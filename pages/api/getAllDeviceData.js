// pages/api/getAllDeviceData.js
import { getMongoDb } from '@/api-lib/mongodb'; 

export default async function handler(req, res) {
  
  // Connect to MongoDB
  const  db  = await getMongoDb();

  try {
    // Fetch all device data from the devices collection
    const devices = await db.collection('devices').find({}).toArray();

    res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching device data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
