import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Disable body parsing for webhook
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const orderId = session.metadata?.orderId;

                if (orderId) {
                    // Update order status to Paid
                    const paidStatus = await prisma.orderStatus.findUnique({
                        where: { name: 'Paid' }
                    });

                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            paymentStatus: 'Paid',
                            paymentRef: session.payment_intent || session.id,
                            statusId: paidStatus?.id,
                        }
                    });

                    console.log(`✅ Order ${orderId} marked as Paid via Stripe`);
                }
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                console.log(`✅ PaymentIntent succeeded: ${paymentIntent.id}`);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                console.log(`❌ PaymentIntent failed: ${paymentIntent.id}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
