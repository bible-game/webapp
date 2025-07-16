"use server"

export async function getPassage(passageKey: string) {
    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/read/${key}`;
    const response = await fetch(url, { method: "GET" });

    return response.json();
}