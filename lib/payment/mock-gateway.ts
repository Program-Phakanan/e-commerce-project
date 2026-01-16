import { prisma } from '@/lib/prisma';

// This is a Mock Gateway Simulation
// In real life, this would be GB Prime Pay or Omise SDK

export const MockGateway = {
    // 1. Create a "Transaction" and get QR Code
    createTransaction: async (orderId: string, amount: number) => {
        // Generate a fake Reference ID
        const refId = `REF-${Math.floor(Math.random() * 1000000)}`;

        // Update Order with this initial Ref
        await prisma.order.update({
            where: { id: orderId },
            data: { paymentRef: refId }
        });

        // Use a free API to generate a QR Code image (text based)
        // In real PromptPay, this payload string is complex.
        // Here we just encode the refId to make it look real.
        const mockPayload = `PROMPTPAY|${refId}|${amount}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPayload)}`;

        return {
            refId,
            qrUrl,
            amount,
            expiryMinutes: 10
        };
    },

    // 2. Check Status (Simulation)
    // In real life, we don't poll database often, we wait for Webhook.
    // But for frontend polling, we check the DB status.
    checkStatus: async (orderId: string) => {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { paymentStatus: true }
        });
        return order?.paymentStatus === 'Paid';
    },

    // 3. Simulate Scanned & Paid (Admin Only Action)
    simulatePaymentSuccess: async (orderId: string) => {
        // 1. Update Order Status
        const paidStatus = await prisma.orderStatus.findUnique({ where: { name: 'Paid' } });
        // Fallback if 'Paid' status doesn't exist (it should from seed)
        // If not found, we just update paymentStatus string.

        const updateData: any = {
            paymentStatus: 'Paid',
            // Also update the Order Status flow if possible
        };

        if (paidStatus) {
            updateData.statusId = paidStatus.id;
        }

        await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });

        return true;
    }
};
