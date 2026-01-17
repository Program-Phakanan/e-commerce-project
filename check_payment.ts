
import { prisma } from './lib/prisma';

async function main() {
    const methods = await prisma.paymentMethod.findMany();
    console.log('Payment Methods in DB:', methods);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
