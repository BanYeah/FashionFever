export async function getRecordStat(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/records/${theme_id}/status`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}
