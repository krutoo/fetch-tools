interface SafetyFetch {
  (...args: Parameters<typeof fetch>): Promise<{ response?: Response; error?: unknown }>;
}

export function safety<T extends typeof fetch>(fetchFn: T): SafetyFetch {
  return (...args) =>
    fetchFn(...args)
      .then(response => ({ response }))
      .catch(error => ({ error }));
}
