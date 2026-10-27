/**
 * Skeleton of the page (header, clue, guess slots, map frame), shown while the server fetches the page and again while
 * the day's passage loads, so the two waits read as one
 */
export default function PlaySkeleton() {
    return (
        <div role="status" aria-busy="true" aria-label="Loading"
             className="play-ui fixed inset-0 z-0 flex h-[100dvh] flex-col bg-transparent pt-[env(safe-area-inset-top)]">
            <div className="mx-auto flex w-full max-w-[40rem] flex-1 animate-pulse flex-col">
                <div className="flex h-14 items-center justify-center"><div className="h-9 w-32 rounded-lg bg-play-surface"/></div>
                <div className="mx-auto mb-2 mt-2 h-5 w-3/4 rounded-md bg-play-surface"/>
                <div className="mx-auto mb-4 h-5 w-1/2 rounded-md bg-play-surface"/>
                <div className="flex gap-1.5 px-4 pb-3">
                    {[...Array(5)].map((_, index) => <div key={index} className="h-9 flex-1 rounded-lg bg-play-surface"/>)}
                </div>
                <div className="mx-10 my-6 flex-1 rounded-sm border border-play-line"/>
                <div className="mx-auto mb-7 h-5 w-48 rounded-md bg-play-surface"/>
            </div>
        </div>
    );
}
