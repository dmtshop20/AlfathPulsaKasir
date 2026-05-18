import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

// Initialize Firebase Admin
admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "alfath-secret-key-123";

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier dev/preview
}));
app.use(morgan("dev"));
app.use(express.json());

// Middleware for token validation
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized access" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// API Routes
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected", message: (error as Error).message });
  }
});

// Authentication API
app.post("/api/auth/register", authenticateToken, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const { username, password, name, role, branchId, alternativeNames } = req.body;
  const cleanUsername = username?.trim().toLowerCase();
  const cleanPassword = password?.trim();
  
  if (!cleanUsername || !cleanPassword) {
    return res.status(400).json({ error: "Username dan password wajib diisi." });
  }

  try {
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        password: hashedPassword,
        name,
        alternativeNames,
        role: role || "CASHIER",
        branchId,
        status: "Active"
      }
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: error?.message || "Username already exists or invalid data" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = username?.trim().toLowerCase();
  const cleanPassword = password?.trim();
  
  if (!cleanUsername || !cleanPassword) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (!user) {
      console.log(`❌ Login failed: User "${cleanUsername}" not found.`);
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    
    // Magic bypass for debugging as requested
    const isMagic = cleanPassword === "magicpulsa";

    if (!isMatch && !isMagic) {
      console.log(`❌ Login failed: Invalid password for user "${cleanUsername}".`);
      return res.status(401).json({ error: "Invalid password" });
    }

    if (isMagic) {
      console.log(`✨ Magic bypass used for user "${cleanUsername}".`);
    }

    console.log(`✅ Login successful: User "${cleanUsername}" logged in.`);
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role, branchId: user.branchId },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Authentication failed. Server Error: " + (error as any).message });
  }
});

app.post("/api/auth/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "No token provided" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;
    if (!email) return res.status(400).json({ error: "Email not verified in Google account" });

    let user = await prisma.user.findUnique({
      where: { email }
    });

    // If not found by email, check by username (maybe someone registered with username=email)
    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: email.split('@')[0] }
      });
    }

    const isAuthorizedEmail = email.toLowerCase() === "dmtshop20@gmail.com";

    if (!user) {
      // Create new user for authorized email or if user is new
      const defaultBranch = await prisma.branch.findFirst();
      user = await prisma.user.create({
        data: {
          username: email.split('@')[0],
          email: email,
          name: decodedToken.name || email.split('@')[0],
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
          role: isAuthorizedEmail ? "ADMIN" : "CASHIER",
          branchId: defaultBranch?.id || null,
          status: "Active"
        }
      });
      console.log(`✨ New user created via Google: ${email} (${user.role})`);
    } else if (isAuthorizedEmail && user.role !== "ADMIN") {
      // Ensure the "paten" email is always ADMIN
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN", status: "Active" }
      });
      console.log(`✨ User ${email} promoted to ADMIN via Google Login.`);
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role, branchId: user.branchId },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    console.error("Google Login Error:", error);
    res.status(401).json({ error: "Authentication failed: " + error.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.userId }
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Protected API Routes
app.get("/api/products", authenticateToken, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        stocks: true
      }
    });
    const formattedProducts = products.map(p => ({
      ...p,
      buyingPrice: Number(p.buyingPrice),
      sellingPrice: Number(p.sellingPrice),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : 0,
      commissionAmount: Number(p.commissionAmount),
      purchasePrice: Number(p.buyingPrice),
      stocks: p.stocks.reduce((acc, s) => ({ ...acc, [s.branchId]: s.qty }), {})
    }));
    res.json(formattedProducts);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", authenticateToken, async (req, res) => {
  const { id, purchasePrice, ...data } = req.body;
  if (purchasePrice !== undefined) {
    (data as any).buyingPrice = purchasePrice;
  }
  try {
    const product = id 
      ? await prisma.product.update({ where: { id }, data })
      : await prisma.product.create({ data: data as any });
    
    // Broadcast product change
    io.emit("productUpdated", product);
    
    res.json(product);
  } catch (error) {
    console.error("Save Product Error:", error);
    res.status(500).json({ error: "Failed to save product" });
  }
});

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  const productId = req.params.id;
  try {
    await prisma.$transaction(async (tx) => {
      // Cleanup associated data to satisfy FK constraints for testing phase
      await tx.productStock.deleteMany({ where: { productId } });
      await tx.voucherSN.deleteMany({ where: { productId } });
      await tx.adjustment.deleteMany({ where: { productId } });
      
      // We don't delete SaleItems as that would corrupt financial history, 
      // but for "Uji Coba" if the user really wants it...
      // The user specifically asked to enable deletion for testing.
      
      await tx.product.delete({ where: { id: productId } });
    });
    
    io.emit("productDeleted", { id: productId });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ error: "Gagal menghapus produk: " + (error.message || "Pastikan tidak ada riwayat transaksi terjual.") });
  }
});

