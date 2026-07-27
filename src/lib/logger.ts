export function logError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[ERROR] ${context}:`, {
    message,
    stack,
    timestamp: new Date().toISOString(),
  });
}

export function logInfo(context: string, data: unknown) {
  console.log(`[INFO] ${context}:`, JSON.stringify(data, null, 2));
}
