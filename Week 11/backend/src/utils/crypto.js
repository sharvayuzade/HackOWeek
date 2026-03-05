import crypto from "crypto";

const ENCRYPTION_ALGO = "aes-256-gcm";

const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string");
  }
  return Buffer.from(key, "hex");
};

export const encryptObject = (payload) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final()
  ]);

  return {
    encryptedPayload: encrypted.toString("base64"),
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex")
  };
};

export const decryptObject = ({ encryptedPayload, iv, authTag }) => {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGO,
    getKey(),
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPayload, "base64")),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString("utf8"));
};
