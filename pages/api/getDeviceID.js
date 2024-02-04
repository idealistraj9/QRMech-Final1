// pages/api/getDeviceID.js
import withSession from '../../lib/ironSession';

export default withSession(async (req, res) => {
  try {
    // Retrieve deviceID from session
    const deviceID = req.session.get('deviceID');

    if (deviceID) {
      res.status(200).json({ deviceID });
    } else {
      res.status(404).json({ error: 'DeviceID not found in session' });
    }
  } catch (error) {
    console.error('Error getting deviceID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
