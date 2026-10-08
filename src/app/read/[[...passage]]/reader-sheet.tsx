"use client"

import React from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
};

/** Bottom sheet for the reader, matching Play's calendar sheet */
export default function ReaderSheet(props: Props) {
    return (
        <Modal isOpen={props.open} onOpenChange={props.onOpenChange} placement="bottom" backdrop="blur" scrollBehavior="inside"
               classNames={{
                   base: `reader-sheet dark m-0 w-full max-w-[34rem] rounded-b-none rounded-t-3xl border border-ui-line bg-[#161514] text-[var(--reader-text)] sm:m-auto sm:rounded-3xl ${props.className ?? ""}`,
                   closeButton: "top-3 right-3 size-11 text-[var(--reader-muted)] hover:bg-ui-raised",
               }}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-0.5 px-5 pb-2 pt-5">
                    <span className="text-[16px] font-semibold">{props.title}</span>
                    {props.subtitle ? <span className="text-[13px] font-normal text-[var(--reader-muted)]">{props.subtitle}</span> : null}
                </ModalHeader>
                <ModalBody className="gap-6 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
                    {props.children}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
