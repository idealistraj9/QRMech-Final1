// pages/api/generateQR.js

import QRCode from 'qrcode';


export default async (req, res) => {
  const { deviceID } = req.query;

  try {
    // Generate QR code
    const qrCodeURL = `http://192.168.87.174:3000/?deviceID=${deviceID}`;
    const qrCode = await QRCode.toDataURL(qrCodeURL);

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="qr_code.png"');

    // Send the image data in the response
    res.status(200).send(Buffer.from(qrCode.replace(/^data:image\/png;base64,/, ''), 'base64'));
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).end('Internal Server Error');
  }
};
