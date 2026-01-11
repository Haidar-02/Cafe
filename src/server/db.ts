import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any = null;

export async function initializeDatabase() {
  if (db) return db;

  try {
    db = await open({
      filename: 'coffee_shop.db',
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'cashier')) NOT NULL,
        salary REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT,
        description TEXT,
        description_ar TEXT,
        price REAL NOT NULL,
        image TEXT,
        category_id INTEGER,
        active INTEGER DEFAULT 1,
        FOREIGN KEY(category_id) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        qty REAL NOT NULL,
        unit TEXT NOT NULL,
        price REAL DEFAULT 0,
        price_qty REAL DEFAULT 1,
        low_stock_threshold REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS order_statuses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        label_ar TEXT,
        color TEXT NOT NULL,
        is_default INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status_id INTEGER,
        total REAL NOT NULL,
        payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
        is_archived INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(status_id) REFERENCES order_statuses(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        qty INTEGER NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_name TEXT,
        action TEXT NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);

    // Seed Initial Data
    const userCountRow = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCountRow.count === 0) {
      await db.run('INSERT INTO users (username, password, name, role, salary) VALUES (?, ?, ?, ?, ?)', 'admin', '123', 'Haidar', 'admin', 2000);
      await db.run('INSERT INTO users (username, password, name, role, salary) VALUES (?, ?, ?, ?, ?)', 'cashier', '000', 'Cashier', 'cashier', 800);
      
      await db.run('INSERT INTO order_statuses (label, label_ar, color, is_default) VALUES (?, ?, ?, ?)', 'Pending', 'قيد الانتظار', '#f59e0b', 1);
      await db.run('INSERT INTO order_statuses (label, label_ar, color) VALUES (?, ?, ?)', 'Preparing', 'جاري التحضير', '#3b82f6');
      await db.run('INSERT INTO order_statuses (label, label_ar, color) VALUES (?, ?, ?)', 'Ready', 'جاهز', '#10b981');
      await db.run('INSERT INTO order_statuses (label, label_ar, color) VALUES (?, ?, ?)', 'Cancelled', 'ملغي', '#ef4444');
      
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', 'exchangeRate', '89500');
      
      await db.run('INSERT INTO categories (name, name_ar, icon) VALUES (?, ?, ?)', 'Hot Coffee', 'قهوة ساخنة', 'Coffee');
      await db.run('INSERT INTO categories (name, name_ar, icon) VALUES (?, ?, ?)', 'Cold Drinks', 'مشروبات باردة', 'Milk');
    }

    return db;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}