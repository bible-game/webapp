import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import React, {useState} from "react";
import Image from "next/image";

export default function PopUp() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const consent = false; // GameStatesService.getConsentState();
    if (!isOpen && !consent) {
        onOpen()
    }

    const [ visible, setVisible ] = useState(true);
    function close(): void {
        setVisible(false)
    }

    if (visible) return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}
      backdrop="opaque"
                    classNames={{
                        body: "p-8 text-center",
                        backdrop: "bg-[#060842]/75",
                        base: "max-w-[40rem] h-min bg-gradient-to-t from-[#0f0a31] to-[#060842] border-[1px] border-[#ffffff]/25",
                        header: "pt-8 w-full text-center",
                        closeButton: "hover:bg-white/5 active:bg-white/10 absolute right-6 top-6",
                    }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Welcome to The Bible Game</ModalHeader>
                <ModalBody>
                    <p>
                        A free web app that encourages Bible Study, committing Scripture to memory and building a Bible
                        ready habit in a fun and stimulating way.
                    </p>
                    <div className="flex my-4 justify-center">
                        <Image src="/mark-1.png" alt="mark1" width={30 * 16} height={0} className="rounded w-[95%]"/>
                    </div>
                    <p className="mt-8">
                        How To Play
                    </p>
                    <ul>
                        <li>
                            • On the web app, there is a daily description of a Bible Chapter.
                        </li>
                        <li>
                            • You are to use the clues in the description to find where the Bible chapter is located.
                        </li>
                        <li>
                            • You try to find the verse by selecting the possible Book and Chapter you think/know the
                            clues are pointing to.
                        </li>
                        <li>
                            You have five guesses per session and with every guess, your feedback will have a number and
                            pointer next to it.
                        </li>
                        <li>
                            • The numbers indicate how many words you are away from the correct answer and the pointer
                            indicates what direction the correct might be - either above or below your current guess.
                        </li>
                    </ul>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={close}>
                        Close
                    </Button>
                    <Button color="primary" onPress={close}>
                        Action
                    </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
