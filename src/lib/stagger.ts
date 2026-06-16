/** Split tagline text into word spans for hero stagger animation */
export function taglineWords(text: string, lineIndex: number) {
  return text.split(/\s+/).filter(Boolean).map((word, wi) => ({
    word,
    style: `--line:${lineIndex};--wi:${wi}`,
  }));
}
