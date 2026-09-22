import 'server-only';
import QRCode from 'qrcode';

/** A table's QR code as a data URL — generated server-side, so the client never needs the library. */
export function tableQrDataUrl(tableUrl: string): Promise<string> {
  return QRCode.toDataURL(tableUrl, { margin: 1, width: 240 });
}
