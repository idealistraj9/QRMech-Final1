import mqtt from 'mqtt';
import { getMongoDb } from '@/api-lib/mongodb';

export default async function handler(req, res) {
  return new Promise(async (resolve, reject) => {
    let responseSent = false;
    let client;
    let totalPower = 0; // Variable to accumulate power values

    try {
      if (req.method === 'POST') {
        const { name } = req.body;
        console.log(
          `Received POST request to /api/fetchPowerData for user: ${name}`
        );

        // Connect to MQTT broker with password authentication
        client = mqtt.connect('mqtt://localhost:1883', {
          username: 'raj', // Replace with your MQTT broker username
          password: 'raj', // Replace with your MQTT broker password
        });

        client.on('connect', () => {
          // Subscribe to the Update topic
          client.subscribe('Update', (err) => {
            if (err) {
              responseSent = true;
              res
                .status(500)
                .send({ error: 'Failed to subscribe to Update topic' });
              resolve();
            } else {
              console.log('Subscribed to Update topic');
            }
          });
        });

        // Handle incoming messages on the Update topic
        client.on('message', async (topic, message) => {
          if (topic === 'Update' && !responseSent) {
            const updateMessage = JSON.parse(message.toString());
            const deviceID = updateMessage.deviceID;
            const power = updateMessage.Power;

            console.log('Received Update:', deviceID, power);

            // Calculate credits from power
            const credits = power;

            // Accumulate power values
            totalPower += power;

            // Unsubscribe from the MQTT topic and close the connection
            client.unsubscribe('Update');
            client.end();

            // Send the power data and calculated credits along with the success response
            res
              .status(200)
              .send({ success: true, power: totalPower, credits: totalPower });

            responseSent = true;
            resolve();
          }
        });
      } else {
        if (!responseSent) {
          res.status(405).send({ error: 'Method Not Allowed' });
          resolve();
          responseSent = true;
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      if (!responseSent) {
        res.status(500).send({ error: 'Internal Server Error', error });
        resolve();
        responseSent = true;
      }
    }
  });
}
