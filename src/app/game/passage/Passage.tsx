"use client"

import React from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";
import { Pagination } from "@heroui/pagination";

const Passage = (props: any) => {
    const [page, setPage] = React.useState(1);
    const readingTime = `${calculateReadingTime()} minute read`

    let pagination = <></>
    if (props.pages.size > 1) {
        pagination = <Pagination size="sm" initialPage={page} total={props.pages.size}
                                 onChange={(page: number) => setPage(page)} className="mt-6 float-right"/>
    }

    function calculateReadingTime() {
        const wpm = 200;
        const words = props.passage.split(' ');

        return Math.ceil(words.length / wpm);
    }

    return  <Modal
                isOpen={props.isOpen}
                onOpenChange={props.onOpenChange}
                onClose={props.onClose}
                classNames={{closeButton: "text-xl absolute left-[12.5%] top-[9.75%]"}}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                duration: 0.2,
                                ease: "easeOut",
                            },
                        },
                        exit: {
                            y: -0,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn",
                            },
                        },
                    },
                }}
                backdrop="blur"
                size="full">
                <ModalContent className="text-black z-10">
                    {(onClose) => (
                        <ModalBody>
                            <div className="flex items-center justify-center h-full">
                                <div className="w-[70%] h-[80%]">
                                    <h1 className="mb-6">{props.today} <span className="text-gray-500 text-sm">({readingTime})</span></h1>
                                    <p className="text-xs leading-[2.5]">{props.pages.get(page)}</p>
                                    {pagination}
                                </div>
                            </div>
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
}

export default Passage;