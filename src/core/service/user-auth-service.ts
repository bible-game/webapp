import { cookies } from 'next/headers'
import { GameStatesService } from "@/core/service/state/game-states-service";
import 'server-only'
import { SignJWT, jwtVerify } from 'jose'

export class UserAuthService {

    private readonly loginEndpoint = `${process.env.USER_SVC}/auth/login`
    private readonly registerEndpoint = `${process.env.USER_SVC}/auth/register`

    public static readonly login = ([username, password]: [string, string]) => {
        console.log(`Username: ${username}. Password: ${password}`)
    }

    public static readonly register = (userDetails: any) => {
        console.log(userDetails)
    }

    public static isLoggedIn(): boolean {
        return true;
    }

    public static async loadState(): Promise<void> {

        if (UserAuthService.isLoggedIn()) {
            const cookie = (await cookies()).get('session')?.value;
            const session = await UserAuthService.decrypt(cookie)

            const state = await fetch(`${process.env.SVC_USER}/state/${session?.userId}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${session?.value}`
                }
            });

            GameStatesService.setState(state)
        }
    }

    public static encrypt(payload: any) {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1d')
            .sign(new TextEncoder().encode(process.env.SESSION_SECRET))
    }

    public static async decrypt(session: string | undefined = '') {
        try {
            const { payload } = await jwtVerify(session, new TextEncoder().encode(process.env.SESSION_SECRET), {
                algorithms: ['HS256'],
            })
            return payload
        } catch (error) {
            console.log('Failed to verify session')
        }
    }

}