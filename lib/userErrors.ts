export const USER_FACING_ERROR = "We're working on it. Something went wrong on our side—please try again shortly.";

export function logError(context: string, error: unknown): string {
  console.error(`[${context}]`, error);
  return USER_FACING_ERROR;
}
