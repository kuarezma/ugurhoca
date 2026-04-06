/** Örnek: "Uğur Yasayan" → "Uğur Y."; tek kelime → "U." */
export function computeChatDisplayName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const w = parts[0];
    return w.charAt(0).toLocaleUpperCase('tr-TR') + '.';
  }
  const firstRaw = parts[0];
  const first =
    firstRaw.charAt(0).toLocaleUpperCase('tr-TR') +
    firstRaw.slice(1).toLocaleLowerCase('tr-TR');
  const lastInitial =
    parts[parts.length - 1].charAt(0).toLocaleUpperCase('tr-TR') + '.';
  return `${first} ${lastInitial}`;
}
