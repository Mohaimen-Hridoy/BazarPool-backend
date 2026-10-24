import QRCode from 'qrcode';

export const generateQrCodeDataUrl = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('QR Code generation error:', err);
    throw new Error('Failed to generate QR code');
  }
};
