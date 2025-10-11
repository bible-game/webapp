"use server"

export async function getPassage(passageKey: string) {

    // example response
    // return {"reference":"Matthew 25:31-33,46","verses":[{"book_id":"MAT","book_name":"Matthew","chapter":25,"verse":31,"text":"\n“But when the Son of Man comes in his glory, and all the holy angels with him, then he will sit on the throne of his glory.\n\n"},{"book_id":"MAT","book_name":"Matthew","chapter":25,"verse":32,"text":"\nBefore him all the nations will be gathered, and he will separate them one from another, as a shepherd separates the sheep from the goats.\n\n"},{"book_id":"MAT","book_name":"Matthew","chapter":25,"verse":33,"text":"\nHe will set the sheep on his right hand, but the goats on the left.\n\n"},{"book_id":"MAT","book_name":"Matthew","chapter":25,"verse":46,"text":"\nThese will go away into eternal punishment, but the righteous into eternal life.”\n"}],"text":"\n“But when the Son of Man comes in his glory, and all the holy angels with him, then he will sit on the throne of his glory.\n\n\nBefore him all the nations will be gathered, and he will separate them one from another, as a shepherd separates the sheep from the goats.\n\n\nHe will set the sheep on his right hand, but the goats on the left.\n\n\nThese will go away into eternal punishment, but the righteous into eternal life.”\n","translation_id":"web","translation_name":"World English Bible","translation_note":"Public Domain"}
    
    const key = encodeURIComponent(passageKey.replace(/ /g, ""));
    const url = `${process.env.SVC_PASSAGE}/read/${key}`;
    const response = await fetch(url, { method: "GET" });

    return response.json();
}
