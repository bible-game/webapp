"use client"

import React, { useState } from "react";
import { Accordion, AccordionItem, Spinner, Button, Modal, ModalContent, Textarea, Chip } from "@heroui/react";
import { getPostContext } from "@/core/action/read/get-postcontext";
import { getPreContext } from "@/core/action/read/get-precontext";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { postFeedback } from "@/core/action/read/post-feedback";
import toast from "react-hot-toast";

type FeedbackOption = { label: string, value: string };

const FEEDBACK_OPTIONS: FeedbackOption[] = [
    { label: "Too long", value: "The summary is too long." },
    { label: "Too short", value: "The summary is too short." },
    { label: "Not relevant", value: "The summary is not relevant to the passage." },
    { label: "Not helpful", value: "I didn't find the summary helpful." },
    { label: "Inaccurate", value: "The summary contains inaccuracies." },
    { label: "Harmful", value: "The summary contains harmful content." },
]

const Context = (props: any) => {
    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);
    const [title] = useState(props.context == "before" ? "Pre‑Context" : "Post‑Context");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [comment, setComment] = useState("");


    function toggle(e: any): void {
        if (!context && e.size) {
            setLoading(true);
            (props.context == "after" ? getPostContext : getPreContext)(props.passageKey).then((ctx: any) => {
                setContext(ctx.text);
                setLoading(false);
            });
        }
    }

    const toggleOption = (index: number) => {
        if (selectedOptions.includes(index)) {
            setSelectedOptions(selectedOptions.filter((value) => value !== index));
        } else {
            setSelectedOptions([...selectedOptions, index]);
        }
    }
    const updateModalOpen = (open: boolean) => {
        setSelectedOptions([]);
        setComment("");
        setModalOpen(open);
    }
    const handlePositiveSubmit = () => {
        postFeedback(props.passageKey, "positive", props.context, "").then((response: any) => {
            console.log(response);
            if (response.status == 200) {
                toast.success("Thank you for your feedback!");
            }
        });
    }

    const handleNegativeSubmit = () => {
        let cmt = "";
        if (selectedOptions.length > 0) cmt += "I found this ";
        selectedOptions.forEach((index) => {
            cmt += FEEDBACK_OPTIONS[index].value + ", ";
        });
        if (comment) cmt += "My other thoughts are: " + comment;
        postFeedback(props.passageKey, "negative", props.context, comment).then((response: any) => {
            console.log(response);
            if (response.status == 200) {
                toast.success("Thank you for your feedback!");
            }
        });
        updateModalOpen(false);
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
                                onPress={handlePositiveSubmit}>
                                <ThumbsUp className="size-5" />
                            </Button>

                            <Button className="p-2 min-w-0 aspect-square bg-transparent border-1 border-indigo-700 text-indigo-700 hover:text-red-500 hover:border-red-500 duration-50"
                                onPress={() => updateModalOpen(true)}>
                                <ThumbsDown className="size-5" />
                            </Button>
                            <Modal isOpen={modalOpen} onOpenChange={updateModalOpen}>


                                <ModalContent className="text-black p-4 flex flex-col gap-4">
                                    <h3 className="text-xl font-bold">Leave a comment?</h3>
                                    <p className="text-black/80">Help us improve our content by adding a comment to you feedback</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {FEEDBACK_OPTIONS.map(({ label, value }, index) => {
                                            return <Button key={index} className={`text-sm hover:scale-[103%] transition-all duration-100 py-0 min-h-0 min-w-0 rounded-full ${selectedOptions.includes(index) && " bg-indigo-700 text-white"}`} onPress={() => toggleOption(index)}>{label}</Button>
                                        })}
                                    </div>
                                    <Textarea placeholder="Write a comment (optional)" value={comment} onValueChange={setComment} />
                                    <div className="flex justify-end gap-4">
                                        <Button onPress={handleNegativeSubmit}>
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