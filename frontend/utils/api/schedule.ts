export async function getTimeline() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/schedules/timeline`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getVotingNow() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/schedules/voting-now`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getJudgingNow() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/schedules/judging-now`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}
