import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * Logs a user activity to the database.
 * @param userId The ID of the user performing the action
 * @param action A short string describing the action (e.g., 'LOGIN', 'UPDATE_PROFILE')
 * @param details Optional details about the action (e.g., 'Updated name from A to B')
 * @param request Optional NextRequest object to extract IP address
 */
export async function logActivity(
    userId: string,
    action: string,
    details?: string,
    request?: NextRequest
) {
    try {
        let ipAddress = 'Unknown';
        if (request) {
            ipAddress = request.headers.get('x-forwarded-for') || (request as any).ip || 'Unknown';
        }

        await prisma.activityLog.create({
            data: {
                userId,
                action,
                details,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Does not throw error to avoid disrupting the main flow
    }
}
