import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────
// Northstar Commerce Intelligence — Seed Script
// Generates ~5,000 orders of realistic e-commerce data
// ──────────────────────────────────────────────────────────

// ─── Helpers ───

function cuid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(randBetween(min, max + 1));
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Data Generators ───

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Dorothy", "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna",
  "Kenneth", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
  "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
  "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
  "Frank", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet", "Jack", "Catherine",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
];

const CATEGORIES_DATA = [
  { name: "Electronics", sortOrder: 1 },
  { name: "Apparel", sortOrder: 2 },
  { name: "Home & Kitchen", sortOrder: 3 },
  { name: "Beauty", sortOrder: 4 },
  { name: "Sports", sortOrder: 5 },
  { name: "Books", sortOrder: 6 },
  { name: "Toys", sortOrder: 7 },
  { name: "Food & Beverage", sortOrder: 8 },
];

const PRODUCTS_BY_CATEGORY: Record<string, { names: string[]; brands: string[]; priceRange: [number, number] }> = {
  "Electronics": {
    names: [
      "Wireless Earbuds Pro", "Bluetooth Speaker X200", "USB-C Hub 7-in-1", "Mechanical Keyboard K1",
      "Wireless Mouse M300", "Portable Charger 20K", "Smart Watch Lite", "Noise Cancelling Headphones",
      "HDMI Cable 6ft", "Webcam HD 1080p", "Phone Stand Adjustable", "Laptop Sleeve 15in",
      "LED Desk Lamp", "Wireless Charging Pad", "USB Flash Drive 128GB",
    ],
    brands: ["TechCore", "SoundWave", "NexGen", "PixelForge", "VoltEdge"],
    priceRange: [15, 299],
  },
  "Apparel": {
    names: [
      "Classic Fit Polo", "Slim Straight Jeans", "Merino Wool Sweater", "Performance Tee V-Neck",
      "Canvas Sneakers Low", "Leather Belt Classic", "Athletic Joggers", "Oxford Button-Down",
      "Puffer Vest Insulated", "Cotton Crew Socks 6pk", "Denim Jacket Trucker", "Linen Camp Collar Shirt",
      "Running Shorts 5in", "Cashmere Beanie", "Quilted Field Jacket",
    ],
    brands: ["ThreadCo", "NorthLoop", "Vantage Wear", "Urban Drift", "StitchLine"],
    priceRange: [12, 180],
  },
  "Home & Kitchen": {
    names: [
      "Cast Iron Skillet 12in", "Bamboo Cutting Board Set", "French Press 34oz", "Knife Block Set 8pc",
      "Cotton Towel Set 6pk", "Stainless Steel Mixing Bowl", "Non-Stick Baking Sheet", "Ceramic Plant Pot",
      "Glass Storage Containers 5pk", "Silicone Spatula Set", "Throw Pillow Cover 18x18", "Table Lamp Ceramic",
      "Spice Rack Rotating", "Dish Drying Mat", "Candle Set Soy Wax 3pk",
    ],
    brands: ["HomeStead", "KitchenCraft", "DwellGoods", "ModernNest", "CozyHome"],
    priceRange: [8, 120],
  },
  "Beauty": {
    names: [
      "Vitamin C Serum 30ml", "Hydrating Face Moisturizer", "Retinol Night Cream", "SPF 50 Sunscreen",
      "Lip Balm Set Natural", "Exfoliating Face Scrub", "Hair Repair Mask", "Body Lotion Unscented",
      "Eye Cream Anti-Aging", "Cleansing Oil 200ml", "Rose Water Toner", "Setting Spray Matte",
      "Dry Shampoo Volume", "Hand Cream Shea Butter", "Sheet Mask Bundle 10pk",
    ],
    brands: ["GlowLab", "Botaniq", "SkinFirst", "PureEssence", "VitalGlow"],
    priceRange: [8, 65],
  },
  "Sports": {
    names: [
      "Yoga Mat 6mm", "Resistance Bands Set 5", "Foam Roller 18in", "Water Bottle 32oz Insulated",
      "Jump Rope Speed", "Dumbbell Set 20lb", "Workout Gloves", "Running Armband",
      "Compression Socks Pair", "Tennis Balls 3pk", "Swim Goggles Anti-Fog", "Camping Hammock",
      "Bike Lock Cable", "Hiking Backpack 30L", "Exercise Ball 65cm",
    ],
    brands: ["PeakFit", "TrailEdge", "IronGrip", "FlexZone", "Enduro"],
    priceRange: [10, 90],
  },
  "Books": {
    names: [
      "The Data Analyst Handbook", "Thinking in Systems", "Atomic Habits", "The Lean Startup",
      "Deep Work", "Sapiens", "The Art of War", "Zero to One",
      "Designing Data Applications", "The Mom Test", "Good to Great", "Start with Why",
      "The Hard Thing About Hard Things", "Measure What Matters", "The Innovators Dilemma",
    ],
    brands: ["Penguin", "HarperCollins", "OReilly", "Wiley", "PublicAffairs"],
    priceRange: [9, 45],
  },
  "Toys": {
    names: [
      "Building Blocks 500pc", "Remote Control Car", "Puzzle 1000pc Landscape", "Board Game Strategy",
      "Art Supply Kit", "Plush Animal Large", "STEM Robot Kit", "Card Game Family",
      "Magnetic Tiles Set 60", "Outdoor Play Set", "Action Figure Collector", "Play-Doh Mega Set",
      "Dollhouse Furniture Set", "Science Experiment Kit", "Wooden Train Set",
    ],
    brands: ["PlaySpark", "WonderKid", "BrightMinds", "FunFactory", "ToyBox"],
    priceRange: [10, 80],
  },
  "Food & Beverage": {
    names: [
      "Organic Coffee Beans 1lb", "Matcha Powder Premium", "Protein Bar Variety 12pk", "Trail Mix 2lb",
      "Olive Oil Extra Virgin", "Hot Sauce Trio Set", "Dark Chocolate 85% 6pk", "Herbal Tea Sampler",
      "Dried Mango Slices", "Almond Butter Natural", "Sparkling Water 12pk", "Granola Clusters",
      "Honey Raw Unfiltered", "Energy Drink Mix 30ct", "Coconut Water 6pk",
    ],
    brands: ["GreenHarvest", "PurePantry", "NutriCore", "TasteOrigins", "FreshRoots"],
    priceRange: [5, 40],
  },
};

