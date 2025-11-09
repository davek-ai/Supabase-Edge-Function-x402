/**
 * Base64URL encoding and decoding library for Deno
 *
 * Optimized for JWT creation and other URL-safe encoding needs.
 * Base64URL is a URL-safe variant of Base64 that uses:
 * - `-` instead of `+`
 * - `_` instead of `/`
 * - No padding (`=`)
 *
 * @module
 */

/**
 * Encodes a string or Uint8Array to Base64URL format
 *
 * @param input - String or Uint8Array to encode
 * @returns Base64URL encoded string (no padding)
 *
 * @example
 * ```ts
 * import { encode } from "./mod.ts";
 *
 * const encoded = encode("Hello, World!");
 * console.log(encoded); // "SGVsbG8sIFdvcmxkIQ"
 * ```
 */
export function encode(input: string | Uint8Array): string {
    const bytes = typeof input === "string"
      ? new TextEncoder().encode(input)
      : input;
  
    // Use Deno's built-in base64 encoding
    // Handle large arrays by chunking to avoid stack overflow
    let binaryString = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      // Build string without spread operator to avoid stack overflow
      for (let j = 0; j < chunk.length; j++) {
        binaryString += String.fromCharCode(chunk[j]);
      }
    }
    const base64 = btoa(binaryString);
  
    // Convert to base64url: replace + with -, / with _, and remove padding
    return base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
  
  /**
   * Decodes a Base64URL string to a Uint8Array
   *
   * @param input - Base64URL encoded string
   * @returns Decoded bytes as Uint8Array
   *
   * @example
   * ```ts
   * import { decode } from "./mod.ts";
   *
   * const decoded = decode("SGVsbG8sIFdvcmxkIQ");
   * const text = new TextDecoder().decode(decoded);
   * console.log(text); // "Hello, World!"
   * ```
   */
  export function decode(input: string): Uint8Array {
    // Add padding back if needed
    let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  
    // Add padding
    const paddingLength = (4 - (base64.length % 4)) % 4;
    base64 += "=".repeat(paddingLength);
  
    // Decode using Deno's built-in atob
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  
    return bytes;
  }
  
  /**
   * Decodes a Base64URL string to a UTF-8 string
   *
   * @param input - Base64URL encoded string
   * @returns Decoded UTF-8 string
   *
   * @example
   * ```ts
   * import { decodeToString } from "./mod.ts";
   *
   * const text = decodeToString("SGVsbG8sIFdvcmxkIQ");
   * console.log(text); // "Hello, World!"
   * ```
   */
  export function decodeToString(input: string): string {
    return new TextDecoder().decode(decode(input));
  }
  
  /**
   * Encodes a JSON object to Base64URL format
   * Useful for JWT payload encoding
   *
   * @param obj - Object to encode
   * @returns Base64URL encoded JSON string
   *
   * @example
   * ```ts
   * import { encodeJSON } from "./mod.ts";
   *
   * const header = encodeJSON({ alg: "HS256", typ: "JWT" });
   * console.log(header); // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
   * ```
   */
  export function encodeJSON(obj: unknown): string {
    return encode(JSON.stringify(obj));
  }
  
  /**
   * Decodes a Base64URL string to a JSON object
   * Useful for JWT payload decoding
   *
   * @param input - Base64URL encoded JSON string
   * @returns Decoded JSON object
   *
   * @example
   * ```ts
   * import { decodeJSON } from "./mod.ts";
   *
   * const header = decodeJSON("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
   * console.log(header); // { alg: "HS256", typ: "JWT" }
   * ```
   */
  export function decodeJSON<T = unknown>(input: string): T {
    return JSON.parse(decodeToString(input)) as T;
  }
  
  