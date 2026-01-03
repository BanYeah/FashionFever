"use client";

import classes from "./modal-go-back.module.css";
import { Modal, Stack, UnstyledButton } from "@mantine/core";

interface ModalGoBackProps {
  title: string;
  go: string;
  back: string;
  children: React.ReactNode;
  opened: boolean;
  onGo: () => void;
  close: () => void;
}

export function ModalGoBack({
  title,
  go,
  back,
  children,
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
        title: classes.ModalTitle,
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
        <Stack className={classes.Section} gap={30}>
          {children}
        </Stack>
        <div className={classes.ModalFooter}>
          <UnstyledButton
            className={`${classes.Button} ${classes.BackButton}`}
            onClick={close}
          >
            <p>{back}</p>
          </UnstyledButton>
          <UnstyledButton
            className={`${classes.Button} ${classes.GoButton}`}
            onClick={onGo}
          >
            <p>{go}</p>
          </UnstyledButton>
        </div>
      </Stack>
    </Modal>
  );
}
