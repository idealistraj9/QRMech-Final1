// lib/deviceDatabase.js

import { getMongoDb } from '@/api-lib/mongodb'; // Replace with your actual collection name


export async function savePaymentToDatabase(deviceID, amount, creditAmount) {
  try {
    const db = await getMongoDb();

    // Insert the payment data into the devices collection
    const result = await db.collection('devices').insertOne({
      deviceID: deviceID,
      amount: amount,
      creditAmount: creditAmount,
      location: 'unknown',
      timestamp: new Date(),
    });

    return result;
  } catch (error) {
    console.error('Error saving payment to database:', error);
    throw error;
  }
}
