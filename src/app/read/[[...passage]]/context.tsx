"use client"

import React, { useState } from "react";
import { Accordion, AccordionItem, Spinner, Button, Modal, ModalContent, Textarea } from "@heroui/react";
import { getPostContext } from "@/core/action/read/get-postcontext";
import { getPreContext } from "@/core/action/read/get-precontext";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { postFeedback } from "@/core/action/read/post-feedback";

const Context = (props: any) => {
    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);
    const [title] = useState(props.context == "before" ? "Pre‑Context" : "Post‑Context");
    const [modalOpen, setModalOpen] = useState(false);

    function toggle(e: any): void {
        if (!context && e.size) {
            setLoading(true);
            (props.context == "after" ? getPostContext : getPreContext)(props.passageKey).then((ctx: any) => {
                setContext(ctx.text);
                setLoading(false);
            });
        }
    }

    const handelSubmit = () => {
        setModalOpen(false);
    }

    return (
        <Accordion
            className="opacity-90 bg-white/80 backdrop-blur-sm ring-1 ring-indigo-500 rounded-2xl p-3 sm:p-4"
            itemClasses={{ title: "text-indigo-700 font-medium", indicator: "text-indigo-700", startContent: "text-indigo-700 bg-red" }}
            onSelectionChange={toggle}
            isCompact
        >
            <AccordionItem key="1" aria-label="context" className="flex flex-col gap-2" title={title}>
                {loading ? (<Spinner color="secondary" />) : (
                    <>
                        <p className="font-light text-sm leading-6 text-indigo-700 max-w-[80%] sm:max-w-[42rem]">{context}</p>
                        <div className="flex gap-4 max-w-[80%] sm:max-w-[42rem] justify-end ">
                            <Button className="p-2 min-w-0 aspect-square bg-transparent border-1 border-indigo-700 text-indigo-700 hover:text-green-500 hover:border-green-500 duration-50"
                                onPress={() => postFeedback(props.passageKey, "positive", props.context)}>
                                <ThumbsUp className="size-5" />
                            </Button>

                                <Button className="p-2 min-w-0 aspect-square bg-transparent border-1 border-indigo-700 text-indigo-700 hover:text-red-500 hover:border-red-500 duration-50"
                                    onPress={() => setModalOpen(true)}>
                                    <ThumbsDown className="size-5" />
                                </Button>
                            <Modal isOpen={modalOpen} onOpenChange={setModalOpen}>


                                <ModalContent className="text-black p-4 flex flex-col gap-4">
                                    <h3 className="text-xl font-bold">Leave a comment?</h3>
                                    <p className="text-black/80">Help us improve our content by adding a comment to you feedback</p>
                                    <Textarea placeholder="Write a comment (optional)"/>
                                    <div className="flex justify-end gap-4">
                                        <Button onPress={handelSubmit}>
                                            Submit
                                        </Button>
                                    </div>
                                </ModalContent>
                            </Modal>

                        </div>
                    </>

                )}
            </AccordionItem>
        </Accordion>
    );
};

export default Context;