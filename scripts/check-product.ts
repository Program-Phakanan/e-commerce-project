
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const productId = '4d36711f-9667-4057-bc61-f444c03f0a96';
    console.log(`Checking for product ID: ${productId}`);

    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (product) {
        console.log('Product found:', product.name);
    } else {
        console.log('Product NOT found.');
        console.log('Listing first 5 available products:');
        const products = await prisma.product.findMany({ take: 5 });
        products.forEach(p => console.log(`- ${p.name} (${p.id})`));
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
