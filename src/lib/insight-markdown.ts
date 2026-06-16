function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text: string): string {
  return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export function renderInsightMarkdown(md: string): string {
  const blocks = md.trim().split(/\n\n+/);
  const html: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    if (lines[0].startsWith('## ')) {
      const heading = inline(lines[0].slice(3));
      html.push(`<h2>${heading}</h2>`);
      continue;
    }

    if (lines.every((l) => l.startsWith('> '))) {
      const quote = lines.map((l) => inline(l.slice(2))).join(' ');
      html.push(`<blockquote class="ins-pullquote">${quote}</blockquote>`);
      continue;
    }

    if (lines.every((l) => l.startsWith('- '))) {
      const items = lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('');
      html.push(`<ul>${items}</ul>`);
      continue;
    }

    html.push(`<p>${inline(lines.join(' '))}</p>`);
  }

  return html.join('');
}
