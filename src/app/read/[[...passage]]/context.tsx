"use client"

import React, { useState } from "react";
import { Accordion, AccordionItem, Spinner, Button, Modal, ModalContent, Textarea, Chip } from "@heroui/react";
import { getPostContext } from "@/core/action/read/get-postcontext";
import { getPreContext } from "@/core/action/read/get-precontext";
import { ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
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
    const [title] = useState(props.context == "before" ? "What comes before" : "What comes next");
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
            if (response.success) {
                toast.success("Thank you for your feedback!");
            } else {
                console.log(response);
                toast.error("Uh oh! something went wrong.");
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
        postFeedback(props.passageKey, "negative", props.context, cmt).then((response: any) => {
            if (response.success) {
                toast.success("Thank you for your feedback!");
            } else {
                console.log(response);
                toast.error("Uh oh! something went wrong.");
            }
        });
        updateModalOpen(false);
    }

    return (
        <Accordion
            className="px-0"
            itemClasses={{
                trigger: "min-h-11 py-2 gap-2 justify-start",
                titleWrapper: "flex-none",
                title: "text-[var(--reader-muted)] text-[14px] font-medium",
                indicator: "text-[var(--reader-accent)] -rotate-90 data-[open=true]:rotate-0",
                content: "pt-1 pb-3",
            }}
            onSelectionChange={toggle}
            isCompact
        >
            <AccordionItem key="1" aria-label={title} indicator={<ChevronDown className="size-4" />} className="flex flex-col gap-2" title={title}>
                {loading ? (<Spinner color="default" size="sm" />) : (
                    <>
                        <p className="border-l-2 border-[color-mix(in_srgb,var(--reader-accent)_45%,transparent)] pl-3 text-[15px] leading-[1.6] text-[var(--reader-muted)]">{context}</p>
                        <div className="-mr-2 mt-1 flex justify-end">
                            <Button isIconOnly aria-label="Helpful context" className="ui-icon bg-transparent text-[var(--reader-muted)]"
                                onPress={handlePositiveSubmit}>
                                <ThumbsUp className="size-5" />
                            </Button>

                            <Button isIconOnly aria-label="Unhelpful context" className="ui-icon bg-transparent text-[var(--reader-muted)]"
                                onPress={() => updateModalOpen(true)}>
                                <ThumbsDown className="size-5" />
                            </Button>
                            <Modal isOpen={modalOpen} onOpenChange={updateModalOpen} classNames={{ base: "bg-ui-surface text-ui-text border border-ui-line rounded-lg" }}>


                                <ModalContent className="p-6 flex flex-col gap-4">
                                    <h3 className="text-xl font-bold">Leave a comment?</h3>
                                    <p className="text-ui-muted text-sm">Help us improve our content by adding feedback.</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {FEEDBACK_OPTIONS.map(({ label, value }, index) => {
                                            return <label key={index} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedOptions.includes(index)} onChange={() => toggleOption(index)}/>{label}</label>
                                        })}
                                    </div>
                                    <Textarea placeholder="Write a comment (optional)" value={comment} onValueChange={setComment} isDisabled />
                                    <div className="flex justify-end gap-4">
                                        <Button className="ui-button ui-primary" onPress={handleNegativeSubmit}>
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
