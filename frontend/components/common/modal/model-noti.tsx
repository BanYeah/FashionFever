"use client";

import classes from "./modal-noti.module.css";
import Image from "next/image";
import { Modal, Stack, Box, UnstyledButton } from "@mantine/core";

interface ModalNotiProps {
  icon: "alert" | "info";
  children: React.ReactNode;
  opened: boolean;
  close: () => void;
}

export function ModalNoti({ icon, children, opened, close }: ModalNotiProps) {
  return (
    <Modal
      classNames={{
        content: classes.ModalContent,
      }}
      opened={opened}
      onClose={close}
      size="auto" // width
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: "-7px" }}>
          {icon == "alert" ? (
            <Image
              src={"/images/modal/alert.svg"}
              alt=""
              width={39}
              height={39}
            />
          ) : (
            <Image
              src={"/images/modal/info.svg"}
              alt=""
              width={39}
              height={39}
            />
          )}
        </div>
        <Stack align="flex-end" mt={7} mb={7} gap={7}>
          <Box className={classes.Section} ml={7} mr={7}>
            {children}
          </Box>
          <UnstyledButton className={classes.CheckButton} onClick={close}>
            <p>확인</p>
          </UnstyledButton>
        </Stack>
      </div>
    </Modal>
  );
}
