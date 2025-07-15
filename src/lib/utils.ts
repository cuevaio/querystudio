import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Decodes malformed Unicode escape sequences and hexadecimal sequences in a string to proper UTF-8 characters
 * This is a comprehensive solution for when AI models return various types of escaped Unicode characters
 */
export function decodeUnicodeEscapes(str: string): string {
  if (!str || typeof str !== "string") return str;

  return (
    str
      // Fix malformed unicode escapes like \u0000e1 -> \u00e1
      .replace(/\\u0000([a-fA-F0-9]{2})/g, "\\u00$1")
      // Fix malformed unicode escapes like \u00191 -> \u00bf (¿)
      .replace(/\\u00191/g, "\\u00bf")
      // Handle hexadecimal escape sequences like \x191C -> ¿C
      .replace(/\\x([a-fA-F0-9]{2})([a-fA-F0-9]{2})/g, (_match, hex1, hex2) => {
        const char1 = String.fromCharCode(parseInt(hex1, 16));
        const char2 = String.fromCharCode(parseInt(hex2, 16));
        return char1 + char2;
      })
      // Handle single hexadecimal escape sequences like \x00f3 -> ó
      .replace(/\\x00([a-fA-F0-9]{2})/g, (_match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      })
      // Handle other hexadecimal escape sequences
      .replace(/\\x([a-fA-F0-9]{2})/g, (_match, hex) => {
        const code = parseInt(hex, 16);
        // Map common special characters
        if (code === 0x19 || code === 0x91) {
          return "¿"; // Opening question mark
        }
        return String.fromCharCode(code);
      })
      // Now properly decode all unicode escapes
      .replace(/\\u([a-fA-F0-9]{4})/g, (_match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      })
  );
}

/**
/**
 * Recursively decodes Unicode escapes in an object or array
 */
export function decodeUnicodeEscapesDeep(obj: unknown): unknown {
  if (typeof obj === "string") {
    return decodeUnicodeEscapes(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(decodeUnicodeEscapesDeep);
  }

  if (obj && typeof obj === "object") {
    const decoded: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      decoded[decodeUnicodeEscapes(key)] = decodeUnicodeEscapesDeep(value);
    }
    return decoded;
  }

  return obj;
}

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}
