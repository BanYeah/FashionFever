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
  reviewStart: string | null;
  setReviewStart: Dispatch<SetStateAction<string | null>>;
  voteStart: string | null;
  setVoteStart: Dispatch<SetStateAction<string | null>>;
  voteEnd: string | null;
  setVoteEnd: Dispatch<SetStateAction<string | null>>;
}

export function ThemeSchedule({
  status,
  enrollStart,
  setEnrollStart,
  reviewStart,
  setReviewStart,
  voteStart,
  setVoteStart,
  voteEnd,
  setVoteEnd,
}: ThemeScheduleProps) {
  const [opened, { toggle }] = useDisclosure(false);

  const formatDate = (dateStr: string, offset: number = 0) => {
    const [yyyy, mm, dd] = dateStr.split("-").map(Number);
    const date = new Date(yyyy, mm - 1, dd);

    date.setDate(date.getDate() + offset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year} ${month} ${day}`;
  };

  const getDurationString = (
    startDateStr: string | null,
    endDateStr: string | null,
    offset: number = 0,
  ) => {
    if (startDateStr === null || endDateStr === null) return "";

    const start = new Date(startDateStr + "T00:00:00+09:00");
    const end = new Date(endDateStr + "T00:00:00+09:00");

    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return `(${diffInDays + offset}일)`;
  };

  return (
    <>
      <UnstyledButton className={classes.Button} onClick={toggle}>
        <p>일정 관리</p>
      </UnstyledButton>

      <Collapse className={classes.Collapse} in={opened}>
        <Stack gap={16}>
          <Stack gap={9}>
            <p className={classes.Label}>
              참가 기간{" "}
              <span>{getDurationString(enrollStart, reviewStart)}</span>
            </p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                // disabled={status.isImminent("ENROLLING")}
                time="00:00:00"
                value={enrollStart}
                setValue={setEnrollStart}
              />
              <p>~</p>
              <ThemeDateInput
                disabled={true}
                time="23:59:59"
                value={reviewStart ? formatDate(reviewStart, -1) : null}
              />
            </Group>
          </Stack>
          <Stack gap={9}>
            <p className={classes.Label}>
              검수 기간 <span>{getDurationString(reviewStart, voteStart)}</span>
            </p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                // disabled={status.isImminent("REVIEWING")}
                time="00:00:00"
                value={reviewStart}
                setValue={setReviewStart}
              />
              <p>~</p>
              <ThemeDateInput
                disabled={true}
                time="23:59:59"
                value={voteStart ? formatDate(voteStart, -1) : null}
              />
            </Group>
          </Stack>
          <Stack gap={9}>
            <p className={classes.Label}>
              투표 기간 <span>{getDurationString(voteStart, voteEnd, 1)}</span>
            </p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                // disabled={status.isImminent("VOTING")}
                time="00:00:00"
                value={voteStart}
                setValue={setVoteStart}
              />
              <p>~</p>
              <ThemeDateInput
                // disabled={status.isImminent("RESULTING")}
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
  setValue?: Dispatch<SetStateAction<string | null>>;
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
        valueFormat="YYYY. MM. DD."
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
