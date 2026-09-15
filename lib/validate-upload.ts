export function isAllowedFileType(fileName: string): boolean {
  const allowedTypes = [".txt", ".md"];
  const lower = fileName.toLowerCase();
  return allowedTypes.some((ext) => lower.endsWith(ext));
}