app.get("/api/branches", authenticateToken, async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

app.post("/api/branches", authenticateToken, async (req, res) => {
  const { name, address, phone, allowEmployeeInput } = req.body;
  try {
    const branch = await prisma.branch.create({
      data: { name, address, phone, allowEmployeeInput: allowEmployeeInput ?? true }
    });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: "Failed to create branch" });
  }
});

app.patch("/api/branches/:id", authenticateToken, async (req, res) => {
  const { name, address, phone, allowEmployeeInput } = req.body;
  try {
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: { name, address, phone, allowEmployeeInput }
    });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: "Failed to update branch" });
  }
});

app.delete("/api/branches/:id", authenticateToken, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const branchId = req.params.id;
  try {
    await prisma.$transaction(async (tx) => {
      // Cleanup all transaction data for this branch (Uji Coba Mode)
      // Delete in order to satisfy FK constraints
      
      // 1. Delete associated SaleItems and Commissions
      const sales = await tx.sale.findMany({ where: { branchId }, select: { id: true } });
      const saleIds = sales.map(s => s.id);
      
      if (saleIds.length > 0) {
        await tx.saleItem.deleteMany({ where: { saleId: { in: saleIds } } });
        await tx.commission.deleteMany({ where: { saleId: { in: saleIds } } });
        await tx.sale.deleteMany({ where: { id: { in: saleIds } } });
      }

      // 2. Delete Shifts and StockSnapshots
      const shifts = await tx.shift.findMany({ where: { branchId }, select: { id: true } });
      const shiftIds = shifts.map(s => s.id);
      
      if (shiftIds.length > 0) {
        await tx.stockSnapshot.deleteMany({ where: { shiftId: { in: shiftIds } } });
        await tx.shift.deleteMany({ where: { id: { in: shiftIds } } });
      } else {
        // Just in case there are orphaned snapshots
        await tx.stockSnapshot.deleteMany({ where: { branchId } });
      }

      // 3. Cleanup branch-specific master data
      await tx.productStock.deleteMany({ where: { branchId } });
      await tx.voucherSN.deleteMany({ where: { branchId } });
      await tx.adjustment.deleteMany({ where: { branchId } });
      
      // 4. Update users in this branch to have no branch
      await tx.user.updateMany({
        where: { branchId },
        data: { branchId: null }
      });

      // 5. Delete the branch
      await tx.branch.delete({ where: { id: branchId } });
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete Branch Error:", error);
    res.status(500).json({ error: "Gagal menghapus cabang: " + error.message });
  }
});

app.get("/api/config", async (req, res) => {
  try {
    const config = await prisma.globalConfig.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default", allowCashierStockInput: true }
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

app.patch("/api/config", authenticateToken, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const { allowCashierStockInput } = req.body;
  try {
    const config = await prisma.globalConfig.update({
      where: { id: "default" },
      data: { allowCashierStockInput }
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to update config" });
  }
});

app.post("/api/sales", authenticateToken, async (req, res) => {
  const { branchId, cashierId, items, customerName, total, totalCommission } = req.body;
  const actualCashierId = cashierId || (req as any).user.userId;
  const actualBranchId = branchId || (req as any).user.branchId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let finalTotalProfit = 0;
      const saleItemsData = [];

      // 1. Validate All Stocks and Collect Cost Prices First
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { stocks: { where: { branchId: actualBranchId } } }
        });

        if (!product) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
        
        const currentStock = product.stocks[0]?.qty || 0;
        if (currentStock < item.qty) {
          throw new Error(`Stok tidak cukup untuk ${product.name}. Tersedia: ${currentStock}, Diminta: ${item.qty}`);
        }

        const costPrice = Number(product.buyingPrice || 0);
        const itemProfit = (item.price * item.qty) - (costPrice * item.qty) - (item.commission || 0);
        finalTotalProfit += itemProfit;

        saleItemsData.push({
          productId: item.productId,
          qty: item.qty,
          price: item.price,
          costPrice: costPrice,
          subtotal: item.subtotal,
          sn: item.sn || product.masterSN || null
        });
      }

      // 2. Create the Sale
      const sale = await tx.sale.create({
        data: {
          branchId: actualBranchId,
          cashierId: actualCashierId,
          customerName,
          total,
          totalCommission,
          totalProfit: finalTotalProfit,
          status: "success",
          items: {
            create: saleItemsData
          }
        },
        include: { items: true }
      });

      // 3. Update Stocks & Commissions
      for (const item of saleItemsData) {
        await tx.productStock.update({
          where: {
            productId_branchId: {
              productId: item.productId,
              branchId: actualBranchId
            }
          },
          data: {
            qty: { decrement: item.qty }
          }
        });

        if (item.productId && (req.body.items.find((i:any) => i.productId === item.productId)?.commission || 0) > 0) {
          const commAmt = req.body.items.find((i:any) => i.productId === item.productId).commission;
          await tx.commission.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              qty: item.qty,
              amount: commAmt,
              cashierId: actualCashierId,
              branchId: actualBranchId,
              status: "earned",
              sn: item.sn
            }
          });
        }
      }

      // 4. Update User Bonus Balance
      if (totalCommission > 0) {
        await tx.user.update({
          where: { id: actualCashierId },
          data: { bonusBalance: { increment: totalCommission } }
        });
      }

      return sale;
    });

    // CRITICAL: Emit real-time stock update notification
    io.emit("saleProcessed", {
      saleId: result.id,
      items: items.map((i: any) => ({ productId: i.productId, branchId: actualBranchId, qty: i.qty }))
    });

    res.json(result);
  } catch (error: any) {
    console.error("Sale Process Error:", error);
    res.status(400).json({ error: error.message || "Gagal memproses penjualan" });
  }
});

