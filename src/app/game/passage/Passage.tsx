"use client"

import React from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";
import { Button } from "@nextui-org/react";

const Passage = (props: any) => {
    return  <Modal isOpen={props.isOpen} onOpenChange={props.onOpenChange} backdrop="blur" size="full">
        <ModalContent className="text-black">
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">{props.today}</ModalHeader>
                    <ModalBody><p>{props.passage}</p></ModalBody>
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
}

export default Passage;