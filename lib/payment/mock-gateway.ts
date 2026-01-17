import { prisma } from '@/lib/prisma';
// Ensure compatibility with CommonJS library
const generatePayload = require('promptpay-qr');

// --- CONFIGURATION ---
const PROMPTPAY_NUMBER = process.env.PROMPTPAY_NUMBER || '0972766446'; // Default fallback or use config

export const PromptPayGateway = {
    // 1. Create a "Transaction" and get QR Code
    createTransaction: async (orderId: string, amount: number) => {
        // Generate a Reference ID
        const refId = `REF-${Math.floor(Math.random() * 1000000)}`;

        // Update Order with this initial Ref
        await prisma.order.update({
            where: { id: orderId },
            data: { paymentRef: refId }
        });

        // --- REAL PROMPTPAY GENERATION ---
        const amountNum = Number(amount);
        let payload = '';

        try {
            // Function might be the module itself or .default
            const generator = typeof generatePayload === 'function' ? generatePayload : generatePayload.default;
            if (typeof generator === 'function') {
                payload = generator(PROMPTPAY_NUMBER, { amount: amountNum });
            } else {
                console.error('PromptPay Library Error: generatePayload is not a function', generatePayload);
                payload = 'ERROR_LIB_NOT_FOUND';
            }
        } catch (error) {
            console.error('Generate Payload Error:', error);
            payload = 'ERROR_GENERATION_FAILED';
        }

        // Use a public API to convert payload to Image URL
        // In FULL production, you might generate QR locally to avoid external dependency, but this is fine for now.
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;

        return {
            refId,
            qrUrl,
            amount,
            expiryMinutes: 10
        };
    },

    // 2. Check Status
    // In real life, we don't polling database often, we wait for Webhook.
    // However, for systems without Webhooks (like simple personal PromptPay), admin must manually approve,
    // or we use a third party service. This check allows the frontend to know when the status changes.
    checkStatus: async (orderId: string) => {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { paymentStatus: true }
        });
        return order?.paymentStatus === 'Paid';
    },

    // confirmPayment logic could be here if we had a webhook, but we'll stick to admin manual update for now.
};
