import "@mantine/dates/styles.css";
import classes from "./theme-schedule.module.css";
import { Dispatch, SetStateAction } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Group, Stack, Select, UnstyledButton, Collapse } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ThemeStatus } from "@/types/theme-status";
import { DateTimeInfo, FormatDateUtil } from "@/utils/fomat-date.util";

interface ThemeScheduleProps {
  status: ThemeStatus;
  enrollStart: DateTimeInfo;
  setEnrollStart: Dispatch<SetStateAction<DateTimeInfo>>;
  reviewStart: DateTimeInfo;
  setReviewStart: Dispatch<SetStateAction<DateTimeInfo>>;
  voteStart: DateTimeInfo;
  setVoteStart: Dispatch<SetStateAction<DateTimeInfo>>;
  voteEnd: DateTimeInfo;
  setVoteEnd: Dispatch<SetStateAction<DateTimeInfo>>;
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

  const getDiff = (
    start: DateTimeInfo,
    end: DateTimeInfo,
    offset: number = 0,
  ) => {
    const diff = FormatDateUtil.diff(start, end, offset);
    if (diff === "") return "";
    return `(${diff})`;
  };

  const getEnd = (dateTime: DateTimeInfo, offset: number = 0): DateTimeInfo => {
    if (dateTime.date === null) return { date: null, time: "23:59:59" };

    const date = new Date(FormatDateUtil.timezone(dateTime)!);
    return FormatDateUtil.dateTime(date.toISOString(), offset);
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
              참가 기간 <span>{getDiff(enrollStart, reviewStart)}</span>
            </p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                // disabled={status.isAfterStart("ENROLLING")}
                value={enrollStart}
                setValue={setEnrollStart}
              />
              <p>~</p>
              <ThemeDateInput
                disabled={true}
                value={getEnd(reviewStart, -1000)}
              />
            </Group>
          </Stack>
          <Stack gap={9}>
            <p className={classes.Label}>
              검수 기간 <span>{getDiff(reviewStart, voteStart)}</span>
            </p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                // disabled={status.isAfterStart("REVIEWING")}
                value={reviewStart}
                setValue={setReviewStart}
              />
              <p>~</p>
              <ThemeDateInput
                disabled={true}
                value={getEnd(voteStart, -1000)}
              />
            </Group>
          </Stack>
          <Stack gap={9}>
            <p className={classes.Label}>
              투표 기간 <span>{getDiff(voteStart, voteEnd, 1000)}</span>
            </p>
            <Group gap={6} wrap="nowrap">
              <ThemeDateInput
                // disabled={status.isAfterStart("VOTE_READY")}
                value={voteStart}
                setValue={setVoteStart}
              />
              <p>~</p>
              <ThemeDateInput
                // disabled={status.isAfterStart("COMPLETE_READY")}
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
  value: DateTimeInfo;
  setValue?: Dispatch<SetStateAction<DateTimeInfo>>;
}
function ThemeDateInput({ disabled, value, setValue }: ThemeDateInputProps) {
  return (
    <div style={{ position: "relative", flexGrow: 1 }}>
      <DateInput
        classNames={{
          input: classes.DateInputInput,
        }}
        disabled={disabled}
        value={value.date}
        onChange={(value: string | null) => {
          setValue?.((prev) => {
            return { ...prev, date: value };
          });
        }}
        valueFormat="YYYY. MM. DD."
        firstDayOfWeek={0}
        popoverProps={{
          withinPortal: true, // 달력을 DOM 최상단으로 보냄
          shadow: "md",
        }}
      />
      {value.date && (
        <div
          className={classes.Time}
          style={{
            color: disabled ? "var(--disabled-over)" : "var(--gray-8a)",
          }}
        >
          <p>(</p>
          <Select
            classNames={{
              input: classes.SelectInput,
              options: classes.SelectOptions,
              option: classes.SelectOption,
            }}
            styles={{
              dropdown: {
                padding: "5px 0px",
              },
            }}
            disabled={disabled}
            data={Array.from({ length: 24 }, (_, i) =>
              i.toString().padStart(2, "0"),
            )}
            value={value.time.slice(0, 2)}
            onChange={(value: string | null) => {
              if (value)
                setValue?.((prev) => {
                  return { ...prev, time: value + prev.time.slice(2) };
                });
            }}
            rightSection={null}
            comboboxProps={{
              width: 56,
              position: "bottom",
            }}
          />
          <p>{value.time.slice(2)})</p>
        </div>
      )}
    </div>
  );
}
