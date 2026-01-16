
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing Prisma Connection...');
        const count = await prisma.user.count();
        console.log('Connection Successful! User count:', count);
    } catch (e) {
        console.error('Connection Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
