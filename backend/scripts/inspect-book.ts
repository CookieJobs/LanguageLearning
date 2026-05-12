
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.join(__dirname, '../../book/2024人教版七上教材信息.xlsx');

console.log('Reading file:', filePath);

if (!fs.existsSync(filePath)) {
    console.error('File not found');
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
console.log('Sheet Names:', workbook.SheetNames);

const sheetName = '单词';
if (workbook.SheetNames.includes(sheetName)) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('First 5 rows:');
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
} else {
    console.log(`Sheet "${sheetName}" not found.`);
}
