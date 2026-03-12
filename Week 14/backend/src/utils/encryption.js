import CryptoJS from "crypto-js";

const getSecret = () => {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.trim().length < 12) {
    throw new Error("ENCRYPTION_SECRET must be at least 12 characters long");
  }
  return secret;
};

export const encryptJsonPayload = (payload) => {
  const plaintext = JSON.stringify(payload);
  return CryptoJS.AES.encrypt(plaintext, getSecret()).toString();
};
