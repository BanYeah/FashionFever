import classes from "./login-footer.module.css";
import Image from "next/image";

export function LoginFooter() {
  return (
    <div className={classes.Container}>
      <div className={classes.Footer}>
        <Image
          src="/images/login/footline.svg"
          alt="FASHION FEVER"
          width={93}
          height={36}
        ></Image>
      </div>
    </div>
  );
}
