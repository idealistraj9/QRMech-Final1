import mqtt from 'mqtt';
import { getMongoDb } from '@/api-lib/mongodb'; // Adjust the path accordingly

export default async function handler(req, res) {
  return new Promise(async (resolve, reject) => {
    let responseSent = false; // Flag to track whether the response has been sent
    let client; // MQTT client instance

    try {
      if (req.method === 'POST') {
        const { name, deduction } = req.body;
        console.log(`Received POST request to /api/deductCredit for user: ${name}`);

        // Connect to MQTT broker with password authentication
        client = mqtt.connect('mqtt://localhost:1883', {
          username: 'raj', // Replace with your MQTT broker username
          password: 'raj', // Replace with your MQTT broker password
        });

        client.on('connect', () => {
          // Subscribe to the Update topic
          client.subscribe('Update', (err) => {
            if (err) {
              res.status(500).send({ error: 'Failed to subscribe to Update topic' });
              responseSent = true;
              resolve();
            } else {
              console.log('Subscribed to Update topic');
            }
          });
        });

        // Get the MongoDB database instance
        const db = await getMongoDb();

        // Handle incoming messages on the Update topic
        client.on('message', async (topic, message) => {
          if (topic === 'Update' && !responseSent) {
            try {
              const updateMessage = JSON.parse(message.toString());
              const deviceID = updateMessage.deviceID;
              const power = updateMessage.Power;

              console.log('Received Update:', deviceID, power);

              // Calculate credits from power
              const credits = power;

              // Deduct the credits from the user's credit in the database
              const user = await db.collection('users').findOne({ username: name });

              if (user && user.credit >= credits) {
                const updatedCredit = user.credit - credits;
                console.log('Updated credit:', updatedCredit);

                // Update the user's credit in the database
                const updateResult = await db.collection('users').updateOne(
                  { username: name },
                  { $set: { credit: updatedCredit } }
                );

                // Send the power data and calculated credits along with the success response
                res.status(200).send({ success: true, power, credits });
              } else {
                res.status(403).send({ message: 'Insufficient credits' });
              }
            } catch (error) {
              console.error('Error parsing MQTT message:', error.message);
            } finally {
              // Unsubscribe from the MQTT topic and close the connection
              client.unsubscribe('Update');
              client.end();
              responseSent = true;
              resolve();
            }
          }
        });

        client.on('error', (err) => {
          if (!responseSent) {
            res.status(500).send({ error: 'Failed to connect to MQTT broker:', err });
            responseSent = true;
            resolve();
          }
        });
      } else {
        if (!responseSent) {
          res.status(405).send({ error: 'Method Not Allowed' });
          responseSent = true;
          resolve();
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      if (!responseSent) {
        res.status(500).send({ error: 'Internal Server Error', error });
        responseSent = true;
        resolve();
      }
    }
  });
}
