const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: 'Target Tabungan', type: 'EXPENSE', icon: 'target' },
      { name: 'Pemasukan Tetap', type: 'INCOME', icon: 'briefcase' }
    ],
    skipDuplicates: true
  });
  console.log('Categories added successfully.');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
