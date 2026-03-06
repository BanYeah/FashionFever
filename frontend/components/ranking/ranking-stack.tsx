"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/utils/store/authStore";
import { useNotification } from "../notification/notification";
import { Stack, Loader } from "@mantine/core";
import { AppShellFooter } from "../app-shell/footer";
import { RankingDisplay } from "./ranking-display";
import { GiftReceive } from "./gift-receive";
import { RecordData } from "@/types/api/record";
import { getRecordTop1 } from "@/utils/api/record";

export function RankingStack({ themeId }: { themeId: string }) {
  const { notify, notifyServerError } = useNotification();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<RecordData | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setData(null);

      const result = await getRecordTop1(themeId);
      if (result.success) {
        setData(result.data);
        setLoading(false);
        return;
      }

      switch (result.status) {
        case 404:
          break;
        default:
          notifyServerError();
      }

      setLoading(false);
    })();
  }, [themeId]);

  const centerStyle = {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };

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
        {!loading && data && (
          <Stack gap={30} m={12}>
            <RankingDisplay data={data} />
            <GiftReceive data={data.collection} />
          </Stack>
        )}
        {!loading && !data && (
          <p style={{ color: "var(--gray-b3)", ...centerStyle }}>
            참가 기록이 없어요!
          </p>
        )}
        {loading && (
          <Loader type="dots" color="var(--main)" style={{ ...centerStyle }} />
        )}
      </section>

      {userId && (
        <AppShellFooter
          variant="tabs"
          tabs={["나의 최고 랭킹", "나의 랭킹", "상위 랭킹!"]}
          activeTab={0}
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
