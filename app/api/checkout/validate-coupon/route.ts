import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, cartTotal } = body;

        // Get Client IP
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

        if (!code) {
            return NextResponse.json({ message: 'Code is required' }, { status: 400 });
        }

        const upperCode = code.toUpperCase().trim();

        // 1. Find Coupon in DB
        const coupon = await prisma.coupon.findUnique({
            where: { code: upperCode }
        });

        if (!coupon) {
            return NextResponse.json(
                { message: 'ไม่พบโค้ดส่วนลดนี้' },
                { status: 404 }
            );
        }

        // 2. Check Active Status
        if (!coupon.isActive) {
            return NextResponse.json(
                { message: 'โค้ดส่วนลดนี้ปิดใช้งานแล้ว' },
                { status: 400 }
            );
        }

        // 3. Check Expiration
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return NextResponse.json(
                { message: 'โค้ดส่วนลดหมดอายุแล้ว' },
                { status: 400 }
            );
        }

        // 4. Check Global Usage Limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json(
                { message: 'โค้ดส่วนลดถูกใช้ครบจำนวนสิทธิ์แล้ว' },
                { status: 400 }
            );
        }

        // 5. Check Min Order Amount
        if (coupon.minOrderAmount && Number(coupon.minOrderAmount) > cartTotal) {
            return NextResponse.json(
                { message: `ยอดสั่งซื้อขั้นต่ำ ${coupon.minOrderAmount} บาท` },
                { status: 400 }
            );
        }

        // 6. Check Usage per IP (1 time per IP)
        const usage = await prisma.couponUsage.findFirst({
            where: {
                couponId: coupon.id,
                ipAddress: ip
            }
        });

        if (usage) {
            return NextResponse.json(
                { message: 'คุณเคยใช้โค้ดส่วนลดนี้ไปแล้ว (จำกัด 1 สิทธิ์/เครื่อง)' },
                { status: 400 }
            );
        }

        // 7. Calculate Discount
        let discount = 0;
        let message = '';

        if (coupon.discountType === 'FIXED') {
            discount = Number(coupon.discountValue);
            message = `ลด ${discount} บาท`;
        } else if (coupon.discountType === 'PERCENT') {
            discount = (cartTotal * Number(coupon.discountValue)) / 100;
            // Check Max Discount
            if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
                discount = Number(coupon.maxDiscount);
            }
            message = `ลด ${Number(coupon.discountValue)}%`;
        }

        // Validate final discount not exceeding total
        if (discount > cartTotal) {
            discount = cartTotal;
        }

        return NextResponse.json({
            success: true,
            code: upperCode,
            discountAmount: discount,
            message: message,
            couponId: coupon.id // Return ID for order creation
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
