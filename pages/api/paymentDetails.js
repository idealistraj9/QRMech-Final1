// pages/api/paymentDetails.js
import axios from 'axios';

export default async function handler(req, res) {
  const { method } = req;
  const apiKey = 'fbae8c3f-c2b3-4d44-be7c-37147654ac5c'; // Replace with your actual API key

  if (method === 'GET') {
    const { paymentId } = req.query;

    try {
      const response = await axios.get(
        `https://api.ext.payconiq.com/v3/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(error.response.status || 500).json({ error: 'Failed to fetch payment details' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
