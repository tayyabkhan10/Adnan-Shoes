import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, productsTable } from "../db";
import { eq, ilike, gte, lte, and } from "drizzle-orm";
import { z } from "zod";
const router = Router();
function requireAuth(req, res, next) {
    const auth = getAuth(req);
    const userId = auth?.sessionClaims?.userId || auth?.userId;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    req.userId = userId;
    next();
}
function toProduct(p) {
    return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
        category: p.category,
        imageUrl: p.imageUrl,
        additionalImages: p.additionalImages ?? [],
        sizes: p.sizes ?? [],
        colors: p.colors ?? [],
        inStock: p.inStock,
        stockCount: p.stockCount,
        featured: p.featured,
        rating: p.rating != null ? Number(p.rating) : null,
        reviewCount: p.reviewCount,
        createdAt: p.createdAt.toISOString(),
    };
}
const ListParams = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    featured: z.coerce.boolean().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
});
router.get("/products", async (req, res) => {
    try {
        const q = ListParams.parse(req.query);
        const conditions = [];
        if (q.category)
            conditions.push(eq(productsTable.category, q.category));
        if (q.search)
            conditions.push(ilike(productsTable.name, `%${q.search}%`));
        if (q.minPrice != null)
            conditions.push(gte(productsTable.price, String(q.minPrice)));
        if (q.maxPrice != null)
            conditions.push(lte(productsTable.price, String(q.maxPrice)));
        if (q.featured != null)
            conditions.push(eq(productsTable.featured, q.featured));
        let products = await db
            .select()
            .from(productsTable)
            .where(conditions.length ? and(...conditions) : undefined);
        if (q.size)
            products = products.filter((p) => p.sizes.includes(q.size));
        if (q.color)
            products = products.filter((p) => p.colors.includes(q.color));
        return res.json(products.map(toProduct));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/products/featured", async (_req, res) => {
    try {
        const products = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.featured, true));
        return res.json(products.map(toProduct));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/products/categories", async (_req, res) => {
    try {
        const products = await db.select({ category: productsTable.category }).from(productsTable);
        const counts = {};
        for (const p of products)
            counts[p.category] = (counts[p.category] ?? 0) + 1;
        return res.json(Object.entries(counts).map(([name, count]) => ({ name, count })));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ error: "Invalid id" });
        const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
        if (!product)
            return res.status(404).json({ error: "Not found" });
        return res.json(toProduct(product));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
const CreateBody = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    category: z.string().min(1),
    imageUrl: z.string().url(),
    additionalImages: z.array(z.string()).optional(),
    sizes: z.array(z.string()),
    colors: z.array(z.string()),
    stockCount: z.number().int().min(0).optional(),
    featured: z.boolean().optional(),
});
router.post("/products", requireAuth, async (req, res) => {
    try {
        const data = CreateBody.parse(req.body);
        const [product] = await db
            .insert(productsTable)
            .values({
            name: data.name,
            description: data.description,
            price: String(data.price),
            originalPrice: data.originalPrice != null ? String(data.originalPrice) : null,
            category: data.category,
            imageUrl: data.imageUrl,
            additionalImages: data.additionalImages ?? [],
            sizes: data.sizes,
            colors: data.colors,
            stockCount: data.stockCount ?? 0,
            inStock: (data.stockCount ?? 0) > 0,
            featured: data.featured ?? false,
        })
            .returning();
        return res.status(201).json(toProduct(product));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.patch("/products/:id", requireAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ error: "Invalid id" });
        const data = CreateBody.partial()
            .extend({ inStock: z.boolean().optional() })
            .parse(req.body);
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.price !== undefined)
            updateData.price = String(data.price);
        if (data.originalPrice !== undefined)
            updateData.originalPrice = data.originalPrice != null ? String(data.originalPrice) : null;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.imageUrl !== undefined)
            updateData.imageUrl = data.imageUrl;
        if (data.additionalImages !== undefined)
            updateData.additionalImages = data.additionalImages;
        if (data.sizes !== undefined)
            updateData.sizes = data.sizes;
        if (data.colors !== undefined)
            updateData.colors = data.colors;
        if (data.stockCount !== undefined)
            updateData.stockCount = data.stockCount;
        if (data.inStock !== undefined)
            updateData.inStock = data.inStock;
        if (data.featured !== undefined)
            updateData.featured = data.featured;
        const [product] = await db
            .update(productsTable)
            .set(updateData)
            .where(eq(productsTable.id, id))
            .returning();
        if (!product)
            return res.status(404).json({ error: "Not found" });
        return res.json(toProduct(product));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.delete("/products/:id", requireAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ error: "Invalid id" });
        await db.delete(productsTable).where(eq(productsTable.id, id));
        return res.status(204).send();
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
