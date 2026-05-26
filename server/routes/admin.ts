import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, ordersTable, orderItemsTable, productsTable } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims as any)?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

async function buildOrderResponse(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    id: order.id,
    userId: order.userId,
    userEmail: order.userEmail,
    status: order.status,
    items: items.map((i) => ({
      id: i.id, productId: i.productId,
      productName: i.productName, productImageUrl: i.productImageUrl,
      price: Number(i.price), quantity: i.quantity, size: i.size, color: i.color,
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    shippingAddress: order.shippingAddress,
    customerPhone: order.customerPhone,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

router.get("/admin/orders", requireAuth, async (req: any, res: any) => {
  try {
    const status = req.query.status as string | undefined;
    const orders = status
      ? await db.select().from(ordersTable).where(eq(ordersTable.status, status)).orderBy(desc(ordersTable.createdAt))
      : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const results = await Promise.all(orders.map((o) => buildOrderResponse(o.id)));
    return res.json(results.filter(Boolean));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/orders/:id/status", requireAuth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    const { status } = z.object({
      status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
    }).parse(req.body);
    const [order] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    if (!order) return res.status(404).json({ error: "Not found" });
    return res.json(await buildOrderResponse(order.id));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/stats", requireAuth, async (_req: any, res: any) => {
  try {
    const orders = await db.select().from(ordersTable);
    const products = await db.select({ id: productsTable.id }).from(productsTable);
    const uniqueCustomers = new Set(orders.map((o) => o.userId)).size;
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const now = new Date();
    const thisMonth = orders.filter(
      (o) => o.createdAt.getMonth() === now.getMonth() && o.createdAt.getFullYear() === now.getFullYear()
    );
    const prevM = now.getMonth() - 1;
    const prevY = prevM < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const lastMonth = orders.filter(
      (o) => o.createdAt.getMonth() === (prevM < 0 ? 11 : prevM) && o.createdAt.getFullYear() === prevY
    );
    const tmr = thisMonth.reduce((s, o) => s + Number(o.total), 0);
    const lmr = lastMonth.reduce((s, o) => s + Number(o.total), 0);
    return res.json({
      totalRevenue, totalOrders: orders.length,
      totalProducts: products.length, totalCustomers: uniqueCustomers,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      revenueGrowth: lmr > 0 ? Math.round(((tmr - lmr) / lmr) * 1000) / 10 : tmr > 0 ? 100 : 0,
      ordersGrowth: lastMonth.length > 0 ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 1000) / 10 : thisMonth.length > 0 ? 100 : 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/top-products", requireAuth, async (_req: any, res: any) => {
  try {
    const rows = await db
      .select({
        productId: orderItemsTable.productId,
        name: productsTable.name,
        imageUrl: productsTable.imageUrl,
        totalSold: sql<number>`sum(${orderItemsTable.quantity})`.as("totalSold"),
        revenue: sql<number>`sum(${orderItemsTable.price}::numeric * ${orderItemsTable.quantity})`.as("revenue"),
      })
      .from(orderItemsTable)
      .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .groupBy(orderItemsTable.productId, productsTable.name, productsTable.imageUrl)
      .orderBy(sql`sum(${orderItemsTable.quantity}) DESC`)
      .limit(10);
    return res.json(rows.map((r) => ({
      productId: r.productId, name: r.name, imageUrl: r.imageUrl,
      totalSold: Number(r.totalSold), revenue: Number(r.revenue),
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-orders", requireAuth, async (_req: any, res: any) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
    const results = await Promise.all(orders.map((o) => buildOrderResponse(o.id)));
    return res.json(results.filter(Boolean));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/users", requireAuth, async (_req: any, res: any) => {
  try {
    const response = await clerkClient.users.getUserList({ limit: 200 });
    return res.json(response.data.map((u) => ({
      id: u.id, email: u.primaryEmailAddress?.emailAddress ?? "",
      firstName: u.firstName, lastName: u.lastName,
      createdAt: u.createdAt, lastActiveAt: u.lastActiveAt,
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
