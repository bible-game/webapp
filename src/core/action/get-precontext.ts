"use server"

export async function getPreContext(passageKey: string) {
    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/context/before/${key}`;
    const response = await fetch(url, { method: "GET" });

    return response.json();
}