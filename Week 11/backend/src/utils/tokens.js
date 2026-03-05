import crypto from "crypto";
import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/RefreshToken.js";

const hashToken = (value) => crypto.createHash("sha256").update(value).digest("hex");

export const issueAccessToken = (user) =>
  jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    {
      subject: user._id.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || "2h"
    }
  );

export const issueRefreshToken = async (user, rotatedFromId = null) => {
  const jti = crypto.randomUUID();
  const refreshToken = jwt.sign(
    {},
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    {
      subject: user._id.toString(),
      jwtid: jti,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
    }
  );

  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    jti,
    expiresAt,
    rotatedFrom: rotatedFromId
  });

  return refreshToken;
};

export const verifyRefreshToken = async (refreshToken) => {
  const payload = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
  );

  const tokenRecord = await RefreshToken.findOne({ jti: payload.jti });
  if (!tokenRecord) {
    throw new Error("Refresh token not recognized");
  }

  if (tokenRecord.revokedAt) {
    throw new Error("Refresh token revoked");
  }

  if (tokenRecord.expiresAt.getTime() < Date.now()) {
    throw new Error("Refresh token expired");
  }

  if (tokenRecord.tokenHash !== hashToken(refreshToken)) {
    throw new Error("Refresh token mismatch");
  }

  return { payload, tokenRecord };
};

export const revokeRefreshToken = async (tokenRecord) => {
  tokenRecord.revokedAt = new Date();
  await tokenRecord.save();
};
