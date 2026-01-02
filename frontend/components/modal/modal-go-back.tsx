"use client";

import classes from "./modal-go-back.module.css";
import { Modal, Stack, UnstyledButton } from "@mantine/core";

interface ModalGoBackProps {
  title: string;
  description: React.ReactNode;
  go: string;
  back: string;
  opened: boolean;
  onGo: () => void;
  close: () => void;
}

export function ModalGoBack({
  title,
  description,
  go,
  back,
  opened,
  onGo,
  close,
}: ModalGoBackProps) {
  return (
    <Modal
      classNames={{
        inner: classes.ModalInner,
        content: classes.ModalContent,
        header: classes.ModalHeader,
      }}
      opened={opened}
      onClose={close}
      title={title}
      size={294} // width
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <Stack gap={0}>
        <Stack className={classes.ModalDescription} gap={30}>
          {description}
        </Stack>
        <div className={classes.ModalFooter}>
          <UnstyledButton
            className={`${classes.Button} ${classes.BackButton}`}
            onClick={close}
          >
            {back}
          </UnstyledButton>
          <UnstyledButton
            className={`${classes.Button} ${classes.GoButton}`}
            onClick={onGo}
          >
            {go}
          </UnstyledButton>
        </div>
      </Stack>
    </Modal>
  );
}
