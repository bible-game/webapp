"use server"

import samplePassage from "../../../../public/sample.json";

export async function getPassage(passageKey: string, translation?: string) {
    if (process.env.USE_STUB_PASSAGE_RESPONSE === "true") {
        return samplePassage;
    }

    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/read/${key}?translation=${translation}`;
    const response = await fetch(url, { method: "GET" });

    return response.json();
}
