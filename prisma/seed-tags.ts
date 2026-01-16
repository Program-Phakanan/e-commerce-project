import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🏷️ Seeding tags...');

    const tags = [
        { name: 'ขายดี', color: 'red' },
        { name: 'สินค้าใหม่', color: 'green' },
        { name: 'แนะนำ', color: 'blue' },
        { name: 'ลดราคา', color: 'orange' },
        { name: 'โปรโมชั่น', color: 'purple' },
        { name: 'จัดส่งฟรี', color: 'teal' },
        { name: 'ของแท้ 100%', color: 'indigo' },
        { name: 'พร้อมส่ง', color: 'emerald' },
        { name: 'จำนวนจำกัด', color: 'rose' },
    ];

    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { name: tag.name },
            update: { color: tag.color },
            create: { name: tag.name, color: tag.color },
        });
        console.log(`Created tag: ${tag.name}`);
    }

    console.log('✅ Tags seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
