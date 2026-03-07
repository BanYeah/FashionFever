"use client";

import classes from "./delivery.module.css";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useNotification } from "../notification/notification";
import {
  Center,
  Group,
  Stack,
  Input,
  Select,
  Switch,
  UnstyledButton,
  Divider,
  Loader,
} from "@mantine/core";
import { PageMeta } from "@/types/page-meta";
import { HeartRating } from "../common/heart-rating/heartrating";
import { DeliveryData } from "@/types/api/record";
import { getDelivery, patchDelivery } from "@/utils/api/record";

export function DeliverySection({ themeId }: { themeId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const minicode = searchParams.get("minicode");

  const { notify, notifyServerError } = useNotification();

  const regex = /^[a-z0-9]{5,7}$/;
  const [searchCode, setSearchCode] = useState("");
  const [status, setStatus] = useState<string | null>("전체");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<(DeliveryData[] | "ERROR")[]>([]);
  const [meta, setMeta] = useState<PageMeta>({
    total: 0,
    current: 1,
    last: 1,
  });

  const observerRef = useRef<HTMLDivElement>(null);

  // 상태 변수 초기화 (탭이나 URL 쿼리 변경 시)
  const reset = () => {
    setSearchCode(minicode || "");

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
  }, [themeId, minicode]);

  // 페이지 데이터 로드
  const loadPage = async (page: number) => {
    setLoading(true);

    const getStatus = (status: string | null) => {
      if (!status) return "all";
      switch (status) {
        case "지급 완료":
          return "complete";
        case "미지급":
          return "incomplete";
        default:
          return "all";
      }
    };

    const result = await getDelivery(
      themeId,
      getStatus(status),
      page,
      minicode,
    );
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
  }, [loading, data.length, meta.current, meta.last]);

  const handleSearchCode = () => {
    const params = new URLSearchParams(searchParams);
    if (!searchCode) params.delete("minicode");
    else params.set("minicode", searchCode);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Stack gap={10} py={12} px={9}>
      <Stack gap={9}>
        <p style={{ paddingLeft: "10px" }}>미니 코드 검색 ({meta.total})</p>
        <Group gap={8}>
          <Input
            classNames={{ wrapper: classes.InputWrapper, input: classes.Input }}
            variant="unstyled"
            placeholder="미니 코드 입력"
            maxLength={7}
            value={searchCode}
            onChange={(event) => setSearchCode(event.currentTarget.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleSearchCode();
            }}
          />
          <Select
            classNames={{
              input: classes.SelectInput,
              options: classes.SelectOptions,
              option: classes.SelectOption,
            }}
            data={["전체", "지급 완료", "미지급"]}
            value={status}
            onChange={setStatus}
            rightSection={null}
          />
        </Group>
      </Stack>
      <Divider size={1} color="var(--gray-d9)" />
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
            <DeliverLine
              key={item.record_id}
              data={item}
              reload={() => {
                loadPage(pageIdx + 1);
              }}
            />
          ));
        }
      })}
      <Center ref={observerRef} pb={10} h={35}>
        {loading && <Loader type="dots" color="var(--main)" />}
        {!loading && meta.total === 0 && (
          <p style={{ color: "var(--gray-b3)" }}> 검색 결과가 없어요.</p>
        )}
      </Center>
    </Stack>
  );
}

interface DeliverLineProps {
  data: DeliveryData;
  reload: () => void;
}

function DeliverLine({ data, reload }: DeliverLineProps) {
  const { notify, notifyServerError } = useNotification();

  const [checked, setChecked] = useState<boolean>(data.delivered_at !== null);

  const handleChecked = async (checked: boolean) => {
    const result = await patchDelivery(
      data.record_id,
      checked ? "complete" : "incomplete",
    );
    if (!result.success) {
      notifyServerError();
      reload();
    }
  };

  return (
    <Stack gap={10}>
      <Group align="center" justify="space-between">
        <Group align="center" gap={12}>
          <p className={classes.Minicode}>{data.minicode}</p>
          <p style={{ color: "var(--gray-b3)" }}>|</p>
          <HeartRating value={data.best_final_score} unitW={25} unitH={22} />
          <p>{data.best_final_score.toFixed(2)}</p>
        </Group>
        <Switch
          color="var(--blue)"
          size="md"
          radius="md"
          checked={checked}
          onChange={(event) => {
            setChecked(event.currentTarget.checked);
            handleChecked(event.currentTarget.checked);
          }}
        />
      </Group>
      <Divider size={1} color="var(--gray-d9)" />
    </Stack>
  );
}

interface RetryLineProps {
  loadPage: () => void;
}

function RetryLine({ loadPage }: RetryLineProps) {
  return (
    <Stack gap={10}>
      <Group align="center" justify="center" gap={10} h={24}>
        <p style={{ color: "var(--main)" }}>데이터 로딩 실패!</p>
        <UnstyledButton h={17} onClick={loadPage}>
          <Image
            src="/images/account-setting/retry.svg"
            alt="다시 시도"
            width={55}
            height={16}
          />
        </UnstyledButton>
      </Group>
      <Divider size={1} color="var(--gray-d9)" />
    </Stack>
  );
}
