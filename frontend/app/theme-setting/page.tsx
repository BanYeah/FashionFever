"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Flex,
  Stack,
  UnstyledButton,
  Divider,
  useCombobox,
} from "@mantine/core";
import { EnrollFooter } from "@/components/app-shell/enroll-footer";
import { ModalNoti } from "@/components/common/modal/model-noti";
import { AddFileButton } from "@/components/common/add-file-button/add-file-button";
import { BgLimitCombobox } from "@/components/theme-setting/bg-limit-combobox";
import { ThemeInput } from "@/components/theme-setting/theme-input";
import { ThemeSchedule } from "@/components/theme-setting/theme-schedule";
import {
  AccountMultiSelect,
  AccountSelect,
} from "@/components/theme-setting/account-select";
import {
  GiftSetting_t,
  ThemeGifts,
} from "@/components/theme-setting/theme-gifts";
import { enrollBgColor } from "@/types/enroll-bg-color";

export default function ThemeSettingPage() {
  /* 알림창 */
  const [notiMessage, setNotiMessage] = useState<React.ReactNode>(null);
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);

  /* 테마 배너 */
  const [banner, setBanner] = useState<File[]>([]); // File[] 이지만 단일 File 저장용으로 사용
  const [bannerPreview, setBannerPreview] = useState<string[]>([]);

  useEffect(() => {
    const urls = banner.map((file) => URL.createObjectURL(file));
    setBannerPreview(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [banner]);

  /* 테마 이름/설명, 배경색 제한 */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [bgLimit, setBgLimit] = useState<string | null>("배경 제한 없음");

  const enrollBgLimit = [
    { name: "테마 시그니처", color: "var(--black)" },
    ...enrollBgColor,
    { name: "배경 제한 없음", color: "var(--gray-b3)" },
  ];

  /* 일정 관리 */
  const [enrollStart, setEnrollStart] = useState<string | null>(null);
  const [enrollEnd, setEnrollEnd] = useState<string | null>(null);
  const [reviewStart, setReviewStart] = useState<string | null>(null);
  const [reviewEnd, setReviewEnd] = useState<string | null>(null);
  const [voteStart, setVoteStart] = useState<string | null>(null);
  const [voteEnd, setVoteEnd] = useState<string | null>(null);

  /* 검수/심사 계정 관리 */
  const [reviewer, setReviewer] = useState<string | null>("");
  const [judge, setJudge] = useState<string[]>([]);

  /* 선물 목록 관리 */
  const themeGiftsRef = useRef<any>(null);
  const handleSave = async () => {
    const giftsData: GiftSetting_t[] =
      themeGiftsRef.current?.getAllData() || [];

    const finalPayload = {
      themeName: name,
      themeDescription: description,
      themeBanner: banner[0] || null, // 파일 객체
      bgLimit: bgLimit,
      schedule: {
        enrollStart,
        enrollEnd,
        reviewStart,
        reviewEnd,
        voteStart,
        voteEnd,
      },
      accounts: {
        reviewer,
        judge,
      },
      giftSettings: giftsData, // 수집한 선물 데이터 포함
    };

    // 유효성 검사 필요! (예. 테마 배너가 없음 등)
  };

  const handleServerError = () => {
    setNotiMessage(
      <p>
        서버와의 통신에 실패했습니다.
        <br /> 잠시 후 다시 시도해주세요.
      </p>,
    );
    openNoti();
  };

  return (
    <>
      <ModalNoti icon="alert" opened={notiOpened} close={closeNoti}>
        {notiMessage}
      </ModalNoti>

      <section style={{ paddingBottom: "60px" }}>
        <Stack m={10} mb={60} gap={0}>
          {/* 테마 배너 */}
          <Flex
            align="center"
            justify="center"
            style={{ position: "relative", aspectRatio: 5 / 2 }}
          >
            {banner.length == 0 || !bannerPreview[0] ? (
              <AddFileButton
                icon="/images/add-file-button/add-file.svg"
                size={40}
                fileRatio="5:2"
                setFiles={setBanner}
              />
            ) : (
              <>
                <UnstyledButton
                  w={28}
                  h={28}
                  style={{ position: "absolute", top: 0, right: 0 }}
                  onClick={() => setBanner([])}
                >
                  <Image
                    style={{ display: "block" }}
                    src="/images/add-file-button/delete-file.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                </UnstyledButton>
                <Image
                  key={bannerPreview[0]}
                  src={bannerPreview[0]}
                  alt=""
                  width={390}
                  height={156}
                  style={{ width: "100%", height: "auto" }}
                />
              </>
            )}
          </Flex>
          <Divider mt={10} size={1} color={"var(--gray-d9)"} />

          {/* 테마 이름/설명, 배경색 제한 */}
          <ThemeInput
            mt={16}
            label="테마 이름"
            placeholder=""
            value={name}
            setValue={setName}
          />
          <ThemeInput
            mt={22}
            label="테마 설명"
            placeholder="~ 미니는 누구?"
            value={description}
            setValue={setDescription}
          />
          <BgLimitCombobox
            mt={22}
            combobox={combobox}
            enrollBgLimit={enrollBgLimit}
            bgLimit={bgLimit}
            setBgLimit={setBgLimit}
          />
          <Divider mt={10} size={1} color={"var(--gray-d9)"} />

          {/* 일정 관리 */}
          <ThemeSchedule
            enrollStart={enrollStart}
            setEnrollStart={setEnrollStart}
            enrollEnd={enrollEnd}
            setEnrollEnd={setEnrollEnd}
            reviewStart={reviewStart}
            setReviewStart={setReviewStart}
            reviewEnd={reviewEnd}
            setReviewEnd={setReviewEnd}
            voteStart={voteStart}
            setVoteStart={setVoteStart}
            voteEnd={voteEnd}
            setVoteEnd={setVoteEnd}
          />
          <Divider size={1} color={"var(--gray-d9)"} />

          {/* 검수/심사 계정 관리 */}
          <AccountSelect
            mt={16}
            label="검수 계정 관리"
            value={reviewer}
            setValue={setReviewer}
            handleServerError={handleServerError}
          />
          <AccountMultiSelect
            mt={22}
            label="심사 계정 관리"
            value={judge}
            setValue={setJudge}
            handleServerError={handleServerError}
          />
          <Divider mt={10} size={1} color={"var(--gray-d9)"} />
          <ThemeGifts ref={themeGiftsRef} />
          <Divider size={1} color={"var(--gray-d9)"} />
        </Stack>
      </section>
      <EnrollFooter text="저 장 하 기" disabled={false} onClick={() => {}} />
    </>
  );
}
