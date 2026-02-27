"use client";

import classes from "./vote-section.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useNotification } from "../notification/notification";
import { Box, Center, Stack, UnstyledButton, Loader } from "@mantine/core";
import { PointFooter } from "../app-shell/point-footer";
import { VoteData, VotePayload } from "@/types/api/vote";
import { createVote } from "@/utils/api/vote";

export function VoteSection({ themeId }: { themeId: string }) {
  const { notify, notifyServerError } = useNotification();

  const [loading, setLoading] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [data, setData] = useState<VoteData>();

  const loadData = async () => {
    const payload: VotePayload = {
      vote_id: null,
      sub_id1: null,
      sub_id2: null,
      winner_side: null,
    };

    const result = await createVote(themeId, payload);
    if (result.success) {
      setData(result.data);
      return;
    }

    switch (result.status) {
      case 410:
        notify(<p>투표 기간이 종료되었어요!</p>);
        break;
      default:
        notifyServerError();
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  if (!data)
    return (
      <div className={classes.CenterWrapper}>
        <Loader type="dots" color="var(--main)" />
      </div>
    );

  const doVote = async (winner_side: number | null) => {
    if (loading || pending) return; // 중복 처리 방지
    setLoading(true);

    const payload: VotePayload = {
      vote_id: data.vote_id,
      sub_id1: data.sub_id1,
      sub_id2: data.sub_id2,
      winner_side: winner_side,
    };

    const result = await createVote(themeId, payload);
    if (!result.success) {
      setLoading(false);

      switch (result.status) {
        case 410:
          notify(<p>투표 기간이 종료되었어요!</p>);
          break;
        default:
          notifyServerError();
      }
      return;
    }

    setData((prev) => {
      return {
        ...prev!,
        winP1: result.data.winP1,
        winP2: result.data.winP2,
        topP1: result.data.topP1,
        topP2: result.data.topP2,
        vote_point: result.data.vote_point,
      };
    });
    setPending(true);
    setLoading(false);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    setPending(false);
    setData(result.data);
  };

  return (
    <>
      <section style={{ paddingBottom: "60px" }}>
        <Stack gap={12} px={15} py={12} style={{ position: "relative" }}>
          {/* 후보 1 */}
          <div style={{ position: "relative", width: "100%" }}>
            {!loading && !pending && (
              <UnstyledButton
                className={classes.VoteButton}
                onClick={() => doVote(1)}
              >
                <Image
                  src="/images/voting/like.svg"
                  alt=""
                  width={66.7}
                  height={60}
                />
              </UnstyledButton>
            )}
            {loading && (
              <Center className={classes.Overlay}>
                <Loader type="bars" color="var(--white)" h={20} />
              </Center>
            )}
            {pending && (
              <Stack className={classes.Overlay} justify="flex-end" gap={0}>
                <TopImage topP={data.topP1} />
              </Stack>
            )}
            <Image
              src={data.sub_content_url1 ?? "/images/content_alt.svg"}
              alt=""
              width={390}
              height={312}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>

          {/* 무승부 버튼 */}
          {!loading && !pending && (
            <UnstyledButton
              className={classes.SameButton}
              onClick={() => doVote(null)}
            >
              <Image
                src="/images/voting/same.svg"
                alt=""
                width={50}
                height={50}
              />
            </UnstyledButton>
          )}

          {/* 후보 2 */}
          <div style={{ position: "relative", width: "100%" }}>
            {!loading && !pending && (
              <UnstyledButton
                className={classes.VoteButton}
                onClick={() => doVote(2)}
              >
                <Image
                  src="/images/voting/like.svg"
                  alt=""
                  width={66.7}
                  height={60}
                />
              </UnstyledButton>
            )}
            {loading && (
              <Center className={classes.Overlay}>
                <Loader type="bars" color="var(--white)" h={20} />
              </Center>
            )}
            {pending && (
              <Stack className={classes.Overlay} gap={0}>
                <TopImage topP={data.topP2} />
              </Stack>
            )}
            <Image
              src={data.sub_content_url2 ?? "/images/content_alt.svg"}
              alt=""
              width={390}
              height={312}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>

          {/* 짙은 회색 수직선 */}
          {!loading && !pending && <Box className={classes.VerticalLine} />}
        </Stack>
      </section>

      <PointFooter point={data?.vote_point} />
    </>
  );
}

function TopImage({ topP }: { topP?: string }) {
  if (!topP || topP === "Novice") {
    return (
      <Image
        src={"/images/voting/novice.svg"}
        alt=""
        width={100}
        height={30}
        style={{ display: "block", margin: "8px 13px" }}
      />
    );
  }

  switch (topP) {
    case "Top 10%":
      return (
        <Image
          src={"/images/voting/top10.svg"}
          alt=""
          width={147}
          height={52}
          style={{ display: "block" }}
        />
      );
    case "Top 30%":
      return (
        <Image
          src={"/images/voting/top30.svg"}
          alt=""
          width={147}
          height={52}
          style={{ display: "block" }}
        />
      );
    default:
      return (
        <Image
          src={"/images/voting/top50.svg"}
          alt=""
          width={124}
          height={30}
          style={{ display: "block", margin: "8px 13px" }}
        />
      );
  }
}
