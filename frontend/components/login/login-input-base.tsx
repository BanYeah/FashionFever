import classes from "./login-input-base.module.css";
import Image from "next/image";
import { Input, UnstyledButton } from "@mantine/core";

interface LoginInputBaseProps {
  disabled?: boolean;
  placeholder: string;
  rightButton?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: () => void;
}

export function LoginInputBase({
  disabled,
  placeholder,
  rightButton,
  value,
  onChange,
  onKeyDown,
  onClick,
}: LoginInputBaseProps) {
  return (
    <Input
      classNames={{
        wrapper: classes.InputWrapper,
        input: classes.Input,
        section: classes.InputSection,
      }}
      variant="unstyled"
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      maxLength={13}
      rightSection={
        rightButton ? (
          <UnstyledButton className={classes.Button} onClick={onClick}>
            <Image
              src="/images/login/arrow-right.svg"
              alt=""
              width={24}
              height={24}
            />
          </UnstyledButton>
        ) : null
      }
      rightSectionWidth={rightButton ? 60 : 0}
      rightSectionPointerEvents={rightButton ? "all" : "none"}
    />
  );
}
