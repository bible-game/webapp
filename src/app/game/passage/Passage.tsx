"use client"

import React from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";
import { Pagination } from "@heroui/pagination";

const Passage = (props: any) => {
    const [page, setPage] = React.useState(1);
    const readingTime = `${calculateReadingTime()} minute read`

    function calculateReadingTime() {
        const wpm = 200;
        const words = props.passage.split(' ');

        return Math.ceil(words.length / wpm);
    }

    return  <Modal isOpen={props.isOpen} onOpenChange={props.onOpenChange} backdrop="blur" size="full">
        <ModalContent className="text-black">
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">{props.today} ({readingTime})</ModalHeader>
                    <ModalBody><p>{props.pages.get(page)}</p></ModalBody>
                    <ModalFooter>
                        <Pagination size="sm" initialPage={page} total={props.pages.size}
                                    onChange={(page: number) => setPage(page)}/>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>
}

export default Passage;