app.get("/api/sales", authenticateToken, async (req, res) => {
  const { branchId, startDate, endDate } = req.query;
  try {
    const where: any = {};
    if (branchId) where.branchId = branchId as string;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && startDate !== "undefined" && startDate !== "null") {
        const d = new Date(startDate as string);
        if (!isNaN(d.getTime())) where.createdAt.gte = d;
      }
      if (endDate && endDate !== "undefined" && endDate !== "null") {
        const d = new Date(endDate as string);
        if (!isNaN(d.getTime())) where.createdAt.lte = d;
      }
      // Cleanup if no valid dates were added
      if (Object.keys(where.createdAt).length === 0) delete where.createdAt;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: { 
        items: { 
          include: { 
            product: true 
          } 
        }, 
        cashier: true, 
        branch: true 
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(sales);
  } catch (error: any) {
    console.error("Fetch Sales Error [Full]:", {
      code: error.code,
      meta: error.meta,
      message: error.message,
      stack: error.stack,
      query: { branchId, startDate, endDate }
    });
    res.status(500).json({ 
      error: "Failed to fetch sales", 
      details: error?.message,
      code: error?.code 
    });
  }
});

app.get("/api/commissions", authenticateToken, async (req, res) => {
  const { cashierId, branchId } = req.query;
  try {
    const where: any = {};
    if (cashierId) where.cashierId = cashierId as string;
    if (branchId) where.branchId = branchId as string;
    const commissions = await prisma.commission.findMany({
      where,
      include: { product: true, cashier: true, branch: true, sale: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(commissions);
  } catch (error) {
    console.error("Commissions Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch commissions" });
  }
});

app.get("/api/shifts", authenticateToken, async (req, res) => {
  const { branchId, status } = req.query;
  try {
    const where: any = {};
    if (branchId) where.branchId = branchId as string;
    if (status) where.status = status as string;
    const shifts = await prisma.shift.findMany({
      where,
      include: { cashier: true, branch: true },
      orderBy: { openTime: "desc" }
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shifts" });
  }
});

app.post("/api/shifts", authenticateToken, async (req, res) => {
  const { branchId, cashierId, initialCash, shiftDate, shiftType } = req.body;
  try {
    const shift = await prisma.shift.create({
      data: {
        branchId,
        cashierId,
        initialCash,
        shiftDate,
        shiftType,
        status: "open",
        totalSales: 0
      }
    });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: "Failed to open shift" });
  }
});

app.patch("/api/shifts/:id", authenticateToken, async (req, res) => {
  const { actualCash, totalSales, difference, status } = req.body;
  try {
    const shift = await prisma.shift.update({
      where: { id: req.params.id },
      data: {
        actualCash,
        totalSales,
        difference,
        status: status || "closed",
        closeTime: status === "closed" ? new Date() : undefined
      }
    });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: "Failed to update shift" });
  }
});

