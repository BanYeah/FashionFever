"use client";

import classes from "./modal-go-back.module.css";
import { Modal, Stack, UnstyledButton, Loader } from "@mantine/core";

interface ModalGoBackProps {
  opened: boolean;
  close: () => void;
  title: string;
  children: React.ReactNode;
  back: string;
  go: string;
  onGo: () => void;
  loading?: boolean;
}

export function ModalGoBack({
  opened,
  close,
  title,
  children,
  back,
  go,
  onGo,
  loading,
}: ModalGoBackProps) {
  return (
    <Modal
      classNames={{
        content: classes.ModalContent,
        header: classes.ModalHeader,
        title: classes.ModalTitle,
      }}
      opened={opened}
      onClose={close}
      title={title}
      size={294} // width
      centered
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
            {loading ? <Loader size={24} color="var(--white)" /> : <p>{go}</p>}
          </UnstyledButton>
        </div>
      </Stack>
    </Modal>
  );
}
