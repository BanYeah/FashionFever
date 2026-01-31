import { CreateThemePayload } from "@/types/api/theme";

export async function createThemeSetting(payload: CreateThemePayload) {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("desc", payload.desc);
  if (payload.bg_limit !== null)
    formData.append("bg_limit", String(payload.bg_limit));

  formData.append("enroll_start_at", payload.enroll_start_at);
  formData.append("enroll_end_at", payload.enroll_end_at);
  formData.append("review_start_at", payload.review_start_at);
  formData.append("review_end_at", payload.review_end_at);
  formData.append("vote_start_at", payload.vote_start_at);
  formData.append("vote_end_at", payload.vote_end_at);

  if (payload.reviewer_minicode !== null)
    formData.append("reviewer_minicode", payload.reviewer_minicode);
  payload.judge_minicodes.forEach((code) =>
    formData.append("judge_minicodes", code),
  );

  formData.append("banner", payload.banner);

  const collectionsData = payload.collections.map((col) => {
    const gifts = col.gifts.map((gift, idx) => {
      formData.append("giftImages", gift.file);
      return {
        theme_name: gift.theme_name,
        gift_name: gift.gift_name,
        collection_order: idx + 1,
      };
    });
    return { ...col, gifts };
  });
  formData.append("collections", JSON.stringify(collectionsData));

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/setting`,
    {
      method: "POST",
      body: formData, // FormData 사용 시 Content-Type 헤더 설정 금지
      credentials: "include",
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      status: res.status,
      message: errorData.message || "테마를 저장하는데 실패했습니다.",
    };
  }

  const data = await res.json();
  return { success: true, ...data };
}
