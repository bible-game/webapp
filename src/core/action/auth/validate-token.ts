"use server"

/**
 * Validates a given token by sending a request to the User service.
 *
 * @param {string} token - The token to be validated.
 * @return {Promise<boolean>} - A promise that resolves to true if the token is valid, otherwise resolves to false.
 */
export async function validateToken(token: string): Promise<boolean> {

    let result: boolean

    try {
        const response = await fetch(`${process.env.SVC_USER}/auth/validate-token?token=${token}`)

        const responseJson = await response.json()
        if (response.ok) {
            result = responseJson.result

        } else {
            result = false
            console.error(`Error received from server when validating password reset token: ${responseJson.message}`)
        }
    } catch (error: any) {
        console.error(`Error when validating password reset token: ${error.message}`)
        result = false
    }

    return result
}