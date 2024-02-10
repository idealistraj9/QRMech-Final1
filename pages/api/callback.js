// pages/api/callback.js
import axios from 'axios';
import { getMongoDb } from '@/api-lib/mongodb';

export default async function handler(req, res) {
  const { username } = req.query;
  const { method, body } = req;

  if (method === 'POST') {
    try {
      // Extract payment status from the request body
      const { status, transferAmount } = req.body;
      
      if (status === 'SUCCEEDED') {
        // Payment succeeded, update the user's credit
        console.log(`Credit updated for user ${username}`);

        // Make a request to update credit
        await axios.post('/api/updateCredit', {
          name: username,
          amount: transferAmount,
        });
      } else if (status === 'FAILED') {
        console.log(`Payment failed for user ${username}`);
      }

      // Send the payment status in the response to the client
      res.status(200).json({ success: true, status });
    } catch (error) {
      console.error('Error processing payment callback:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
