import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sedang mengisi data kategori...');

  const categories = [
    // --- PEMASUKAN (INCOME) ---
    { name: 'Gaji', type: CategoryType.INCOME, icon: 'banknote' },
    { name: 'Freelance', type: CategoryType.INCOME, icon: 'laptop' },
    { name: 'Investasi', type: CategoryType.INCOME, icon: 'trending-up' },
    { name: 'Bonus', type: CategoryType.INCOME, icon: 'gift' },

    // --- PENGELUARAN (EXPENSE) ---
    { name: 'Makanan & Minuman', type: CategoryType.EXPENSE, icon: 'utensils' },
    { name: 'Transportasi', type: CategoryType.EXPENSE, icon: 'car' },
    { name: 'Pendidikan', type: CategoryType.EXPENSE, icon: 'graduation-cap' },
    { name: 'Hiburan', type: CategoryType.EXPENSE, icon: 'clapperboard' },
    { name: 'Belanja', type: CategoryType.EXPENSE, icon: 'shopping-bag' },
    { name: 'Kesehatan', type: CategoryType.EXPENSE, icon: 'heart-pulse' },
    { name: 'Tagihan & Listrik', type: CategoryType.EXPENSE, icon: 'receipt' },
    { name: 'Sewa Tempat', type: CategoryType.EXPENSE, icon: 'home' },
  ];

  for (const category of categories) {
    // Mencari berdasarkan nama untuk menghindari duplikasi
    const existing = await prisma.category.findFirst({
      where: { name: category.name, type: category.type }
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
      console.log(`✅ Kategori dibuat: ${category.name}`);
    } else {
      console.log(`⏩ Kategori sudah ada: ${category.name}`);
    }
  }

  console.log('✨ Berhasil sinkronisasi 12 kategori default.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
