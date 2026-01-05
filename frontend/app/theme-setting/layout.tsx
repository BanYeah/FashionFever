import { HomeShell } from "@/components/home/home-shell";

export default function ThemeSettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeShell>{children}</HomeShell>;
}
