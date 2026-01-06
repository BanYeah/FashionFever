import "@mantine/dates/styles.css";
import classes from "./theme-schedule.module.css";
import { Dispatch, SetStateAction } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Group, Stack, UnstyledButton, Collapse } from "@mantine/core";
import { DateInput } from "@mantine/dates";

interface ThemeScheduleProps {
  enrollStart: string | null;
  setEnrollStart: Dispatch<SetStateAction<string | null>>;
  enrollEnd: string | null;
  setEnrollEnd: Dispatch<SetStateAction<string | null>>;
  reviewStart: string | null;
  setReviewStart: Dispatch<SetStateAction<string | null>>;
  reviewEnd: string | null;
  setReviewEnd: Dispatch<SetStateAction<string | null>>;
  voteStart: string | null;
  setVoteStart: Dispatch<SetStateAction<string | null>>;
  voteEnd: string | null;
  setVoteEnd: Dispatch<SetStateAction<string | null>>;
}

export function ThemeSchedule({
  enrollStart,
  setEnrollStart,
  enrollEnd,
  setEnrollEnd,
  reviewStart,
  setReviewStart,
  reviewEnd,
  setReviewEnd,
  voteStart,
  setVoteStart,
  voteEnd,
  setVoteEnd,
}: ThemeScheduleProps) {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <>
      <UnstyledButton className={classes.Button} onClick={toggle}>
        <p>일정 관리</p>
      </UnstyledButton>

      <Collapse className={classes.Collapse} in={opened}>
        <Stack gap={16}>
          <Stack gap={9}>
            <p className={classes.Label}>참가 기간</p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                variant="start"
                value={enrollStart}
                setValue={setEnrollStart}
              />
              <p>~</p>
              <ThemeDateInput
                variant="end"
                value={enrollEnd}
                setValue={setEnrollEnd}
              />
            </Group>
          </Stack>
          <Stack gap={9}>
            <p className={classes.Label}>검수 기간</p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                variant="start"
                value={reviewStart}
                setValue={setReviewStart}
              />
              <p>~</p>
              <ThemeDateInput
                variant="end"
                value={reviewEnd}
                setValue={setReviewEnd}
              />
            </Group>
          </Stack>
          <Stack gap={9}>
            <p className={classes.Label}>투표 기간</p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                variant="start"
                value={voteStart}
                setValue={setVoteStart}
              />
              <p>~</p>
              <ThemeDateInput
                variant="end"
                value={voteEnd}
                setValue={setVoteEnd}
              />
            </Group>
          </Stack>
        </Stack>
      </Collapse>
    </>
  );
}

interface ThemeDateInputProps {
  variant: "start" | "end";
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
}
function ThemeDateInput({ variant, value, setValue }: ThemeDateInputProps) {
  return (
    <div style={{ position: "relative", flexGrow: 1 }}>
      <DateInput
        classNames={{
          input: classes.DateInputInput,
        }}
        value={value}
        onChange={setValue}
        valueFormat="YYYY MM DD"
        popoverProps={{
          withinPortal: true, // 달력을 DOM 최상단으로 보냄
          shadow: "md",
        }}
      />
      {value && (
        <div className={classes.Time}>
          <p>({variant === "start" ? "00:00:00" : "23:59:59"})</p>
        </div>
      )}
    </div>
  );
}
