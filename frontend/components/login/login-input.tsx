"use client";

import classes from "./login-input.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Input, UnstyledButton } from "@mantine/core";
import { ModalNoti } from "../modal/model-noti";
import { ModalGoBack } from "../modal/modal-go-back";

interface LoginInputBaseProps {
  disabled?: boolean;
  placeholder: string;
  rightButton?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
}

export function LoginInputBase({
  disabled,
  placeholder,
  rightButton,
  value,
  onChange,
  onClick,
}: LoginInputBaseProps) {
  return (
    <Input
      classNames={{
        wrapper: classes.InputWrapper,
        input: classes.Input,
        section: classes.InputSection,
      }}
      variant="unstyled"
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={12}
      rightSection={
        rightButton ? (
          <UnstyledButton className={classes.Button} onClick={onClick}>
            <Image
              src="/images/login/arrow-right.svg"
              alt=""
              width={24}
              height={24}
            />
          </UnstyledButton>
        ) : null
      }
      rightSectionWidth={rightButton ? 60 : 0}
      rightSectionPointerEvents={rightButton ? "all" : "none"}
    />
  );
}

interface LoginInputProps {
  disabled?: boolean;
  placeholder: string;
  defaultValue?: string;
  rightButton?: boolean;
}

export function LoginInput({
  disabled,
  placeholder,
  defaultValue = "",
  rightButton,
}: LoginInputProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <LoginInputBase
      disabled={disabled}
      placeholder={placeholder}
      rightButton={rightButton}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export function LoginInputWithModal({
  disabled,
  placeholder,
  defaultValue = "",
  rightButton,
}: LoginInputProps) {
  const router = useRouter();

  const [agreeOpened, { open: openAgree, close: closeAgree }] =
    useDisclosure(false);
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);
  const [value, setValue] = useState(defaultValue);

  const isValidMinicode = (code: string) => {
    const regex = /^[a-z0-9_]{5,12}$/;
    return regex.test(code);
  };

  return (
    <>
      <ModalNoti icon="alert" opened={notiOpened} close={closeNoti}>
        <p>유효하지 않은 형식의 미니코드예요!</p>
      </ModalNoti>

      <ModalGoBack
        title="정보 제공 및 활용 동의 안내"
        go="참여하기"
        back="그만두기"
        opened={agreeOpened}
        onGo={() => router.push(`/login/${value}`)}
        close={closeAgree}
      >
        <>
          <p>
            본 이벤트 참여 시, 원활한 진행을 위해{" "}
            <span>미니 코드, 코디 사진, 투표 내역</span>이 기록 및 보관됩니다.
          </p>
          <p>
            이벤트 참여는 이에 동의하신 것으로 간주하오니 이용에 참고
            부탁드립니다.
          </p>
        </>
      </ModalGoBack>

      <LoginInputBase
        disabled={disabled}
        placeholder={placeholder}
        rightButton={rightButton}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClick={isValidMinicode(value) ? openAgree : openNoti}
      />
    </>
  );
}