const REGIONS_DATA = [
  { name: "California", country: "USA", zone: "West", avgShippingDays: 3 },
  { name: "New York", country: "USA", zone: "Northeast", avgShippingDays: 4 },
  { name: "Texas", country: "USA", zone: "South", avgShippingDays: 3.5 },
  { name: "Florida", country: "USA", zone: "South", avgShippingDays: 4 },
  { name: "Illinois", country: "USA", zone: "Midwest", avgShippingDays: 3.5 },
  { name: "Washington", country: "USA", zone: "West", avgShippingDays: 3 },
  { name: "Pennsylvania", country: "USA", zone: "Northeast", avgShippingDays: 4 },
  { name: "Ohio", country: "USA", zone: "Midwest", avgShippingDays: 4 },
  { name: "Georgia", country: "USA", zone: "South", avgShippingDays: 3.5 },
  { name: "North Carolina", country: "USA", zone: "South", avgShippingDays: 4 },
  { name: "United Kingdom", country: "UK", zone: "International", avgShippingDays: 8 },
  { name: "Canada", country: "Canada", zone: "International", avgShippingDays: 6 },
];

const CHANNELS = ["organic", "paid", "email", "social", "direct"];
const CHANNEL_WEIGHTS = [30, 25, 20, 15, 10];

const DEVICES = ["desktop", "mobile", "tablet"];
const DEVICE_WEIGHTS = [50, 40, 10];

const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge"];
const BROWSER_WEIGHTS = [55, 25, 12, 8];

const PAYMENT_METHODS = ["card", "paypal", "bank_transfer"];
const PAYMENT_WEIGHTS = [55, 30, 15];

const RETURN_REASONS = [
  "Wrong size",
  "Defective",
  "Not as described",
  "Changed mind",
  "Late delivery",
];

