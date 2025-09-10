import express from "express";

import emojis from "./emojis.js";
import authRoutes from '../routes/auth.js';

const router = express.Router();


router.get("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/emojis", emojis);
router.use("/auth", authRoutes);

export default router;
