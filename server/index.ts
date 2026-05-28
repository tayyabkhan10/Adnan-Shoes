import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/orders.js";
import adminRouter from "./routes/admin.js";
import contactRouter from "./routes/contact.js";
import healthRouter from "./routes/health.js";
import uploadRouter from "./routes/upload.js";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.use("/api", healthRouter);
app.use("/api", productsRouter);
app.use("/api", cartRouter);
app.use("/api", ordersRouter);
app.use("/api", adminRouter);
app.use("/api", contactRouter);
app.use("/api", uploadRouter);

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`\x1b[32m✓\x1b[0m API server running at http://localhost:${PORT}`);
});
