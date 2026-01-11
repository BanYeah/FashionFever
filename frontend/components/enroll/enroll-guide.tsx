import Image from "next/image";
import { Stack } from "@mantine/core";
import { ModalNoti } from "@/components/common/modal/model-noti";

interface EnrollNotiProps {
  opened: boolean;
  close: () => void;
}

export function EnrollGuide({ opened, close }: EnrollNotiProps) {
  return (
    <ModalNoti icon="info" opened={opened} close={close}>
      <Stack gap={20}>
        <Image
          src="/images/enroll/guide-save.png"
          alt=""
          width={300}
          height={264}
          style={{ width: "100%", height: "auto" }}
        />

        <p>
          스타일을 꼭 <span style={{ color: "var(--main)" }}>앨범에 저장</span>
          해 주세요.
          <br />
          <span style={{ color: "var(--gray-8a)", fontSize: "12px" }}>
            *선물 전달 전, 본인 확인 및 도용 여부를 확인할 수 있어요.
          </span>
        </p>

        <Image
          src="/images/enroll/guide-bg.png"
          alt=""
          width={300}
          height={472}
          style={{ width: "100%", height: "auto" }}
        />

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

        <Image
          src="/images/enroll/guide-ratio.png"
          alt=""
          width={300}
          height={438}
          style={{ width: "100%", height: "auto" }}
        />

        <p>
          스크린샷을 찍은 후,
          <br /> 사진을 <span style={{ color: "var(--main)" }}>5:4 비율</span>에
          맞춰 잘라 주세요!
        </p>

        <Image
          src="/images/enroll/guide-clean.png"
          alt=""
          width={300}
          height={240}
          style={{ width: "100%", height: "auto" }}
        />

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
