import PlaySkeleton from "@/app/play/[game]/skeleton";

/** Shown straight away while the server fetches the page's data */
export default function Loading() {
    return <PlaySkeleton/>;
}
