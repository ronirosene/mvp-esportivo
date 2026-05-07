import XLSX from 'xlsx';

const filePath = 'C:\\Users\\Meu Computador\\Documents\\vscode\\atividades.xlsx';

const workbook = XLSX.readFile(filePath);

console.log(`📄 Abas encontradas: ${workbook.SheetNames.join(', ')}\n`);

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`📋 ${sheetName}: ${data.length} linhas`);

  if (data.length > 0) {
    console.log(`   Cabeçalhos: ${JSON.stringify(data[0])}`);
    console.log(`   Primeiras linhas:`);

    const sample = data.slice(1, 6);
    sample.forEach((row: any, i: number) => {
      console.log(`   [${i + 1}] ${JSON.stringify(row)}`);
    });
  }
  console.log('');
}
