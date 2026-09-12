/**
 * Conversão entre segundos e `mm:ss`.
 *
 * O banco guarda segundos, mas ninguém sincroniza comentário com vídeo pensando
 * em "2700". Pensa em "45:00" — que é o que o player mostra.
 */

export function paraMMSS(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Aceita `mm:ss`, `hh:mm:ss` ou um número solto (interpretado como segundos).
 * Devolve `null` quando não dá para entender.
 */
export function deMMSS(texto: string): number | null {
  const t = texto.trim();
  if (!t) return null;

  if (!t.includes(':')) {
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  }

  const partes = t.split(':').map((p) => Number(p.trim()));
  if (partes.length > 3) return null;
  if (partes.some((p) => !Number.isFinite(p) || p < 0)) return null;

  return Math.round(partes.reduce((acc, p) => acc * 60 + p, 0));
}
