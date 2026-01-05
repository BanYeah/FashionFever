"use client";

import classes from "./file-display.module.css";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { UnstyledButton } from "@mantine/core";

interface FileDisplayProps {
  idx: number;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  preview: string;
  setFiles: Dispatch<SetStateAction<File[]>>;
}

export function FileDisplay({
  idx, // 자기자신의 인덱스
  index, // 현재 선택된 파일 인덱스
  setIndex,
  preview,
  setFiles,
}: FileDisplayProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== idx); // 내 인덱스에 해당하는 파일 제거
      return newFiles;
    });

    // 인덱스 보정
    setIndex((prevIndex) => {
      if (prevIndex === idx) return 0;
      if (prevIndex > idx) return prevIndex - 1;
      return prevIndex;
    });
  };

  return (
    <div className={classes.Wrapper}>
      <UnstyledButton className={classes.DeleteButton} onClick={handleDelete}>
        <Image
          src="/images/add-file-button/delete-file.svg"
          alt=""
          width={28}
          height={28}
        />
      </UnstyledButton>
      {idx === index && <div className={classes.Highlight}></div>}

      <UnstyledButton onClick={() => setIndex(idx)}>
        <Image
          key={preview}
          src={preview}
          alt=""
          width={200}
          height={160}
          style={{ width: "100%", height: "auto" }}
        />
      </UnstyledButton>
    </div>
  );
}
