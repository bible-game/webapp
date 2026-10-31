import StatsSkeleton from "@/app/stats/skeleton";

/** Shown straight away while the server fetches the page's data; the menu waits for the page, which knows who is in */
export default function Loading() {
    return (
        <>
            <div className="app-header"><div className="h-14"/></div>
            <main className="app-page">
                <h1 className="sr-only">Statistics</h1>
                <StatsSkeleton/>
            </main>
        </>
    );
}
