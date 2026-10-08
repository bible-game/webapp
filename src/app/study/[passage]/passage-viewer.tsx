import { Spinner } from "@heroui/react";
import useSWR from "swr";
import ReaderSheet from "@/app/read/[[...passage]]/reader-sheet";

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to load passage");
    return response.json();
};

/** The passage being studied, in a sheet over the study, set as on Read */
export function PassageViewer({ title, open, onClose }: {
    title: string;
    open: boolean;
    onClose: () => void;
}) {
    const { data, error, isLoading } = useSWR(open ? `${process.env.SVC_BIBLE}/${title}` : null, fetcher);

    return (
        <ReaderSheet open={open} onOpenChange={(value) => { if (!value) onClose(); }} title={title} className="max-h-[85dvh]">
            {isLoading ? <div className="flex justify-center py-12"><Spinner color="default" aria-label="Loading passage"/></div> :
                error || !data ? <p role="alert" className="text-ui-muted">Unable to load this passage.</p> :
                    <p className="reading-prose whitespace-pre-wrap">{data.text}</p>}
        </ReaderSheet>
    );
}
