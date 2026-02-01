"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { ThemeGifts } from "@/components/theme-setting/theme-gifts";
import { enrollBgColor } from "@/types/enroll-bg-color";
import { GiftCollection_t } from "@/types/app/theme";
import { GiftCollection, CreateThemePayload } from "@/types/api/theme";
import { convertToWebP, WebPConversionError } from "@/utils/convert-to-webp";
import { createThemeSetting } from "@/utils/api/theme";

export default function ThemeSettingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const themeId = searchParams.get("theme_id");

  /* 알림창 */
  const [notiMessage, setNotiMessage] = useState<React.ReactNode>(null);
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);

  /* 테마 배너 */
  const [banner, setBanner] = useState<File | string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (banner instanceof File) {
      const url = URL.createObjectURL(banner);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url); // clean-up
    }

    setBannerPreview(banner);
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
  const [reviewer, setReviewer] = useState<string | null>(null);
  const [judge, setJudge] = useState<string[]>([]);

  /* 선물 목록 관리 */
  const themeGiftsRef = useRef<any>(null);

  /* 저장하기 */
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const handleSave = async () => {
    const giftsData: GiftCollection_t[] =
      themeGiftsRef.current?.getAllData() || [];

    /* 입력값 유효성 검사 */
    {
      if (name.trim() === "") {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>테마 이름</span>이 입력되지
            않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }
      if (description.trim() === "") {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>테마 설명</span>이 입력되지
            않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }

      if (banner === null) {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>테마 배너 이미지</span>가
            업로드되지 않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }

      if (!enrollStart) {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>참가 시작 시간</span>이
            입력되지 않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }
      if (!enrollEnd) {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>참가 종료 시간</span>이
            입력되지 않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }
      if (!reviewStart) {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>검수 시작 시간</span>이
            입력되지 않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }
      if (!reviewEnd) {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>검수 종료 시간</span>이
            입력되지 않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }
      if (!voteStart) {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>투표 시작 시간</span>이
            입력되지 않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }
      if (!voteEnd) {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>투표 종료 시간</span>이
            입력되지 않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }

      if (giftsData.length === 0) {
        handleNoti(
          <p>
            <span style={{ color: "var(--main)" }}>선물 목록</span>이 입력되지
            않아
            <br /> 저장할 수 없어요!
          </p>,
        );
        return;
      }

      for (const [cid, collection] of giftsData.entries()) {
        if (collection.heart_rate === 0) {
          handleNoti(
            <p>
              {cid + 1}번 선물 목록에
              <br /> 입력된{" "}
              <span style={{ color: "var(--main)" }}>하트레이트</span> 값을
              확인해 주세요.
              <br /> 0인 상태에서는 저장할 수 없어요!
            </p>,
          );
          return;
        }
        if (collection.gift_total_num === 0) {
          handleNoti(
            <p>
              {cid + 1}번 선물 목록에
              <br /> 입력된{" "}
              <span style={{ color: "var(--main)" }}>아이템 총 개수</span>를
              확인해 주세요.
              <br /> 0인 상태에서는 저장할 수 없어요!
            </p>,
          );
          return;
        }
        if (collection.gifts.length === 0) {
          handleNoti(
            <p>
              {cid + 1}번 선물 목록에
              <br />
              <span style={{ color: "var(--main)" }}>선물</span>이 입력되지 않아
              <br /> 저장할 수 없어요!
            </p>,
          );
          return;
        }

        for (const [gid, gift] of collection.gifts.entries()) {
          if (gift.gift_file === null) {
            handleNoti(
              <p>
                {cid + 1}번 선물 목록의 {gid + 1}번 선물에
                <br />
                <span style={{ color: "var(--main)" }}>선물 이미지</span>가
                업로드되지 않아
                <br /> 저장할 수 없어요!
              </p>,
            );
            return;
          }
          if (gift.theme_name.trim() === "") {
            handleNoti(
              <p>
                {cid + 1}번 선물 목록의 {gid + 1}번 선물에
                <br />
                <span style={{ color: "var(--main)" }}>테마 이름</span>이
                입력되지 않아
                <br /> 저장할 수 없어요!
              </p>,
            );
            return;
          }
          if (gift.gift_name.trim() === "") {
            handleNoti(
              <p>
                {cid + 1}번 선물 목록의 {gid + 1}번 선물에
                <br />
                <span style={{ color: "var(--main)" }}>아이템 이름</span>이
                입력되지 않아
                <br /> 저장할 수 없어요!
              </p>,
            );
            return;
          }
        }
      }
    }

    /* 일정 유효성 검사 */
    const enrollStartDate = new Date(
      enrollStart.replace(" ", "-") + "T00:00:00+09:00",
    );
    const enrollEndDate = new Date(
      enrollEnd.replace(" ", "-") + "T23:59:59+09:00",
    );
    const reviewStartDate = new Date(
      reviewStart.replace(" ", "-") + "T00:00:00+09:00",
    );
    const reviewEndDate = new Date(
      reviewEnd.replace(" ", "-") + "T23:59:59+09:00",
    );
    const voteStartDate = new Date(
      voteStart.replace(" ", "-") + "T00:00:00+09:00",
    );
    const voteEndDate = new Date(voteEnd.replace(" ", "-") + "T23:59:59+09:00");

    const now = new Date();
    if (
      enrollStartDate <= now ||
      enrollEndDate <= now ||
      reviewStartDate <= now ||
      reviewEndDate <= now ||
      voteStartDate <= now ||
      voteEndDate <= now
    ) {
      handleNoti(<p>과거 시점으로는 일정을 등록할 수 없어요!</p>);
      return;
    }

    if (
      !(
        enrollStartDate < enrollEndDate &&
        enrollEndDate <= reviewStartDate &&
        reviewStartDate < reviewEndDate &&
        reviewEndDate <= voteStartDate &&
        voteStartDate < voteEndDate
      )
    ) {
      handleNoti(
        <p>
          시작 시간은 종료 시간보다 빨라야 하며,
          <br /> 각 일정은 이전 일정이 끝난 후 시작되어야 해요!
        </p>,
      );
      return;
    }

    const bgIndex = enrollBgLimit.findIndex((item) => item.name === bgLimit);
    const convertToWebP_GC = async (
      collections: GiftCollection_t[],
    ): Promise<GiftCollection[]> => {
      const result = await Promise.all(
        collections.map(async (collection) => ({
          ...collection,
          gifts: await Promise.all(
            collection.gifts.map(async (gift) => ({
              ...gift,
              gift_file:
                gift.gift_file instanceof File
                  ? await convertToWebP(gift.gift_file)
                  : gift.gift_file,
            })),
          ),
        })),
      );

      // heart_rate 기준 내림차순 정렬
      return result.sort((a, b) => b.heart_rate - a.heart_rate);
    };

    try {
      setSaveLoading(true);
      const payload: CreateThemePayload = {
        name: name,
        desc: description,
        bg_limit: 0 <= bgIndex && bgIndex <= 10 ? bgIndex : null,
        banner: banner instanceof File ? await convertToWebP(banner) : banner,
        enroll_start_at: enrollStartDate.toISOString(),
        enroll_end_at: enrollEndDate.toISOString(),
        review_start_at: reviewStartDate.toISOString(),
        review_end_at: reviewEndDate.toISOString(),
        vote_start_at: voteStartDate.toISOString(),
        vote_end_at: voteEndDate.toISOString(),
        reviewer_minicode:
          reviewer === null ? null : reviewer.replace(/^judge_/, ""),
        judge_minicodes: judge.map((code) => code.replace(/^judge_/, "")),
        collections: await convertToWebP_GC(giftsData),
      };

      const result = await createThemeSetting(payload);
      if (!result.success)
        throw new Error(result.message || "서버 처리 중 오류가 발생했습니다.");

      const params = new URLSearchParams(searchParams);
      params.set("theme_id", result.data.theme_id);
      router.push(`${pathname}?${params.toString()}`);

      handleNoti(<p>성공적으로 테마가 저장되었습니다.</p>);
    } catch (e) {
      if (e instanceof WebPConversionError)
        handleNoti(
          <p>
            이미지를 WebP 형식으로 변환하는데 실패했습니다.
            <br /> 잠시 후 다시 시도해주세요.
          </p>,
        );
      else if (e instanceof Error) handleNoti(<p>{e.message}</p>);
      else handleNoti(<p>알 수 없는 오류가 발생했습니다.</p>);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleNoti = (message: React.ReactNode) => {
    setNotiMessage(message);
    openNoti();
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
            {!bannerPreview ? (
              <AddFileButton
                icon="/images/add-file-button/add-file.svg"
                size={40}
                fileRatio="5:2"
                setFile={setBanner}
              />
            ) : (
              <>
                <UnstyledButton
                  w={28}
                  h={28}
                  style={{ position: "absolute", top: 0, right: 0 }}
                  onClick={() => setBanner(null)}
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
                  key={bannerPreview}
                  src={bannerPreview}
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
      <EnrollFooter
        text="저 장 하 기"
        loading={saveLoading}
        disabled={false}
        onClick={handleSave}
      />
    </>
  );
}
