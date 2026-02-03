import "@mantine/dates/styles.css";
import classes from "./theme-schedule.module.css";
import { Dispatch, SetStateAction } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Group, Stack, UnstyledButton, Collapse } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ThemeStatus } from "@/types/theme-status";

interface ThemeScheduleProps {
  status: ThemeStatus;
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
  status,
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
                // disabled={status.isImminent("ENROLLING")}
                time="00:00:00"
                value={enrollStart}
                setValue={setEnrollStart}
              />
              <p>~</p>
              <ThemeDateInput
                // disabled={status.isImminent("REVIEWING")}
                time="23:59:59"
                value={enrollEnd}
                setValue={setEnrollEnd}
              />
            </Group>
          </Stack>
          <Stack gap={9}>
            <p className={classes.Label}>검수 기간</p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                // disabled={status.isImminent("REVIEWING")}
                time="00:00:00"
                value={reviewStart}
                setValue={setReviewStart}
              />
              <p>~</p>
              <ThemeDateInput
                // disabled={status.isImminent("VOTING")}
                time="23:59:59"
                value={reviewEnd}
                setValue={setReviewEnd}
              />
            </Group>
          </Stack>
          <Stack gap={9}>
            <p className={classes.Label}>투표 기간</p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                // disabled={status.isImminent("VOTING")}
                time="00:00:00"
                value={voteStart}
                setValue={setVoteStart}
              />
              <p>~</p>
              <ThemeDateInput
                // disabled={status.isImminent("COMPLETE")}
                time="23:59:59"
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
  disabled?: boolean;
  time: string;
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
}
function ThemeDateInput({
  disabled,
  time,
  value,
  setValue,
}: ThemeDateInputProps) {
  return (
    <div style={{ position: "relative", flexGrow: 1 }}>
      <DateInput
        classNames={{
          input: classes.DateInputInput,
        }}
        disabled={disabled}
        value={value}
        onChange={setValue}
        valueFormat="YYYY MM DD"
        firstDayOfWeek={0}
        popoverProps={{
          withinPortal: true, // 달력을 DOM 최상단으로 보냄
          shadow: "md",
        }}
      />
      {value && (
        <div
          className={classes.Time}
          style={{
            color: disabled ? "var(--disabled-over)" : "var(--gray-8a)",
          }}
        >
          <p>({time})</p>
        </div>
      )}
    </div>
  );
}
