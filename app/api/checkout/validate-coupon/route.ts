import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, cartTotal } = body;

        if (!code) {
            return NextResponse.json({ message: 'Code is required' }, { status: 400 });
        }

        // --- MOCK COUPON LOGIC ---
        // In a real app, this would query a database
        const upperCode = code.toUpperCase().trim();
        let discount = 0;
        let type = '';
        let message = '';

        if (upperCode === 'SAVE50') {
            discount = 50;
            type = 'FIXED';
            message = 'ลด 50 บาท';
        } else if (upperCode === 'SAVE100') {
            discount = 100;
            type = 'FIXED';
            message = 'ลด 100 บาท';
        } else if (upperCode === 'PROMO10') {
            discount = (cartTotal * 10) / 100;
            type = 'PERCENT';
            message = 'ลด 10%';
        } else if (upperCode === 'WELCOME') {
            discount = 99; // ลด 99 บาท
            type = 'FIXED';
            message = 'ส่วนลดต้อนรับสมาชิกใหม่ ลด 99 บาท';
        } else {
            return NextResponse.json(
                { message: 'ไม่พบโค้ดส่วนลดนี้ หรือโค้ดหมดอายุแล้ว' },
                { status: 400 }
            );
        }

        // Validate discount amount
        if (discount > cartTotal) {
            discount = cartTotal; // Cannot discount more than total
        }

        return NextResponse.json({
            success: true,
            code: upperCode,
            discountAmount: discount,
            message: message
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
