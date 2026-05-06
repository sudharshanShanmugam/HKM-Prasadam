import 'dotenv/config';
import mongoose from 'mongoose';

const COLLECTIONS = [
  'prasadambookings',
  'registrations',
  'counters',
  'partyenquiries',
  'internalorders',
  'slotdates',
  'mealmenus',
  'festivals',
  'settings',
];

async function clearDb() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB');

  for (const name of COLLECTIONS) {
    const result = await mongoose.connection.collection(name).deleteMany({});
    console.log(`  ${name}: deleted ${result.deletedCount} document(s)`);
  }

  await mongoose.disconnect();
  console.log('Done — all collections cleared.');
}

clearDb().catch(err => {
  console.error(err);
  process.exit(1);
});
