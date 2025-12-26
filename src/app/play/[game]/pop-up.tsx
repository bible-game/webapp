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
                classNames={{
                    body: "py-5 md:py-7 text-center md:text-left",
                    backdrop: "bg-[#060842]/75",
                    base:
                        "max-w-[100%] h-min bg-gradient-to-t from-[#0f0a31] to-[#060842] border border-[#ffffff]/25 " +
                        "shadow-2xl !mb-0 rounded-none !mx-0 px-4 pointer-events-auto",
                    header: "pt-6 pb-0 w-full text-center md:text-left",
                    closeButton: "hidden",
                    footer: "pb-6 md:pb-7 pt-0 flex gap-3 justify-between",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <span
                                    className="text-base font-semibold tracking-wide text-[#e5e7ff]">
                                    The Bible Game
                                </span>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-sm">
                                    Explore the Bible with a daily passage-guessing game 📖✨
                                </p>
                                <p className="text-sm">
                                    By continuing, you accept that we use cookies to to save your progress.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <p className="text-[0.7rem] md:text-xs opacity-70 text-left">
                                    For more details, see our {" "}
                                    <a href="/about/privacy"
                                       className="underline underline-offset-2 hover:opacity-100">
                                        Privacy Policy
                                    </a>
                                    {" "} and {" "}
                                    <a href="/about/cookies"
                                       className="underline underline-offset-2 hover:opacity-100">
                                        Cookie Policy
                                    </a>
                                    .
                                </p>
                                <Button
                                    color="default"
                                    className="bg-transparent text-gray-200 border-1 border-gray-300 rounded-none"
                                    onPress={() => handleChoice(true, onClose)}>
                                    Accept
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
