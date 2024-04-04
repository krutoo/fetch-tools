/**
 * This function need for Node.js and undici.
 * Details: https://github.com/nodejs/undici/discussions/2979#discussioncomment-8865341.
 * @param response Response.
 */
export async function dump(response: Response) {
  try {
    await response.body?.cancel();
  } catch {
    // do nothing
  }
}
