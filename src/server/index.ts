import express, { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDatabase } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const JWT_SECRET = process.env.JWT_SECRET || "pos-system-secret-2025";
const PORT = String(process.env.PORT || 8082);

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

const UPLOADS_DIR = "uploads";
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
app.use("/uploads", express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

let db: any;

// Helper to log actions
const logAction = async (user: any, action: string, details: string = "") => {
  try {
    await db.run(
      "INSERT INTO audit_logs (user_id, user_name, action, details) VALUES (?, ?, ?, ?)",
      user?.id || null,
      user?.name || "System",
      action,
      details
    );
  } catch (err) {
    console.error("Logging failed:", err);
  }
};

interface AuthenticatedRequest extends Request {
  user?: any;
}

const authenticate = (req: AuthenticatedRequest, res: any, next: any) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API ENDPOINTS ---

app.post("/api/auth", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get(
    "SELECT id, username, name, role FROM users WHERE username = ? AND password = ?",
    username,
    password
  );
  if (user) {
    const token = jwt.sign(user, JWT_SECRET);
    await logAction(user, "Login", `User ${user.username} logged in`);
    res.json({ user, token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/users", authenticate, async (req, res) => {
  res.json(await db.all("SELECT id, username, name, role, salary FROM users"));
});

app.post("/api/users", authenticate, async (req, res) => {
  const u = req.body;
  if (u.id) {
    if (u.password) {
      await db.run(
        "UPDATE users SET username=?, password=?, name=?, role=?, salary=? WHERE id=?",
        u.username,
        u.password,
        u.name,
        u.role,
        u.salary,
        u.id
      );
    } else {
      await db.run(
        "UPDATE users SET username=?, name=?, role=?, salary=? WHERE id=?",
        u.username,
        u.name,
        u.role,
        u.salary,
        u.id
      );
    }
    await logAction(req.user, "Update User", `Updated user: ${u.username}`);
  } else {
    await db.run(
      "INSERT INTO users (username, password, name, role, salary) VALUES (?,?,?,?,?)",
      u.username,
      u.password || "123",
      u.name,
      u.role,
      u.salary
    );
    await logAction(req.user, "Create User", `Created user: ${u.username}`);
  }
  res.json({ success: true });
});

app.delete("/api/users/:id", authenticate, async (req, res) => {
  const user = await db.get(
    "SELECT username FROM users WHERE id = ?",
    req.params.id
  );
  await db.run("DELETE FROM users WHERE id = ?", req.params.id);
  await logAction(
    req.user,
    "Delete User",
    `Deleted user: ${user?.username || req.params.id}`
  );
  res.json({ success: true });
});

app.get("/api/products", async (req, res) => {
  res.json(await db.all("SELECT * FROM products WHERE active = 1"));
});

app.post("/api/products", authenticate, async (req, res) => {
  const p = req.body;
  if (p.id) {
    await db.run(
      "UPDATE products SET name=?, name_ar=?, description=?, description_ar=?, price=?, image=?, category_id=? WHERE id=?",
      p.name,
      p.name_ar,
      p.description,
      p.description_ar,
      p.price,
      p.image,
      p.category_id,
      p.id
    );
    await logAction(req.user, "Update Product", `Updated product: ${p.name}`);
  } else {
    await db.run(
      "INSERT INTO products (name, name_ar, description, description_ar, price, image, category_id) VALUES (?,?,?,?,?,?,?)",
      p.name,
      p.name_ar,
      p.description,
      p.description_ar,
      p.price,
      p.image,
      p.category_id
    );
    await logAction(req.user, "Create Product", `Created product: ${p.name}`);
  }
  res.json({ success: true });
});

app.delete("/api/products/:id", authenticate, async (req, res) => {
  const product = await db.get(
    "SELECT name FROM products WHERE id = ?",
    req.params.id
  );
  await db.run("UPDATE products SET active = 0 WHERE id = ?", req.params.id);
  await logAction(
    req.user,
    "Delete Product",
    `Deactivated product: ${product?.name || req.params.id}`
  );
  res.json({ success: true });
});

app.get("/api/categories", async (req, res) =>
  res.json(await db.all("SELECT * FROM categories"))
);

app.post("/api/categories", authenticate, async (req, res) => {
  const c = req.body;
  if (c.id) {
    await db.run(
      "UPDATE categories SET name=?, name_ar=?, icon=? WHERE id=?",
      c.name,
      c.name_ar,
      c.icon,
      c.id
    );
    await logAction(req.user, "Update Category", `Updated category: ${c.name}`);
  } else {
    await db.run(
      "INSERT INTO categories (name, name_ar, icon) VALUES (?,?,?)",
      c.name,
      c.name_ar,
      c.icon
    );
    await logAction(req.user, "Create Category", `Created category: ${c.name}`);
  }
  res.json({ success: true });
});

app.delete("/api/categories/:id", authenticate, async (req, res) => {
  const cat = await db.get(
    "SELECT name FROM categories WHERE id = ?",
    req.params.id
  );
  await db.run("DELETE FROM categories WHERE id = ?", req.params.id);
  await logAction(
    req.user,
    "Delete Category",
    `Deleted category: ${cat?.name || req.params.id}`
  );
  res.json({ success: true });
});

app.get("/api/stock", async (req, res) =>
  res.json(await db.all("SELECT * FROM stock"))
);

app.post("/api/stock", authenticate, async (req, res) => {
  const s = req.body;
  if (s.id) {
    await db.run(
      "UPDATE stock SET name=?, qty=?, unit=?, price=?, price_qty=?, low_stock_threshold=? WHERE id=?",
      s.name,
      s.qty,
      s.unit,
      s.price,
      s.price_qty,
      s.low_stock_threshold,
      s.id
    );
    await logAction(
      (req as AuthenticatedRequest).user,
      "Update Stock",
      `Updated stock item: ${s.name} to ${s.qty} ${s.unit}`
    );
  } else {
    await db.run(
      "INSERT INTO stock (name, qty, unit, price, price_qty, low_stock_threshold) VALUES (?,?,?,?,?,?)",
      s.name,
      s.qty,
      s.unit,
      s.price,
      s.price_qty,
      s.low_stock_threshold
    );
    await logAction(req.user, "Create Stock", `Created stock item: ${s.name}`);
  }
  res.json({ success: true });
});

app.delete("/api/stock/:id", authenticate, async (req, res) => {
  const item = await db.get(
    "SELECT name FROM stock WHERE id = ?",
    req.params.id
  );
  await db.run("DELETE FROM stock WHERE id = ?", req.params.id);
  await logAction(
    req.user,
    "Delete Stock",
    `Deleted stock item: ${item?.name || req.params.id}`
  );
  res.json({ success: true });
});

app.get("/api/expenses", authenticate, async (req, res) => {
  res.json(
    await db.all(
      "SELECT * FROM expenses WHERE is_archived = 0 ORDER BY date DESC"
    )
  );
});

app.get("/api/expenses/archived", authenticate, async (req, res) => {
  res.json(
    await db.all(
      "SELECT * FROM expenses WHERE is_archived = 1 ORDER BY date DESC"
    )
  );
});

app.post("/api/expenses", authenticate, async (req, res) => {
  const e = req.body;
  if (e.id) {
    await db.run(
      "UPDATE expenses SET title=?, amount=?, category=?, date=? WHERE id=?",
      e.title,
      e.amount,
      e.category,
      e.date,
      e.id
    );
    await logAction(
      req.user,
      "Update Expense",
      `Updated expense: ${e.title} ($${e.amount})`
    );
  } else {
    await db.run(
      "INSERT INTO expenses (title, amount, category, date) VALUES (?,?,?,?)",
      e.title,
      e.amount,
      e.category,
      e.date
    );
    await logAction(
      req.user,
      "Create Expense",
      `Created expense: ${e.title} ($${e.amount})`
    );
  }
  res.json({ success: true });
});

app.post("/api/expenses/:id/archive", authenticate, async (req, res) => {
  await db.run(
    "UPDATE expenses SET is_archived = 1 WHERE id = ?",
    req.params.id
  );
  await logAction(
    req.user,
    "Archive Expense",
    `Archived expense ID: ${req.params.id}`
  );
  res.json({ success: true });
});

app.post("/api/expenses/:id/unarchive", authenticate, async (req, res) => {
  await db.run(
    "UPDATE expenses SET is_archived = 0 WHERE id = ?",
    req.params.id
  );
  await logAction(
    req.user,
    "Unarchive Expense",
    `Unarchived expense ID: ${req.params.id}`
  );
  res.json({ success: true });
});

app.delete("/api/expenses/:id", authenticate, async (req, res) => {
  await db.run("DELETE FROM expenses WHERE id = ?", req.params.id);
  await logAction(
    req.user,
    "Delete Expense",
    `Deleted expense ID: ${req.params.id}`
  );
  res.json({ success: true });
});

async function getFullOrders(isArchived: number) {
  const orders = await db.all(
    `
    SELECT o.*, s.label, s.label_ar, s.color 
    FROM orders o 
    JOIN order_statuses s ON o.status_id = s.id 
    WHERE o.is_archived = ? 
    ORDER BY created_at DESC
  `,
    isArchived
  );

  for (const o of orders) {
    o.items = await db.all(
      `
      SELECT oi.*, p.name_ar 
      FROM order_items oi 
      LEFT JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `,
      o.id
    );
    o.status = o.label.toLowerCase();
  }
  return orders;
}

app.get("/api/orders", authenticate, async (req, res) =>
  res.json(await getFullOrders(0))
);
app.get("/api/orders/archived", authenticate, async (req, res) =>
  res.json(await getFullOrders(1))
);

app.post("/api/orders", async (req, res) => {
  const { items, total } = req.body;
  const status = await db.get(
    "SELECT id FROM order_statuses WHERE is_default = 1"
  );
  const result = await db.run(
    "INSERT INTO orders (total, status_id, payment_status) VALUES (?, ?, ?)",
    total,
    status.id,
    "unpaid"
  );
  const orderId = result.lastID;
  for (const item of items) {
    await db.run(
      "INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)",
      orderId,
      item.product_id || item.id,
      item.name,
      item.price,
      item.qty
    );
  }
  io.emit("new-order");

  // Log the customer order
  await logAction(
    null,
    "Customer Order",
    `New order #${orderId} placed from POS (Total: $${total})`
  );

  res.json({ id: orderId });
});

app.post("/api/orders/update", authenticate, async (req, res) => {
  const o = req.body;
  await db.run("UPDATE orders SET total = ? WHERE id = ?", o.total, o.id);
  await db.run("DELETE FROM order_items WHERE order_id = ?", o.id);
  for (const item of o.items) {
    await db.run(
      "INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)",
      o.id,
      item.product_id || item.id,
      item.name,
      item.price,
      item.qty
    );
  }
  await logAction(req.user, "Update Order", `Updated order #${o.id}`);
  res.json({ success: true });
});

app.post("/api/orders/:id/status", authenticate, async (req, res) => {
  const statusLabel = req.body.status;
  const status = await db.get(
    "SELECT id FROM order_statuses WHERE LOWER(label) = ?",
    statusLabel.toLowerCase()
  );
  if (status) {
    await db.run(
      "UPDATE orders SET status_id = ? WHERE id = ?",
      status.id,
      req.params.id
    );
    await logAction(
      req.user,
      "Update Order Status",
      `Order #${req.params.id} set to ${statusLabel}`
    );
  }
  res.json({ success: true });
});

app.post("/api/orders/:id/payment", authenticate, async (req, res) => {
  await db.run(
    "UPDATE orders SET payment_status = ? WHERE id = ?",
    req.body.status,
    req.params.id
  );
  await logAction(
    req.user,
    "Update Order Payment",
    `Order #${req.params.id} set to ${req.body.status}`
  );
  res.json({ success: true });
});

app.post("/api/orders/:id/archive", authenticate, async (req, res) => {
  await db.run("UPDATE orders SET is_archived = 1 WHERE id = ?", req.params.id);
  await logAction(
    req.user,
    "Archive Order",
    `Archived order #${req.params.id}`
  );
  res.json({ success: true });
});

app.post("/api/orders/:id/unarchive", authenticate, async (req, res) => {
  await db.run("UPDATE orders SET is_archived = 0 WHERE id = ?", req.params.id);
  await logAction(
    req.user,
    "Unarchive Order",
    `Unarchive order #${req.params.id}`
  );
  res.json({ success: true });
});

app.post("/api/orders/bulk-archive", authenticate, async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) return res.json({ success: true });
  const placeholders = ids.map(() => "?").join(",");
  await db.run(
    `UPDATE orders SET is_archived = 1 WHERE id IN (${placeholders})`,
    ...ids
  );
  await logAction(
    req.user,
    "Bulk Archive Orders",
    `Archived orders: ${ids.join(", ")}`
  );
  res.json({ success: true });
});

app.post("/api/orders/archive-all", authenticate, async (req, res) => {
  await db.run("UPDATE orders SET is_archived = 1 WHERE is_archived = 0");
  await logAction(req.user, "Archive All Orders", `Archived all active orders`);
  res.json({ success: true });
});

app.delete("/api/orders/clear", authenticate, async (req, res) => {
  await db.run("DELETE FROM order_items");
  await db.run("DELETE FROM orders");
  await logAction(
    req.user,
    "Clear Orders History",
    `Deleted all order records permanently`
  );
  res.json({ success: true });
});

app.delete("/api/orders/:id", authenticate, async (req, res) => {
  await db.run("DELETE FROM order_items WHERE order_id = ?", req.params.id);
  await db.run("DELETE FROM orders WHERE id = ?", req.params.id);
  await logAction(req.user, "Delete Order", `Deleted order #${req.params.id}`);
  res.json({ success: true });
});

app.get("/api/stats", authenticate, async (req, res) => {
  const timeframe = req.query.timeframe || "all";
  let dateFilter = "";
  let expenseFilter = "";

  if (timeframe === "weekly") {
    dateFilter = "AND created_at >= date('now', '-7 days')";
    expenseFilter = "AND date >= date('now', '-7 days')";
  } else if (timeframe === "monthly") {
    dateFilter = "AND created_at >= date('now', '-30 days')";
    expenseFilter = "AND date >= date('now', '-30 days')";
  } else if (timeframe === "yearly") {
    dateFilter = "AND created_at >= date('now', '-365 days')";
    expenseFilter = "AND date >= date('now', '-365 days')";
  }

  const revenueRow = await db.get(
    `SELECT SUM(total) as total FROM orders WHERE payment_status = 'paid' ${dateFilter}`
  );
  const potentialRow = await db.get(
    `SELECT SUM(total) as total FROM orders WHERE 1=1 ${dateFilter}`
  );
  const countRow = await db.get(
    `SELECT COUNT(*) as count FROM orders WHERE 1=1 ${dateFilter}`
  );
  const expensesRow = await db.get(
    `SELECT SUM(amount) as total FROM expenses WHERE is_archived = 0 ${expenseFilter}`
  );
  const stockRow = await db.get(
    `SELECT SUM(qty * price / price_qty) as total FROM stock`
  );

  // Advanced Salary pro-rating
  const salarySumRow = await db.get(`SELECT SUM(salary) as total FROM users`);
  const monthlySalary = salarySumRow.total || 0;
  let proRatedSalaries = monthlySalary;

  if (timeframe === "weekly") {
    proRatedSalaries = monthlySalary / 4;
  } else if (timeframe === "yearly") {
    proRatedSalaries = monthlySalary * 12;
  } else if (timeframe === "all") {
    const firstOrder = await db.get(
      "SELECT created_at FROM orders ORDER BY created_at ASC LIMIT 1"
    );
    if (firstOrder) {
      const start = new Date(firstOrder.created_at);
      const end = new Date();
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()) +
        1;
      proRatedSalaries = monthlySalary * months;
    }
  }

  const topProducts = await db.all(`
    SELECT name, SUM(qty) as qty 
    FROM order_items oi 
    JOIN orders o ON oi.order_id = o.id 
    WHERE 1=1 ${dateFilter} 
    GROUP BY name ORDER BY qty DESC LIMIT 5
  `);

  const categoryPerformance = await db.all(`
    SELECT c.name, SUM(oi.price * oi.qty) as value
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN orders o ON oi.order_id = o.id
    WHERE 1=1 ${dateFilter}
    GROUP BY c.id
  `);

  res.json({
    totalRevenue: revenueRow.total || 0,
    totalPotentialRevenue: potentialRow.total || 0,
    orderCount: countRow.count || 0,
    totalExpenses: expensesRow.total || 0,
    stockValue: stockRow.total || 0,
    totalSalaries: proRatedSalaries,
    topProducts,
    categoryPerformance,
  });
});

