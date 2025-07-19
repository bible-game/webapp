"use server"

export async function getPostContext(passageKey: string) {
    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/context/after/${key}`;
    const response = await fetch(url, { method: "GET" });

    return response.json();
}