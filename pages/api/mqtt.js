import mqtt from 'mqtt';

export default async function handler(req, res) {
  return new Promise((resolve, reject) => {
    if (req.method === 'POST') {
      const { message } = req.body;

      // Connect to MQTT broker
      const client = mqtt.connect('mqtt://localhost:1883');

      client.on('connect', () => {
        // Send the message to MQTT broker
        client.publish('credit', message, (err) => {
          client.end(); // Close MQTT connection
          if (err) {
            res.status(500).json({ error: 'Failed to publish message to MQTT broker' });
            resolve();
          } else {
            res.status(200).json({ success: true }); // Send success response
            resolve();
          }
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
