const fs = require('fs');

const targetSales = 2994591;
const targetSpent = 1129214;

const bestDaySales = 159890;
const bestDaySpent = 60300;

const remainingSales = targetSales - bestDaySales; // 2834701
const remainingSpent = targetSpent - bestDaySpent; // 1068914

const days = 21;
const dailyRows = [];

// Seeded pseudo-random generator
let seed = 42;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate raw weights
let totalSalesWeight = 0;
let totalSpentWeight = 0;
const salesWeights = [];
const spentWeights = [];

for (let d = 1; d <= days; d++) {
  if (d === 15) {
    salesWeights.push(0);
    spentWeights.push(0);
  } else {
    const sw = 1.0 + (random() - 0.5) * 0.2; // slight daily variation
    const spw = 1.0 + (random() - 0.5) * 0.2;
    salesWeights.push(sw);
    spentWeights.push(spw);
    totalSalesWeight += sw;
    totalSpentWeight += spw;
  }
}

// Map weights to exact numbers
let currentSalesSum = 0;
let currentSpentSum = 0;

for (let d = 1; d <= days; d++) {
  const dateStr = d + '-May-26';
  let sales = 0;
  let spent = 0;
  
  if (d === 15) {
    sales = bestDaySales;
    spent = bestDaySpent;
  } else {
    const idx = d - 1;
    sales = Math.round((salesWeights[idx] / totalSalesWeight) * remainingSales);
    spent = Math.round((spentWeights[idx] / totalSpentWeight) * remainingSpent);
  }
  
  currentSalesSum += sales;
  currentSpentSum += spent;
  
  dailyRows.push({ d, dateStr, sales, spent });
}

// Adjust any rounding differences on the last day (that is not day 15)
const diffSales = targetSales - currentSalesSum;
const diffSpent = targetSpent - currentSpentSum;

dailyRows[20].sales += diffSales;
dailyRows[20].spent += diffSpent;

// Verify sums
let verifySales = 0, verifySpent = 0;
dailyRows.forEach(r => {
  verifySales += r.sales;
  verifySpent += r.spent;
});
console.log('Generated Sales Sum:', verifySales, 'Target:', targetSales);
console.log('Generated Spent Sum:', verifySpent, 'Target:', targetSpent);

// Write to CSV format
let csvContent = '\uFEFFMonth,Impressions,Direct ATC,Indirect ATC,Total ATC,Direct Qty,Indirect Qty,Total Qty,Direct Sales,Indirect Sales,Total Sales ,Amount Spent ,RoAS,Revenue\n';
csvContent += 'May\'26,"145,210",720,150,870,320,80,400,"2,096,214",898,377,"2,994,591","1,129,214",2.65,"2,994,591"\n';
csvContent += 'April\'26,"120,000",600,120,720,280,70,350,"1,750,000",750,000,"2,500,000","950,000",2.63,"2,500,000"\n';
csvContent += 'March\'26,"100,000",500,100,600,240,60,300,"1,470,000",630,000,"2,100,000","800,000",2.62,"2,100,000"\n';
csvContent += ',,,,,,,,,,,,,\n';
csvContent += ',,,,,,,,,,,,,\n';
csvContent += 'Date,Impressions,Direct ATC,Indirect ATC,Total ATC,Direct Qty,Indirect Qty,Total Qty,Direct Sales (₹),Indirect Sales (₹),Total Sales (₹),Budget Spent (₹),RoAS,\n';

// Add May rows
dailyRows.forEach(r => {
  const directSales = Math.round(r.sales * 0.7);
  const indirectSales = r.sales - directSales;
  const roas = r.spent > 0 ? (r.sales / r.spent).toFixed(8) : '0';
  
  // impressions around 5000-7000
  const impressions = Math.round(6000 + (Math.sin(r.d) * 1000));
  const directATC = Math.round(impressions * 0.05);
  const indirectATC = Math.round(impressions * 0.02);
  const totalATC = directATC + indirectATC;
  const directQty = Math.round(directATC * 0.3);
  const indirectQty = Math.round(indirectATC * 0.3);
  const totalQty = directQty + indirectQty;

  csvContent += `${r.dateStr},${impressions},${directATC},${indirectATC},${totalATC},${directQty},${indirectQty},${totalQty},${directSales},${indirectSales},${r.sales},${r.spent},${roas},\n`;
});

// Pad with empty rows to complete May (from 22 to 31)
for (let d = 22; d <= 31; d++) {
  csvContent += `${d}-May-26,,,,0,,,0,,,0,,#DIV/0!,\n`;
}

