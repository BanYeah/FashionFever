"use client";

import classes from "./login-input.module.css";
import React, { useState } from "react";
import { Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { LoginInputBase } from "./login-input-base";
import { ModalNoti } from "../common/modal/model-noti";
import { ModalGoBack } from "../common/modal/modal-go-back";

export function LoginInput() {
  const regex = /^[a-z0-9]{5,7}$/;
  const [minicode, setMinicode] = useState("");

  const [isEnter, setIsEnter] = useState(false);
  const [entercode, setEntercode] = useState("");

  const [notiMessage, setNotiMessage] = useState<React.ReactNode>(null);
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);
  const [agreeOpened, { open: openAgree, close: closeAgree }] =
    useDisclosure(false);

  const handleMinicode = () => {
    if (minicode === "admin_") {
      setIsEnter(true); // 입장코드 입력창 등장
    } else if (minicode.startsWith("judge_")) {
      if (regex.test(minicode.slice(6))) {
        // 해당 미니코드의 심사위원이 있는지 확인
        // (1) 200 OK
        // setIsEnter(true); // 입장코드 입력창 등장

        // (2) 401 Unauthorized
        setNotiMessage(<p>심사위원으로 임명되지 않은 미니예요!</p>);
        openNoti();
      } else {
        setNotiMessage(<p>유효하지 않은 형식의 미니코드예요!</p>);
        openNoti();
      }
    } else {
      if (regex.test(minicode)) {
        // 해당 미니코드의 유저가 있는지 확인
        // (1) 200 OK
        // setIsEnter(true); // 입장코드 입력창 등장

        // (2) 404 Not Found
        openAgree(); // 정보 제공 및 활용 동의 안내
      } else {
        setNotiMessage(<p>유효하지 않은 형식의 미니코드예요!</p>);
        openNoti();
      }
    }
  };

  const handleEntercode = () => {
    if (minicode === "admin_") {
      // 어드민 로그인
    } else if (minicode.startsWith("judge_")) {
      // 심사위원 로그인
    } else {
      // 유저 로그인
    }
  };

  return (
    <>
      <ModalNoti icon="alert" opened={notiOpened} close={closeNoti}>
        {notiMessage}
      </ModalNoti>

      <ModalGoBack
        title="정보 제공 및 활용 동의 안내"
        go="참여하기"
        back="그만두기"
        opened={agreeOpened}
        onGo={() => {
          setIsEnter(true); // 입장코드 입력창 등장
          closeAgree();
        }}
        close={closeAgree}
      >
        <>
          <p>
            본 이벤트 참여 시, 원활한 진행을 위해
            <br />
            <span>미니 코드, 코디 사진, 투표 내역</span>이<br />
            기록 및 보관됩니다.
          </p>
          <p>
            이벤트 참여는 이에 동의하신 것으로
            <br /> 간주하오니 이용에 참고 부탁드립니다.
          </p>
        </>
      </ModalGoBack>

      <Stack className={classes.Announce} gap={0}>
        {!isEnter ? (
          <>
            <p>안녕하세요, 반야입니다!</p>
            <p>
              2018년 4월을 끝으로 개최되지 않는 패션 피버를 비슷하게나마 즐기실
              수 있도록 이벤트를 마련했습니다. 그때의 설렘을 다시 만끽하는
              시간이 되길 바랍니다.
            </p>
          </>
        ) : (
          <p>
            <span>입장코드</span>는 패션 피버 운영 계정(미니 코드: oooooo)으로
            친구 신청을 주시면, 확인 후 1:1 메세지로 보내드립니다.
          </p>
        )}
      </Stack>
      <Stack align="stretch" mt={16} mb={16} gap={12}>
        <LoginInputBase
          placeholder="미니코드 입력"
          value={minicode}
          disabled={isEnter}
          onChange={(e) => setMinicode(e.target.value)}
          rightButton={!isEnter}
          onClick={handleMinicode}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleMinicode();
          }}
        />
        {isEnter && (
          <LoginInputBase
            placeholder="입장코드 입력"
            value={entercode}
            onChange={(e) => setEntercode(e.target.value)}
            rightButton
            onClick={handleEntercode}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleEntercode();
            }}
          />
        )}
      </Stack>
    </>
  );
}
