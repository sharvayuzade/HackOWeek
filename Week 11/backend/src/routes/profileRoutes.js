import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { WearableProfile } from "../models/WearableProfile.js";
import { decryptObject, encryptObject } from "../utils/crypto.js";

const router = express.Router();

router.post("/sync", requireAuth, async (req, res) => {
  try {
    const { provider, deviceId, profileData, syncedAt } = req.body;

    if (!provider || !deviceId || !profileData || typeof profileData !== "object") {
      return res.status(400).json({
        message: "provider, deviceId and profileData object are required"
      });
    }

    const encrypted = encryptObject(profileData);

    const record = await WearableProfile.create({
      user: req.user.id,
      provider,
      deviceId,
      syncedAt: syncedAt ? new Date(syncedAt) : new Date(),
      ...encrypted
    });

    return res.status(201).json({
      message: "Wearable profile synced securely",
      profileId: record._id,
      syncedAt: record.syncedAt
    });
  } catch (error) {
    return res.status(500).json({ message: "Sync failed", error: error.message });
  }
});

router.get("/latest", requireAuth, async (req, res) => {
  try {
    const latest = await WearableProfile.findOne({ user: req.user.id }).sort({ syncedAt: -1 });

    if (!latest) {
      return res.status(404).json({ message: "No synced wearable profile found" });
    }

    const profileData = decryptObject({
      encryptedPayload: latest.encryptedPayload,
      iv: latest.iv,
      authTag: latest.authTag
    });

    return res.status(200).json({
      id: latest._id,
      provider: latest.provider,
      deviceId: latest.deviceId,
      syncedAt: latest.syncedAt,
      profileData
    });
  } catch (error) {
    return res.status(500).json({ message: "Fetch failed", error: error.message });
  }
});

export default router;
