import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

const PORT = Number(process.env.PORT) || 3000;
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
  try {
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (!user || !(await bcrypt.compare(cleanPassword, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

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
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    io.emit("productDeleted", { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
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
  const { name, address, phone } = req.body;
  try {
    const branch = await prisma.branch.create({
      data: { name, address, phone }
    });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: "Failed to create branch" });
  }
});

app.patch("/api/branches/:id", authenticateToken, async (req, res) => {
  const { name, address, phone } = req.body;
  try {
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: { name, address, phone }
    });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: "Failed to update branch" });
  }
});

app.delete("/api/branches/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.branch.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete branch" });
  }
});

app.post("/api/sales", authenticateToken, async (req, res) => {
  const { branchId, cashierId, items, customerName, total, totalCommission } = req.body;
  const actualCashierId = cashierId || (req as any).user.userId;
  const actualBranchId = branchId || (req as any).user.branchId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          branchId: actualBranchId,
          cashierId: actualCashierId,
          customerName,
          total,
          totalCommission,
          status: "success",
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price,
              subtotal: item.subtotal
            }))
          }
        },
        include: { items: true }
      });

      // Update Stocks
      for (const item of items) {
        await tx.productStock.upsert({
          where: {
            productId_branchId: {
              productId: item.productId,
              branchId: actualBranchId
            }
          },
          update: {
            qty: { decrement: item.qty }
          },
          create: {
            productId: item.productId,
            branchId: actualBranchId,
            qty: -item.qty
          }
        });

        // Add Commission Records
        if (item.commission && item.commission > 0) {
          await tx.commission.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              qty: item.qty,
              amount: item.commission,
              cashierId: actualCashierId,
              branchId: actualBranchId,
              status: "earned"
            }
          });
        }
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
    if (error.code) console.error("Prisma Error Code:", error.code);
    if (error.meta) console.error("Prisma Error Meta:", JSON.stringify(error.meta));
    res.status(500).json({ error: "Failed to process sale: " + (error.message || "Unknown") });
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

      // 3. Update Commissions
      await tx.commission.updateMany({
        where: { saleId: sale.id },
        data: { status: "refunded", refundedAt: new Date() }
      });

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
async function startApp() {
  // Test Database Connection before starting
  console.log("Checking database connection...");
  try {
    await prisma.$connect();
    console.log("✅ Database connection established.");
  } catch (error: any) {
    console.error("❌ Database connection failed!");
    console.error("Error details:", error.message);
    console.log("Tip: Check if DATABASE_URL is set correctly in Railway variables.");
    // We continue so the server doesn't crash, but API calls will fail until fixed
  }

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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} with Socket.IO enabled`);
  });
}

startApp();

