import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

async function start() {
  if (!process.env.MONGO_URL) throw new Error('Missing MONGO_URL');

  await mongoose.connect(process.env.MONGO_URL);

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
