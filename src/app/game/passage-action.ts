"use server"

export async function passageAction() {
    const response = await fetch(`${process.env.passageService}/daily`, {
        method: "GET"
    });

    return response.json();
}