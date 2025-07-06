import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

export default function PopUp() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <>
      <Button onPress={onOpen}>Open Modal</Button>
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
                  A free web app that encourages Bible Study, committing Scripture to memory and building a Bible ready habit in a fun and stimulating way.
                </p>
                <p className="mt-8">
                  How To Play
                </p>
                <ul>
                    <li>
                        •	On the web app, there is a daily description of a Bible Chapter.
                    </li>
                    <li>
                        •	You are to use the clues in the description to find where the Bible chapter is located.
                    </li>
                </ul>
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
    </>
  );
}
