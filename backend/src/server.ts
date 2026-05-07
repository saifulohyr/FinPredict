import 'dotenv/config';
import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('⚠️ Database connection failed. Some features may not work.', error);
  }
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main();
