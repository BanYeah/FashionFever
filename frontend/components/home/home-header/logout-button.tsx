"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { UnstyledButton } from "@mantine/core";
import { ModalNoti } from "@/components/common/modal/model-noti";
import { logout } from "@/utils/api/auth";

export function LogoutButton() {
  const router = useRouter();
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);

  return (
    <>
      <ModalNoti icon="alert" opened={notiOpened} close={closeNoti}>
        <p>
          서버와의 통신에 실패했습니다.
          <br /> 잠시 후 다시 시도해주세요.
        </p>
      </ModalNoti>

      <UnstyledButton
        className={classes.LogoutButton}
        onClick={async () => {
          const result = await logout();

          if (result.success) router.push("/home");
          else openNoti();
        }}
      >
        <Image
          src="/images/home/home-shell/logout.svg"
          alt=""
          width={20}
          height={20}
        />
      </UnstyledButton>
    </>
  );
}
