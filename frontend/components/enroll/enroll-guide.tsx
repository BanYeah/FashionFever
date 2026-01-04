import { Stack } from "@mantine/core";
import { ModalNoti } from "@/components/modal/model-noti";

interface EnrollNotiProps {
  opened: boolean;
  close: () => void;
}

export function EnrollGuide({ opened, close }: EnrollNotiProps) {
  return (
    <ModalNoti icon="info" opened={opened} close={close}>
      <Stack gap={20}>
        <img src="/images/enroll/guide-bg.png" width={"100%"} />

        <Stack gap={14}>
          <p>마음에 드는 배경색을 선택해 주세요.</p>
          <p>
            단, 테마에 따라 <span style={{ color: "var(--main)" }}>색상</span>
            이나
            <br />
            <span style={{ color: "var(--main)" }}>스크린샷 배경</span>이 제한될
            수 있어요!
            <br />
            <span style={{ color: "var(--gray-8a)", fontSize: "12px" }}>
              *자세한 배경 제한은 공식 카페 내 게시글을 참고해 주세요.
            </span>
          </p>
        </Stack>

        <img src="/images/enroll/guide-ratio.png" width={"100%"} />

        <p>
          스크린샷을 찍은 후,
          <br /> 사진을 <span style={{ color: "var(--main)" }}>5:4 비율</span>에
          맞춰 잘라 주세요!
        </p>

        <img src="/images/enroll/guide-clean.png" width={"100%"} />

        <Stack gap={14}>
          <p>
            주변의 불필요한 부분은 브러시 또는 AI 지우개를 사용하여 깔끔하게
            지운 뒤 등록해 주세요!
          </p>
          <p>
            가이드에 맞지 않는 사진은 아쉽게도
            <br />
            <span style={{ color: "var(--main)" }}>검수 과정에서 제외</span>될
            수 있어요!
          </p>
        </Stack>
      </Stack>
    </ModalNoti>
  );
}
