const INITIAL_DELAY_MS = 200;
const MAX_DELAY_MS = 3200;
const BACKOFF_FACTOR = 2;

interface HealthResponse {
  status: string;
}

export async function waitForHealth(
  url: string,
  timeoutMs: number = 30000
): Promise<void> {
  const healthUrl = `${url}/api/v1/health`;
  const deadline = Date.now() + timeoutMs;
  let delay = INITIAL_DELAY_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(healthUrl, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const body = (await response.json()) as HealthResponse;
        if (body.status === "ok") {
          return;
        }
      }
    } catch {
      // Server not ready yet — retry after delay
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      break;
    }

    const waitMs = Math.min(delay, remainingMs);
    await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    delay = Math.min(delay * BACKOFF_FACTOR, MAX_DELAY_MS);
  }

  throw new Error(
    `Health check timed out after ${timeoutMs}ms: ${healthUrl} did not respond with status "ok"`
  );
}
