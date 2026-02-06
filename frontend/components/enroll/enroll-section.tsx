"use client";

import { useState, useEffect } from "react";
import { useNotification } from "../notification/notification";
import { useDisclosure } from "@mantine/hooks";
import { Flex, SimpleGrid, Stack } from "@mantine/core";
import { EnrollFooter } from "../app-shell/enroll-footer";
import { ModalGoBack } from "../common/modal/modal-go-back";
import { AddFileButton } from "../common/add-file-button/add-file-button";
import { EnrollNotiMessage } from "./enroll-noti-message";
import { EnrollTopSection } from "./enroll-top-section";
import { FileDisplay } from "./file-display";

interface EnrollSectionProps {
  themeId: string;
  bgLimit: number | null;
}

export function EnrollSection({ themeId, bgLimit }: EnrollSectionProps) {
  const { notify } = useNotification();
  const [opened, { open, close }] = useDisclosure(false);

  const [files, setFiles] = useState<(File | string)[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const urls = files.map((file) => {
      if (file instanceof File) return URL.createObjectURL(file);
      return file;
    });

    setPreviews(urls);

    // clean-up
    return () => {
      urls.forEach((url) => {
        // blob:으로 시작하는 객체 URL만 해제 (기존 네트워크 URL은 제외)
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  return (
    <>
      <ModalGoBack
        title="참가 전 안내"
        go="참가하기"
        back="돌아가기"
        opened={opened}
        onGo={() => {
          close();
          notify(<EnrollNotiMessage variant="fail" />);
        }}
        close={close}
      >
        <>
          <p>
            이벤트 참여 전, <br />
            반드시 가이드를 확인해 주세요!
          </p>
          <p>
            가이드에 맞지 않는 사진은 아쉽게도 <br />
            <span>검수 과정에서 제외</span>될 수 있어요.
          </p>
        </>
      </ModalGoBack>

      <section style={{ paddingBottom: "60px" }}>
        <Stack gap={0}>
          <EnrollTopSection
            bgLimit={bgLimit}
            previews={previews}
            selectedIndex={selectedIndex}
          />
          <SimpleGrid
            cols={2}
            spacing={20}
            verticalSpacing={16}
            px={16}
            py={16}
          >
            {previews.map((preview, index) => (
              <FileDisplay
                key={`${preview}`}
                index={index}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                preview={preview}
                setFiles={setFiles}
              />
            ))}
            {previews.length < 4 && (
              <Flex
                align="center"
                justify="center"
                style={{ aspectRatio: 5 / 4 }}
              >
                <AddFileButton
                  icon="/images/add-file-button/add-file.svg"
                  size={40}
                  fileRatio="5:4"
                  setFiles={setFiles}
                />
              </Flex>
            )}
          </SimpleGrid>
        </Stack>
      </section>

      <EnrollFooter
        text="참 가 하 기"
        disabled={files.length <= 0}
        onClick={open}
      />
    </>
  );
}
