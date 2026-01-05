"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { SimpleGrid, Flex, Stack } from "@mantine/core";
import { AppShell } from "@/components/app-shell/app-shell";
import { EnrollFooter } from "@/components/app-shell/enroll-footer";
import { ModalGoBack } from "@/components/common/modal/modal-go-back";
import { EnrollNoti } from "@/components/enroll/enroll-noti";
import { EnrollTopSection } from "@/components/enroll/enroll-top-section";
import { FileDisplay } from "@/components/enroll/file-display";
import { AddFileButton } from "@/components/common/add-file-button/add-file-button";

export default function EnrollPage() {
  const [enrollOpened, { open: openEnroll, close: closeEnroll }] =
    useDisclosure(false);
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);

  const [index, setIndex] = useState<number>(0); // File Index
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return (
    <>
      <ModalGoBack
        title="참가 전 안내"
        go="참가하기"
        back="돌아가기"
        opened={enrollOpened}
        onGo={() => {
          closeEnroll();
          openNoti();
        }}
        close={closeEnroll}
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

      <EnrollNoti variant="fail" opened={notiOpened} close={closeNoti} />

      <AppShell
        footer={
          <EnrollFooter
            text="참 가 하 기"
            disabled={files.length <= 0}
            onClick={openEnroll}
          />
        }
      >
        <Stack gap={0}>
          <EnrollTopSection index={index} previews={previews} />
          <SimpleGrid
            cols={2}
            spacing={20}
            verticalSpacing={16}
            px={16}
            py={16}
          >
            {previews.map((preview, idx) => (
              <FileDisplay
                key={`${preview}_${idx}`}
                idx={idx}
                index={index}
                setIndex={setIndex}
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
                  icon="/images/enroll/add-file.svg"
                  size={40}
                  setFiles={setFiles}
                />
              </Flex>
            )}
          </SimpleGrid>
        </Stack>
      </AppShell>
    </>
  );
}
