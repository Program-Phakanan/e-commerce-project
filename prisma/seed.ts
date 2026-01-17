import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Order Statuses
  const orderStatuses = [
    { name: 'รอชำระเงิน', orderIndex: 1, color: '#EF4444' },
    { name: 'รอจัดเตรียม', orderIndex: 2, color: '#F59E0B' },
    { name: 'กำลังแพ็คสินค้า', orderIndex: 3, color: '#FFB84D' },
    { name: 'พร้อมจัดส่ง', orderIndex: 4, color: '#3B82F6' },
    { name: 'กำลังจัดส่ง', orderIndex: 5, color: '#8B5CF6' },
    { name: 'จัดส่งสำเร็จ', orderIndex: 6, color: '#10B981' },
    { name: 'ยกเลิก', orderIndex: 7, color: '#6B7280' },
  ];

  console.log('📦 Creating order statuses...');
  for (const status of orderStatuses) {
    await prisma.orderStatus.upsert({
      where: { orderIndex: status.orderIndex },
      update: status,
      create: status,
    });
  }

  // Create Payment Methods
  console.log('💳 Creating payment methods...');
  const paymentMethods = [
    {
      name: 'Credit/Debit Card',
      type: 'CARD', // Must match PaymentMethodType enum if applicable, or string
      details: 'Pay securely with Stripe',
      isActive: true,
      // provider removed
    },
    {
      name: 'PromptPay',
      type: 'PROMPTPAY',
      details: 'Scan QR Code to pay',
      isActive: true,
      // provider removed
    }
  ];

  for (const method of paymentMethods) {
    // Check if exists by name to avoid duplicates if specific constraints aren't there
    const existing = await prisma.paymentMethod.findFirst({
      where: { name: method.name }
    });

    if (!existing) {
      await prisma.paymentMethod.create({
        data: method
      });
    }
  }
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
      email: 'admin@ecommerce.com'
    },
    create: {
      name: 'Admin User',
      username: 'admin',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      role: 'Admin',
    },
  });

  // Create Customer User
  console.log('👤 Creating customer user...');
  const customerPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { username: 'user' },
    update: {
      password: customerPassword,
      email: 'user@ecommerce.com'
    },
    create: {
      name: 'Test Customer',
      username: 'user',
      email: 'user@ecommerce.com',
      password: customerPassword,
      role: 'Customer',
    },
  });

  // --- Create Categories ---
  console.log('📂 Creating categories...');
  const categoryData = [
    { name: 'กุ้ง', description: 'กุ้งแม่น้ำ กุ้งลายเสือ กุ้งขาว', isActive: true },
    { name: 'ปู', description: 'ปูม้า ปูทะเล ปูอลาสก้า', isActive: true },
    { name: 'ปลา', description: 'ปลาทะเล ปลาหมอสี ปลาเก๋า', isActive: true },
    { name: 'หอย', description: 'หอยนางรม หอยเชลล์ หอยแครง', isActive: true },
    { name: 'หมึก', description: 'หมึกกล้วย หมึกกระดอง หมึกยักษ์', isActive: true },
  ];

  const categoryMap: { [key: string]: string } = {};

  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
    categoryMap[cat.name] = created.id;
  }

  // --- Create Coupons ---
  console.log('🎟️ Creating coupons...');
  const coupons = [
    { code: 'SAVE50', discountType: 'FIXED', discountValue: 50, isActive: true },
    { code: 'SAVE100', discountType: 'FIXED', discountValue: 100, isActive: true },
    { code: 'PROMO10', discountType: 'PERCENT', discountValue: 10, isActive: true },
    { code: 'WELCOME', discountType: 'FIXED', discountValue: 99, isActive: true, minOrderAmount: 0 },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }

  // --- Create 20 Sea Products ---
  console.log('🦐 Creating 20 seafood products...');

  const products = [
    // 1. หมวดกุ้ง (Shrimp)
    {
      name: 'กุ้งแม่น้ำยักษ์ (Size Jumbo)',
      description: 'กุ้งแม่น้ำไซส์ใหญ่พิเศษ 3 ตัวโล มันแก้วเยิ้มๆ เนื้อแน่นเด้ง สดใหม่จากแม่น้ำตาปี',
      price: 1200,
      stock: 50,
      sku: 'SHR-001',
      categoryId: categoryMap['กุ้ง'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'กุ้งลายเสือ (Tiger Prawn)',
      description: 'กุ้งลายเสือทะเลตัวใหญ่ เนื้อหวานกรอบ เหมาะสำหรับย่างบาร์บีคิว หรือทำต้มยำโป๊ะแตก',
      price: 850,
      stock: 40,
      sku: 'SHR-002',
      categoryId: categoryMap['กุ้ง'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1623855244183-52fd8d3ce2f7?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'กุ้งมังกร 7 สี (Phuket Lobster)',
      description: 'ราชินีแห่งท้องทะเล กุ้งมังกร 7 สี สดๆ จากภูเก็ต เนื้อเด้งสู้ฟัน ทำซาชิมิได้',
      price: 2800,
      stock: 10,
      sku: 'SHR-003',
      categoryId: categoryMap['กุ้ง'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1599020792689-9fdeefbea8dd?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'กุ้งขาวแวนนาไม (Shrimp)',
      description: 'กุ้งขาวสดๆ ไซส์กลาง 40-50 ตัว/กก. เหมาะสำหรับทำข้าวผัด ผัดกะเพรา หรือต้มยำกุ้งน้ำข้น',
      price: 320,
      stock: 100,
      sku: 'SHR-004',
      categoryId: categoryMap['กุ้ง'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1559737558-2f5a3b86e6c3?auto=format&fit=crop&q=80&w=1000']),
    },

    // 2. หมวดปู (Crab)
    {
      name: 'ปูม้าสด (Blue Crab)',
      description: 'ปูม้าสด เนื้อหวานธรรมชาติ ไม่ฟรีซยา ตัวแน่นๆ คัดพิเศษ เหมาะสำหรับนึ่งจิ้มซีฟู้ด',
      price: 550,
      stock: 60,
      sku: 'CRB-001',
      categoryId: categoryMap['ปู'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'ปูทะเลไข่ (Mud Crab)',
      description: 'ปูทะเลไข่แน่นๆ เต็มกระดอง มันปูเยิ้มๆ คัดไซส์ใหญ่ 4-5 ขีด',
      price: 790,
      stock: 30,
      sku: 'CRB-002',
      categoryId: categoryMap['ปู'],
      images: JSON.stringify(['https://plus.unsplash.com/premium_photo-1669283738096-7c012891d09e?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'ปูอลาสก้า (King Crab Legs)',
      description: 'ขาปูอลาสก้ายักษ์ นำเข้าจากแหล่งกำเนิด เนื้อเยอะ เต็มคำ รสชาติหวานฉ่ำ',
      price: 3500,
      stock: 15,
      sku: 'CRB-003',
      categoryId: categoryMap['ปู'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1542365287-19cb9ce3e05e?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'ปูนิ่ม (Soft Shell Crab)',
      description: 'ปูนิ่มไซส์ใหญ่ ทานได้ทั้งตัว เหมาะสำหรับทอดกระเทียม ผัดผงกะหรี่',
      price: 450,
      stock: 40,
      sku: 'CRB-004',
      categoryId: categoryMap['ปู'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=1000']),
    },

    // 3. หมวดปลา (Fish)
    {
      name: 'ปลากะพงขาว (Sea Bass)',
      description: 'ปลากะพงขาวสด ขนาด 1 กก. เนื้อขาวนุ่ม ไม่คาว เหมาะสำหรับนึ่งมะนาว หรือทอดน้ำปลา',
      price: 250,
      stock: 50,
      sku: 'FSH-001',
      categoryId: categoryMap['ปลา'],
      images: JSON.stringify(['https://thumbs.dreamstime.com/b/raw-seabass-fish-isolated-white-background-fresh-sea-bass-top-view-package-design-element-165039239.jpg']),
    },
    {
      name: 'ปลาแซลมอนนอร์เวย์ (Salmon Fillet)',
      description: 'แซลมอนสดนำเข้าจากนอร์เวย์ แล่ชิ้นส่วนกลาง ไขมันแทรกสวย ทำซาชิมิหรือสเต็กได้',
      price: 890,
      stock: 35,
      sku: 'FSH-002',
      categoryId: categoryMap['ปลา'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'ปลาเก๋าแดง (Red Grouper)',
      description: 'ปลาเก๋าแดงทะเลลึก เนื้อขาวเด้ง หนังหนึบ หายาก เหมาะสำหรับทำข้าวต้มปลาเก๋า',
      price: 950,
      stock: 20,
      sku: 'FSH-003',
      categoryId: categoryMap['ปลา'],
      images: JSON.stringify(['https://previews.123rf.com/images/tycoon751/tycoon7511406/tycoon751140600007/29168940-fresh-red-grouper-fish-market.jpg']),
    },
    {
      name: 'ปลาอินทรีย์สด (Mackerel Steaks)',
      description: 'ปลาอินทรีย์หั่นแว่น สดจากเรือประมง เนื้อแน่น ไม่ยุ่ย เหมาะสำหรับทอดน้ำปลา',
      price: 480,
      stock: 45,
      sku: 'FSH-004',
      categoryId: categoryMap['ปลา'],
      images: JSON.stringify(['https://media.istockphoto.com/id/1154569502/photo/fresh-raw-mackerel-steaks.jpg?s=170667a&w=0&k=20&c=uH2O82b2VvP2X_ZkB5gXlK8gD_tq7v_z0v6gXlK8gD0=']),
    },

    // 4. หมวดหอย (Shellfish)
    {
      name: 'หอยนางรมสุราษฎร์ (Oyster Set)',
      description: 'หอยนางรมยักษ์ สดจากสุราษฎร์ธานี ชุด 5 ตัว พร้อมเครื่องเคียง ยอดกระถิน น้ำจิ้มซีฟู้ด',
      price: 390,
      stock: 30,
      sku: 'SHL-001',
      categoryId: categoryMap['หอย'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1623961990059-28356e226a77?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'หอยเชลล์ฮอกไกโด (Scallops)',
      description: 'หอยเชลล์ญี่ปุ่นตัวใหญ่ เกรดซาชิมิ เนื้อหวานละมุน นำเข้าจากฮอกไกโด',
      price: 1590,
      stock: 25,
      sku: 'SHL-002',
      categoryId: categoryMap['หอย'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1633504381831-292945c7c2f6?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'หอยแครงยักษ์ (Blood Cockle)',
      description: 'หอยแครงคัดไซส์ยักษ์ ลวกพอสะดุ้ง เนื้อหวานกรอบ น้ำจิ้มซีฟู้ดรสเด็ด',
      price: 280,
      stock: 80,
      sku: 'SHL-003',
      categoryId: categoryMap['หอย'],
      images: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Blood_cockles.jpg/1200px-Blood_cockles.jpg']),
    },
    {
      name: 'หอยแมลงภู่นิวซีแลนด์ (Mussels)',
      description: 'หอยแมลงภู่ตัวใหญ่ นำเข้าจากนิวซีแลนด์ เนื้อเยอะ เต็มคำ อบชีสอร่อยมาก',
      price: 350,
      stock: 50,
      sku: 'SHL-004',
      categoryId: categoryMap['หอย'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1615141982880-1313d06a7d64?auto=format&fit=crop&q=80&w=1000']),
    },

    // 5. หมวดหมึก (Squid)
    {
      name: 'หมึกกล้วยสด (Squid)',
      description: 'หมึกกล้วยตัวใส ไข่แน่นๆ ไม่ดองยา นึ่งมะนาวหรือย่างก็อร่อย',
      price: 320,
      stock: 60,
      sku: 'SQD-001',
      categoryId: categoryMap['หมึก'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1628876403204-7c603b71c726?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'หมึกกระดอง (Cuttlefish)',
      description: 'หมึกกระดองเนื้อหนา ขาว กรอบ เหมาะสำหรับผัดฉ่า หรือใส่เย็นตาโฟ',
      price: 290,
      stock: 45,
      sku: 'SQD-002',
      categoryId: categoryMap['หมึก'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1590740902802-127bcfb99480?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'หมึกยักษ์ทาโกะ (Octopus Leg)',
      description: 'หนวดหมึกยักษ์ต้มสุก นำเข้าจากญี่ปุ่น หั่นชิ้นทำซาชิมิ หรือทาโกะยากิ',
      price: 650,
      stock: 20,
      sku: 'SQD-003',
      categoryId: categoryMap['หมึก'],
      images: JSON.stringify(['https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      name: 'หมึกสายวง (Blue-ringed Octopus - Mockup)',
      description: 'หมึกสายสดๆ สำหรับทำหมึกย่างเกาหลี หรือลวกจิ้ม (ชื่อ mockup ปลอดภัยทานได้)',
      price: 250,
      stock: 55,
      sku: 'SQD-004',
      categoryId: categoryMap['หมึก'],
      images: JSON.stringify(['https://www.sgethai.com/wp-content/uploads/2021/05/%E0%B8%AB%E0%B8%A1%E0%B8%B6%E0%B8%81%E0%B8%AA%E0%B8%B2%E0%B8%A2.jpg']),
    }
  ];

  for (const product of products) {
    // Check if category exists before creating product
    if (product.categoryId) {
      await prisma.product.upsert({
        where: { sku: product.sku },
        update: { ...product, isActive: true },
        create: { ...product, isActive: true },
      });
    }
  }

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
