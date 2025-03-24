"use client"

import React from "react";
import { Modal, ModalBody, ModalContent } from "@nextui-org/modal";
import { Pagination } from "@heroui/pagination";
import moment from "moment/moment";
import {CalendarDate} from "@internationalized/date";

// FixMe && import?
function paginate(text: string): Map<number, string> {
    const remaining = (segment: string) => {
        const sentences = segment.split(".");
        return sentences[sentences.length - 1];
    }

    const pages = new Map();
    const segments = text.match(/[\s\S]{1,1500}/g)!!
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
    const pages: Map<number, string> = paginate(props.passage.text);

    const [currentPage, setCurrentPage] = React.useState(1);

    let pagination = <></>
    if (pages.size > 1) {
        pagination = <Pagination size="sm" initialPage={currentPage} total={pages.size}
                                 onChange={(page: number) => setCurrentPage(page)} className="mt-6 float-right"/>
    }

    function calculateReadingTime() {
        if (!!props.passage) {
            const words = props.passage.text.split(' ');

            return Math.ceil(words.length / wordsPerMinute);

        } else return '';
    }

    return <Modal
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        onClose={props.onClose}
        classNames={{base: "bg-inherit", closeButton: ""}}
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
        <section>
            <div aria-hidden="true"
                 className="fixed hidden dark:md:block dark:opacity-100 -bottom-[20%] -left-[10%] z-0">
                <img
                    src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/docs-left.png"
                    className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-85 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                    alt="docs left background" data-loaded="true"/>
            </div>
            <div aria-hidden="true"
                 className="fixed hidden dark:md:block dark:opacity-75 -top-[40%] -right-[60%] 2xl:-top-[60%] 2xl:-right-[45%] z-0 rotate-12">
                <img src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/docs-right.png"
                     className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-65 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                     alt="docs right background" data-loaded="true"/>
            </div>
        </section>
        <ModalContent className="text-white z-10">
            {() => (
                <ModalBody>
                    <div className="flex items-center justify-center h-full">
                        <div className="w-[40rem] h-[700px]">
                            <div className="h-[114px]">
                                <h1 className="mb-6">
                                    {moment(new CalendarDate(parseInt(props.today.split('-')[0]), parseInt(props.today.split('-')[1]) - 1, parseInt(props.today.split('-')[2]))).format('Do MMMM YYYY')}
                                     <br/><span className="text-gray-400 text-sm">({readingTime})</span>
                                </h1>
                                <h1 className="mb-3 text-lg">{props.passage.book} {props.passage.chapter}</h1>
                            </div>
                            <p className="text-sm leading-[2] opacity-90">{pages.get(currentPage)}</p>
                            {pagination}
                        </div>
                    </div>
                </ModalBody>
            )}
        </ModalContent>
    </Modal>
}

export default Text;