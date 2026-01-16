// Types Definitions

// User Interface
export interface User {
    id: string;
    name: string;
    email: string;
    username: string; // Added username
    role: string; // Changed from UserRole enum to string for SQLite compatibility
    image?: string;
}

// Auth Context Interface
export interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<any>; // Changed email to username
    register: (data: any) => Promise<boolean>;
    logout: () => void;
    updateUser: (userData: User) => void;
    loading: boolean;
}

// Dashboard Stats Interface
export interface DashboardStats {
    totalOrdersToday: number;
    totalRevenueMonth: number;
    pendingOrders: number;
    lowStockProducts: number;
}

// Product Interface (Matched with Prisma Schema)
export interface ProductWithCategory {
    id: string;
    name: string; // Changed from productName
    sku: string;
    category: {
        id: string;
        name: string;
    };
    price: number; // Changed to number (Prisma Decimal returns as string/number depending on config, usually handled as number in frontend)
    stock: number; // Changed from stockQuantity
    isActive: boolean;
    images?: string; // Added images
}

// Order Interface
export interface OrderWithDetails {
    id: string;
    orderNumber: string;
    customer: {
        id: string;
        name: string;
        email: string;
    };
    orderStatus: { // Changed from status to orderStatus (relation name)
        id: string;
        name: string;
        color: string;
    };
    totalAmount: number;
    paymentStatus: string;
    createdAt: Date;
}
