import { VotePayload } from "@/types/api/vote";

export async function createVote(theme_id: string, payload: VotePayload) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/votes/${theme_id}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getVoteStatus(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/votes/${theme_id}`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}
