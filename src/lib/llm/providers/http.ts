export const fetchJsonWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = 15000
): Promise<Response | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
