// pages/api/savePaymentToDatabase.js

import nc from 'next-connect';
import { auths } from '@/api-lib/middlewares';
import { ncOpts } from '@/api-lib/nc';
import { savePaymentToDatabase } from '@/lib/deviceDatabase';

const handler = nc(ncOpts);

handler.use(...auths);

handler.post(async (req, res) => {
  const { deviceID, amount, creditAmount } = req.body;

  try {
    // Save payment data to the device database
    await savePaymentToDatabase(deviceID, amount, creditAmount);

    res.status(200).json({ success: true, message: 'Payment data saved to the device database.' });
  } catch (error) {
    console.error('Error saving payment to database:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default handler;
