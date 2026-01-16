
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Adding Stripe Payment Method...');

    await prisma.paymentMethod.create({
        data: {
            name: 'Credit/Debit Card',
            details: 'Secure payment via Stripe',
            type: 'CARD', // We will use this type to trigger Stripe flow
            isActive: true,
        }
    });

    console.log('Stripe Payment Method added.');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
