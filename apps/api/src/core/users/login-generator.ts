const transliterationMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

export function buildLoginBase(lastName: string, firstName: string): string {
  const firstLetter = firstName.trim()[0] ?? '';
  const source = `${lastName.trim()}${firstLetter}`.toLowerCase();
  const transliterated = Array.from(source)
    .map((letter) => transliterationMap[letter] ?? letter)
    .join('');
  const normalized = transliterated.replace(/[^a-z0-9]/g, '');

  return normalized || 'user';
}

export function getLoginCandidate(base: string, index: number): string {
  return index === 1 ? base : `${base}${index}`;
}
