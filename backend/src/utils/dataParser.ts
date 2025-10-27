import fs from 'fs';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import path from 'path';

export interface ParsedData {
  headers: string[];
  rows: any[];
  rowCount: number;
}

export const parseCSV = (filePath: string): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    let headers: string[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headerList: string[]) => {
        headers = headerList;
      })
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        resolve({
          headers,
          rows,
          rowCount: rows.length
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

export const parseExcel = (filePath: string): ParsedData => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const jsonData = xlsx.utils.sheet_to_json(worksheet) as Record<string, any>[];
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  
  return {
    headers,
    rows: jsonData,
    rowCount: jsonData.length
  };
};

export const parseFile = async (filePath: string): Promise<ParsedData> => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.csv') {
    return await parseCSV(filePath);
  } else if (ext === '.xlsx' || ext === '.xls') {
    return parseExcel(filePath);
  } else {
    throw new Error('Unsupported file type');
  }
};

export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};