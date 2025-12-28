const ExcelJS = require("exceljs");

async function readTestData(excelPath, sheetName, testName) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);

    const sheet = workbook.getWorksheet(sheetName);

    const headers = sheet.getRow(1).values; // first row is header
    let matchedRowData = {};

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header

        const rowValues = row.values;

        // Find the column index for testName
        const testNameColumnIndex = headers.indexOf("testName");

        if (rowValues[testNameColumnIndex] === testName) {
            // Convert row to object
            headers.forEach((header, i) => {
                if (i > 0) {
                    matchedRowData[header] = rowValues[i];
                }
            });
        }
    });

    return matchedRowData;
}

module.exports = { readTestData };