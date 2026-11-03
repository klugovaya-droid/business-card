export function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message.replace(/(?:prisma\+postgres|postgres(?:ql)?):\/\/[^\s]+/gi, '[redacted]');
}
