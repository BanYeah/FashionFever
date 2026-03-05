import { LoginShell } from "@/components/login/login-shell";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LoginShell>{children}</LoginShell>;
}