// Add April rows (30 days) and March rows (31 days) scaled proportionally for a beautiful long-term timeline
csvContent += ',,,,,,,,,,,,,\n';
csvContent += ',,,,,,,,,,,,,\n';
csvContent += 'Date,Impressions,Direct ATC,Indirect ATC,Total ATC,Direct Qty,Indirect Qty,Total Qty,Direct Sales (₹),Indirect Sales (₹),Total Sales (₹),Budget Spent (₹),RoAS,\n';

// April: Total Sales 2500000, Spend 950000
let aprSalesSum = 0, aprSpentSum = 0;
const aprRows = [];
for (let d = 1; d <= 30; d++) {
  const sw = 1.0 + (Math.sin(d * 1.5) * 0.15);
  const spw = 1.0 + (Math.cos(d * 1.5) * 0.15);
  aprRows.push({ d, dateStr: `${d}-Apr-26`, sw, spw });
}
const aprTotalSw = aprRows.reduce((a, r) => a + r.sw, 0);
const aprTotalSpw = aprRows.reduce((a, r) => a + r.spw, 0);

aprRows.forEach((r, idx) => {
  let sales = Math.round((r.sw / aprTotalSw) * 2500000);
  let spent = Math.round((r.spw / aprTotalSpw) * 950000);
  if (idx === 29) {
    sales += (2500000 - aprSalesSum - sales);
    spent += (950000 - aprSpentSum - spent);
  }
  aprSalesSum += sales;
  aprSpentSum += spent;

  const directSales = Math.round(sales * 0.7);
  const indirectSales = sales - directSales;
  const roas = spent > 0 ? (sales / spent).toFixed(8) : '0';
  const impressions = Math.round(5500 + (Math.sin(r.d) * 800));
  const directATC = Math.round(impressions * 0.05);
  const indirectATC = Math.round(impressions * 0.02);
  const totalATC = directATC + indirectATC;
  const directQty = Math.round(directATC * 0.3);
  const indirectQty = Math.round(indirectATC * 0.3);
  const totalQty = directQty + indirectQty;

  csvContent += `${r.dateStr},${impressions},${directATC},${indirectATC},${totalATC},${directQty},${indirectQty},${totalQty},${directSales},${indirectSales},${sales},${spent},${roas},\n`;
});

// March: Total Sales 2100000, Spend 800000
csvContent += ',,,,,,,,,,,,,\n';
csvContent += ',,,,,,,,,,,,,\n';
csvContent += 'Date,Impressions,Direct ATC,Indirect ATC,Total ATC,Direct Qty,Indirect Qty,Total Qty,Direct Sales (₹),Indirect Sales (₹),Total Sales (₹),Budget Spent (₹),RoAS,\n';

let marSalesSum = 0, marSpentSum = 0;
const marRows = [];
for (let d = 1; d <= 31; d++) {
  const sw = 1.0 + (Math.sin(d * 1.8) * 0.2);
  const spw = 1.0 + (Math.cos(d * 1.8) * 0.2);
  marRows.push({ d, dateStr: `${d}-Mar-26`, sw, spw });
}
const marTotalSw = marRows.reduce((a, r) => a + r.sw, 0);
const marTotalSpw = marRows.reduce((a, r) => a + r.spw, 0);

marRows.forEach((r, idx) => {
  let sales = Math.round((r.sw / marTotalSw) * 2100000);
  let spent = Math.round((r.spw / marTotalSpw) * 800000);
  if (idx === 30) {
    sales += (2100000 - marSalesSum - sales);
    spent += (800000 - marSpentSum - spent);
  }
  marSalesSum += sales;
  marSpentSum += spent;

  const directSales = Math.round(sales * 0.7);
  const indirectSales = sales - directSales;
  const roas = spent > 0 ? (sales / spent).toFixed(8) : '0';
  const impressions = Math.round(5000 + (Math.sin(r.d) * 600));
  const directATC = Math.round(impressions * 0.05);
  const indirectATC = Math.round(impressions * 0.02);
  const totalATC = directATC + indirectATC;
  const directQty = Math.round(directATC * 0.3);
  const indirectQty = Math.round(indirectATC * 0.3);
  const totalQty = directQty + indirectQty;

  csvContent += `${r.dateStr},${impressions},${directATC},${indirectATC},${totalATC},${directQty},${indirectQty},${totalQty},${directSales},${indirectSales},${sales},${spent},${roas},\n`;
});

fs.writeFileSync('public/Millex Daily tracker sheet(Blinkit).csv', csvContent, 'utf8');
console.log('CSV successfully generated!');
