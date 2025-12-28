import ExcelJS from 'exceljs';

export async function readTestData(excelPath:string, sheetName:string, testName:string) : Promise<Record<string, any>> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);

    const sheet = workbook.getWorksheet(sheetName);

    if(!sheet) {
        throw new Error(`Sheet ${sheetName} not found in ${excelPath}`);
    }

    const headers = sheet.getRow(1).values as Array<string | undefined>; // first row is header

    // Find the column index for testName
    const testNameColumnIndex = headers.indexOf("testName");

    let matchedRowData: Record<string, any> = {};

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header

        const rowValues = row.values as Array<any>;


        if (rowValues[testNameColumnIndex] === testName) {
            // Convert row to object
            headers.forEach((header, index) => {
                if (index > 0 && header) {
                    matchedRowData[header] = rowValues[index];
                }
            });
        }
    });

    return matchedRowData;
}

module.exports = { readTestData };