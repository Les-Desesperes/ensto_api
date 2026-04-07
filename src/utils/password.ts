import bcrypt from 'bcryptjs';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

export const hashPassword = async (plainPassword: string): Promise<string> => {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    if (!plainPassword || !hashedPassword) {
        return false;
    }

    return bcrypt.compare(plainPassword, hashedPassword);
};

