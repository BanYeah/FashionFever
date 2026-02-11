"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/utils/store/authStore";
import { useNotification } from "../notification/notification";
import { Flex, Stack, UnstyledButton, Divider } from "@mantine/core";
import { ThemeDisplay } from "./theme-display/theme-display";
import { ThemeDisplayJudge } from "./theme-display/theme-display-judge";
import { ThemeDisplayAdmin } from "./theme-display/theme-display-admin";
import { PageMeta } from "@/types/page-meta";
import { ThemeScheduleData } from "@/types/api/theme";
import { getThemes, getThemeSettings } from "@/utils/api/theme";

export function ThemeCollection() {
  const { notify, notifyServerError } = useNotification();

  const { user } = useAuthStore.getState();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<(ThemeScheduleData[] | "ERROR")[]>([]);
  const [meta, setMeta] = useState<PageMeta>({
    total: 0,
    current: 1,
    last: 1,
  });

  const observerRef = useRef<HTMLDivElement>(null);

  // 상태 변수 초기화
  const reset = () => {
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
  }, []);

  // 페이지 데이터 로드
  const loadPage = async (page: number) => {
    setLoading(true);

    const doFetch = () => {
      if (user?.account === "user" || user?.account === "judge")
        return getThemes(page);
      else if (user?.account === "admin") return getThemeSettings(page);
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

  if (user?.account === "user") {
    return (
      <Stack p={10} gap={10}>
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
            return pageItems.map((item) => (
              <ThemeDisplay key={item.theme_id} data={item} />
            ));
          }
        })}
        <div ref={observerRef}></div>
      </Stack>
    );
  } else if (user?.account === "judge") {
    return (
      <Stack p={10} gap={10}>
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
            return pageItems.map((item) => (
              <ThemeDisplayJudge key={item.theme_id} data={item} />
            ));
          }
        })}
        <div ref={observerRef}></div>
      </Stack>
    );
  } else if (user?.account === "admin") {
    return (
      <Stack p={10} gap={10}>
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
            return pageItems.map((item) => (
              <ThemeDisplayAdmin
                key={item.theme_id}
                data={item}
                reload={() => {
                  setMeta((prev) => ({
                    ...prev,
                    current: pageIdx + 1,
                  }));
                  setData((prev) => {
                    return prev.slice(0, pageIdx + 1);
                  });

                  loadPage(pageIdx + 1);
                }}
              />
            ));
          }
        })}
        <div ref={observerRef}></div>
      </Stack>
    );
  }
}

interface RetryLineProps {
  loadPage: () => void;
}

function RetryLine({ loadPage }: RetryLineProps) {
  return (
    <>
      <Flex align="center" justify="center" gap={10} h={200}>
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
      <Divider size={3} color="var(--black)" />
    </>
  );
}
