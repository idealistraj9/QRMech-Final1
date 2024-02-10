// getDeviceDetails.js
import { getMongoDb } from '@/api-lib/mongodb';

export default async function handler(req, res) {
  try {
    const db = await getMongoDb();
    const deviceid = req.query.deviceid;

    // Check if deviceid is a valid string (no ObjectId validation needed)
    console.log('deviceid:', deviceid);

    // Use find to get all records with the given deviceID
    const deviceDetails = await db.collection('devices').find({
      deviceID: deviceid,
    }).toArray();

    if (!deviceDetails || deviceDetails.length === 0) {
      return res.status(404).json({ error: 'No devices found for the given ID' });
    }

    res.status(200).json(deviceDetails);
  } catch (error) {
    console.error('Error fetching device details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
