const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding tags...');

    const tags = [
        { name: '#ขายดี', color: 'gold' },
        { name: '#มาใหม่', color: 'green' },
        { name: '#ลดราคา', color: 'red' },
        { name: '#แนะนำ', color: 'blue' },
        { name: '#ของมันต้องมี', color: 'purple' },
        { name: '#ส่งฟรี', color: 'teal' },
    ];

    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { name: tag.name },
            update: {},
            create: tag,
        });
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
