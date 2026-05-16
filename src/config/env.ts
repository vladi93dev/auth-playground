export function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if(!value) {
        throw new Error(`${name} is not defined in environment variables`);
    }

    return value;
}

export const JWT_SECRET = getRequiredEnv('JWT_SECRET');
export const DATABASE_URL = getRequiredEnv('DATABASE_URL');

