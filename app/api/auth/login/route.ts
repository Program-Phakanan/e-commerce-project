import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { logActivity } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '7d' }
        );

        // Return user data (without password) and token
        const { password: _, ...userWithoutPassword } = user;


        // Create response
        const response = NextResponse.json({
            user: userWithoutPassword,
            token,
        });

        // Log Activity
        await logActivity(user.id, 'LOGIN', 'User logged in successfully', request);

        // Set Cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure this is false in dev
            sameSite: 'lax', // Relaxed for local dev
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
