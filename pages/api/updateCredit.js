// pages/api/updateCredit.js

import connectDB from '@/lib/db';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB();

  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's credit field
    user.credit += amount;
    await user.save();

    return res.status(200).json({ message: 'Credit updated successfully' });
  } catch (error) {
    console.error('Error updating credit:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
