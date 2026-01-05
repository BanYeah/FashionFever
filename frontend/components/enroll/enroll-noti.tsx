import { Stack } from "@mantine/core";
import { ModalNoti } from "../common/modal/model-noti";

interface EnrollNotiProps {
  variant: "success" | "fail" | "expired";
  opened: boolean;
  close: () => void;
}

export function EnrollNoti({ variant, opened, close }: EnrollNotiProps) {
  if (variant === "success")
    return (
      <ModalNoti icon="alert" opened={opened} close={close}>
        <Stack gap={20}>
          <p>성공적으로 참가되었어요!</p>
          <p>
            참가 기간 종료 전까지
            <br />
            자유롭게 패션 수정이 가능하니 참고해주세요.
          </p>
        </Stack>
      </ModalNoti>
    );
  else if (variant === "fail")
    return (
      <ModalNoti icon="alert" opened={opened} close={close}>
        <Stack gap={20}>
          <p>참가 신청에 실패했어요.</p>
          <p>
            잠시 후 다시 시도해 주세요.
            <br />
            문제가 지속되면 공식 카페 내 게시글로 문의주세요.
          </p>
        </Stack>
      </ModalNoti>
    );
  else
    return (
      <ModalNoti icon="alert" opened={opened} close={close}>
        <Stack gap={20}>
          <p>참가 기간이 종료되었어요!</p>
          <p>
            아쉽게도 이번 테마는 마감되었어요.
            <br />
            다음 패션 피버를 기대해 주세요!
          </p>
        </Stack>
      </ModalNoti>
    );
}
