import mqtt from 'mqtt';

export default async function handler(req, res) {
  return new Promise((resolve, reject) => {
    if (req.method === 'POST') {
      const { deviceID, Command } = req.body;

      if (!deviceID || !Command) {
        res.status(400).json({ error: 'Device ID and Command are required' });
        resolve();
        return;
      }

      // Connect to MQTT broker with password authentication
      const client = mqtt.connect('mqtt://localhost:1883', {
        username: 'raj', // Replace with your MQTT broker username
        password: 'raj', // Replace with your MQTT broker password
      });

      client.on('connect', () => {
        // Publish the message to the Control topic
        const controlMessage = {
          deviceID: deviceID,
          Command: Command,
        };

        client.publish('Control', JSON.stringify(controlMessage), (err) => {
          if (err) {
            res.status(500).json({ error: 'Failed to publish message to Control topic' });
          } else {
            res.status(200).json({ success: true });
          }
          client.end(); // Close MQTT connection
          resolve();
        });
      });

      client.on('error', (err) => {
        res.status(500).json({ error: 'Failed to connect to MQTT broker' });
        resolve();
      });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
      resolve();
    }
  });
}