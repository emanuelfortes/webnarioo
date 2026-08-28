'use client';

/**
 * M5 da auditoria: o export anterior só escapava aspas. Um lead cadastrado com
 * o nome `=HYPERLINK(...)` virava fórmula executável ao abrir o arquivo no
 * Excel — e tanto o nome quanto o campo livre da aplicação vêm de input público.
 */
const PERIGOSOS = /^[=+\-@\t\r]/;

function celula(valor: string | number | null | undefined): string {
  const texto = String(valor ?? '');
  const neutro = PERIGOSOS.test(texto) ? "'" + texto : texto;
  return '"' + neutro.replace(/"/g, '""') + '"';
}

export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csv = rows.map((linha) => linha.map(celula).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
