"use client";

import classes from "./reviewing.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useNotification } from "../notification/notification";
import { Stack, Group, UnstyledButton, Loader } from "@mantine/core";
import { ReviewData, ReviewMeta } from "@/types/api/review";
import { getReviewPending, patchReviewStatus } from "@/utils/api/review";

type StatusType = "approved" | "rejected";

export function Reviewing({ themeId }: { themeId: string }) {
  const { notify, notifyServerError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReviewData | null>(null);
  const [meta, setMeta] = useState<ReviewMeta | null>(null);

  const [patching, setPatching] = useState<StatusType | null>(null);

  const loadData = async () => {
    setLoading(true);

    const result = await getReviewPending(themeId);
    if (result.success) {
      setData(result.data);
      setMeta(result.meta);
    } else {
      setData(null);
      setMeta(null);
      notifyServerError();
    }
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, []);

  const patchStatus = async (subId: string, status: StatusType) => {
    setPatching(status);

    const result = await patchReviewStatus(subId, status);
    if (result.success) {
      await loadData();
      setPatching(null);
      return;
    }

    switch (result.status) {
      case 404:
        notify(<p>존재하지 않는 테마/제출 사진이에요!</p>);
        await loadData();
        break;
      case 410:
        notify(<p>검수 기간이 종료된 테마예요!</p>);
        break;
      default:
        notifyServerError();
    }

    setPatching(null);
  };

  return (
    <>
      <div className={classes.CenterWrapper}>
        {loading && <Loader type="dots" color="var(--main)" />}
        {!loading && data && (
          <Stack gap={8}>
            <Image
              className={classes.Image}
              src={data.content_url}
              alt=""
              width={390}
              height={312}
              style={{ width: "100%", height: "auto" }}
              loading="eager"
            />
            <Group gap={8} grow>
              <UnstyledButton
                className={classes.Button}
                style={{ backgroundColor: "var(--gray-8a)" }}
                disabled={patching !== null}
                onClick={() => {
                  patchStatus(data.submission_id, "rejected");
                }}
              >
                {patching === "rejected" ? (
                  <Loader size={24} color="var(--white)" />
                ) : (
                  <p>반려</p>
                )}
              </UnstyledButton>
              <UnstyledButton
                className={classes.Button}
                style={{ backgroundColor: "var(--main)" }}
                disabled={patching !== null}
                onClick={() => {
                  patchStatus(data.submission_id, "approved");
                }}
              >
                {patching === "approved" ? (
                  <Loader size={24} color="var(--white)" />
                ) : (
                  <p>승인</p>
                )}
              </UnstyledButton>
            </Group>
          </Stack>
        )}
        {!loading && !data && (
          <p style={{ color: "var(--gray-b3)" }}>
            축하합니다! 모든 사진의 검수를 완료했어요.
          </p>
        )}
      </div>

      {/* 진행률 */}
      {meta && (
        <div className={classes.ProcessBarWrapper}>
          <div
            className={classes.ProcessBar}
            style={{ width: `${(meta.reviewed / meta.total) * 100}%` }}
          ></div>
        </div>
      )}
    </>
  );
}
