# 🔌 API Documentation

## Authentication Endpoints

### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@ecommerce.com",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@ecommerce.com",
    "role": "Admin",
    "createdAt": "2026-01-14T...",
    "updatedAt": "2026-01-14T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

## Dashboard Endpoints

### GET `/api/dashboard/stats`
Get dashboard statistics.

**Success Response (200):**
```json
{
  "totalOrdersToday": 5,
  "totalRevenueMonth": 125000,
  "pendingOrders": 3,
  "lowStockProducts": 7
}
```

### GET `/api/dashboard/recent-orders`
Get 10 most recent orders.

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "orderNumber": "ORD-2026-0001",
    "customerName": "John Doe",
    "totalAmount": 1500,
    "status": "รอจัดเตรียม",
    "statusColor": "#F59E0B",
    "createdAt": "2026-01-14T..."
  }
]
```

---

## 🚧 Upcoming API Endpoints (Phase 3 & 4)

### Products

#### GET `/api/products`
Get all products with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or SKU
- `categoryId` (string): Filter by category
- `isActive` (boolean): Filter by active status
- `stockStatus` (string): 'low' | 'out' | 'available'

#### GET `/api/products/[id]`
Get single product by ID.

#### POST `/api/products`
Create new product.

**Request Body:**
```json
{
  "productName": "Product Name",
  "sku": "SKU-001",
  "categoryId": "uuid",
  "description": "Product description",
  "price": 1000,
  "stockQuantity": 50,
  "imageUrls": ["url1", "url2"],
  "isActive": true
}
```

#### PUT `/api/products/[id]`
Update product.

#### DELETE `/api/products/[id]`
Delete product.

#### PATCH `/api/products/[id]/stock`
Update stock quantity.

**Request Body:**
```json
{
  "quantity": 10,
  "reason": "New_Stock",
  "note": "Restocked from supplier"
}
```

---

### Orders

#### GET `/api/orders`
Get all orders with pagination and filters.

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `search` (string): Search by order number or customer name
- `statusId` (string): Filter by status
- `paymentStatus` (string): Filter by payment status
- `dateFrom` (string): Start date
- `dateTo` (string): End date

#### GET `/api/orders/[id]`
Get single order with all details.

**Response:**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-2026-0001",
  "customer": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0812345678",
    "address": "123 Main St"
  },
  "status": {
    "id": "uuid",
    "name": "รอจัดเตรียม",
    "color": "#F59E0B"
  },
  "orderItems": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "productName": "Product 1",
        "sku": "SKU-001"
      },
      "quantity": 2,
      "unitPrice": 500,
      "subtotal": 1000
    }
  ],
  "totalAmount": 1000,
  "shippingAddress": "123 Main St",
  "paymentMethod": "Credit_Card",
  "paymentStatus": "Paid",
  "notes": "Please deliver before 5 PM",
  "createdAt": "2026-01-14T...",
  "updatedAt": "2026-01-14T..."
}
```

#### POST `/api/orders`
Create new order.

#### PUT `/api/orders/[id]`
Update order.

#### PATCH `/api/orders/[id]/status`
Update order status.

**Request Body:**
```json
{
  "statusId": "uuid"
}
```

#### DELETE `/api/orders/[id]`
Cancel order.

---

### Customers

#### GET `/api/customers`
Get all customers with pagination.

#### GET `/api/customers/[id]`
Get single customer with order history.

#### POST `/api/customers`
Create new customer.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0812345678",
  "address": "123 Main St",
  "city": "Bangkok",
  "postalCode": "10100"
}
```

#### PUT `/api/customers/[id]`
Update customer.

#### DELETE `/api/customers/[id]`
Delete customer.

---

### Categories

#### GET `/api/categories`
Get all categories.

#### POST `/api/categories`
Create new category.

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices",
  "imageUrl": "https://...",
  "isActive": true
}
```

#### PUT `/api/categories/[id]`
Update category.

#### DELETE `/api/categories/[id]`
Delete category.

---

### Order Statuses

#### GET `/api/order-statuses`
Get all order statuses.

#### POST `/api/order-statuses`
Create new order status (Admin only).

**Request Body:**
```json
{
  "name": "Custom Status",
  "orderIndex": 8,
  "color": "#FF0000"
}
```

---

### Inventory

#### GET `/api/inventory/logs`
Get inventory movement logs.

**Query Parameters:**
- `productId` (string): Filter by product
- `orderId` (string): Filter by order
- `reason` (string): Filter by reason
- `dateFrom` (string)
- `dateTo` (string)

#### POST `/api/inventory/adjust`
Manual stock adjustment.

**Request Body:**
```json
{
  "productId": "uuid",
  "changeQuantity": 10,
  "reason": "Adjustment",
  "note": "Stock count correction"
}
```

---

### Reports

#### GET `/api/reports/sales`
Get sales report.

**Query Parameters:**
- `dateFrom` (string): Start date
- `dateTo` (string): End date
- `groupBy` (string): 'day' | 'week' | 'month'

**Response:**
```json
{
  "totalRevenue": 125000,
  "totalOrders": 45,
  "averageOrderValue": 2777.78,
  "salesByDate": [
    {
      "date": "2026-01-14",
      "revenue": 5000,
      "orders": 3
    }
  ]
}
```

#### GET `/api/reports/products`
Get product performance report.

**Response:**
```json
{
  "bestSellers": [
    {
      "productId": "uuid",
      "productName": "Product 1",
      "totalSold": 100,
      "revenue": 50000
    }
  ],
  "slowMoving": [
    {
      "productId": "uuid",
      "productName": "Product 2",
      "totalSold": 2,
      "daysInStock": 90
    }
  ]
}
```

#### GET `/api/reports/customers`
Get customer analytics.

**Response:**
```json
{
  "topCustomers": [
    {
      "customerId": "uuid",
      "customerName": "John Doe",
      "totalOrders": 15,
      "totalSpent": 75000
    }
  ],
  "newCustomers": 10,
  "returningCustomers": 25
}
```

---

### Users (Admin Only)

#### GET `/api/users`
Get all users.

#### POST `/api/users`
Create new user.

**Request Body:**
```json
{
  "name": "Staff User",
  "email": "staff@example.com",
  "password": "password123",
  "role": "Staff"
}
```

#### PUT `/api/users/[id]`
Update user.

#### DELETE `/api/users/[id]`
Delete user.

---

## Authentication Headers

For protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

**Note:** API endpoints marked with 🚧 are not yet implemented and will be added in Phase 3 & 4.
