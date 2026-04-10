import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

export const hashPassword = async (plainPassword: string): Promise<string> => {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    if (!plainPassword || !hashedPassword) {
        return false;
    }

    if (/^[a-f0-9]{64}$/i.test(hashedPassword)) {
        const digest = crypto.createHash('sha256').update(plainPassword).digest('hex');
        return digest.toLowerCase() === hashedPassword.toLowerCase();
    }

    return bcrypt.compare(plainPassword, hashedPassword);
};

