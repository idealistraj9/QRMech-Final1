import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, amount } = req.body;

    // Establish a database connection
    await mongoose.connect('mongodb://localhost:27017', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection; // Get the database instance
    const user = await db.collection('users').findOne({ username: name });
    // console.log(user);
    var r = parseFloat(user.credit)
    var a = parseFloat(amount)  
    if(user.credit != NaN){
      var currentCredit = r +a;
    }else{
      currentCredit = a;
    }
    
    console.log(currentCredit);
    const updateResult = await db.collection('users').updateOne(
      { username: name }, // Replace 'users' with your collection name
      {  $set:{credit: currentCredit}  } // Increment the credit field by 'amount'
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Close the database connection
    await mongoose.disconnect();

    return res.status(200).json({ message: 'Credit updated successfully' });
  } catch (error) {
    console.error('Error updating credit:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
