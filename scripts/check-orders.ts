
import { prisma } from '../lib/prisma';

async function main() {
    try {
        console.log('Checking orders...');
        const orders = await prisma.order.findMany({
            include: {
                customer: true,
                orderStatus: true
            }
        });

        console.log(`Found ${orders.length} orders.`);

        for (const order of orders) {
            if (!order.customer) {
                console.error(`Order ${order.id} is missing customer! (customerId: ${order.customerId})`);
            }
            if (!order.orderStatus) {
                console.error(`Order ${order.id} is missing orderStatus! (statusId: ${order.statusId})`);
            }
        }

        console.log('Data check complete.');

    } catch (error) {
        console.error('Error checking orders:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
