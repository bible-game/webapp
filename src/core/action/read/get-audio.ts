"use server"

export async function getAudio(passageKey: string) {
    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/audio/${key}`;
    const response = await fetch(url, { method: "GET" });

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}