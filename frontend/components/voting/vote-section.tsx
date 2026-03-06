"use client";

import classes from "./vote-section.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useNotification } from "../notification/notification";
import {
  Box,
  Center,
  Group,
  Stack,
  UnstyledButton,
  Loader,
} from "@mantine/core";
import { AppShellFooter } from "../app-shell/footer";
import { VoteData, VotePayload } from "@/types/api/vote";
import { createVote } from "@/utils/api/vote";
import { HeartRating } from "../common/heart-rating/heartrating";

export function VoteSection({ themeId }: { themeId: string }) {
  const { notify, notifyServerError } = useNotification();

  const [winnerSide, setWinnerSide] = useState<number | null>(null);

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
    setWinnerSide(winner_side);

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
        sub_vote_score1: result.data.sub_vote_score1,
        sub_vote_score2: result.data.sub_vote_score2,
        vote_point: result.data.vote_point,
      };
    });
    setPending(true);
    setLoading(false);

    await new Promise((resolve) => setTimeout(resolve, 4000));

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
              <Group
                className={classes.Overlay}
                align="center"
                justify="space-between"
                pl={30}
                pr={40}
                gap={0}
              >
                <ResultPreview
                  key={data.sub_id1}
                  voteScore={data.sub_vote_score1}
                  winning={winnerSide === 1}
                />
              </Group>
            )}
            <Image
              src={data.sub_content_url1 ?? "/images/content_alt.svg"}
              alt=""
              width={390}
              height={312}
              style={{ width: "100%", height: "auto", display: "block" }}
              loading="eager"
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
              <Group
                className={classes.Overlay}
                align="center"
                justify="space-between"
                pl={30}
                pr={40}
                gap={0}
              >
                <ResultPreview
                  key={data.sub_id2}
                  voteScore={data.sub_vote_score2}
                  winning={winnerSide === 2}
                />
              </Group>
            )}
            <Image
              src={data.sub_content_url2 ?? "/images/content_alt.svg"}
              alt=""
              width={390}
              height={312}
              style={{ width: "100%", height: "auto", display: "block" }}
              loading="eager"
            />
          </div>

          {/* 짙은 회색 수직선 */}
          {!loading && !pending && <Box className={classes.VerticalLine} />}
        </Stack>
      </section>

      <AppShellFooter
        variant="default"
        description={`공감 포인트 ${data?.vote_point ?? 0}`}
      />
    </>
  );
}

interface ResultPreviewProps {
  voteScore?: number;
  winning: boolean;
}

function ResultPreview({ voteScore = 0, winning }: ResultPreviewProps) {
  const profiles = [
    "images/voting/profile-blue.jpg",
    "images/voting/profile-gray.jpg",
    "images/voting/profile-pink.jpg",
  ];

  return (
    <>
      <Stack gap={0}>
        <Image
          src={profiles[Math.floor(Math.random() * profiles.length)]}
          alt=""
          width={100}
          height={100}
        />
        <div className={classes.NameBox}>
          <p>미니니</p>
        </div>
        <HeartRating value={voteScore} unitW={20} unitH={18} />
      </Stack>
      <>
        {winning && (
          <div className={classes.LikeBox}>
            <Image
              src="images/voting/like-1.svg"
              alt=""
              width={70}
              height={97}
            />
          </div>
        )}
      </>
    </>
  );
}
