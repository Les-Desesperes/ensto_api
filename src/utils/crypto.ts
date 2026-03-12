import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// AES-256-CBC requires a 32-byte key.
// Add ENCRYPTION_KEY to your .env file!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-character-secret-key!';
const ALGORITHM = 'aes-256-cbc';

// --- AES-256 Encryption (For Delivery Drivers) ---
export const encryptAES = (text: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Store the IV alongside the encrypted text so it can be decrypted later
    return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptAES = (encryptedText: string): string => {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// --- SHA-256 Hashing (For Employees) ---
export const hashSHA256 = (text: string): string => {
    return crypto.createHash('sha256').update(text).digest('hex');
};