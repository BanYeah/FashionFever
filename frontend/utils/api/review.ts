export async function getReviews(
  theme_id: string,
  page: number,
  status: "approved" | "rejected",
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${theme_id}?page=${page}&status=${status}`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getReviewPending(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${theme_id}/pending`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getReviewStatus(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${theme_id}/status`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function patchReviewStatus(
  submission_id: string,
  status: "approved" | "rejected",
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${submission_id}?status=${status}`,
    {
      method: "PATCH",
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };
  return { success: true };
}
