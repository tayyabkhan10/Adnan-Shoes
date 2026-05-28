import { Router } from "express";
const router = Router();
router.post("/contact", (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "name, email, and message are required" });
    }
    console.log(`[Contact] From: ${name} <${email}>`);
    return res.json({ success: true, message: "Message received. We'll reply within 24 hours." });
});
export default router;
