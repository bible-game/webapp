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
                        body: "p-10 text-center",
                        backdrop: "bg-[#060842]/75",
                        base: "max-w-[40rem] h-min bg-gradient-to-t from-[#0f0a31] to-[#060842] border-[1px] border-[#ffffff]/25",
                        header: "pt-8 w-full text-center",
                        closeButton: "hover:bg-white/5 active:bg-white/10 absolute right-6 top-6 m-4",
                    }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Cookies</ModalHeader>
                <ModalBody>
                    <p>
                        Welcome to the Bible Game- a free web app that encourages Bible Study, committing Scripture to memory and building a Bible
                        ready habit in a fun and stimulating way.
                    </p>
                    <p className="mt-8">
                        Information Before You Play:
                    </p>
                    <ul>
                        <li>
                            We and our third party systems use cookies and data to
                        </li>
                        <li>
                            • Create accounts for our users
                        </li>
                        <li>
                            • Maintain and retain their play records on our leaderboards
                        </li>
                        <li>
                            • To track user engagement and use the statistics to improve the quality of the webapp
                        </li>
                        <li>
                            If you choose to "Accept", you will be able explore the full features of the webapp including the leaderboard, create
                            an account and retain your play progress.
                        </li>
                        <li>
                            If you choose to "Reject", you explore the webapp and attempt the daily challenges but your records will not be saved.
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
