const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api(path: string, options: FetchOptions = {}) {
  const url = `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
  
  const headers = new Headers(options.headers);
  
  // Forward cookies on the server side to backend
  if (typeof window === "undefined") {
    try {
      const { headers: getNextHeaders } = await import("next/headers");
      const requestHeaders = await getNextHeaders();
      const cookie = requestHeaders.get("cookie");
      if (cookie) {
        headers.set("cookie", cookie);
      }
    } catch {
      // Ignore errors if called outside of a server-side request context
    }
  } else {
    // On client side, ensure cookies are included
    options.credentials = options.credentials || "include";
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: "An unexpected error occurred." };
    }
    // Unwrap nested message if wrapped by the ResponseInterceptor
    const message = errorData?.message || response.statusText;
    throw new Error(message);
  }

  try {
    const json = await response.json();
    // Unwrap the global ResponseInterceptor envelope: { statusCode, message, data }
    if (
      json !== null &&
      typeof json === "object" &&
      "statusCode" in json &&
      "data" in json
    ) {
      return json.data;
    }
    return json;
  } catch {
    return null;
  }
}
