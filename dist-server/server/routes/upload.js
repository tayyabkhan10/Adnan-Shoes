// // ── server/routes/upload.ts ──────────────────────────────────
// // Is file ko apne backend routes mein add karo
// // Express + multer + cloudinary use ho raha hai
// import { Router, Request, Response } from "express";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// const router = Router();
// // Cloudinary config (env vars se automatically aata hai)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// // Multer: file memory mein rakhega (disk pe nahi)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
//   fileFilter: (_req, file, cb) => {
//     const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
//     if (allowed.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only JPG, PNG, WebP, GIF allowed"));
//     }
//   },
// });
// // POST /api/upload
// router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file provided" });
//     }
//     // Buffer ko Cloudinary pe upload karo
//     const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           folder: "shoe-store/products", // Cloudinary mein folder
//           transformation: [
//             { width: 800, height: 800, crop: "limit" }, // Max size limit
//             { quality: "auto:good" },                    // Auto quality optimize
//             { fetch_format: "auto" },                    // WebP/AVIF auto
//           ],
//         },
//         (error, result) => {
//           if (error || !result) {
//             reject(error || new Error("Upload failed"));
//           } else {
//             resolve(result as { secure_url: string });
//           }
//         }
//       );
//       stream.end(req.file!.buffer);
//     });
//     res.json({ url: uploadResult.secure_url });
//   } catch (error: any) {
//     console.error("Cloudinary upload error:", error);
//     res.status(500).json({ error: error.message || "Upload failed" });
//   }
// });
// export default router;
// // ─────────────────────────────────────────────────────────────
// // APNE MAIN SERVER FILE (index.ts / server.ts) MEIN YE ADD KARO:
// // ─────────────────────────────────────────────────────────────
// //
// // import uploadRouter from "./routes/upload";
// // app.use("/api", uploadRouter);
// //
// // AUR YE PACKAGES INSTALL KARO:
// // npm install cloudinary multer @types/multer
// // ─────────────────────────────────────────────────────────────
// ── server/routes/upload.ts ──────────────────────────────────
import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
const router = Router();
// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Multer: file memory mein rakhega
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only JPG, PNG, WebP, GIF allowed"));
        }
    },
});
// Cloudinary URL se public_id nikalna
// e.g. "https://res.cloudinary.com/dn7qswbhl/image/upload/v123/shoe-store/products/abc123.jpg"
// → "shoe-store/products/abc123"
function extractPublicId(url) {
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (!matches || !matches[1]) {
        throw new Error("Invalid Cloudinary URL");
    }
    return matches[1];
}
// ── POST /api/upload ── Image upload karo
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({
                folder: "shoe-store/products",
                transformation: [
                    { width: 800, height: 800, crop: "limit" },
                    { quality: "auto:good" },
                    { fetch_format: "auto" },
                ],
            }, (error, result) => {
                if (error || !result) {
                    reject(error || new Error("Upload failed"));
                }
                else {
                    resolve(result);
                }
            });
            stream.end(req.file.buffer);
        });
        res.json({ url: uploadResult.secure_url });
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ error: error.message || "Upload failed" });
    }
});
// ── DELETE /api/upload ── Image delete karo Cloudinary se
router.delete("/upload", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "Image URL required" });
        }
        const publicId = extractPublicId(url);
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === "ok") {
            res.json({ success: true, message: "Image deleted from Cloudinary" });
        }
        else if (result.result === "not found") {
            res.json({ success: true, message: "Image not found (already deleted)" });
        }
        else {
            res.status(500).json({ error: "Failed to delete image", result });
        }
    }
    catch (error) {
        console.error("Cloudinary delete error:", error);
        res.status(500).json({ error: error.message || "Delete failed" });
    }
});
export default router;
