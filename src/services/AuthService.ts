import { Employee } from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';
import { comparePassword } from '@/utils/password';
import { AuthTokenPayload, getAccessTokenMaxAgeMs, signAccessToken } from '@/utils/jwt';

export interface LoginResult {
    accessToken: string;
    tokenType: 'Bearer';
    expiresInMs: number;
    user: {
        employeeId: string | number;
        username: string;
        role: AuthTokenPayload['role'];
        badgeUuid: string;
    };
}

export class AuthService implements IService {
    public async login(username: string, password: string): Promise<LoginResult> {
        const employee = await Employee.findOne({
            where: { username },
        });

        if (!employee) {
            throw {
                statusCode: 401,
                message: 'Invalid username or password',
            };
        }

        const passwordHash = (employee as any).passwordHash as string;
        const isPasswordValid = await comparePassword(password, passwordHash);

        if (!isPasswordValid) {
            throw {
                statusCode: 401,
                message: 'Invalid username or password',
            };
        }

        const payload: AuthTokenPayload = {
            sub: String((employee as any).employeeId),
            username: String((employee as any).username),
            role: (employee as any).role,
            badgeUuid: String((employee as any).badgeUuid),
        };

        const accessToken = signAccessToken(payload);

        return {
            accessToken,
            tokenType: 'Bearer',
            expiresInMs: getAccessTokenMaxAgeMs(),
            user: {
                employeeId: payload.sub,
                username: payload.username,
                role: payload.role,
                badgeUuid: payload.badgeUuid,
            },
        };
    }
}

