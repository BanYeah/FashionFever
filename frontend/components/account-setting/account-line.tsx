"use client";

import classes from "./account-setting.module.css";
import Image from "next/image";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotification } from "../notification/notification";
import { Group, Input, UnstyledButton, Divider } from "@mantine/core";
import { ModalGoBack } from "@/components/common/modal/modal-go-back";
import { User, Judge } from "@/types/api/account";
import { resetCode, deleteUser, expelJudge } from "@/utils/api/account";

interface AccountLineProps {
  variant: "user" | "judge";
  account: User | Judge;
  reload: (clear: boolean) => void;
}

export function AccountLine({ variant, account, reload }: AccountLineProps) {
  const { notify, notifyServerError } = useNotification();

  const [opened, { open, close }] = useDisclosure(false);
  const [option, { toggle }] = useDisclosure(false);

  const [value, setValue] = useState<string>("");
  const [action, setAction] = useState<"reset" | "delete">("reset");
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleAccount = async () => {
    if (value !== account.minicode) return;
    if (loading) return;
    setLoading(true);

    const doAction = () => {
      if (action === "reset") return resetCode(account.minicode);
      // action === "delete"
      else if (variant === "user") return deleteUser(account.minicode);
      else return expelJudge(account.minicode);
    };

    const result = await doAction();
    if (result.success) {
      if (option) toggle();
      reload(action === "delete");
    }

    close();
    setValue("");
    setLoading(false);

    if (!result.success) {
      switch (result.status) {
        case 400:
          notify(
            <p>
              투표가 진행 중인 테마가 있을 때는
              <br /> 계정을 삭제할 수 없어요!
            </p>,
          );
          break;
        case 404:
          notify(
            <p>
              존재하지 않는{" "}
              {variant === "user" ? "유저예요!" : "심사위원이에요!"}
            </p>,
          );
          break;

        default:
          notifyServerError();
      }
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (option) toggle();

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Seoul",
    });
    return formatter.format(date).replace(/\s/g, "").replace(/\.$/, "");
  };

  return (
    <>
      <ModalGoBack
        title="계정 관리 안내"
        go="계속하기"
        back="그만두기"
        opened={opened}
        onGo={handleAccount}
        close={() => {
          close();
          setValue("");
        }}
        loading={loading}
      >
        <>
          <p>
            정말로 미니 코드 <span>{account.minicode}</span>
            의
            <br />
            <span>
              {action === "reset"
                ? "입장 코드를 초기화"
                : // action === "delete"
                  variant === "user"
                  ? "계정을 삭제"
                  : "심사위원 임명을 취소"}
            </span>
            하시겠습니까?
          </p>
          <Input
            classNames={{ input: classes.SearchInput }}
            styles={{ input: { textAlign: "center" } }}
            variant="unstyled"
            placeholder={`미니 코드 확인 : ${account.minicode}`}
            maxLength={7}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleAccount();
            }}
          />
        </>
      </ModalGoBack>

      <div className={`${classes.CopyText} ${copied && classes.Copied}`}>
        <p>입장 코드 복사 완료</p>
      </div>

      <Group className={classes.AccountLine} align="center" gap={8}>
        <Group className={classes.AccountText} ml={10} gap={14}>
          <p style={{ minWidth: "66px" }}>
            {variant === "judge" && "judge_"}
            {account.minicode}
          </p>
          {variant === "user" && "enter_code" in account && (
            <>
              <span>|</span>
              <UnstyledButton onClick={toggle}>
                <p>{account.enter_code}</p>
              </UnstyledButton>
              <Group
                className={`${classes.Option} ${option && classes.ShowOption}`}
                gap={8}
              >
                <UnstyledButton
                  w={28}
                  h={28}
                  onClick={() => handleCopy(account.enter_code)}
                >
                  <Image
                    src="/images/account-setting/copy.svg"
                    alt="Reset"
                    width={28}
                    height={28}
                  />
                </UnstyledButton>
                <UnstyledButton
                  w={28}
                  h={28}
                  onClick={() => {
                    setAction("reset");
                    open();
                  }}
                >
                  <Image
                    src="/images/account-setting/reset.svg"
                    alt="Reset"
                    width={28}
                    height={28}
                  />
                </UnstyledButton>
              </Group>
            </>
          )}
        </Group>

        <Group gap={8}>
          <div className={classes.AccountDate}>
            {"created_at" in account && formatDate(account.created_at)}
            {"appointed_at" in account && formatDate(account.appointed_at)}
          </div>
          <UnstyledButton
            w={28}
            h={28}
            onClick={() => {
              setAction("delete");
              open();
            }}
          >
            <Image
              src="/images/account-setting/minus.svg"
              alt="Delete"
              width={28}
              height={28}
            />
          </UnstyledButton>
        </Group>
      </Group>
      <Divider size={1} color="var(--gray-d9)" />
    </>
  );
}