const ORDER_STATUSES = ["delivered", "shipped", "processing", "cancelled"];
const STATUS_WEIGHTS = [72, 15, 8, 5];

// ─── Main Seed Function ───

async function main() {
  console.log("🌱 Seeding Northstar Commerce database...\n");

  // Clear existing data
  console.log("  Clearing existing data...");
  await prisma.customerMetric.deleteMany();
  await prisma.productPerformance.deleteMany();
  await prisma.dailyMetric.deleteMany();
  await prisma.return.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.region.deleteMany();

  // ─── 1. Regions ───
  console.log("  Creating 12 regions...");
  const regions = [];
  for (const r of REGIONS_DATA) {
    const region = await prisma.region.create({
      data: { id: cuid(), ...r },
    });
    regions.push(region);
  }

  // ─── 2. Categories ───
  console.log("  Creating 8 categories...");
  const categories = [];
  for (const c of CATEGORIES_DATA) {
    const category = await prisma.category.create({
      data: { id: cuid(), ...c },
    });
    categories.push(category);
  }

  // ─── 3. Products (120) ───
  console.log("  Creating 120 products...");
  const products: Array<{
    id: string;
    categoryId: string;
    name: string;
    sku: string;
    costPrice: number;
    retailPrice: number;
    brand: string;
    categoryName: string;
  }> = [];

  for (const category of categories) {
    const catData = PRODUCTS_BY_CATEGORY[category.name];
    if (!catData) continue;

    for (const productName of catData.names) {
      const retailPrice = round2(randBetween(catData.priceRange[0], catData.priceRange[1]));
      const costRatio = randBetween(0.4, 0.7);
      const costPrice = round2(retailPrice * costRatio);
      const brand = pick(catData.brands);
      const sku = `${category.name.slice(0, 3).toUpperCase()}-${String(products.length + 1).padStart(4, "0")}`;

      const product = await prisma.product.create({
        data: {
          id: cuid(),
          categoryId: category.id,
          name: productName,
          sku,
          costPrice,
          retailPrice,
          brand,
          weight: round2(randBetween(0.1, 5)),
          isActive: Math.random() > 0.05,
        },
      });

      products.push({
        ...product,
        categoryName: category.name,
      });
    }
  }

  // ─── 4. Customers (1,500) ───
  console.log("  Creating 1,500 customers...");
  const customers: Array<{ id: string; region: string; acquisitionChannel: string }> = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < 1500; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName}`;

    let email: string;
    let attempt = 0;
    do {
      const suffix = attempt > 0 ? `${attempt}` : "";
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@example.com`;
      attempt++;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const region = pick(REGIONS_DATA).name;
    const channel = pickWeighted(CHANNELS, CHANNEL_WEIGHTS);

    const customer = await prisma.customer.create({
      data: {
        id: cuid(),
        name,
        email,
        region,
        acquisitionChannel: channel,
        segment: "standard",
      },
    });

    customers.push({
      id: customer.id,
      region: customer.region,
      acquisitionChannel: customer.acquisitionChannel,
    });
  }

  // ─── 5. Orders (5,000) with OrderItems, Payments, Returns ───
  console.log("  Creating 5,000 orders with items, payments, and returns...");

  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  // Track repeat customers
  const customerOrderCount: Record<string, number> = {};

  // Pre-select repeat customers (~30%)
  const repeatCustomerIds = new Set<string>();
  const shuffledCustomers = [...customers].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.floor(customers.length * 0.3); i++) {
    repeatCustomerIds.add(shuffledCustomers[i].id);
  }

  let totalOrders = 0;
  let totalItems = 0;
  let totalReturns = 0;
  let totalPayments = 0;

  // Batch inserts for performance
  const orderBatch: Parameters<typeof prisma.order.create>[0]["data"][] = [];
  const orderItemBatch: Parameters<typeof prisma.orderItem.create>[0]["data"][] = [];
  const paymentBatch: Parameters<typeof prisma.payment.create>[0]["data"][] = [];
  const returnBatch: Parameters<typeof prisma.return.create>[0]["data"][] = [];

  for (let i = 0; i < 5000; i++) {
    // Pick customer — repeat buyers get more orders
    let customer;
    if (Math.random() < 0.55 && repeatCustomerIds.size > 0) {
      const repeatArr = Array.from(repeatCustomerIds);
      const found = customers.find((c) => c.id === pick(repeatArr));
      customer = found || pick(customers);
    } else {
      customer = pick(customers);
    }

    customerOrderCount[customer.id] = (customerOrderCount[customer.id] || 0) + 1;

    // Date — with seasonal spike in Nov-Dec
    let orderDate: Date;
    const monthOffset = Math.random();
    if (monthOffset > 0.82) {
      // Nov-Dec spike: ~18% chance maps to these 2 months (2x rate)
      const month = Math.random() > 0.5 ? 10 : 11; // Nov=10, Dec=11
      const startOfMonth = new Date(now.getFullYear() - 1, month, 1);
      const endOfMonth = new Date(now.getFullYear() - 1, month + 1, 0);
      // If months are in the future relative to startDate, adjust year
      if (startOfMonth > now) {
        startOfMonth.setFullYear(startOfMonth.getFullYear() - 1);
        endOfMonth.setFullYear(endOfMonth.getFullYear() - 1);
      }
      orderDate = randomDate(startOfMonth, endOfMonth);
    } else {
      orderDate = randomDate(startDate, now);
    }

    const status = pickWeighted(ORDER_STATUSES, STATUS_WEIGHTS);
    const channel = pickWeighted(CHANNELS, CHANNEL_WEIGHTS);

    // Generate order items
    const itemCount = pickWeighted([1, 2, 3, 4, 5], [35, 30, 20, 10, 5]);
    const selectedProducts = new Set<number>();
    const items: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      lineTotal: number;
    }> = [];

    for (let j = 0; j < itemCount; j++) {
      let productIdx: number;
      do {
        productIdx = randInt(0, products.length - 1);
      } while (selectedProducts.has(productIdx));
      selectedProducts.add(productIdx);

      const product = products[productIdx];
      const quantity = pickWeighted([1, 2, 3], [65, 25, 10]);
      const unitPrice = product.retailPrice;

      // 25% chance of discount (10-30%)
      let discount = 0;
      if (Math.random() < 0.25) {
        const discountPct = randBetween(0.1, 0.3);
        discount = round2(unitPrice * quantity * discountPct);
      }

      const lineTotal = round2(unitPrice * quantity - discount);

      items.push({
        id: cuid(),
        productId: product.id,
        quantity,
        unitPrice,
        discount,
        lineTotal,
      });
    }

    const subtotal = round2(items.reduce((s, it) => s + it.unitPrice * it.quantity, 0));
    const discountAmount = round2(items.reduce((s, it) => s + it.discount, 0));
    const tax = round2((subtotal - discountAmount) * 0.08);
    const shippingCost = subtotal > 100 ? 0 : round2(randBetween(5, 15));
    const total = round2(subtotal - discountAmount + tax + shippingCost);

    // Shipping dates
    let shippedDate: Date | null = null;
    let deliveredDate: Date | null = null;
    if (status === "shipped" || status === "delivered") {
      shippedDate = addDays(orderDate, randInt(1, 3));
    }
    if (status === "delivered") {
      const regionData = REGIONS_DATA.find((r) => r.name === customer.region);
      const shippingDays = regionData ? regionData.avgShippingDays : 5;
      deliveredDate = addDays(shippedDate!, randInt(Math.floor(shippingDays - 1), Math.ceil(shippingDays + 2)));
    }

    const orderId = cuid();

    // Create order
    await prisma.order.create({
      data: {
        id: orderId,
        customerId: customer.id,
        status,
        channel,
        region: customer.region,
        subtotal,
        discountAmount,
        tax,
        shippingCost,
        total,
        orderDate,
        shippedDate,
        deliveredDate,
      },
    });
    totalOrders++;

    // Create order items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          id: item.id,
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          lineTotal: item.lineTotal,
        },
      });
      totalItems++;

      // ~12% return rate on delivered items
      if (status === "delivered" && Math.random() < 0.12) {
        const returnId = cuid();
        const reason = pick(RETURN_REASONS);
        const refundAmount = round2(item.lineTotal * randBetween(0.8, 1.0));
        const initiatedAt = addDays(deliveredDate!, randInt(1, 14));
        const resolvedAt = Math.random() > 0.15 ? addDays(initiatedAt, randInt(3, 10)) : null;
        const returnStatus = resolvedAt
          ? pickWeighted(["refunded", "approved", "rejected"], [70, 20, 10])
          : "pending";

        await prisma.return.create({
          data: {
            id: returnId,
            orderItemId: item.id,
            reason,
            status: returnStatus,
            refundAmount,
            initiatedAt,
            resolvedAt,
          },
        });
        totalReturns++;
      }
    }

    // Create payment
    if (status !== "cancelled") {
      const paymentMethod = pickWeighted(PAYMENT_METHODS, PAYMENT_WEIGHTS);
      await prisma.payment.create({
        data: {
          id: cuid(),
          orderId,
          method: paymentMethod,
          status: "completed",
          amount: total,
          paidAt: orderDate,
        },
      });
      totalPayments++;
    }

    // Progress
    if ((i + 1) % 500 === 0) {
      console.log(`    ${i + 1}/5,000 orders created...`);
    }
  }

  console.log(`  ✓ ${totalOrders} orders, ${totalItems} items, ${totalPayments} payments, ${totalReturns} returns\n`);

  // ─── 6. Sessions (15,000) ───
  console.log("  Creating 15,000 sessions...");
  for (let i = 0; i < 15000; i++) {
    const customer = Math.random() > 0.3 ? pick(customers) : null;
    const device = pickWeighted(DEVICES, DEVICE_WEIGHTS);
    const browser = pickWeighted(BROWSERS, BROWSER_WEIGHTS);
    const channel = pickWeighted(CHANNELS, CHANNEL_WEIGHTS);
    const pagesViewed = randInt(1, 20);

    // Funnel: 65% add-to-cart, 40% checkout, 25% converted
    const addedToCart = Math.random() < 0.65;
    const reachedCheckout = addedToCart && Math.random() < 0.615; // ~40% overall
    const converted = reachedCheckout && Math.random() < 0.625; // ~25% overall

    await prisma.session.create({
      data: {
        id: cuid(),
        customerId: customer?.id || null,
        device,
        browser,
        channel,
        pagesViewed,
        addedToCart,
        reachedCheckout,
        converted,
        startedAt: randomDate(startDate, now),
      },
    });

    if ((i + 1) % 3000 === 0) {
      console.log(`    ${i + 1}/15,000 sessions created...`);
    }
  }
  console.log("  ✓ 15,000 sessions\n");

  // ─── 7. Update customer first order dates ───
  console.log("  Updating customer first order dates...");
  const customersWithOrders = await prisma.order.groupBy({
    by: ["customerId"],
    _min: { orderDate: true },
  });

  for (const c of customersWithOrders) {
    if (c._min.orderDate) {
      await prisma.customer.update({
        where: { id: c.customerId },
        data: { firstOrderDate: c._min.orderDate },
      });
    }
  }

  // ─── 8. Compute DailyMetrics ───
  console.log("  Computing daily metrics...");
  const allOrders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          returnRecord: true,
        },
      },
    },
  });

  const dailyMap: Record<string, {
    revenue: number;
    netRevenue: number;
    orders: number;
    unitsSold: number;
    refundAmount: number;
    discountTotal: number;
    customerIds: Set<string>;
  }> = {};

  // Get first order per customer for new vs returning
  const customerFirstOrder: Record<string, string> = {};
  for (const c of customersWithOrders) {
    if (c._min.orderDate) {
      customerFirstOrder[c.customerId] = c._min.orderDate.toISOString().split("T")[0];
    }
  }

  for (const order of allOrders) {
    const dateKey = order.orderDate.toISOString().split("T")[0];

    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        revenue: 0,
        netRevenue: 0,
        orders: 0,
        unitsSold: 0,
        refundAmount: 0,
        discountTotal: 0,
        customerIds: new Set(),
      };
    }

    const day = dailyMap[dateKey];
    day.revenue += order.total;
    day.orders += 1;
    day.discountTotal += order.discountAmount;
    day.customerIds.add(order.customerId);

    for (const item of order.items) {
      day.unitsSold += item.quantity;
      if (item.returnRecord) {
        day.refundAmount += item.returnRecord.refundAmount;
      }
    }
    day.netRevenue = day.revenue - day.refundAmount;
  }

  for (const [dateStr, data] of Object.entries(dailyMap)) {
    const date = new Date(dateStr);
    const newCustomers = Array.from(data.customerIds).filter(
      (cid) => customerFirstOrder[cid] === dateStr
    ).length;

    await prisma.dailyMetric.create({
      data: {
        id: cuid(),
        date,
        revenue: round2(data.revenue),
        netRevenue: round2(data.netRevenue),
        orders: data.orders,
        unitsSold: data.unitsSold,
        aov: data.orders > 0 ? round2(data.netRevenue / data.orders) : 0,
        refundAmount: round2(data.refundAmount),
        newCustomers,
        returningCustomers: data.customerIds.size - newCustomers,
        discountTotal: round2(data.discountTotal),
      },
    });
  }
  console.log(`  ✓ ${Object.keys(dailyMap).length} daily metric records\n`);

  // ─── 9. Compute ProductPerformance ───
  console.log("  Computing product performance...");
  for (const product of products) {
    const items = await prisma.orderItem.findMany({
      where: { productId: product.id },
      include: { returnRecord: true, order: true },
    });

    const totalRevenue = items.reduce((s, it) => s + it.lineTotal, 0);
    const totalQuantity = items.reduce((s, it) => s + it.quantity, 0);
    const returnCount = items.filter((it) => it.returnRecord).length;
    const returnRate = items.length > 0 ? returnCount / items.length : 0;

    // Margin proxy: (revenue - cost * quantity) / revenue
    const totalCost = items.reduce((s, it) => s + product.costPrice * it.quantity, 0);
    const marginProxy = totalRevenue > 0 ? (totalRevenue - totalCost) / totalRevenue : 0;

    // Repeat purchase rate: customers who bought this product more than once
    const customerPurchases: Record<string, number> = {};
    for (const item of items) {
      customerPurchases[item.order.customerId] = (customerPurchases[item.order.customerId] || 0) + 1;
    }
    const totalBuyers = Object.keys(customerPurchases).length;
    const repeatBuyers = Object.values(customerPurchases).filter((c) => c > 1).length;
    const repeatPurchaseRate = totalBuyers > 0 ? repeatBuyers / totalBuyers : 0;

    const avgDiscount = items.length > 0
      ? items.reduce((s, it) => s + it.discount, 0) / items.length
      : 0;

    await prisma.productPerformance.create({
      data: {
        id: cuid(),
        productId: product.id,
        productName: product.name,
        categoryName: product.categoryName,
        totalRevenue: round2(totalRevenue),
        totalQuantity,
        returnCount,
        returnRate: round2(returnRate * 100),
        marginProxy: round2(marginProxy * 100),
        repeatPurchaseRate: round2(repeatPurchaseRate * 100),
        avgDiscount: round2(avgDiscount),
      },
    });
  }
  console.log(`  ✓ ${products.length} product performance records\n`);

  // ─── 10. Compute CustomerMetrics ───
  console.log("  Computing customer metrics...");

  const allCustomerOrders = await prisma.order.groupBy({
    by: ["customerId"],
    _count: true,
    _sum: { total: true },
    _min: { orderDate: true },
    _max: { orderDate: true },
  });

  // Compute RFM quartiles
  const rfmData = allCustomerOrders.map((c) => {
    const daysSince = Math.floor(
      (now.getTime() - (c._max.orderDate?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24)
    );
    return {
      customerId: c.customerId,
      recency: daysSince,
      frequency: c._count,
      monetary: c._sum.total || 0,
      firstOrder: c._min.orderDate!,
      lastOrder: c._max.orderDate!,
    };
  });

  // Score RFM (1-5 quartiles)
  const recencyValues = rfmData.map((d) => d.recency).sort((a, b) => a - b);
  const frequencyValues = rfmData.map((d) => d.frequency).sort((a, b) => a - b);
  const monetaryValues = rfmData.map((d) => d.monetary).sort((a, b) => a - b);

  function getQuartile(value: number, sorted: number[]): number {
    const pct = sorted.indexOf(value) / sorted.length;
    if (pct >= 0.8) return 5;
    if (pct >= 0.6) return 4;
    if (pct >= 0.4) return 3;
    if (pct >= 0.2) return 2;
    return 1;
  }

  function getRFMSegment(r: number, f: number, m: number): string {
    const score = r + f + m;
    if (score >= 13) return "Champions";
    if (r >= 4 && f >= 3) return "Loyal";
    if (r >= 4 && f <= 2) return "Recent";
    if (r <= 2 && f >= 3) return "At Risk";
    if (r <= 2 && f >= 4) return "Can't Lose";
    if (f <= 2 && m <= 2) return "Hibernating";
    if (r >= 3) return "Promising";
    return "Needs Attention";
  }

  for (const data of rfmData) {
    const customer = customers.find((c) => c.id === data.customerId);
    if (!customer) continue;

    const customerRecord = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    // For recency, reverse: lower days = better = higher score
    const rScore = 6 - getQuartile(data.recency, recencyValues);
    const fScore = getQuartile(data.frequency, frequencyValues);
    const mScore = getQuartile(data.monetary, monetaryValues);
    const segment = getRFMSegment(rScore, fScore, mScore);

    await prisma.customerMetric.create({
      data: {
        id: cuid(),
        customerId: data.customerId,
        customerName: customerRecord?.name || "Unknown",
        totalOrders: data.frequency,
        totalSpent: round2(data.monetary),
        avgOrderValue: data.frequency > 0 ? round2(data.monetary / data.frequency) : 0,
        firstOrderDate: data.firstOrder,
        lastOrderDate: data.lastOrder,
        daysSinceLastOrder: data.recency,
        rfmRecency: rScore,
        rfmFrequency: fScore,
        rfmMonetary: mScore,
        segment,
      },
    });

    // Update customer segment
    await prisma.customer.update({
      where: { id: data.customerId },
      data: { segment },
    });
  }
  console.log(`  ✓ ${rfmData.length} customer metric records\n`);

  // ─── Summary ───
  const summary = {
    regions: await prisma.region.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    payments: await prisma.payment.count(),
    returns: await prisma.return.count(),
    sessions: await prisma.session.count(),
    dailyMetrics: await prisma.dailyMetric.count(),
    productPerformance: await prisma.productPerformance.count(),
    customerMetrics: await prisma.customerMetric.count(),
  };

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   🌟 Northstar Commerce — Seed Complete  ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log(`║  Regions:             ${String(summary.regions).padStart(6)}          ║`);
  console.log(`║  Categories:          ${String(summary.categories).padStart(6)}          ║`);
  console.log(`║  Products:            ${String(summary.products).padStart(6)}          ║`);
  console.log(`║  Customers:           ${String(summary.customers).padStart(6)}          ║`);
  console.log(`║  Orders:              ${String(summary.orders).padStart(6)}          ║`);
  console.log(`║  Order Items:         ${String(summary.orderItems).padStart(6)}          ║`);
  console.log(`║  Payments:            ${String(summary.payments).padStart(6)}          ║`);
  console.log(`║  Returns:             ${String(summary.returns).padStart(6)}          ║`);
  console.log(`║  Sessions:            ${String(summary.sessions).padStart(6)}          ║`);
  console.log(`║  Daily Metrics:       ${String(summary.dailyMetrics).padStart(6)}          ║`);
  console.log(`║  Product Perf:        ${String(summary.productPerformance).padStart(6)}          ║`);
  console.log(`║  Customer Metrics:    ${String(summary.customerMetrics).padStart(6)}          ║`);
  console.log("╚══════════════════════════════════════════╝");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
