import express from "express";
import adminRoutes from '../routes/admin.js';
import ratingRoutes from '../routes/rating.js';
import authRoutes from '../routes/auth.js';
import storeRoutes from '../routes/store.js';

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/admin", adminRoutes);
router.use("/rating", ratingRoutes);
router.use("/auth", authRoutes);
router.use("/store", storeRoutes);

export default router;
