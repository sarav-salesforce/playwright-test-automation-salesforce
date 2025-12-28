const ExcelJs = require('exceljs');

async function readExcelData(filePath, sheetName) {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(sheetName);

    if(!worksheet) {
        throw new Error(`Sheet ${sheetName} not found in ${filePath}`);
    }

    const rows = [];

    //Convert each row to a JSON object
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if(rowNumber === 1) {
            // Skip header row
            return;
        }
        const rowData = {};
        row.eachCell((cell, colNumber) => {
            const headerCell = worksheet.getRow(1).getCell(colNumber).value;
            rowData[headerCell] = cell.value;
        });

        rows.push(rowData);

    });

    return rows;

}

module.exports = { readExcelData };