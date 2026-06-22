export function getFileBaseName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName
}

export function hasApkgExtension(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.apkg')
}
