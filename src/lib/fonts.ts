import { Fraunces, Gowun_Batang, IBM_Plex_Sans_KR } from 'next/font/google';

/**
 * FONTS — Club Go Stop, "Vintage print"
 *
 * To swap a font: change the import name and the function name on ONE of the
 * three blocks below (keep each `variable` string as it is — the theme in
 * globals.css reads it). Nothing else needs to change.
 *
 * The display face is two fonts working as one: Fraunces draws the Latin
 * letters and Gowun Batang Bold draws the Korean (Fraunces has no Korean).
 * The browser picks per character, so a title can mix both.
 * Every Korean slice is self-hosted; a page only downloads the slices it uses.
 */

// Display, Latin: titles, section titles, the wordmark, big scores.
// Weight 600 and the optical-size axis are set in globals.css (--display-*).
// `axes: ['opsz']` loads the optical-size axis so those fine strokes are available.
export const displayLatinFont = Fraunces({
  variable: '--font-display-latin',
  style: 'normal',
  axes: ['opsz'],
  subsets: ['latin'],
  display: 'swap',
});

// Display, Korean: Gowun Batang Bold.
export const displayKoreanFont = Gowun_Batang({
  variable: '--font-display-ko',
  weight: '700',
  subsets: ['latin'],
  display: 'swap',
});

// Body + UI: rules text, labels, inputs, numbers.
export const bodyFont = IBM_Plex_Sans_KR({
  variable: '--font-body-face',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});
