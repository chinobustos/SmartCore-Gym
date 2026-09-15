/**
 * Exportacion a Excel compartida por los modulos de la app.
 *
 * La libreria `xlsx` pesa bastante, asi que se carga con import() dinamico:
 * solo baja al navegador cuando el usuario efectivamente exporta.
 */

/** Tipos que Excel entiende de forma nativa. */
export type CellValue = string | number | boolean | Date | null | undefined;

export interface Column<T> {
  /** Encabezado que se ve en la planilla. */
  header: string;
  /** Extrae el valor de la fila. Devolver Date o number para que Excel los trate como tales. */
  value: (row: T) => CellValue;
  /** Ancho en caracteres. Si se omite se calcula segun el contenido. */
  width?: number;
  /** Formato numerico de Excel, ej. '$#,##0' o 'dd/mm/yyyy'. */
  format?: string;
}

export interface Sheet<T> {
  /** Nombre de la pestaña. Excel lo limita a 31 caracteres. */
  name: string;
  columns: Column<T>[];
  rows: T[];
}

/** Calcula un ancho legible a partir del encabezado y el contenido. */
function autoWidth<T>(column: Column<T>, rows: T[]): number {
  const lengths = rows.map(row => {
    const value = column.value(row);
    if (value === null || value === undefined) return 0;
    if (value instanceof Date) return 10;
    return String(value).length;
  });
  const longest = Math.max(column.header.length, ...lengths, 0);
  // Un poco de aire, con un techo para que una celda larga no rompa la tabla.
  return Math.min(Math.max(longest + 2, 10), 50);
}

/**
 * Genera un .xlsx con una o mas hojas y dispara la descarga.
 * Cada hoja se pasa por separado porque cada una tiene su propio tipo de fila.
 */
export async function exportToExcel(sheets: Sheet<any>[], filename: string): Promise<void> {
  const XLSX = await import("xlsx");

  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const header = sheet.columns.map(c => c.header);
    const body = sheet.rows.map(row => sheet.columns.map(c => c.value(row) ?? ""));

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body], { cellDates: true });

    worksheet["!cols"] = sheet.columns.map(c => ({ wch: c.width ?? autoWidth(c, sheet.rows) }));

    // Congela la fila de encabezados para que quede visible al scrollear.
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    // Aplica formato de numero/fecha columna por columna.
    sheet.columns.forEach((column, columnIndex) => {
      if (!column.format) return;
      for (let rowIndex = 1; rowIndex <= sheet.rows.length; rowIndex++) {
        const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
        const cell = worksheet[address];
        if (cell) cell.z = column.format;
      }
    });

    // Excel rechaza nombres de hoja de mas de 31 caracteres.
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  }

  XLSX.writeFile(workbook, filename);
}

/** Nombre de archivo con la fecha del dia: smartcore-finanzas-2026-09-14.xlsx */
export function datedFilename(slug: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `smartcore-${slug}-${today}.xlsx`;
}

/** Formatos de Excel reutilizables. */
export const EXCEL_FORMAT = {
  currencyARS: '"$"#,##0',
  date: "dd/mm/yyyy",
} as const;
