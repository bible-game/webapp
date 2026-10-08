import { Drawer, DrawerBody, DrawerContent, DrawerHeader, Spinner } from "@heroui/react";
import useSWR from "swr";

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to load passage");
    return response.json();
};

export function PassageViewer({ id, title, open, onClose }: {
    id: string;
    title: string;
    open: boolean;
    onClose: () => void;
}) {
    const { data, error, isLoading } = useSWR(open ? `${process.env.SVC_BIBLE}/${title}` : null, fetcher);

    return <Drawer id={id} isOpen={open} onOpenChange={value => { if (!value) onClose(); }}
        placement="right" size="lg" aria-label={title}
        classNames={{ base: "bg-ui-surface text-ui-text rounded-none border-l border-ui-line", closeButton: "text-ui-muted hover:bg-ui-raised" }}>
        <DrawerContent>
            <DrawerHeader className="pr-14 text-[18px] font-semibold">{title}</DrawerHeader>
            <DrawerBody className="reading-surface px-6 py-6">
                {isLoading ? <div className="flex justify-center py-12"><Spinner aria-label="Loading passage"/></div> :
                    error || !data ? <p role="alert">Unable to load this passage.</p> :
                    <p className="whitespace-pre-wrap text-[16px] leading-[1.85]">{data.text}</p>}
            </DrawerBody>
        </DrawerContent>
    </Drawer>;
}
