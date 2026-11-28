export function getProductImageSource(value) {
  if (typeof value !== 'string') return '';
  const source = value.trim();
  if (
    !source ||
    source.includes('\\') ||
    [...source].some((character) => character.charCodeAt(0) < 32)
  )
    return '';
  if (source.startsWith('/') && !source.startsWith('//')) return source;
  try {
    const url = new URL(source);
    return ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : '';
  } catch {
    return '';
  }
}
