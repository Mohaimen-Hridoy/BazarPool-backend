import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BazarPool database with demo data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bazarpool.com' },
    update: {},
    create: {
      email: 'admin@bazarpool.com',
      passwordHash,
      fullName: 'BazarPool System Admin',
      phone: '+8801700000001',
      role: UserRole.ADMIN,
      walletAccount: {
        create: {
          availableBalance: 50000,
          reservedBalance: 0,
        },
      },
    },
  });

  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@agrofarm.com' },
    update: {},
    create: {
      email: 'supplier@agrofarm.com',
      passwordHash,
      fullName: 'Green Agro Wholesale Co.',
      phone: '+8801711111111',
      role: UserRole.SUPPLIER,
      walletAccount: {
        create: {
          availableBalance: 25000,
          reservedBalance: 0,
        },
      },
    },
  });

  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@dhanmondi.com' },
    update: {},
    create: {
      email: 'coordinator@dhanmondi.com',
      passwordHash,
      fullName: 'Dhanmondi Hub Lead',
      phone: '+8801722222222',
      role: UserRole.HUB_COORDINATOR,
      walletAccount: {
        create: {
          availableBalance: 5000,
          reservedBalance: 0,
        },
      },
    },
  });

  const consumer1 = await prisma.user.upsert({
    where: { email: 'consumer@gmail.com' },
    update: {},
    create: {
      email: 'consumer@gmail.com',
      passwordHash,
      fullName: 'Rahim Ahmed (Hostel Manager)',
      phone: '+8801733333333',
      role: UserRole.CONSUMER,
      walletAccount: {
        create: {
          availableBalance: 12000,
          reservedBalance: 0,
        },
      },
    },
  });

  const consumer2 = await prisma.user.upsert({
    where: { email: 'student@du.ac.bd' },
    update: {},
    create: {
      email: 'student@du.ac.bd',
      passwordHash,
      fullName: 'Tanvir Hasan (Student Coordinator)',
      phone: '+8801744444444',
      role: UserRole.CONSUMER,
      walletAccount: {
        create: {
          availableBalance: 8500,
          reservedBalance: 0,
        },
      },
    },
  });

  // 2. Create Designated Pickup Hubs
  const hubDhanmondi = await prisma.pickupHub.create({
    data: {
      name: 'Dhanmondi Community Hub',
      address: 'House #42, Road #27 (Old), Dhanmondi',
      city: 'Dhaka',
      area: 'Dhanmondi',
      contactPhone: '+8801722222222',
    },
  });

  const hubMirpur = await prisma.pickupHub.create({
    data: {
      name: 'Mirpur 10 Resident Hub',
      address: 'Plot #15, Block #C, Mirpur 10 Roundabout',
      city: 'Dhaka',
      area: 'Mirpur',
      contactPhone: '+8801755555555',
    },
  });

  const hubUttara = await prisma.pickupHub.create({
    data: {
      name: 'Uttara Sector 7 Community Center',
      address: 'Road #11, Sector 7, Uttara',
      city: 'Dhaka',
      area: 'Uttara',
      contactPhone: '+8801766666666',
    },
  });

  // 3. Create Wholesale Products
  const productRice = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      title: 'Premium Dinajpur Miniket Rice (50kg Bulk Sack)',
      description: 'Export-quality polished Miniket rice directly sourced from Dinajpur farmers. Best for hostel messes and household group-buying.',
      category: 'Grains & Rice',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
    },
  });

  const productOil = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      title: 'Radhuni Pure Mustard Oil (5-Liter Bulk Can)',
      description: '100% natural cold-pressed mustard oil directly from mill distributor at wholesale rates.',
      category: 'Edible Oils',
      unit: 'can',
      images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    },
  });

  const productEggs = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      title: 'Farm Fresh Brown Eggs (100 Pieces Wholesale Crate)',
      description: 'Grade A antibiotic-free organic poultry farm eggs in secure transport crates.',
      category: 'Dairy & Poultry',
      unit: 'crate',
      images: ['https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80'],
    },
  });

  // 4. Create Active Group-Buying Campaigns
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const fiveDaysLater = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  const campaignRice = await prisma.campaign.create({
    data: {
      supplierId: supplier.id,
      productId: productRice.id,
      pickupHubId: hubDhanmondi.id,
      title: 'Bulk Miniket Rice Community Pool (Save 28% Wholesale)',
      description: 'Join together with Dhanmondi & surrounding residents to unlock wholesale wholesale pricing on pure Dinajpur Miniket rice.',
      unitPrice: 3200.0, // Wholesale price per 50kg sack (Market retail: ৳3,800)
      targetQuantity: 40,
      minCommitmentQty: 1,
      maxCommitmentQty: 5,
      committedQuantity: 26,
      deadline: threeDaysLater,
      status: 'OPEN',
    },
  });

  const campaignOil = await prisma.campaign.create({
    data: {
      supplierId: supplier.id,
      productId: productOil.id,
      pickupHubId: hubMirpur.id,
      title: 'Winter Pure Mustard Oil 5L Pool (Factory Rate)',
      description: 'Direct factory dispatch for Mirpur community members. Save ৳350 per 5L can by buying collectively.',
      unitPrice: 1150.0, // Retail: ৳1,450
      targetQuantity: 30,
      minCommitmentQty: 1,
      maxCommitmentQty: 4,
      committedQuantity: 12,
      deadline: fiveDaysLater,
      status: 'OPEN',
    },
  });

  console.log('✅ BazarPool Seed completed successfully!');
  console.log(`Demo Users Created:
- Admin: admin@bazarpool.com / password123
- Supplier: supplier@agrofarm.com / password123
- Coordinator: coordinator@dhanmondi.com / password123
- Consumer: consumer@gmail.com / password123
- Student: student@du.ac.bd / password123
Hubs: Dhanmondi, Mirpur 10, Uttara
Campaigns: ${campaignRice.title}, ${campaignOil.title}`);
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
