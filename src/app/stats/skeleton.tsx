/**
 * Skeleton of the statistics (metrics, leaderboard, completion), in the same places and spacing as the real ones, shown
 * while the server fetches the page and while the completion is worked out
 */
export default function StatsSkeleton() {
    return (
        <div role="status" aria-busy="true" aria-label="Loading statistics" className="animate-pulse">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-ui-line py-6 sm:grid-cols-4">
                {[...Array(4)].map((_, index) => <div key={index}>
                    <div className="h-4 w-20 rounded-md bg-ui-surface"/>
                    <div className="mt-3 h-6 w-12 rounded-md bg-ui-surface"/>
                </div>)}
            </div>
            <div className="py-6">
                <div className="mb-4 h-5 w-28 rounded-md bg-ui-surface"/>
                {[...Array(5)].map((_, index) => <div key={index} className="flex items-center gap-4 border-b border-ui-line py-3.5">
                    <div className="h-4 w-6 rounded-md bg-ui-surface"/>
                    <div className="h-4 flex-1 rounded-md bg-ui-surface"/>
                    <div className="h-4 w-10 rounded-md bg-ui-surface"/>
                </div>)}
            </div>
            <div className="border-t border-ui-line pt-6">
                <div className="mb-4 h-5 w-36 rounded-md bg-ui-surface"/>
                {[...Array(6)].map((_, index) => <div key={index} className="flex min-h-11 items-center gap-3 px-2">
                    <div className="h-3 w-28 rounded-md bg-ui-surface sm:w-36"/>
                    <div className="h-1.5 flex-1 bg-ui-surface"/>
                    <div className="h-3 w-8 rounded-md bg-ui-surface"/>
                </div>)}
            </div>
        </div>
    );
}
