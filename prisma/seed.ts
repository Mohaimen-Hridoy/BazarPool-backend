import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

const generateQr = async (text: string): Promise<string> => {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
  });
};

async function main() {
  console.log('🌱 Seeding BazarPool database with rich, authentic wholesale production data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Core Users (Admin, Wholesalers, Hub Coordinators, Consumers)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bazarpool.com' },
    update: {},
    create: {
      email: 'admin@bazarpool.com',
      passwordHash,
      fullName: 'BazarPool Operations Admin',
      phone: '+8801700000001',
      role: UserRole.ADMIN,
      walletAccount: {
        create: {
          availableBalance: 100000,
          reservedBalance: 0,
        },
      },
    },
  });

  const supplier1 = await prisma.user.upsert({
    where: { email: 'supplier@agrofarm.com' },
    update: {},
    create: {
      email: 'supplier@agrofarm.com',
      passwordHash,
      fullName: 'Green Agro Wholesale Ltd.',
      phone: '+8801711111111',
      role: UserRole.SUPPLIER,
      walletAccount: {
        create: {
          availableBalance: 85000,
          reservedBalance: 0,
        },
      },
    },
  });

  const supplier2 = await prisma.user.upsert({
    where: { email: 'supplier@bengalspices.com' },
    update: {},
    create: {
      email: 'supplier@bengalspices.com',
      passwordHash,
      fullName: 'Bengal Commodities & Staples Co.',
      phone: '+8801711222333',
      role: UserRole.SUPPLIER,
      walletAccount: {
        create: {
          availableBalance: 65000,
          reservedBalance: 0,
        },
      },
    },
  });

  const supplier3 = await prisma.user.upsert({
    where: { email: 'supplier@citygroup.com' },
    update: {},
    create: {
      email: 'supplier@citygroup.com',
      passwordHash,
      fullName: 'City Edible Oils & Grains Distro',
      phone: '+8801711444555',
      role: UserRole.SUPPLIER,
      walletAccount: {
        create: {
          availableBalance: 120000,
          reservedBalance: 0,
        },
      },
    },
  });

  const coordinatorDhanmondi = await prisma.user.upsert({
    where: { email: 'coordinator@dhanmondi.com' },
    update: {},
    create: {
      email: 'coordinator@dhanmondi.com',
      passwordHash,
      fullName: 'Dhanmondi Community Hub Lead (Shakil)',
      phone: '+8801722222222',
      role: UserRole.HUB_COORDINATOR,
      walletAccount: {
        create: { availableBalance: 5000, reservedBalance: 0 },
      },
    },
  });

  const coordinatorMirpur = await prisma.user.upsert({
    where: { email: 'coordinator@mirpur.com' },
    update: {},
    create: {
      email: 'coordinator@mirpur.com',
      passwordHash,
      fullName: 'Mirpur 10 Resident Hub Lead (Rony)',
      phone: '+8801755555555',
      role: UserRole.HUB_COORDINATOR,
      walletAccount: {
        create: { availableBalance: 5000, reservedBalance: 0 },
      },
    },
  });

  const coordinatorUttara = await prisma.user.upsert({
    where: { email: 'coordinator@uttara.com' },
    update: {},
    create: {
      email: 'coordinator@uttara.com',
      passwordHash,
      fullName: 'Uttara Sector 7 Hub Lead (Fahim)',
      phone: '+8801766666666',
      role: UserRole.HUB_COORDINATOR,
      walletAccount: {
        create: { availableBalance: 5000, reservedBalance: 0 },
      },
    },
  });

  const coordinatorBanani = await prisma.user.upsert({
    where: { email: 'coordinator@banani.com' },
    update: {},
    create: {
      email: 'coordinator@banani.com',
      passwordHash,
      fullName: 'Banani & Gulshan Hub Lead (Arif)',
      phone: '+8801777777777',
      role: UserRole.HUB_COORDINATOR,
      walletAccount: {
        create: { availableBalance: 5000, reservedBalance: 0 },
      },
    },
  });

  const coordinatorChittagong = await prisma.user.upsert({
    where: { email: 'coordinator@chittagong.com' },
    update: {},
    create: {
      email: 'coordinator@chittagong.com',
      passwordHash,
      fullName: 'Agrabad Hub Lead (Tareq)',
      phone: '+8801733334444',
      role: UserRole.HUB_COORDINATOR,
      walletAccount: {
        create: { availableBalance: 5000, reservedBalance: 0 },
      },
    },
  });

  const consumerRahim = await prisma.user.upsert({
    where: { email: 'consumer@gmail.com' },
    update: {},
    create: {
      email: 'consumer@gmail.com',
      passwordHash,
      fullName: 'Rahim Ahmed (Hostel Manager)',
      phone: '+8801733333333',
      role: UserRole.CONSUMER,
      walletAccount: {
        create: { availableBalance: 25000, reservedBalance: 0 },
      },
    },
  });

  const consumerTanvir = await prisma.user.upsert({
    where: { email: 'student@du.ac.bd' },
    update: {},
    create: {
      email: 'student@du.ac.bd',
      passwordHash,
      fullName: 'Tanvir Hasan (University Mess Rep)',
      phone: '+8801744444444',
      role: UserRole.CONSUMER,
      walletAccount: {
        create: { availableBalance: 14000, reservedBalance: 0 },
      },
    },
  });

  const consumerNusrat = await prisma.user.upsert({
    where: { email: 'buyer@mess.org' },
    update: {},
    create: {
      email: 'buyer@mess.org',
      passwordHash,
      fullName: 'Dr. Nusrat Jahan (Medical Hostel Welfare)',
      phone: '+8801788888888',
      role: UserRole.CONSUMER,
      walletAccount: {
        create: { availableBalance: 18000, reservedBalance: 0 },
      },
    },
  });

  const consumerKabir = await prisma.user.upsert({
    where: { email: 'chef@restaurant.com' },
    update: {},
    create: {
      email: 'chef@restaurant.com',
      passwordHash,
      fullName: 'Master Chef Kabir (Cloud Kitchen Group)',
      phone: '+8801799999999',
      role: UserRole.CONSUMER,
      walletAccount: {
        create: { availableBalance: 32000, reservedBalance: 0 },
      },
    },
  });

  // 2. Designated Regional Pickup Hubs (9 real prominent points)
  const hubsData = [
    {
      name: 'Dhanmondi Community Hub',
      address: 'House #42, Road #27 (Old), Dhanmondi',
      city: 'Dhaka',
      area: 'Dhanmondi',
      contactPhone: '+8801722222222',
    },
    {
      name: 'Mirpur 10 Resident Hub',
      address: 'Plot #15, Block #C, Mirpur 10 Roundabout',
      city: 'Dhaka',
      area: 'Mirpur',
      contactPhone: '+8801755555555',
    },
    {
      name: 'Uttara Sector 7 Community Center',
      address: 'Road #11, Sector 7, Uttara',
      city: 'Dhaka',
      area: 'Uttara',
      contactPhone: '+8801766666666',
    },
    {
      name: 'Banani Community Distribution Hub',
      address: 'House #88, Road #11, Block D, Banani',
      city: 'Dhaka',
      area: 'Banani',
      contactPhone: '+8801777777777',
    },
    {
      name: 'Mohammadpur Town Hall Center',
      address: 'Taj Mahal Road, Mohammadpur',
      city: 'Dhaka',
      area: 'Mohammadpur',
      contactPhone: '+8801788881111',
    },
    {
      name: 'Bashundhara R/A Gate Distribution Hub',
      address: 'Block C Main Avenue, Bashundhara R/A',
      city: 'Dhaka',
      area: 'Bashundhara',
      contactPhone: '+8801799992222',
    },
    {
      name: 'Khilgaon Taltola Community Point',
      address: 'Taltola Market Complex, Khilgaon',
      city: 'Dhaka',
      area: 'Khilgaon',
      contactPhone: '+8801711998877',
    },
    {
      name: 'Chittagong Agrabad Commercial Center',
      address: 'Agrabad Commercial Area, Badamtali Circle',
      city: 'Chittagong',
      area: 'Agrabad',
      contactPhone: '+8801733334444',
    },
    {
      name: 'GEC Circle Distribution Hub',
      address: 'Nasirabad Road, GEC Circle',
      city: 'Chittagong',
      area: 'GEC',
      contactPhone: '+8801744556677',
    },
  ];

  const hubs: Record<string, any> = {};
  for (const h of hubsData) {
    const existing = await prisma.pickupHub.findFirst({ where: { name: h.name } });
    hubs[h.name] = existing || (await prisma.pickupHub.create({ data: h }));
  }

  // 3. 16 Wholesale Staple Products with authentic images & specifications
  const productsData = [
    {
      supplierId: supplier1.id,
      title: 'Premium Dinajpur Miniket Rice (50kg Bulk Sack)',
      description: 'Export-grade polished Miniket rice directly sourced from Dinajpur auto rice mills. Moisture below 12%, double woven packaging.',
      category: 'Grains & Rice',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier1.id,
      title: 'Super Fine Nazirshail Rice (50kg Bulk Sack)',
      description: 'Single-source authentic Barisal Nazirshail rice with high kernel elongation and natural fragrance.',
      category: 'Grains & Rice',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier1.id,
      title: 'Fragrant Chinigura Polao Rice (25kg Festive Sack)',
      description: 'Traditional aromatic Chinigura rice harvested in northern Bangladesh. Ideal for weddings, catering, and hostel banquets.',
      category: 'Grains & Rice',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier1.id,
      title: 'Bogura BR-28 High-Yield Rice (50kg Bulk Sack)',
      description: 'Economical, staple non-sticky parboiled rice for large student hostels, restaurants, and mess communities.',
      category: 'Grains & Rice',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier3.id,
      title: 'Teer Fortified Pure Soybean Oil (5-Liter Bulk Can)',
      description: 'Vitamin A & D fortified refined edible soybean oil. Direct factory mill packing from City Group.',
      category: 'Edible Oils',
      unit: 'can',
      images: ['https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier1.id,
      title: 'Radhuni Pure Mustard Oil (5-Liter Bulk Can)',
      description: '100% natural cold-pressed mustard oil with pungent aroma directly from mill distributor at wholesale rates.',
      category: 'Edible Oils',
      unit: 'can',
      images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier3.id,
      title: 'Fresh Fortified Soybean Oil (5-Liter Jar × 4 Master Box)',
      description: 'Wholesale 20-liter master corrugated box containing 4 factory-sealed 5L jars. Direct Meghna Group depot rate.',
      category: 'Edible Oils',
      unit: 'box',
      images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier2.id,
      title: 'Selected Deshi Red Masoor Dal (25kg Bulk Sack)',
      description: 'Unpolished split red lentils with rich protein content and rapid cooking time. Direct from Kushtia millers.',
      category: 'Pulses & Spices',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier2.id,
      title: 'Imported Indian Red Lentils (25kg Bulk Sack)',
      description: 'Cleaned, bold-grain imported Masoor Dal delivered straight from Benapole land port logistics hub.',
      category: 'Pulses & Spices',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier2.id,
      title: 'Radhuni Pure Turmeric & Red Chili Wholesale Lot (10kg Sack)',
      description: 'Aromatic high-curcumin whole sun-dried turmeric roots and pungent red chili lot for bulk blending.',
      category: 'Pulses & Spices',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier1.id,
      title: 'Faridpur Red King Onions (40kg Jute Sack)',
      description: 'Crisp, spicy deshi onions directly harvested from Faridpur farmlands with zero chemical wash.',
      category: 'Fresh Produce',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier1.id,
      title: 'Munshiganj Diamond White Potatoes (50kg Sack)',
      description: 'Grade A starchy table potatoes from Munshiganj cold storage. Ideal for bulk hostel kitchens.',
      category: 'Fresh Produce',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier1.id,
      title: 'Farm Fresh Organic Brown Eggs (100 Pieces Crate)',
      description: 'Grade A antibiotic-free organic poultry farm eggs packed in heavy shockproof wholesale crates.',
      category: 'Dairy & Poultry',
      unit: 'crate',
      images: ['https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier3.id,
      title: 'Fresh Refined White Sugar (50kg Jute Sack)',
      description: 'Pure crystalline white cane sugar in export-grade moisture-sealed sacks. Direct refinery price.',
      category: 'Bakery & Staples',
      unit: 'sack',
      images: ['https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier3.id,
      title: 'Fresh Whole Wheat Atta Bundle (2kg × 10 Packs)',
      description: 'Unadulterated stone-ground whole wheat atta master bundle. Premium fiber for healthy household dining.',
      category: 'Bakery & Staples',
      unit: 'bundle',
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'],
    },
    {
      supplierId: supplier2.id,
      title: 'Dano Full Cream Milk Powder (1kg × 12 Master Carton)',
      description: 'Imported instant whole milk powder master carton for cafeterias, residential messes, and community bakers.',
      category: 'Dairy & Poultry',
      unit: 'carton',
      images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'],
    },
  ];

  const products: Record<string, any> = {};
  for (const p of productsData) {
    const existing = await prisma.product.findFirst({ where: { title: p.title } });
    products[p.title] = existing || (await prisma.product.create({ data: p }));
  }

  // 4. Group-Buying Campaigns (14 realistic pools across lifecycle states)
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const campaignsData = [
    {
      supplierId: supplier1.id,
      productId: products['Premium Dinajpur Miniket Rice (50kg Bulk Sack)'].id,
      pickupHubId: hubs['Dhanmondi Community Hub'].id,
      title: 'Bulk Dinajpur Miniket Rice Community Pool (Save 25% Wholesale)',
      description: 'Join together with Dhanmondi & surrounding residents to unlock mill-gate pricing on genuine Dinajpur Miniket rice.',
      unitPrice: 3200.0, // Wholesale per 50kg sack (Market retail: ৳3,850)
      targetQuantity: 40,
      minCommitmentQty: 1,
      maxCommitmentQty: 5,
      committedQuantity: 28,
      deadline: new Date(now + 3 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier1.id,
      productId: products['Radhuni Pure Mustard Oil (5-Liter Bulk Can)'].id,
      pickupHubId: hubs['Mirpur 10 Resident Hub'].id,
      title: 'Cold-Pressed Mustard Oil 5L Pool (Direct Factory Rate)',
      description: 'Direct factory mill dispatch for Mirpur community members. Save ৳350 per 5L can by buying collectively.',
      unitPrice: 1150.0, // Retail: ৳1,450
      targetQuantity: 30,
      minCommitmentQty: 1,
      maxCommitmentQty: 4,
      committedQuantity: 14,
      deadline: new Date(now + 5 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier1.id,
      productId: products['Super Fine Nazirshail Rice (50kg Bulk Sack)'].id,
      pickupHubId: hubs['Uttara Sector 7 Community Center'].id,
      title: 'Barisal Super Fine Nazirshail 50kg Mess Pool',
      description: 'High-elongation Barisal Nazirshail rice pool for Uttara residents and student hostels. Unlock ৳600 per sack discount.',
      unitPrice: 3450.0, // Retail: ৳4,050
      targetQuantity: 30,
      minCommitmentQty: 1,
      maxCommitmentQty: 5,
      committedQuantity: 25,
      deadline: new Date(now + 2 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier1.id,
      productId: products['Farm Fresh Organic Brown Eggs (100 Pieces Crate)'].id,
      pickupHubId: hubs['Banani Community Distribution Hub'].id,
      title: 'Farm Fresh Organic Brown Eggs (100 Pcs Wholesale Crate)',
      description: 'Direct poultry farm crates without broker markup. 85% full — only 3 crates remaining before pool locks!',
      unitPrice: 1050.0, // Retail: ৳1,350
      targetQuantity: 20,
      minCommitmentQty: 1,
      maxCommitmentQty: 3,
      committedQuantity: 17,
      deadline: new Date(now + 1 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier1.id,
      productId: products['Faridpur Red King Onions (40kg Jute Sack)'].id,
      pickupHubId: hubs['Mohammadpur Town Hall Center'].id,
      title: 'Faridpur Red Onion Direct Farm Lot (Save 35% vs Retail)',
      description: 'Bypass Karwan Bazar middlemen! Pure Faridpur harvest at ৳55/kg bulk rate vs ৳85/kg neighborhood store price.',
      unitPrice: 2200.0, // Retail: ৳3,400
      targetQuantity: 25,
      minCommitmentQty: 1,
      maxCommitmentQty: 4,
      committedQuantity: 15,
      deadline: new Date(now + 4 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier2.id,
      productId: products['Selected Deshi Red Masoor Dal (25kg Bulk Sack)'].id,
      pickupHubId: hubs['Bashundhara R/A Gate Distribution Hub'].id,
      title: 'Selected Deshi Masoor Dal Wholesale 25kg Sack Pool',
      description: 'Fast-cooking split red lentils for Bashundhara residential messes and families. Direct mill rate.',
      unitPrice: 2750.0, // Retail: ৳3,300
      targetQuantity: 20,
      minCommitmentQty: 1,
      maxCommitmentQty: 3,
      committedQuantity: 14,
      deadline: new Date(now + 6 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier3.id,
      productId: products['Fresh Refined White Sugar (50kg Jute Sack)'].id,
      pickupHubId: hubs['Khilgaon Taltola Community Point'].id,
      title: 'Refinery Direct White Sugar 50kg Sack Pool',
      description: 'Wholesale sugar pool directly from refinery terminal. Perfect for community bakeries and catering managers.',
      unitPrice: 5800.0, // Retail: ৳6,750
      targetQuantity: 15,
      minCommitmentQty: 1,
      maxCommitmentQty: 3,
      committedQuantity: 9,
      deadline: new Date(now + 4 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier3.id,
      productId: products['Fresh Whole Wheat Atta Bundle (2kg × 10 Packs)'].id,
      pickupHubId: hubs['Dhanmondi Community Hub'].id,
      title: 'Stone-Ground Whole Wheat Atta 20kg Master Bundle',
      description: 'Direct mill bundle with high nutritional bran content. Save ৳200 per bundle compared to super shops.',
      unitPrice: 980.0, // Retail: ৳1,200
      targetQuantity: 25,
      minCommitmentQty: 1,
      maxCommitmentQty: 4,
      committedQuantity: 16,
      deadline: new Date(now + 3 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier1.id,
      productId: products['Munshiganj Diamond White Potatoes (50kg Sack)'].id,
      pickupHubId: hubs['Mohammadpur Town Hall Center'].id,
      title: 'Munshiganj Cold-Storage Diamond Potato 50kg Pool',
      description: 'Unblemished cooking potatoes straight from Munshiganj farmers cold warehouse. Bulk kitchen savings guaranteed.',
      unitPrice: 1850.0, // Retail: ৳2,400
      targetQuantity: 30,
      minCommitmentQty: 1,
      maxCommitmentQty: 5,
      committedQuantity: 19,
      deadline: new Date(now + 5 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier1.id,
      productId: products['Bogura BR-28 High-Yield Rice (50kg Bulk Sack)'].id,
      pickupHubId: hubs['Mirpur 10 Resident Hub'].id,
      title: 'Bogura BR-28 Wholesale Rice 50kg Mess Pool',
      description: 'Budget-friendly staple parboiled rice for hostel managers and dining facilities in Mirpur.',
      unitPrice: 2650.0, // Retail: ৳3,100
      targetQuantity: 35,
      minCommitmentQty: 1,
      maxCommitmentQty: 5,
      committedQuantity: 21,
      deadline: new Date(now + 4 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier2.id,
      productId: products['Dano Full Cream Milk Powder (1kg × 12 Master Carton)'].id,
      pickupHubId: hubs['Banani Community Distribution Hub'].id,
      title: 'Dano Full Cream Milk Powder 12kg Master Carton Pool',
      description: 'Institutional master carton wholesale pool. ৳1,400 discount per carton compared to retail confectionery stores.',
      unitPrice: 9400.0, // Retail: ৳10,800
      targetQuantity: 10,
      minCommitmentQty: 1,
      maxCommitmentQty: 2,
      committedQuantity: 7,
      deadline: new Date(now + 3 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier3.id,
      productId: products['Fresh Fortified Soybean Oil (5-Liter Jar × 4 Master Box)'].id,
      pickupHubId: hubs['Chittagong Agrabad Commercial Center'].id,
      title: 'Fresh Fortified Soybean Oil 20L Master Box (Port Hub Rate)',
      description: 'Chittagong port commercial pool! Factory master box with four 5-liter bottles for port area households and canteens.',
      unitPrice: 3250.0, // Retail: ৳3,900
      targetQuantity: 20,
      minCommitmentQty: 1,
      maxCommitmentQty: 3,
      committedQuantity: 13,
      deadline: new Date(now + 5 * day),
      status: 'OPEN',
    },
    {
      supplierId: supplier3.id,
      productId: products['Teer Fortified Pure Soybean Oil (5-Liter Bulk Can)'].id,
      pickupHubId: hubs['Dhanmondi Community Hub'].id,
      title: 'Teer Fortified Pure Soybean Oil 5L Commercial Pool',
      description: '100% capacity reached! Wholesale dispatch is underway to Dhanmondi hub.',
      unitPrice: 820.0, // Retail: ৳980
      targetQuantity: 20,
      minCommitmentQty: 1,
      maxCommitmentQty: 4,
      committedQuantity: 20,
      deadline: new Date(now + 2 * day),
      status: 'LOCKED',
      lockedAt: new Date(now - 1 * day),
    },
    {
      supplierId: supplier1.id,
      productId: products['Fragrant Chinigura Polao Rice (25kg Festive Sack)'].id,
      pickupHubId: hubs['Mirpur 10 Resident Hub'].id,
      title: 'Fragrant Chinigura Polao Rice 25kg Festive Pool',
      description: 'Goods have arrived at Mirpur 10 Resident Hub! Ready for immediate pickup collection with QR passes.',
      unitPrice: 2850.0, // Retail: ৳3,600
      targetQuantity: 15,
      minCommitmentQty: 1,
      maxCommitmentQty: 3,
      committedQuantity: 15,
      deadline: new Date(now + 1 * day),
      status: 'AT_HUB',
      lockedAt: new Date(now - 2 * day),
      dispatchedAt: new Date(now - 1 * day),
      arrivedAtHubAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ];

  for (const c of campaignsData) {
    const existing = await prisma.campaign.findFirst({ where: { title: c.title } });
    if (!existing) {
      await prisma.campaign.create({ data: c as any });
    }
  }

  // 5. Create a verified Ready-For-Pickup Order with QR Code for consumer@gmail.com
  const polaoCampaign = await prisma.campaign.findFirst({
    where: { title: 'Fragrant Chinigura Polao Rice 25kg Festive Pool' },
  });

  if (polaoCampaign) {
    const existingComm = await prisma.commitment.findFirst({
      where: {
        campaignId: polaoCampaign.id,
        consumerId: consumerRahim.id,
      },
    });

    if (!existingComm) {
      const comm = await prisma.commitment.create({
        data: {
          campaignId: polaoCampaign.id,
          consumerId: consumerRahim.id,
          quantity: 2,
          unitPrice: polaoCampaign.unitPrice,
          totalAmount: 2 * polaoCampaign.unitPrice,
          status: 'COMMITTED',
        },
      });

      const order = await prisma.order.create({
        data: {
          campaignId: polaoCampaign.id,
          consumerId: consumerRahim.id,
          commitmentId: comm.id,
          totalQuantity: 2,
          totalAmount: 2 * polaoCampaign.unitPrice,
          status: 'READY_FOR_PICKUP',
        },
      });

      const tokenCode = 'BP-7A9B-4D21';
      const qrDataUrl = await generateQr(
        JSON.stringify({
          orderId: order.id,
          tokenCode,
          campaign: polaoCampaign.title,
          consumer: consumerRahim.fullName,
          quantity: 2,
        })
      );

      await prisma.pickupToken.create({
        data: {
          orderId: order.id,
          tokenCode,
          qrCodeDataUrl: qrDataUrl,
          expiresAt: new Date(now + 14 * day),
          status: 'PENDING',
        },
      });

      // Also create a welcome notification for consumer
      await prisma.notification.create({
        data: {
          userId: consumerRahim.id,
          title: 'Your Order is Ready for Pickup!',
          message: `Your group-buying order for "${polaoCampaign.title}" is ready at Mirpur 10 Resident Hub. Show your token code ${tokenCode} or scan your QR pass to collect.`,
          type: 'PICKUP_READY',
        },
      });
    }
  }

  console.log('✅ BazarPool Seed completed with 13 Users, 9 Hubs, 16 Wholesale Products, and 14 Campaigns!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
