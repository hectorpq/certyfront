export function extractApiError(err: unknown): string | null {
  const error = err as { response?: { data?: unknown } };
  const data = error.response?.data;
  if (data && typeof data === 'object') {
    return String(Object.values(data as Record<string, unknown[]>).flat()[0]);
  }
  return null;
}
