/**
 * Calls cancel on response.body if it is present.
 *
 * This is need for Node.js and undici.
 * Details: https://github.com/nodejs/undici/discussions/2979#discussioncomment-8865341.
 *
 * This is also useful in Deno when you don't read the response body.
 * For example in `deno test`.
 * @param response Response.
 */
export async function dump(response: Response) {
  try {
    await response.body?.cancel();
  } catch {
    // do nothing
  }
}
