export async function getRecords(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/records/${theme_id}`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getRecordTop1(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/records/${theme_id}/top1`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getRecordRankings(theme_id: string, page: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/records/${theme_id}/ranking?page=${page}`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getRecordStat(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/records/${theme_id}/status`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getDelivery(
  theme_id: string,
  status: "all" | "complete" | "incomplete",
  page: number,
  minicode: string | null,
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/records/${theme_id}/delivery?status=${status}&page=${page}${minicode ? `&minicode=${minicode}` : ""}`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function patchDelivery(
  record_id: string,
  status: "complete" | "incomplete",
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/records/${record_id}/delivery?status=${status}`,
    {
      method: "PATCH",
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };
  return { success: true };
}
