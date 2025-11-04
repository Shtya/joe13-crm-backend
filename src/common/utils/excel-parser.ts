import * as XLSX from 'xlsx';
import { CreateClientDto } from '../../client/create-client.dto';

export function parseExcelToClients(filePath: string): CreateClientDto[] {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  return rows.map((row: any) => {
    const phones = extractMultiColumns(row, 'phone');
    const emails = extractMultiColumns(row, 'email');
    const designations = extractMultiColumns(row, 'designation');
    const contactPerson = extractMultiColumns(row, 'Contact Person')
    return {
      clientName: row['Client name'] || row['Client Name'],
      commercialName: row['Commercial Name'] || row['commercialName'],
      phones,
      emails,
      salesperson: row['Salesperson'],
      country: row['Country'],
      city: row['City'],
      joinedDate: excelDateToISO(row['Joined Date']),
      leavingDate: excelDateToISO(row['Leaving Date']),
      reasonIfLeft: row['Reason if Left'],
      unit: row['Unit'],
      designation: designations,
      contactPersons: contactPerson,
      remarks: row['Remarks'],
    };
  });
}


function extractMultiColumns(row: Record<string, any>, baseName: string): string[] | undefined {
  const result: string[] = [];

  for (const key of Object.keys(row)) {
    if (key.toLowerCase().startsWith(baseName.toLowerCase())) {
      const value = row[key];
      if (value !== undefined && value !== null && value.toString().trim() !== '') {
        const cleanValues = value
          .toString()
          .split(/[,;/]/)
          .map((v) => v.replace(/\s+/g, ' ').trim()) 
          .filter(Boolean);

        result.push(...cleanValues);
      }
    }
  }

  return result.length > 0 ? Array.from(new Set(result)) : undefined;
}


function excelDateToISO(value: any): Date | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return new Date(value);
  const parsed = XLSX.SSF.parse_date_code(value);
  if (!parsed) return undefined;
  return new Date(parsed.y, parsed.m - 1, parsed.d);
}
