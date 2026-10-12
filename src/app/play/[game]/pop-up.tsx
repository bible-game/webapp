import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import { StateUtil } from "@/core/util/state-util";
import { playTheme } from "@/core/style/play-theme";

/** The map's key: its five region colours, in map order */
const regions = [playTheme.teal, playTheme.purple, playTheme.rose, playTheme.green, playTheme.gold];

export default function PopUp() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [visible, setVisible] = useState(true);
    const [consent, setConsent] = useState(StateUtil.getConsent());

    // Open the popup on first load if we don't yet have consent
    useEffect(() => {
        if (!consent) {
            onOpen();
        }
    }, [consent, onOpen]);

    function handleChoice(accepted: boolean, onClose: () => void): void {
        StateUtil.setConsent(accepted);
        setConsent(accepted);
        setVisible(false);
        onClose();
    }

    if (!visible || consent) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="opaque"
                placement="bottom"
                hideCloseButton
                classNames={{
                    wrapper: "items-end",
                    backdrop: "bg-black/40",
                    base: "play-ui !m-0 w-full max-w-[40rem] rounded-b-none rounded-t-lg border border-b-0 border-play-line " +
                        "bg-play-surface text-play-text shadow-[0_-16px_48px_rgba(0,0,0,0.5)] sm:!mb-4 sm:rounded-lg sm:border-b",
                    header: "flex-col items-center gap-3 px-6 pb-0 pt-3",
                    body: "gap-2 px-6 py-4 text-center text-[15px] leading-[1.5] text-play-muted",
                    footer: "flex-col gap-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-0",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <span aria-hidden="true" className="h-1 w-10 rounded-full bg-play-line"/>
                                <span className="text-[18px] font-semibold text-play-text">Welcome to Bible Game</span>
                            </ModalHeader>
                            <ModalBody>
                                <p>Explore the Bible with a daily chapter-guessing game.</p>
                                <p>We use cookies to save your progress.</p>
                                <figure className="mt-4 flex flex-col gap-2">
                                    <figcaption className="text-[12px] text-play-faint">Five colours, five regions of one map.</figcaption>
                                    <span aria-hidden="true" className="flex gap-1">
                                        {regions.map((colour) => <span key={colour} className="h-1.5 flex-1" style={{ background: colour }}/>)}
                                    </span>
                                </figure>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    className="h-12 w-full rounded-lg bg-play-text text-[16px] font-semibold text-play-bg"
                                    onPress={() => handleChoice(true, onClose)}>
                                    Accept and play
                                </Button>
                                <p className="text-center text-[12px] text-play-faint">
                                    See our{" "}
                                    <a href="/about/privacy" className="underline underline-offset-2 hover:text-play-text">Privacy Policy</a>
                                    {" "}and{" "}
                                    <a href="/about/cookies" className="underline underline-offset-2 hover:text-play-text">Cookie Policy</a>.
                                </p>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
