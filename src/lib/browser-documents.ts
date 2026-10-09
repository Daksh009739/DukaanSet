'use client';

export interface DocumentLine { text: string; value?: string; emphasis?: boolean; photoUrl?: string }
/** Canvas text uses the locally hosted UI fonts, including Devanagari shaping. No remote renderer. */
export async function documentPdf(title: string, subtitle: string, lines: DocumentLine[]): Promise<Blob> {
  await document.fonts.load('24px "Noto Sans Devanagari Variable"', 'हिन्दी');
  await document.fonts.load('24px "Manrope Variable"');
  await document.fonts.ready;
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  pdf.setTitle(title); pdf.setAuthor('DukaanSet'); pdf.setSubject(subtitle);
  const width = 1240, height = 1754, margin = 80;
  let canvas!: HTMLCanvasElement, ctx!: CanvasRenderingContext2D, y = 0, pageNumber = 0;
  const font = (bold = false, size = 24) => `${bold ? '700' : '400'} ${size}px "Manrope Variable", "Noto Sans Devanagari Variable", sans-serif`;
  function page() {
    canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d'); if (!context) throw new Error('PDF rendering unavailable'); ctx = context;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = '#103b36';
    ctx.font = font(true, 20); ctx.fillText('DUKAANSET', margin, 72);
    ctx.font = font(true, 34); y = 138;
    for (const line of wrap(title, width - 2 * margin)) { ctx.fillText(line, margin, y); y += 48; }
    ctx.fillStyle = '#53655f'; ctx.font = font(false, 22);
    for (const line of wrap(subtitle, width - 2 * margin)) { ctx.fillText(line, margin, y); y += 34; }
    y += 26; ctx.strokeStyle = '#dce7e2'; ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(width - margin, y); ctx.stroke(); y += 45;
    ctx.font = font(false, 18); ctx.fillText(`${++pageNumber}`, width - margin - 28, height - 42);
  }
  function wrap(text: string, limit: number) {
    const output: string[] = []; let current = '';
    for (const word of text.split(/\s+/)) {
      if (ctx.measureText(current ? `${current} ${word}` : word).width > limit && current) { output.push(current); current = ''; }
      // Split unusually long SKU/name strings, preventing page overflow.
      for (const char of Array.from(word)) {
        if (ctx.measureText(current + char).width > limit && current) { output.push(current); current = ''; }
        current += char;
      }
      current += ' ';
    }
    if (current.trim()) output.push(current.trim()); return output.length ? output : [''];
  }
  async function flush() {
    const image = await pdf.embedPng(canvas.toDataURL('image/png'));
    pdf.addPage([595.28, 841.89]).drawImage(image, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  page();
  for (const line of lines) {
    ctx.font = font(line.emphasis);
    const textLines = wrap(line.text, line.value ? 730 : width - 2 * margin);
    for (let index = 0; index < textLines.length; index++) {
      if (y > height - 125) { await flush(); page(); ctx.font = font(line.emphasis); }
      ctx.fillStyle = line.emphasis ? '#103b36' : '#263b34'; ctx.fillText(textLines[index], margin, y);
      if (index === 0 && line.value) { ctx.textAlign = 'right'; ctx.fillText(line.value, width - margin, y); ctx.textAlign = 'left'; }
      y += 38;
    }
    y += 12;
    if (line.photoUrl) {
      const url = new URL(line.photoUrl, window.location.origin);
      if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/businesses/')) throw new Error('Invalid receipt photo URL');
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('Receipt photo could not be loaded');
      const photo = await createImageBitmap(await response.blob());
      const scale = Math.min(400 / photo.width, 220 / photo.height); const imageHeight = photo.height * scale, imageWidth = photo.width * scale;
      if (y + imageHeight > height - 125) { await flush(); page(); }
      ctx.drawImage(photo, margin, y, imageWidth, imageHeight); photo.close(); y += imageHeight + 25;
    }
  }
  await flush();
  return new Blob([Uint8Array.from(await pdf.save())], { type: 'application/pdf' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function inventoryCsv(rows: (string | number)[][]): string {
  return '\ufeff' + rows.map(row => row.map(value => {
    let text = String(value); if (/^[\s]*[=+\-@]/.test(text) && typeof value === 'string') text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  }).join(',')).join('\r\n');
}
