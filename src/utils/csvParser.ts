import Papa from 'papaparse';
import type { School, RelationStage } from '../types/school';

export async function parseSchoolsCSV(url: string): Promise<School[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const schools: School[] = (results.data as Record<string, string>[]).map((row) => ({
          id: row.id || '',
          name: row.name || '',
          type: (row.type as School['type']) || '大学',
          category: (row.category as School['category']) || '私立',
          address: row.address || '',
          lat: parseFloat(row.lat) || 0,
          lng: parseFloat(row.lng) || 0,
          tel: row.tel || '',
          faculty: row.faculty || '',
          open_campus_2025: row.open_campus_2025 || '',
          open_campus_2026: row.open_campus_2026 || '',
          website: row.website || '',
          contact_person: row.contact_person || '',
          contact_date: row.contact_date || '',
          relation_stage: (parseInt(row.relation_stage) || 0) as RelationStage,
          support_items: row.support_items || '',
          notes: row.notes || '',
        }));
        resolve(schools);
      },
      error: (error) => reject(error),
    });
  });
}

export function schoolsToCSV(schools: School[]): string {
  return Papa.unparse(schools, {
    header: true,
  });
}
