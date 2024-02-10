// pages/api/payconiq.js
import axios from 'axios';

export default async function handler(req, res) {
  const { method, body } = req;

  if (method === 'POST') {
    const apiKey = 'fbae8c3f-c2b3-4d44-be7c-37147654ac5c';
    const paymentInitiationUrl = 'https://api.ext.payconiq.com/v3/payments/';

    try {
      const response = await axios.post(paymentInitiationUrl, body, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      // console.log('response', response);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Error initiating payment:', error);
      res.status(error.response.status || 500).json({ error: 'Failed to process payment' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
