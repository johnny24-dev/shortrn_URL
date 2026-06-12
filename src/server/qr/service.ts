import QRCode from "qrcode";

export async function generateQrPngBuffer(value: string): Promise<Buffer> {
  return QRCode.toBuffer(value, {
    errorCorrectionLevel: "M",
    margin: 2,
    type: "png",
    width: 512,
  });
}
