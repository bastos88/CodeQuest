export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function assertFound<T>(value: T | null | undefined, message = 'Resource not found'): T {
  if (!value) throw new HttpError(404, message);
  return value;
}