app.get("/api/settings", async (req, res) => {
  const rows = await db.all("SELECT * FROM settings");
  const settings = rows.reduce(
    (acc: any, row: any) => ({
      ...acc,
      [row.key]: isNaN(row.value) ? row.value : Number(row.value),
    }),
    {}
  );
  res.json(settings);
});

app.post("/api/settings", authenticate, async (req, res) => {
  const s = req.body;
  for (const key of Object.keys(s)) {
    await db.run(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
      key,
      String(s[key])
    );
  }
  await logAction(
    req.user,
    "Update Settings",
    `Changed system settings: ${Object.keys(s).join(", ")}`
  );
  res.json({ success: true });
});

app.post(
  "/api/upload",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    await logAction(
      req.user,
      "File Upload",
      `Uploaded image: ${req.file.filename}`
    );
    res.json({ url: `/uploads/${req.file.filename}` });
  }
);

// Audit Log endpoints
app.get("/api/logs", authenticate, async (req, res) => {
  res.json(await db.all("SELECT * FROM audit_logs ORDER BY timestamp DESC"));
});

app.delete("/api/logs/clear", authenticate, async (req, res) => {
  await db.run("DELETE FROM audit_logs");
  await logAction(
    req.user,
    "Clear Audit Logs",
    "Permanently cleared action history"
  );
  res.json({ success: true });
});

// Serve frontend in production
const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  const distPath = path.resolve(__dirname, "../../dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
}

async function startServer() {
  db = await initializeDatabase();
  httpServer.listen(parseInt(PORT, 10), "0.0.0.0", () =>
    console.log(`Server running on port ${PORT}...`)
  );
}

startServer();