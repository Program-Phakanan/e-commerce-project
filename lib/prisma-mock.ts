// Temporary mock Prisma client for development without database
// This allows the app to run while database connection is being set up

const mockPrismaClient = {
    user: {
        findUnique: async (params: any) => {
            // Mock admin user for testing
            if (params?.where?.username === 'admin' || params?.where?.email === 'admin@ecommerce.com') {
                return {
                    id: '1',
                    name: 'Admin User',
                    username: 'admin',
                    email: 'admin@ecommerce.com',
                    password: '$2a$10$YourHashedPasswordHere', // This will be checked by bcrypt
                    role: 'Admin',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }
            return null;
        },
        findFirst: async () => ({
            id: '1',
            name: 'Admin User',
            username: 'admin',
            email: 'admin@ecommerce.com',
            password: '$2a$10$YourHashedPasswordHere',
            role: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        findMany: async () => [],
        create: async (data: any) => ({ id: '1', ...data.data }),
        update: async (data: any) => ({ id: '1', ...data.data }),
        delete: async () => ({ id: '1' }),
        count: async () => 0,
        upsert: async (data: any) => ({ id: '1', ...(data.create || data.update) }),
    },
    category: {
        findMany: async () => [],
        findUnique: async () => null,
        create: async (data: any) => ({ id: '1', ...data.data }),
        upsert: async (data: any) => ({ id: '1', ...data.create }),
    },
    product: {
        findMany: async () => [],
        findUnique: async () => null,
        create: async (data: any) => ({ id: '1', ...data.data }),
        update: async (data: any) => ({ id: '1', ...data.data }),
        delete: async () => ({ id: '1' }),
        count: async () => 0,
    },
    customer: {
        findMany: async () => [],
        findUnique: async () => null,
        create: async (data: any) => ({ id: '1', ...data.data }),
        update: async (data: any) => ({ id: '1', ...data.data }),
        delete: async () => ({ id: '1' }),
        count: async () => 0,
    },
    order: {
        findMany: async () => [],
        findUnique: async () => null,
        create: async (data: any) => ({ id: '1', ...data.data }),
        update: async (data: any) => ({ id: '1', ...data.data }),
        delete: async () => ({ id: '1' }),
        count: async () => 0,
    },
    orderStatus: {
        findMany: async () => [
            { id: '1', name: 'รอชำระเงิน', orderIndex: 1, color: '#EF4444' },
            { id: '2', name: 'รอจัดเตรียม', orderIndex: 2, color: '#F59E0B' },
            { id: '3', name: 'กำลังแพ็คสินค้า', orderIndex: 3, color: '#FFB84D' },
            { id: '4', name: 'พร้อมจัดส่ง', orderIndex: 4, color: '#3B82F6' },
            { id: '5', name: 'กำลังจัดส่ง', orderIndex: 5, color: '#8B5CF6' },
            { id: '6', name: 'จัดส่งสำเร็จ', orderIndex: 6, color: '#10B981' },
            { id: '7', name: 'ยกเลิก', orderIndex: 7, color: '#6B7280' },
        ],
        findFirst: async () => ({ id: '1', name: 'รอชำระเงิน', orderIndex: 1, color: '#EF4444' }),
        upsert: async (data: any) => ({ id: '1', ...data.create }),
    },
    orderItem: {
        findMany: async () => [],
    },
    inventoryLog: {
        create: async (data: any) => ({ id: '1', ...data.data }),
    },
    $disconnect: async () => { },
};

export const prisma = mockPrismaClient as any;

console.log('⚠️  Using MOCK Prisma Client - Database not connected');
console.log('📝 To use real database:');
console.log('   1. Update DATABASE_URL in .env');
console.log('   2. Run: npx prisma db push');
console.log('   3. Run: npm run prisma:seed');
console.log('   4. Delete lib/prisma-mock.ts');
console.log('   5. Restart server');
