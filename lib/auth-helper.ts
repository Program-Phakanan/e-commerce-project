import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

/**
 * Extracts and verifies the user ID from the JWT token found in cookies or authorization headers.
 * @param request The NextRequest object
 * @returns The user ID if authenticated, or null if not.
 */
export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    try {
        let token = request.cookies.get('token')?.value;

        // Fallback: Check Authorization header (Bearer <token>)
        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) return null;

        const decoded: any = jwt.verify(token, JWT_SECRET);
        return decoded.userId || null;
    } catch (error) {
        // Token invalid or expired
        return null;
    }
}
