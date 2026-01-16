const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating products...');

    // Get all products
    const products = await prisma.product.findMany();

    // Randomly feature 3 products
    for (let i = 0; i < Math.min(3, products.length); i++) {
        const product = products[i];

        // Calculate mock sale price (10-20% off)
        const price = Number(product.price);
        const salePrice = Math.floor(price * 0.85);

        await prisma.product.update({
            where: { id: product.id },
            data: {
                isFeatured: true, // Make first 3 products featured
                salePrice: i === 0 ? salePrice : null // Put the first one on sale
            }
        });
        console.log(`Updated ${product.name}: Featured=${true}, Sale=${i === 0 ? salePrice : 'None'}`);
    }

    // Ensure we have some categories
    const categories = ['อาหารแห้ง', 'อาหารสด', 'เครื่องดื่ม', 'ขนม'];
    for (const catName of categories) {
        await prisma.category.upsert({
            where: { name: catName },
            update: {},
            create: { name: catName }
        });
    }

    console.log('Done!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
