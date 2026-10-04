"use client"

import React from "react";
import { Modal, ModalBody, ModalContent } from "@heroui/react";
import { ModalHeader } from "@heroui/modal";

/**
 * How to Play Modal
 * @since 2nd October 2026
 */
const Help = (props: { isOpen: boolean, onOpenChange: () => void }) => (
    <Modal
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        placement="center"
        radius="none"
        classNames={{
            base: "mx-4 bg-[#0d0e0f] text-[#dfdfdf] [font-family:Inter,system-ui,sans-serif]",
            backdrop: "bg-black/70",
            header: "pt-8 text-[13px] font-light uppercase tracking-[0.18em] text-[#bfbfbf]",
            body: "gap-5 pb-8 text-[15px] font-light leading-[1.5]",
            closeButton: "rounded-none text-[#ffffff] hover:bg-[#ffffff0d]",
        }}>
        <ModalContent>
            <ModalHeader>How to Play</ModalHeader>
            <ModalBody>
                <p>A chapter is chosen each day and summarised.</p>
                <p>Tap the map to pick a chapter, then guess. You have five guesses.</p>
                <p>Each guess shows how far away you are, and in which direction.</p>
                <p className="text-[#999999]">Feedback? hello@bible.game</p>
            </ModalBody>
        </ModalContent>
    </Modal>
);

export default Help;
