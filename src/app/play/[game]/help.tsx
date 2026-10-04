"use client"

import React from "react";
import { Modal, ModalBody, ModalContent } from "@heroui/react";
import { ModalHeader } from "@heroui/modal";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Band, CLOSE, FAR, NEAR } from "@/app/play/[game]/closeness";

const examples: { band: Band, passage: string, up: boolean, distance: string, meaning: string }[] = [
    { band: CLOSE, passage: "ACT 14", up: false, distance: "300", meaning: "Within 500 verses" },
    { band: NEAR, passage: "ROM 2", up: true, distance: "1.2K", meaning: "Within 2,000 verses" },
    { band: FAR, passage: "NUM 31", up: false, distance: "28K", meaning: "Further away" },
];

/**
 * How to Play Modal
 * @since 2nd October 2026
 */
const Help = (props: { isOpen: boolean, onOpenChange: () => void }) => (
    <Modal
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        placement="center"
        radius="lg"
        classNames={{
            base: "mx-4 rounded-3xl border border-play-line bg-play-surface text-play-text",
            backdrop: "bg-black/70",
            header: "pt-7 text-[13px] font-medium uppercase tracking-[0.18em] text-play-muted",
            body: "gap-4 pb-7 text-[15px] leading-[1.5]",
            closeButton: "m-2 rounded-full text-play-text hover:bg-play-raised",
        }}>
        <ModalContent>
            <ModalHeader>How to Play</ModalHeader>
            <ModalBody>
                <p>Each day, one chapter of the Bible is chosen and summarised. Can you find it?</p>
                <p>Tap the map to pick a chapter, then guess. You have five guesses.</p>
                <p>Each guess shows how many verses away the answer is, and in which direction:</p>
                <ul className="grid gap-2">
                    {examples.map(({ band, passage, up, distance, meaning }) => {
                        const Arrow = up ? ArrowUpIcon : ArrowDownIcon;
                        return (
                            <li key={passage} className="flex items-center gap-3">
                                <span className="flex h-9 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-lg border text-[12px] font-semibold leading-[1.15] tabular-nums"
                                      style={{ background: band.fill, borderColor: band.edge, color: band.text }}>
                                    {passage}
                                    <span className="flex items-center gap-0.5 font-medium"><Arrow className="size-3" strokeWidth={2.5}/>{distance}</span>
                                </span>
                                <span className="text-[14px] text-play-muted">{meaning}</span>
                            </li>
                        );
                    })}
                </ul>
                <p className="text-[14px] text-play-muted">
                    <ArrowUpIcon className="inline size-3.5 align-[-2px]" strokeWidth={2.5}/> the answer is later in the Bible,{" "}
                    <ArrowDownIcon className="inline size-3.5 align-[-2px]" strokeWidth={2.5}/> earlier.
                </p>
                <p className="text-[14px] text-play-faint">Feedback? hello@bible.game</p>
            </ModalBody>
        </ModalContent>
    </Modal>
);

export default Help;