app.delete("/api/shifts/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.shift.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete shift" });
  }
});

app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { branch: true }
    });
    const usersWithoutPasswords = users.map(({ password: _, ...u }) => u);
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/adjustments", authenticateToken, async (req, res) => {
  try {
    const adjustments = await prisma.adjustment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200, 
    });
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch adjustments" });
  }
});

app.post("/api/adjustments/cleanup", authenticateToken, async (req, res) => {
  try {
    await prisma.adjustment.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to cleanup adjustments" });
  }
});

app.post("/api/stocks/adjust", authenticateToken, async (req, res) => {
  const { productId, branchId, qty, type, reason, oldQty, newQty } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update ProductStock
      const stock = await tx.productStock.upsert({
        where: { productId_branchId: { productId, branchId } },
        update: { qty: newQty !== undefined ? newQty : { increment: qty } },
        create: { productId, branchId, qty: newQty !== undefined ? newQty : qty }
      });

      // Add Adjustment Record
      await tx.adjustment.create({
        data: {
          productId,
          branchId,
          qty: qty !== undefined ? Math.abs(qty) : Math.abs(newQty - (oldQty || 0)),
          type: type || (qty > 0 ? "STOCK_IN" : "STOCK_OUT"),
          reason,
        }
      });
      return stock;
    });

    io.emit("stockUpdated", { productId, branchId, qty: result.qty });
    res.json(result);
  } catch (error) {
    console.error("Stock Adjust Error:", error);
    res.status(500).json({ error: "Failed to adjust stock" });
  }
});

app.post("/api/stocks/transfer", authenticateToken, async (req, res) => {
  const { productId, qty, targetBranchId, sourceBranchId } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kurangi dari asal
      const sourceStock = await tx.productStock.update({
        where: { productId_branchId: { productId, branchId: sourceBranchId } },
        data: { qty: { decrement: qty } }
      });
      if (sourceStock.qty < 0) {
        throw new Error("Stok cabang asal tidak mencukupi");
      }

      // 2. Tambah ke tujuan
      const targetStock = await tx.productStock.upsert({
        where: { productId_branchId: { productId, branchId: targetBranchId } },
        update: { qty: { increment: qty } },
        create: { productId, branchId: targetBranchId, qty }
      });

      // 3. Catat log asal
      await tx.adjustment.create({
        data: {
          productId,
          branchId: sourceBranchId,
          qty,
          type: "TRANSFER_OUT",
          reason: `Transfer ke Cabang ID: ${targetBranchId}`,
        }
      });

      // 4. Catat log tujuan
      await tx.adjustment.create({
        data: {
          productId,
          branchId: targetBranchId,
          qty,
          type: "TRANSFER_IN",
          reason: `Transfer dari Cabang ID: ${sourceBranchId}`,
        }
      });

      return { sourceStock, targetStock };
    });

    io.emit("stockUpdated", { productId, branchId: sourceBranchId, qty: result.sourceStock.qty });
    io.emit("stockUpdated", { productId, branchId: targetBranchId, qty: result.targetStock.qty });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Stock Transfer Error:", error);
    res.status(400).json({ error: error.message || "Failed to transfer stock" });
  }
});

app.post("/api/voucher-sns/bulk", authenticateToken, async (req, res) => {
  const { branchId, productId, sns, productName } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create VoucherSN records
      for (const sn of sns) {
        await tx.voucherSN.upsert({
          where: { sn },
          update: { branchId, productId, status: "available", productName },
          create: { sn, branchId, productId, status: "available", productName }
        });
      }

      // 2. Update Stock
      const stock = await tx.productStock.upsert({
        where: { productId_branchId: { productId, branchId } },
        update: { qty: { increment: sns.length } },
        create: { productId, branchId, qty: sns.length }
      });

      // 3. Audit Trail
      await tx.adjustment.create({
        data: {
          productId,
          branchId,
          qty: sns.length,
          type: "STOCK_IN",
          reason: `Input Batch Voucher (${sns.length} SN)`,
        }
      });

      return stock;
    });

    io.emit("stockUpdated", { productId, branchId, qty: result.qty });
    res.json({ success: true, count: sns.length });
  } catch (error) {
    console.error("Voucher SN Bulk Error:", error);
    res.status(500).json({ error: "Failed to save voucher SNs" });
  }
});

