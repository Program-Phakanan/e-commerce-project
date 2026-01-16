const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding payment methods...');

    const method1 = await prisma.paymentMethod.create({
        data: {
            name: 'QR Code PromptPay (Auto)',
            type: 'PROMPTPAY',
            details: 'ระบบตรวจสอบอัตโนมัติ 24 ชม.',
            isActive: true,
            qrCode: 'https://cdn-icons-png.flaticon.com/512/241/241528.png' // Mock QR Image
        }
    });

    const method2 = await prisma.paymentMethod.create({
        data: {
            name: 'กสิกรไทย (KBank)',
            type: 'BANK_TRANSFER',
            details: '123-4-56789-0\nบริษัท แอนตี้กราวิตี้ จำกัด',
            isActive: true
        }
    });

    console.log('Created:', method1.name, method2.name);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
