"use client";

import classes from "./account-setting.module.css";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useNotification } from "../notification/notification";
import {
  Center,
  Flex,
  Group,
  Stack,
  Input,
  UnstyledButton,
  Loader,
  Divider,
} from "@mantine/core";
import { AccountLine } from "./account-line";
import { PageMeta } from "@/types/page-meta";
import { User } from "@/types/api/user";
import { Judge } from "@/types/api/judge";
import { registerUser } from "@/utils/api/auth";
import { appointJudge, fetchUsers, fetchJudges } from "@/utils/api/account";

interface AccountSettingProps {
  variant: "user" | "judge";
}

export function AccountSetting({ variant }: AccountSettingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const minicode = searchParams.get("minicode");

  const { notify, notifyServerError } = useNotification();

  const regex = /^[a-z0-9]{5,7}$/;
  const [searchCode, setSearchCode] = useState("");
  const [addCode, setAddCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<(User[] | Judge[] | "ERROR")[]>([]);
  const [meta, setMeta] = useState<PageMeta>({
    total: 0,
    current: 1,
    last: 1,
  });

  const observerRef = useRef<HTMLDivElement>(null);

  // 상태 변수 초기화 (탭이나 URL 쿼리 변경 시)
  const reset = () => {
    setSearchCode(minicode || "");
    setAddCode("");

    setLoading(false);
    setData([]);
    setMeta({
      total: 0,
      current: 1,
      last: 1,
    });
  };
  useEffect(() => {
    reset();
  }, [variant, minicode]);

  // 페이지 데이터 로드
  const loadPage = async (page: number) => {
    setLoading(true);

    const doFetch = () => {
      if (variant === "user") return fetchUsers(page, minicode);
      else return fetchJudges(page, minicode);
    };

    const result = await doFetch();
    if (result.success) {
      setData((prev) => {
        const newData = [...prev];
        newData[page - 1] = result.data;
        return newData;
      });
      setMeta((prev) => ({
        ...prev,
        total: result.meta.total,
        last: result.meta.last_page,
      }));
    } else {
      setData((prev) => {
        const newData = [...prev];
        newData[page - 1] = "ERROR";
        return newData;
      });
      notifyServerError();
    }
    setLoading(false);
  };

  // 스크롤/리셋 시 데이터 로드
  useEffect(() => {
    if (!data[meta.current - 1]) loadPage(meta.current);
  }, [meta.current, data.length]);

  // 스크롤 관찰자 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          data.length > 0 &&
          meta.current < meta.last
        ) {
          setMeta((prev) => ({
            ...prev,
            current: prev.current + 1,
          }));
        }
      },
      { threshold: 1.0 },
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, meta.current, meta.last, data.length]);

  const handleSearchCode = () => {
    const params = new URLSearchParams(searchParams);
    if (!searchCode) {
      params.delete("minicode");
    } else if (regex.test(searchCode)) {
      params.set("minicode", searchCode);
    } else {
      notify(<p>유효하지 않은 형식의 미니코드예요!</p>);
      return;
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAddClick = async () => {
    if (regex.test(addCode)) {
      if (variant === "user") {
        const result = await registerUser(addCode);

        if (result.success) {
          reset();
          return;
        }
        switch (result.status) {
          case 409:
            notify(<p>이미 존재하는 미니코드예요!</p>);
            break;
          default:
            notifyServerError();
        }
      } else {
        // variant === "judge"
        const result = await appointJudge(addCode);

        if (result.success) {
          reset();
          return;
        }
        switch (result.status) {
          case 404:
            notify(<p>존재하지 않는 미니코드예요!</p>);
            break;
          case 409:
            notify(<p>이미 심사위원으로 임명된 미니예요!</p>);
            break;
          default:
            notifyServerError();
        }
      }
    } else notify(<p>유효하지 않은 형식의 미니코드예요!</p>);
  };

  return (
    <Stack gap={10} py={12} px={9}>
      <Stack gap={9}>
        <p style={{ paddingLeft: "10px" }}>미니 코드 검색 ({meta.total})</p>
        <Input
          classNames={{ input: classes.SearchInput }}
          variant="unstyled"
          placeholder="미니 코드 입력"
          maxLength={7}
          value={searchCode}
          onChange={(event) => setSearchCode(event.currentTarget.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleSearchCode();
          }}
        />
      </Stack>

      <Stack gap={6}>
        <Divider size={1} color="var(--gray-d9)" />
        <Group align="center" w="100%" gap={8}>
          <Input
            classNames={{ input: classes.Input }}
            style={{ flex: 1 }}
            ml={10}
            variant="unstyled"
            placeholder="미니 코드 입력"
            maxLength={7}
            value={addCode}
            onChange={(event) => setAddCode(event.currentTarget.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleAddClick();
            }}
          />
          <UnstyledButton w={28} h={28} onClick={handleAddClick}>
            <Image
              src="/images/account-setting/plus.svg"
              alt="Add"
              width={28}
              height={28}
            />
          </UnstyledButton>
        </Group>
        <Divider size={1} color="var(--gray-d9)" />
      </Stack>

      <Stack gap={10}>
        {Array.from({ length: meta.current }).map((_, pageIdx) => {
          const pageItems = data[pageIdx];
          if (pageItems === "ERROR") {
            return (
              <RetryLine
                key={`retry (${pageIdx} page)`}
                loadPage={() => loadPage(pageIdx + 1)}
              />
            );
          } else if (pageItems) {
            return pageItems.map((acnt) => (
              <AccountLine
                key={`${variant}_${acnt.minicode}`}
                variant={variant}
                account={acnt}
                reload={(clear: boolean = false) => {
                  if (clear) {
                    setMeta((prev) => ({
                      ...prev,
                      current: pageIdx + 1,
                    }));
                    setData((prev) => {
                      return prev.slice(0, pageIdx + 1);
                    });
                  }

                  loadPage(pageIdx + 1);
                }}
              />
            ));
          }
        })}
        <Center ref={observerRef} py={6} h={36}>
          {loading && <Loader type="dots" color="var(--main)" />}
          {!loading && meta.total === 0 && (
            <p style={{ color: "var(--gray-b3)" }}> 검색 결과가 없어요.</p>
          )}
        </Center>
      </Stack>
    </Stack>
  );
}

interface RetryLineProps {
  loadPage: () => void;
}

function RetryLine({ loadPage }: RetryLineProps) {
  return (
    <>
      <Flex align="center" justify="center" gap={10} h={28}>
        <p style={{ color: "var(--main)" }}>데이터 로딩 실패!</p>
        <UnstyledButton h={17} onClick={loadPage}>
          <Image
            src="/images/account-setting/retry.svg"
            alt="다시 시도"
            width={55}
            height={16}
          />
        </UnstyledButton>
      </Flex>
      <Divider size={1} color="var(--gray-d9)" />
    </>
  );
}
