export class UserAuthService {

    private loginEndpoint = `${process.env.USER_SVC}/auth/login`
    private registerEndpoint = `${process.env.USER_SVC}/auth/register`

    public static login = ([username, password]: [string, string]) => {
        console.log(`Username: ${username}. Password: ${password}`)
    }

    public static register = (userDetails: any) => {
        console.log(userDetails)
    }


}