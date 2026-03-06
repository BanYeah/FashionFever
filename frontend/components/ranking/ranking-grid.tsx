"use client";

import classes from "./ranking-grid.module.css";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "@/utils/store/authStore";
import { useNotification } from "../notification/notification";
import {
  Center,
  Box,
  Group,
  Flex,
  SimpleGrid,
  Stack,
  Modal,
  UnstyledButton,
  Loader,
} from "@mantine/core";
import { AppShellFooter } from "../app-shell/footer";
import { HeartRating } from "../common/heart-rating/heartrating";
import { RankingData } from "@/types/api/record";
import { PageMeta } from "@/types/page-meta";
import { getRecordRankings } from "@/utils/api/record";

export function RankingGrid({ themeId }: { themeId: string }) {
  const { notify, notifyServerError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<(RankingData[] | "ERROR")[]>([]);
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

    const result = await getRecordRankings(themeId, page);
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

  const { user } = useAuthStore.getState();
  const userId = user?.account === "user" ? user.user_id : null;
  return (
    <>
      <section
        style={{
          paddingBottom: `${userId ? "60px" : "0px"}`,
          zIndex: 100,
        }}
      >
        <SimpleGrid cols={2} spacing={10} verticalSpacing={30} p={10}>
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
                <RankingCard key={item.content_url} data={item} />
              ));
            }
          })}
        </SimpleGrid>
        <Center ref={observerRef} h={loading ? 144 : 0}>
          {loading && <Loader type="dots" color="var(--main)" />}
        </Center>
      </section>

      {userId && (
        <AppShellFooter
          variant="tabs"
          tabs={["나의 최고 랭킹", "나의 랭킹", "상위 랭킹!"]}
          activeTab={2}
          tabLinks={[
            `/ranking/${userId}/top1?theme_id=${themeId}`,
            `/ranking/${userId}?theme_id=${themeId}`,
            `/ranking?theme_id=${themeId}`,
          ]}
        />
      )}
    </>
  );
}

function RankingCard({ data }: { data: RankingData }) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {/* 모달 영역 */}
      <Modal
        opened={opened}
        onClose={close}
        size="auto"
        centered
        padding={0}
        withCloseButton={false}
      >
        <Image
          src={data.content_url}
          alt=""
          width={390}
          height={312}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </Modal>

      <Stack style={{ position: "relative" }} gap={8}>
        {/* 이미지 영역 */}
        <Box style={{ position: "relative" }}>
          <Image
            src={data.content_url}
            alt=""
            width={180}
            height={144}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          {/* 우측 하단 확대 버튼 */}
          <UnstyledButton className={classes.MagnifyButton} onClick={open}>
            <Image
              src="/images/ranking/magnify.svg"
              alt="Magnify"
              width={24}
              height={24}
            />
          </UnstyledButton>
        </Box>

        {/* 이미지 밖으로 삐져나오는 랭킹 태그 */}
        <Box className={classes.RankTag}>
          <p>#{data.final_rank}</p>
        </Box>

        {/* 하단 정보 영역 */}
        <Group className={classes.CustomHeart} align="center" gap={8} pl={8}>
          <HeartRating value={data.final_score} unitH={22} unitW={25} />
          <p>{data.final_score.toFixed(2)}</p>
        </Group>
      </Stack>
    </>
  );
}

function RetryCard({ loadPage }: { loadPage: () => void }) {
  return (
    <Stack className={classes.RetryCard} align="center" justify="center">
      <p style={{ color: "var(--main)" }}>데이터 로딩 실패!</p>
      <UnstyledButton pb={1} onClick={loadPage}>
        <Image
          src="/images/account-setting/retry.svg"
          alt="다시 시도"
          width={55}
          height={16}
          style={{ display: "block" }}
        />
      </UnstyledButton>
    </Stack>
  );
}
