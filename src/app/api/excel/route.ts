import { NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import fs from 'fs';
import path from 'path';
import "isomorphic-fetch";

// Cache data for 60 seconds - prevents hammering the Graph API on every page load
export const revalidate = 60;

// Custom robust parser for currency, commas, negative numbers, Excel errors
function parseNumeric(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  const str = String(val)
    .replace(/[₹,%\s]/g, '')
    .trim();
  if (str.startsWith('(') && str.endsWith(')')) {
    return -parseNumeric(str.slice(1, -1));
  }
  if (str === '#DIV/0!' || str === '#REF!' || str === '-' || isNaN(Number(str))) {
    return 0;
  }
  return Number(str);
}

// Custom CSV parser handling quotes
function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/);
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

function parseWorkbookRows(rows: any[][]) {
  const monthlySummary: any[] = [];
  const dailyPerformance: any[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const isRowEmpty = row.every(cell => cell === null || cell === undefined || String(cell).trim() === '');
    if (isRowEmpty) continue;

    const firstCell = String(row[0]).trim();

    if (firstCell.toLowerCase() === 'month' || firstCell.toLowerCase() === 'date') {
      continue;
    }

    const isMonthlyRow = /^[A-Za-z]+'\d{2}$/.test(firstCell) || firstCell.toLowerCase().includes('total');
    const isDailyRow = /^\d{1,2}-[A-Za-z]+-\d{2,4}$/.test(firstCell);

    if (isMonthlyRow) {
      monthlySummary.push({
        month: firstCell,
        impressions: parseNumeric(row[1]),
        directATC: parseNumeric(row[2]),
        indirectATC: parseNumeric(row[3]),
        totalATC: parseNumeric(row[4]),
        directQty: parseNumeric(row[5]),
        indirectQty: parseNumeric(row[6]),
        totalQty: parseNumeric(row[7]),
        directSales: parseNumeric(row[8]),
        indirectSales: parseNumeric(row[9]),
        totalSales: parseNumeric(row[10]),
        amountSpent: parseNumeric(row[11]),
        roas: parseNumeric(row[12]),
        revenue: parseNumeric(row[13] ?? row[10]),
      });
    } else if (isDailyRow) {
      dailyPerformance.push({
        date: firstCell,
        impressions: parseNumeric(row[1]),
        directATC: parseNumeric(row[2]),
        indirectATC: parseNumeric(row[3]),
        totalATC: parseNumeric(row[4]),
        directQty: parseNumeric(row[5]),
        indirectQty: parseNumeric(row[6]),
        totalQty: parseNumeric(row[7]),
        directSales: parseNumeric(row[8]),
        indirectSales: parseNumeric(row[9]),
        totalSales: parseNumeric(row[10]),
        budgetSpent: parseNumeric(row[11]),
        roas: parseNumeric(row[12]),
      });
    }
  }

  return { monthlySummary, dailyPerformance };
}

// Fallback logic to read local CSV replica
function getLocalCsvData() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'Millex Daily tracker sheet(Blinkit).csv');
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf-8');
      const rawRows = parseCSV(content);
      return parseWorkbookRows(rawRows);
    }
  } catch (error) {
    console.error("Local CSV Read Error:", error);
  }
  return { monthlySummary: [], dailyPerformance: [] };
}

export async function GET() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const sharepointHostname = process.env.SHAREPOINT_HOSTNAME;
  const sharepointSitePath = process.env.SHAREPOINT_SITE_PATH;
  const fileItemId = process.env.FILE_ITEM_ID;
  let worksheetName = process.env.WORKSHEET_NAME || 'Sheet1';

  const isSharepointConfigured = !!(tenantId && clientId && clientSecret && sharepointHostname && sharepointSitePath && fileItemId);

  if (!isSharepointConfigured) {
    console.warn("SharePoint config missing. Falling back to local CSV tracker sheet...");
    const localData = getLocalCsvData();
    return NextResponse.json({
      success: true,
      dataSource: 'local-csv-fallback',
      ...localData,
      meta: {
        file: 'Millex Daily tracker sheet(Blinkit).csv',
        rowCount: localData.dailyPerformance.length
      }
    });
  }

  try {
    // Authenticate using Azure AD Client Credentials (App-only, no user login required)
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken("https://graph.microsoft.com/.default");
          return token.token;
        }
      }
    });

    // Step 1: Resolve site ID
    const site = await client.api(`/sites/${sharepointHostname}:${sharepointSitePath}`).get();
    const siteId = site.id;

    // Step 2: Get default drive
    const drive = await client.api(`/sites/${siteId}/drive`).get();
    const driveId = drive.id;

    // Step 3: Normalize File Item ID (remove curly brackets if present)
    const cleanFileItemId = fileItemId.replace(/[{}]/g, '');

    // Step 4: Resolve Worksheet (Self-healing discover)
    try {
      await client.api(`/drives/${driveId}/items/${cleanFileItemId}/workbook/worksheets/${worksheetName}`).get();
    } catch (e) {
      console.warn(`Worksheet ${worksheetName} not found, discovering available worksheets...`);
      const sheetsList = await client.api(`/drives/${driveId}/items/${cleanFileItemId}/workbook/worksheets`).get();
      if (sheetsList && sheetsList.value && sheetsList.value.length > 0) {
        const blinkitSheet = sheetsList.value.find((s: any) => s.name.toLowerCase().includes('blinkit'));
        worksheetName = blinkitSheet ? blinkitSheet.name : sheetsList.value[0].name;
        console.log(`Auto-discovered worksheet: ${worksheetName}`);
      }
    }

    // Step 5: Read used range
    const response = await client
      .api(`/drives/${driveId}/items/${cleanFileItemId}/workbook/worksheets/${worksheetName}/usedRange`)
      .get();

    const rows: any[][] = response.values;
    if (!rows || rows.length === 0) {
      console.warn("SharePoint sheet is empty. Falling back to local CSV...");
      const localData = getLocalCsvData();
      return NextResponse.json({
        success: true,
        dataSource: 'local-csv-empty-sheet-fallback',
        ...localData
      });
    }

    const parsedData = parseWorkbookRows(rows);

    return NextResponse.json({
      success: true,
      dataSource: 'sharepoint-live',
      ...parsedData,
      meta: {
        site: `${sharepointHostname}${sharepointSitePath}`,
        file: 'Millex Daily tracker sheet.xlsx',
        worksheet: worksheetName,
        rowCount: parsedData.dailyPerformance.length
      }
    });

  } catch (error: any) {
    console.error("Graph API Error, falling back to local CSV:", error);
    const localData = getLocalCsvData();
    return NextResponse.json({
      success: true,
      dataSource: 'local-csv-error-fallback',
      ...localData,
      errorDetails: error.message,
      errorCode: error.code
    });
  }
}

