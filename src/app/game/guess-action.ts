"use server"

export async function guessAction(date: String, book: String, chapter: String) {
    const response = await fetch(`${process.env.SVC_PASSAGE}/guess/${date}/${book}/${chapter}`, {
        method: "GET"
    });

    return response.json();
}