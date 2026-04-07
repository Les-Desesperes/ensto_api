import jwt, { SignOptions } from 'jsonwebtoken';

export type EmployeeRole = 'Admin' | 'Magasinier' | 'Personnel';

export interface AuthTokenPayload {
    sub: string;
    username: string;
    role: EmployeeRole;
    badgeUuid: string;
}

const getJwtSecret = (): string => {
    return process.env.JWT_SECRET || 'dev-only-secret-change-me';
};

const getJwtExpiresIn = (): SignOptions['expiresIn'] => {
    return (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '8h';
};

export const signAccessToken = (payload: AuthTokenPayload): string => {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: getJwtExpiresIn(),
    });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
};

export const getAccessTokenMaxAgeMs = (): number => {
    const configured = Number(process.env.JWT_COOKIE_MAX_AGE_MS);
    if (Number.isFinite(configured) && configured > 0) {
        return configured;
    }

    return 8 * 60 * 60 * 1000;
};

