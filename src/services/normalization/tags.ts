export function parseApiTags(strTags: string | null | undefined): string[] {
  if (!strTags?.trim()) return []
  return strTags
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

export function mergeTags(...groups: string[][]): string[] {
  return [...new Set(groups.flat())]
}
