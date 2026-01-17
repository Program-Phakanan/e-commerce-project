import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password, name } = body;

        // Basic validation
        if (!username || !email || !password || !name) {
            return NextResponse.json(
                { message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' },
                { status: 400 }
            );
        }

        // Check format
        // Username: alphanumeric only, 3-20 chars
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return NextResponse.json(
                { message: 'ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษหรือตัวเลข 3-20 ตัวอักษร' },
                { status: 400 }
            );
        }

        // Check if user already exists (username OR email)
        // Check if user already exists (username OR email) - API side check with Case Insensitive
        // Note: Ideally enforce unique constraints in DB as well
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: { equals: username, mode: 'insensitive' } },
                    { email: { equals: email, mode: 'insensitive' } },
                ],
            },
        });

        if (existingUser) {
            if (existingUser.username.toLowerCase() === username.toLowerCase()) {
                return NextResponse.json(
                    { message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' },
                    { status: 400 }
                );
            }
            if (existingUser.email.toLowerCase() === email.toLowerCase()) {
                return NextResponse.json(
                    { message: 'อีเมลนี้ถูกใช้งานแล้ว' },
                    { status: 400 }
                );
            }
            // Fallback general error if collision detected but not specifically identified by strict logic above
            return NextResponse.json(
                { message: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword,
                role: 'Customer', // Default role
            },
        });

        // Generate JWT Token for Auto-login
        const token = jwt.sign(
            {
                userId: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '7d' }
        );

        // Return success with Token
        const { password: _, ...userWithoutPassword } = newUser;

        const response = NextResponse.json(
            {
                message: 'สมัครสมาชิกสำเร็จ',
                user: userWithoutPassword,
                token
            },
            { status: 201 }
        );

        // Set Cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
            { status: 500 }
        );
    }
}
