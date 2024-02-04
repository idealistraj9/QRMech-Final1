// pages/api/setDeviceID.js
import withSession from '../../lib/ironSession';

export default withSession(async (req, res) => {
  try {
    const { deviceID } = req.body;

    if (deviceID) {
      // Store deviceID in session
      req.session.set('deviceID', deviceID);
      await req.session.save();
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: 'DeviceID not provided in the request body' });
    }
  } catch (error) {
    console.error('Error setting deviceID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
