/** The site's own public URL — used to build absolute links for QR codes. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gostop-night.vercel.app';
}
