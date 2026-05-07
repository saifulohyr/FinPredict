"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Sedang mengisi data kategori...');
    const categories = [
        // --- PEMASUKAN (INCOME) ---
        { name: 'Gaji', type: client_1.CategoryType.INCOME, icon: 'banknote' },
        { name: 'Freelance', type: client_1.CategoryType.INCOME, icon: 'laptop' },
        { name: 'Investasi', type: client_1.CategoryType.INCOME, icon: 'trending-up' },
        { name: 'Bonus', type: client_1.CategoryType.INCOME, icon: 'gift' },
        // --- PENGELUARAN (EXPENSE) ---
        { name: 'Makanan & Minuman', type: client_1.CategoryType.EXPENSE, icon: 'utensils' },
        { name: 'Transportasi', type: client_1.CategoryType.EXPENSE, icon: 'car' },
        { name: 'Pendidikan', type: client_1.CategoryType.EXPENSE, icon: 'graduation-cap' },
        { name: 'Hiburan', type: client_1.CategoryType.EXPENSE, icon: 'clapperboard' },
        { name: 'Belanja', type: client_1.CategoryType.EXPENSE, icon: 'shopping-bag' },
        { name: 'Kesehatan', type: client_1.CategoryType.EXPENSE, icon: 'heart-pulse' },
        { name: 'Tagihan & Listrik', type: client_1.CategoryType.EXPENSE, icon: 'receipt' },
        { name: 'Sewa Tempat', type: client_1.CategoryType.EXPENSE, icon: 'home' },
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
        }
        else {
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
//# sourceMappingURL=seed.js.map