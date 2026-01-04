import { Stack } from "@mantine/core";
import { GiftDisplay } from "./gift-display";

export function GiftCollection() {
  const pStyle: React.CSSProperties = {
    padding: "0px 6px",
    color: "var(--gray-8a)",
    fontSize: "14px",
    lineHeight: 1.5,
    wordBreak: "keep-all",
  };

  return (
    <Stack mx={15} mt={12} mb={60} gap={10}>
      <GiftDisplay />
      <GiftDisplay />
      <Stack gap={6}>
        <p style={pStyle}>
          아이템은 달성하신{" "}
          <span style={{ color: "var(--main)" }}>
            최고 랭킹의 패션을 기준으로 1개만
          </span>{" "}
          지급됩니다.
        </p>
        <p style={pStyle}>
          또한, 이벤트 상황에 따라 동일한 가치를 지닌 다른 아이템으로 변경될 수
          있는 점 양해 부탁드립니다.
        </p>
      </Stack>
    </Stack>
  );
}
