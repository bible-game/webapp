"use server"

export async function getStudy(passageKey: string) {
    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/study/${key}`;
    const response = await fetch(url, { method: "GET" });

    return response.json();
}

export interface Question {
    content: string;
    optionOne: string[];
    optionTwo: string[];
    optionThree: string[];
    correct: string;
}