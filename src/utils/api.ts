interface FetchWithRetriesOptions {
  maxRetries?: number;
  timeout?: number;
  retryDelay?: number;
}

export async function fetchWithRetries(
  url: string,
  options: RequestInit & FetchWithRetriesOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    timeout = 30000,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!response.ok && response.status === 504) {
        throw new Error('Gateway Timeout');
      }

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`API request attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}
