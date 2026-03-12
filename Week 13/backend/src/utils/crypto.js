import crypto from "crypto";

const ENCRYPTION_ALGO = "aes-256-gcm";

const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string");
  }

  return Buffer.from(key, "hex");
};

export const decryptObject = ({ encryptedPayload, iv, authTag }) => {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGO,
    getKey(),
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  const decryptedBuffer = Buffer.concat([
    decipher.update(Buffer.from(encryptedPayload, "base64")),
    decipher.final()
  ]);

  return JSON.parse(decryptedBuffer.toString("utf8"));
};
