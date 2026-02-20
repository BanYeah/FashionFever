"use client";

import classes from "./reviewing-grid.module.css";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotification } from "../notification/notification";
import {
  Center,
  Group,
  SimpleGrid,
  Stack,
  Box,
  Modal,
  UnstyledButton,
  Loader,
} from "@mantine/core";
import { PageMeta } from "@/types/page-meta";
import { ReviewData } from "@/types/api/review";
import { getReviews, patchReviewStatus } from "@/utils/api/review";

interface RankingGridProps {
  themeId: string;
  status: "approved" | "rejected";
}

export function ReviewingGrid({ themeId, status }: RankingGridProps) {
  const { notify, notifyServerError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<(ReviewData[] | "ERROR")[]>([]);
  const [meta, setMeta] = useState<PageMeta>({
    total: 0,
    current: 1,
    last: 1,
  });

  const observerRef = useRef<HTMLDivElement>(null);

  // 상태 변수 초기화 (탭이나 URL 쿼리 변경 시)
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
  }, [themeId, status]);

  // 페이지 데이터 로드
  const loadPage = async (page: number) => {
    setLoading(true);

    const result = await getReviews(themeId, page, status);
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

  return (
    <Stack gap={0} p={10}>
      {status === "rejected" && (
        <p className={classes.Caption}>
          반려된 사진은 검수 기간이 종료 후, <span>영구적으로 삭제</span>되어
          복구가 불가능해요. <br />
          번거로우시더라도 기한 내에 꼼꼼히 확인해 주세요.
        </p>
      )}
      <SimpleGrid cols={2} spacing={10} verticalSpacing={10}>
        {Array.from({ length: meta.current }).map((_, pageIdx) => {
          const pageItems = data[pageIdx];
          if (pageItems === "ERROR") {
            return (
              <RetryCard
                key={`retry (${pageIdx} page)`}
                loadPage={() => loadPage(pageIdx + 1)}
              />
            );
          } else if (pageItems) {
            return pageItems.map((item) => (
              <ReviewingCard
                key={`${item.submission_id}`}
                data={item}
                tab={status}
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
                notify={notify}
                notifyServerError={notifyServerError}
              />
            ));
          }
        })}
      </SimpleGrid>
      <Center
        ref={observerRef}
        className={classes.Center}
        style={{
          height: loading || (!loading && meta.total === 0) ? "auto" : 0,
        }}
      >
        {loading && <Loader type="dots" color="var(--main)" />}
        {!loading && meta.total === 0 && (
          <p style={{ color: "var(--gray-b3)" }}>
            {status === "approved" ? "승인된" : "반려된"} 사진이 없어요.
          </p>
        )}
      </Center>
    </Stack>
  );
}

interface ReviewingCardProps {
  data: ReviewData;
  tab: "approved" | "rejected";
  reload: (clear: boolean) => void;
  notify: (msg: React.ReactNode) => void;
  notifyServerError: () => void;
}

function ReviewingCard({
  data,
  tab,
  reload,
  notify,
  notifyServerError,
}: ReviewingCardProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const status = tab === "approved" ? "rejected" : "approved";
  const statusName = tab === "approved" ? "반려" : "승인";

  const [loading, setLoading] = useState(false);

  const patchStatus = async () => {
    setLoading(true);

    const result = await patchReviewStatus(data.submission_id, status);
    if (result.success) {
      reload(true);
      setLoading(false);
      close();
      return;
    }

    switch (result.status) {
      case 404:
        notify(<p>존재하지 않는 테마/제출 사진이에요!</p>);
        break;
      case 410:
        notify(<p>검수 기간이 종료된 테마예요!</p>);
        break;
      default:
        notifyServerError();
    }

    setLoading(false);
    close();
  };

  return (
    <>
      {/* 모달 영역 */}
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="auto"
        withCloseButton={false}
        padding={0}
      >
        <Stack gap={0}>
          <Image
            src={data.content_url}
            alt=""
            width={390}
            height={312}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          <Group gap={0} grow>
            <UnstyledButton
              className={classes.Button}
              style={{
                backgroundColor:
                  status === "approved" ? "var(--main)" : "var(--gray-8a)",
              }}
              onClick={patchStatus}
            >
              {loading ? (
                <Loader size={24} color="var(--white)" />
              ) : (
                <p>{statusName} 상태로 변경</p>
              )}
            </UnstyledButton>
          </Group>
        </Stack>
      </Modal>

      <Box style={{ position: "relative" }}>
        <Image
          src={data.content_url}
          alt=""
          width={180}
          height={144}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        <UnstyledButton className={classes.MagnifyButton} onClick={open}>
          <Image
            src="/images/ranking/magnify.svg"
            alt="Magnify"
            width={24}
            height={24}
          />
        </UnstyledButton>
      </Box>
    </>
  );
}

interface RetryCardProps {
  loadPage: () => void;
}

function RetryCard({ loadPage }: RetryCardProps) {
  return (
    <Stack
      className={classes.RetryCard}
      align="center"
      justify="center"
      gap={10}
    >
      <p style={{ color: "var(--main)" }}>데이터 로딩 실패!</p>
      <UnstyledButton h={17} onClick={loadPage}>
        <Image
          src="/images/account-setting/retry.svg"
          alt="다시 시도"
          width={55}
          height={16}
        />
      </UnstyledButton>
    </Stack>
  );
}