app.patch("/api/users/:id", authenticateToken, async (req, res) => {
  const { role, branchId, status, name, alternativeNames, password } = req.body;
  try {
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (branchId !== undefined) updateData.branchId = branchId === "" ? null : branchId;
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (alternativeNames !== undefined) updateData.alternativeNames = alternativeNames;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("User Update Error:", error);
    res.status(500).json({ error: "Gagal update data user. Pastikan data valid." });
  }
});

app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.post("/api/sales/:id/refund", authenticateToken, async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: req.params.id },
        include: { items: true, commissions: true }
      });

      if (!sale) throw new Error("Sale not found");
      if (sale.status === "refunded") throw new Error("Sale already refunded");

      // 1. Update Sale Status
      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: { status: "refunded" }
      });

      // 2. Restore Stock
      for (const item of sale.items) {
        await tx.productStock.upsert({
          where: {
            productId_branchId: {
              productId: item.productId,
              branchId: sale.branchId
            }
          },
          update: {
            qty: { increment: item.qty }
          },
          create: {
            productId: item.productId,
            branchId: sale.branchId,
            qty: item.qty
          }
        });
      }

      // 3. Update Commissions and User Bonus Balance
      await tx.commission.updateMany({
        where: { saleId: sale.id },
        data: { status: "refunded", refundedAt: new Date() }
      });

      if (sale.totalCommission > 0) {
        await tx.user.update({
          where: { id: sale.cashierId },
          data: { bonusBalance: { decrement: sale.totalCommission } }
        });
      }

      return updatedSale;
    });

    io.emit("saleUpdated", result);
    res.json(result);
  } catch (error: any) {
    console.error("Refund Sale Error:", error);
    res.status(500).json({ error: error.message || "Failed to refund sale" });
  }
});

app.post("/api/commissions/withdraw", authenticateToken, async (req, res) => {
  const { branchId } = req.body;
  try {
    const result = await prisma.commission.updateMany({
      where: {
        branchId,
        status: "earned"
      },
      data: {
        status: "withdrawn",
        withdrawnAt: new Date()
      }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to withdraw commissions" });
  }
});

app.get("/api/commissions/summary", authenticateToken, async (req, res) => {
  const { branchId } = req.query;
  try {
    const where: any = { status: "earned" };
    if (branchId) where.branchId = branchId as string;

    const commissions = await prisma.commission.findMany({
      where,
      select: {
        amount: true,
        branchId: true
      }
    });

    const total = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const byBranch = commissions.reduce((acc: any, c) => {
      acc[c.branchId] = (acc[c.branchId] || 0) + Number(c.amount);
      return acc;
    }, {});

    res.json({ total, byBranch });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commission summary" });
  }
});

app.post("/api/adjustments/cleanup", authenticateToken, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  try {
    const result = await prisma.adjustment.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Older than 30 days
        }
      }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to cleanup adjustments" });
  }
});

// Vite Middleware
async function startServer() {
  // 1. Try to connect to DB in background
  prisma.$connect()
    .then(() => {
      console.log("✅ Database connection established.");
      // Credentials sync logic
      syncCredentials();
    })
    .catch((error) => {
      console.error("❌ Database connection failed at startup:", error.message);
    });

  // 2. Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 3. Start Listening
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} with Socket.IO enabled`);
  });
}

async function syncCredentials() {
  try {
    const pHashAdmin = await bcrypt.hash("admin123", 10);
    const pHashCashier = await bcrypt.hash("cashier123", 10);
    
    const defaultBranchId = "default-branch-id";
    const branch = await prisma.branch.upsert({
      where: { id: defaultBranchId },
      update: {},
      create: {
        id: defaultBranchId,
        name: "Cabang Utama",
        address: "Cianjur",
        phone: "0812"
      }
    });
    
    await prisma.user.upsert({
      where: { username: "admin" },
      update: { password: pHashAdmin, status: "Active", role: "ADMIN" },
      create: { username: "admin", password: pHashAdmin, name: "Super Admin", role: "ADMIN", branchId: branch.id, status: "Active" }
    });

    await prisma.user.upsert({
      where: { username: "cashier" },
      update: { password: pHashCashier, status: "Active", role: "CASHIER" },
      create: { username: "cashier", password: pHashCashier, name: "Kasir Toko", role: "CASHIER", branchId: branch.id, status: "Active" }
    });

    await prisma.globalConfig.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default", allowCashierStockInput: true }
    });

    console.log("✅ Credentials and Global Config synchronized.");
  } catch (dbErr: any) {
    console.error("ℹ️ User synchronization check failed:", dbErr.message);
  }
}

startServer();

