import mqtt from 'mqtt';
import { getMongoDb } from '@/api-lib/mongodb'; // Adjust the path accordingly

export default async function handler(req, res) {
  return new Promise(async (resolve, reject) => {
    let responseSent = false; // Flag to track whether the response has been sent

    try {
      if (req.method === 'POST') {
        const { name, deduction } = req.body;
        console.log(
          `Received POST request to /api/deductCredit for user: ${name}`
        );
        // Connect to MQTT broker with password authentication
        const client = mqtt.connect('mqtt://localhost:1883', {
          username: 'raj', // Replace with your MQTT broker username
          password: 'raj', // Replace with your MQTT broker password
        });

        client.on('connect', () => {
          // Subscribe to the Update topic
          client.subscribe('Update', (err) => {
            if (err) {
              res
                .status(500)
                .json({ error: 'Failed to subscribe to Update topic' });
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
          if (topic === 'Update' && !responseSent) { // Check if the response has not been sent
            try {
              const updateMessage = JSON.parse(message.toString());
              const deviceID = updateMessage.deviceID;
              const power = updateMessage.Power;

              // Process the deviceID and power data here
              console.log('Received Update:', deviceID, power);

              // Calculate credits from power
              const credits =  power;

              // Deduct the credits from the user's credit in the database
              const user = await db
                .collection('users')
                .findOne({ username: name });

              // Deduct credits only if the user has enough credits
              if (user && user.credit >= credits) {
                const updatedCredit = user.credit - credits;
                console.log('Updated credit:', updatedCredit)
                // Update the user's credit in the database
                const updateResult = await db
                  .collection('users')
                  .updateOne(
                    { username: name },
                    { $set: { credit: updatedCredit } }
                  );

                // Send the power data and calculated credits along with the success response
                res.status(200).json({ success: true, power, credits });
                responseSent = true; // Set the flag to true after sending the response
              } else {
                responseSent = true; // Set the flag to true if there's an error to avoid sending multiple responses
                return res
                  .status(403)
                  .json({ message: 'Insufficient credits' });
              }
            } catch (error) {
              console.error('Error parsing MQTT message:', error.message);
              responseSent = true; // Set the flag to true if there's an error to avoid sending multiple responses
            }
          }
        });

        client.on('error', (err) => {
          if (!responseSent) { // Check if the response has not been sent
            res
              .status(500)
              .json({ error: 'Failed to connect to MQTT broker:', err });
            responseSent = true; // Set the flag to true after sending the response
          }
        });
      } else {
        if (!responseSent) { // Check if the response has not been sent
          res.status(405).json({ error: 'Method Not Allowed' });
          responseSent = true; // Set the flag to true after sending the response
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      if (!responseSent) { // Check if the response has not been sent
        res.status(500).json({ error: 'Internal Server Error', error });
        responseSent = true; // Set the flag to true after sending the response
      }
    } finally {
      resolve();
    }
  });
}
