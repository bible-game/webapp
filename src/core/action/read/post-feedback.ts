"use server"

export async function postFeedback(passageKey: string, feedback: "positive" | "negative", context: "before" | "after") {
    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/feedback/${key}?feedback=${feedback}&context=${context}`;
    const response = await fetch(url, { method: "POST" });

    return response.json();
}