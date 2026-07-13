/** Base64 JSON share payloads (UTF-8 safe; avoids deprecated escape/unescape). */

export function encodeConfig(config: Record<string, unknown>): string {
  try {
    const json = JSON.stringify(config);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    return btoa(binary);
  } catch {
    return "";
  }
}

export function decodeConfig(hash: string): Record<string, unknown> | null {
  try {
    const binary = atob(hash);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
