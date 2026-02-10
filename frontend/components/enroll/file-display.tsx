"use client";

import classes from "./file-display.module.css";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { UnstyledButton } from "@mantine/core";

interface FileDisplayProps {
  index: number;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  preview: string;
  setFiles: Dispatch<SetStateAction<(File | string)[]>>;
}

export function FileDisplay({
  index, // 자기 자신의 인덱스
  selectedIndex, // 현재 선택된 파일 인덱스
  setSelectedIndex,
  preview,
  setFiles,
}: FileDisplayProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      return newFiles;
    });

    // 인덱스 보정
    setSelectedIndex((prevIndex) => {
      if (prevIndex === index) return 0;
      if (prevIndex > index) return prevIndex - 1;
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
      {index === selectedIndex && <div className={classes.Highlight}></div>}

      <UnstyledButton onClick={() => setSelectedIndex(index)}>
        <Image
          key={preview}
          src={preview}
          alt=""
          width={200}
          height={160}
          style={{ width: "100%", height: "auto" }}
          loading="eager"
        />
      </UnstyledButton>
    </div>
  );
}
