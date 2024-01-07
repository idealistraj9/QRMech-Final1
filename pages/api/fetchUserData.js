import mongoose from 'mongoose';
import { findUserByUsername } from '@/api-lib/db/user'; // Import the function

export default async function handler(req, res) {
  try {
    // Establish a database connection
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Use the function to find a user by username
    const db = mongoose.connection; // Get the database instance
    // const username = 'femego';
    const { username } = req.query;
    console.log(username);
    const user = await findUserByUsername(db, username);

    // Close the database connection
    await mongoose.disconnect();

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send({ error: 'Error fetching data' });
  }
}
