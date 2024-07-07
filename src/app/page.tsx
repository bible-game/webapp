async function getPassage(passageId: string) {
    const response = await fetch(`https://bible-api.com/${passageId}`, {
        method: "GET"
    });

    return response.json();
}

export default async function Home() {
    const today = new Date().toISOString();
    const passageId = "John+3:16";
    const passage = (await getPassage(passageId))["text"];

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1>The passage for {today} is:</h1>
            <p>{passage}</p>
        </main>
    );
}
