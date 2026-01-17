
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, orderId, userId, customerEmail } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'No items in checkout' }, { status: 400 });
        }

        const line_items = items.map((item: any) => {
            // Stripe requires absolute URLs and they must be publicly accessible.
            // Localhost URLs or relative paths will cause issues or won't render.
            // safely handle images
            let images: string[] = [];
            if (item.image && item.image.startsWith('http') && !item.image.includes('localhost') && !item.image.includes('127.0.0.1')) {
                images = [item.image];
            }

            return {
                price_data: {
                    currency: 'thb',
                    product_data: {
                        name: item.name,
                        images: images,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            };
        });

        const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Removing 'promptpay' temporarily to isolate card issues, or keep if account supports it. Safest is just card for "Credit Card" option.
            line_items,
            mode: 'payment',
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${origin}/checkout?canceled=true`,
            customer_email: customerEmail,
            metadata: {
                orderId: orderId,
                userId: userId
            }
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message || String(error) },
            { status: 500 }
        );
    }
}
