import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, cartItemsTable, productsTable } from "../db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims as any)?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

async function buildCartResponse(userId: string) {
  const items = await db
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

  const cartItems = items.map((i) => ({
    id: i.id,
    productId: i.productId,
    productName: i.productName,
    productImageUrl: i.productImageUrl,
    price: Number(i.price),
    quantity: i.quantity,
    size: i.size,
    color: i.color,
  }));

  return {
    items: cartItems,
    subtotal: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    itemCount: cartItems.reduce((s, i) => s + i.quantity, 0),
  };
}

router.get("/cart", requireAuth, async (req: any, res: any) => {
  try {
    return res.json(await buildCartResponse(req.userId));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const AddBody = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  size: z.string().min(1),
  color: z.string().min(1),
});

router.post("/cart/items", requireAuth, async (req: any, res: any) => {
  try {
    const { productId, quantity, size, color } = AddBody.parse(req.body);
    const userId = req.userId as string;

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));
    if (!product) return res.status(404).json({ error: "Product not found" });

    const [existing] = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.userId, userId),
          eq(cartItemsTable.productId, productId),
          eq(cartItemsTable.size, size),
          eq(cartItemsTable.color, color)
        )
      );

    if (existing) {
      await db
        .update(cartItemsTable)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItemsTable.id, existing.id));
    } else {
      await db.insert(cartItemsTable).values({
        userId, productId, quantity, size, color, price: product.price,
      });
    }

    return res.json(await buildCartResponse(userId));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/cart/items/:cartItemId", requireAuth, async (req: any, res: any) => {
  try {
    const cartItemId = Number(req.params.cartItemId);
    const { quantity } = z.object({ quantity: z.number().int().min(0) }).parse(req.body);
    const userId = req.userId as string;

    if (quantity <= 0) {
      await db.delete(cartItemsTable).where(
        and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, userId))
      );
    } else {
      await db.update(cartItemsTable).set({ quantity }).where(
        and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, userId))
      );
    }
    return res.json(await buildCartResponse(userId));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart/items/:cartItemId", requireAuth, async (req: any, res: any) => {
  try {
    const cartItemId = Number(req.params.cartItemId);
    const userId = req.userId as string;
    await db.delete(cartItemsTable).where(
      and(eq(cartItemsTable.id, cartItemId), eq(cartItemsTable.userId, userId))
    );
    return res.json(await buildCartResponse(userId));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart/clear", requireAuth, async (req: any, res: any) => {
  try {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId));
    return res.json({ items: [], subtotal: 0, itemCount: 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
