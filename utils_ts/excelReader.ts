import ExcelJs from 'exceljs';

export async function readExcelData(filePath:string, sheetName:string) :Promise<Record<string, any>[]> {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(sheetName);

    if(!worksheet) {
        throw new Error(`Sheet ${sheetName} not found in ${filePath}`);
    }

    const rows : Record<string, any>[] = [];

    //Convert each row to a JSON object
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if(rowNumber === 1) {
            // Skip header row
            return;
        }
        const rowData: Record<string, any> = {};
        row.eachCell((cell, colNumber) => {
            const headerCell = worksheet.getRow(1).getCell(colNumber).value as string;
            rowData[headerCell] = cell.value;
        });

        rows.push(rowData);

    });

    return rows;

}

module.exports = { readExcelData };