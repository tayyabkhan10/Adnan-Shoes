import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable } from "../db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { sendOrderConfirmation } from "../lib/mailer";

const FREE_SHIPPING_THRESHOLD = 28000;
const SHIPPING_COST = 500;

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
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productImageUrl: i.productImageUrl,
      price: Number(i.price),
      quantity: i.quantity,
      size: i.size,
      color: i.color,
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    shippingAddress: order.shippingAddress,
    customerPhone: order.customerPhone,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

router.get("/orders", requireAuth, async (req: any, res: any) => {
  try {
    const userOrders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, req.userId))
      .orderBy(desc(ordersTable.createdAt));
    const results = await Promise.all(userOrders.map((o) => buildOrderResponse(o.id)));
    return res.json(results.filter(Boolean));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const ShippingAddress = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(3),
  country: z.string().min(2),
});

const CreateOrderBody = z.object({ shippingAddress: ShippingAddress ,  customerPhone: z.string().min(11), paymentMethod: z.enum(['cod', 'online'])});

router.post("/orders", requireAuth, async (req: any, res: any) => {
  try {
    const { shippingAddress , customerPhone ,  paymentMethod} = CreateOrderBody.parse(req.body);
    const userId = req.userId as string;

    const cartItems = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        productName: productsTable.name,
        productImageUrl: productsTable.imageUrl,
        price: cartItemsTable.price,
        quantity: cartItemsTable.quantity,
        size: cartItemsTable.size,
        color: cartItemsTable.color,
      })
      .from(cartItemsTable)
      .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.userId, userId));

    if (!cartItems.length) return res.status(400).json({ error: "Cart is empty" });

    const subtotal = cartItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shippingCost;

    const [order] = await db
      .insert(ordersTable)
      .values({
        userId,
        status: "pending",
        subtotal: String(subtotal.toFixed(2)),
        shippingCost: String(shippingCost.toFixed(2)),
        total: String(total.toFixed(2)),
        shippingAddress,
        customerPhone,
        paymentMethod,
      })
      .returning();

    await db.insert(orderItemsTable).values(
      cartItems.map((i) => ({
        orderId: order.id,
        productId: i.productId,
        productName: i.productName,
        productImageUrl: i.productImageUrl,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }))
    );

    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

    const result = await buildOrderResponse(order.id);

    // Send email (non-blocking)
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      const toEmail = clerkUser.primaryEmailAddress?.emailAddress;
      const toName = clerkUser.firstName || toEmail || "Customer";
      if (toEmail) {
        sendOrderConfirmation({
          orderId: order.id, toEmail, toName,
          items: cartItems.map((i) => ({
            productName: i.productName, quantity: i.quantity,
            price: Number(i.price), size: i.size, color: i.color,
          })),
          subtotal, shippingCost, total, shippingAddress, 
        }).catch((e) => console.warn("Email send failed:", e));
      }
    } catch (e) {
      console.warn("Could not fetch user for email:", e);
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const order = await buildOrderResponse(id);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (order.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
