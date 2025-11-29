"use client"

import Image from "next/image";
import { ModalBody, ModalFooter, ModalHeader } from "@heroui/modal";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { Button } from "@heroui/button";

export default function ProfileSidebar({ info }: { info: any }) {
    const fallbackUrl =
        "https://raw.githubusercontent.com/bible-game/webapp/main/public/icon-nobg.png";

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <aside className="space-y-4">

            {/* Profile Photo */}
            <div className="flex justify-center">
                <Image
                    src={`data:image/png;base64,${info.userIcon}` || fallbackUrl}
                    width={260}
                    height={260}
                    alt="Profile"
                    className="rounded-full border"
                />
                <Button onPress={onOpen}>Edit</Button>
                <Modal
                    backdrop="opaque"
                       classNames={{
                           body: "p-8 text-center",
                           backdrop: "bg-[#060842]/75",
                           base: "max-w-[40rem] h-min bg-gradient-to-t from-[#0f0a31] to-[#060842] border-[1px] border-[#ffffff]/25",
                           header: "pt-8 w-full text-center",
                           closeButton: "hover:bg-white/5 active:bg-white/10 absolute right-6 top-6",
                       }}
                       isOpen={isOpen}
                       radius="lg"
                       placement="center"
                       onOpenChange={onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Editing Picture</ModalHeader>
                                <ModalBody>
                                    <p>Hello!</p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Close
                                    </Button>
                                    <Button color="primary" onPress={onClose}>
                                        Action
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>

                </Modal>
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-center">
                {info.firstname} {info.lastname}
            </h2>

            {/* Job Title */}
            <p className="text-center text-gray-400 text-sm">
                {info.role}
            </p>

            {/* Achievements */}
            <div className="space-y-2">
                <h3 className="font-semibold">Achievements</h3>
                <div className="flex gap-2">
                    {info.achievements?.map((ach: any, i: number) => (
                        <Image
                            key={i}
                            src={ach.icon}
                            alt={ach.name}
                            width={48}
                            height={48}
                        />
                    ))}
                </div>
            </div>

        </aside>
    );
}
