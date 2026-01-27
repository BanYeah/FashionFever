interface AppShellProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ header, footer, children }: AppShellProps) {
  return (
    <section style={{ minHeight: "100dvh" }}>
      {header}
      <section
        style={{
          paddingBottom: `${footer !== null ? "60px" : "0px"}`,
          zIndex: 100,
        }}
      >
        {children}
      </section>
      {footer}
    </section>
  );
}
