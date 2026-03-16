import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const getSecret = () => {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.trim().length < 12) {
    throw new Error("ENCRYPTION_SECRET must be at least 12 characters long");
  }
  return secret.trim();
};

const buildKey = () => createHash("sha256").update(getSecret(), "utf8").digest();

export const encryptPayload = (payload) => {
  const plaintextBuffer = Buffer.from(JSON.stringify(payload), "utf8");
  const key = buildKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: ciphertext.toString("base64")
  };
};

export const decryptPayload = (encryptedPayload) => {
  const key = buildKey();
  const iv = Buffer.from(encryptedPayload.iv, "base64");
  const authTag = Buffer.from(encryptedPayload.authTag, "base64");
  const ciphertext = Buffer.from(encryptedPayload.ciphertext, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
};