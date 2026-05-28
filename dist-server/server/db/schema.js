import { pgTable, text, serial, boolean, numeric, integer, timestamp, jsonb, } from "drizzle-orm/pg-core";
// ── Products ─────────────────────────────────────────────────
export const productsTable = pgTable("products", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
    category: text("category").notNull(),
    imageUrl: text("image_url").notNull(),
    additionalImages: text("additional_images").array().notNull().default([]),
    sizes: text("sizes").array().notNull().default([]),
    colors: text("colors").array().notNull().default([]),
    inStock: boolean("in_stock").notNull().default(true),
    stockCount: integer("stock_count").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    rating: numeric("rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
// ── Cart ─────────────────────────────────────────────────────
export const cartItemsTable = pgTable("cart_items", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    productId: integer("product_id")
        .notNull()
        .references(() => productsTable.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    size: text("size").notNull(),
    color: text("color").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
// ── Orders ───────────────────────────────────────────────────
export const ordersTable = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    userEmail: text("user_email"),
    status: text("status").notNull().default("pending"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    shippingAddress: jsonb("shipping_address").notNull(),
    paymentMethod: text("payment_method").notNull(), // 'cod' ya 'online'
    customerPhone: text("customer_phone"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
export const orderItemsTable = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
        .notNull()
        .references(() => ordersTable.id, { onDelete: "cascade" }),
    productId: integer("product_id")
        .notNull()
        .references(() => productsTable.id),
    productName: text("product_name").notNull(),
    productImageUrl: text("product_image_url").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    size: text("size").notNull(),
    color: text("color").notNull(),
});
