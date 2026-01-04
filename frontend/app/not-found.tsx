export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
      }}
    >
      <div
        style={{
          display: "flex",
          columnGap: "16px",
          fontSize: "16px",
        }}
      >
        <p>404</p>
        <p>|</p>
        <p>페이지를 찾을 수 없습니다.</p>
      </div>
    </div>
  );
}
