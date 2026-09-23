import { randomInt } from 'node:crypto';

/**
 * Random codes for events and tables. Excludes look-alike characters (0/O, 1/I/L)
 * since these get read off a phone screen or a printed sheet.
 */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** A random, hard-to-guess code, e.g. "X7K2PQ9H". Cryptographically random. */
export function randomCode(length = 8): string {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
