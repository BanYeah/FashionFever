import classes from "./login-input-base.module.css";
import Image from "next/image";
import { Input, PasswordInput, UnstyledButton, Loader } from "@mantine/core";

interface LoginInputBaseProps {
  password?: boolean;
  placeholder: string;
  disabled?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: () => void;
  rightButton?: boolean;
  loading?: boolean;
}

export function LoginInputBase({
  password,
  placeholder,
  disabled,
  value,
  onChange,
  onKeyDown,
  onClick,
  rightButton,
  loading,
}: LoginInputBaseProps) {
  const props = {
    classNames: {
      wrapper: classes.InputWrapper,
      input: classes.Input,
      section: classes.InputSection,
    },
    variant: "unstyled",
    placeholder: placeholder,
    disabled: disabled,
    value: value,
    onChange: onChange,
    onKeyDown: onKeyDown,
    rightSection: rightButton ? (
      <UnstyledButton className={classes.Button} onClick={onClick}>
        {loading ? (
          <Loader size={24} color="var(--main)" />
        ) : (
          <Image
            src="/images/login/arrow-right.svg"
            alt=""
            width={24}
            height={24}
          />
        )}
      </UnstyledButton>
    ) : null,
    rightSectionWidth: rightButton ? 60 : 0,
    rightSectionPointerEvents: (rightButton ? "all" : "none") as "all" | "none",
  };

  if (!password) return <Input {...props} maxLength={13} />;
  else return <PasswordInput {...props} />;
}
