"use server"

export async function postFeedback(passageKey: string, feedback: "positive" | "negative", context: "before" | "after", comment: string) {
    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/feedback`;
    const ctx = context == "before" ? "PRE_CONTEXT" : "POST_CONTEXT";
    console.log(JSON.stringify({passageKey: key, feedback: feedback.toUpperCase(), promptType: ctx, comment: comment}));
    const response = await fetch(url, { 
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({passageKey: key, feedback: feedback.toUpperCase(), promptType: ctx, comment: comment}) 
    });

    return response.json();
}

// {
//    "passageKey": "John 3:16",
//    "feedback": "NEGATIVE",
//    "promptType": "PRE_CONTEXT",
//    "comment": "This context is very helpful."
// }