"use client"

import React from "react";
import { Modal, ModalBody, ModalContent } from "@nextui-org/modal";
import { Pagination } from "@heroui/pagination";

// FixMe && import?
function paginate(text: string): Map<number, string> {
    const remaining = (segment: string) => {
        const sentences = segment.split(".");
        return sentences[sentences.length - 1];
    }

    const pages = new Map();
    const segments = text.match(/[\s\S]{1,2000}/g)!!
    let head = ""; let tail = "";

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const lastCharacter = segment.substring(segment.length - 1);

        const last: boolean = i == segments.length - 1;
        tail = last ? "" : lastCharacter == "." ? ".." : "...";

        const page = i + 1;
        const content = `${head}${segment}${tail}`
        pages.set(page, content);

        const first: boolean = i == 0;
        head = first ? "" : lastCharacter == "." ? "" : remaining(segment);
        tail = "";
    }

    return pages
}

const Text = (props: any) => {
    const wordsPerMinute = 200;
    const readingTime = `${calculateReadingTime()} minute read`;
    const pages: Map<number, string> = paginate(props.text);

    const [currentPage, setCurrentPage] = React.useState(1);

    let pagination = <></>
    if (pages.size > 1) {
        pagination = <Pagination size="sm" initialPage={currentPage} total={pages.size}
                                 onChange={(page: number) => setCurrentPage(page)} className="mt-6 float-right"/>
    }

    function calculateReadingTime() {
        if (!!props.text) {
            const words = props.text.split(' ');

            return Math.ceil(words.length / wordsPerMinute);

        } else return '';
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
                    {() => (
                        <ModalBody>
                            <div className="flex items-center justify-center h-full">
                                <div className="w-[70%] h-[80%]">
                                    <h1 className="mb-6">{props.today} <span className="text-gray-500 text-sm">({readingTime})</span></h1>
                                    <p className="text-xs leading-[2.5]">{pages.get(currentPage)}</p>
                                    {pagination}
                                </div>
                            </div>
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
}

export default Text;