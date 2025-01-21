"use server"

export async function guessAction(book: String, title: String) {
    const response = await fetch(`${process.env.passageService}/guess/${book}/${title}`, {
        method: "GET"
    });

    return response.json();
}