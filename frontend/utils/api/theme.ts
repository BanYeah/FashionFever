import { ThemePayload } from "@/types/api/theme";

export async function getThemes(page: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes?page=${page}`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getThemeHeader(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/${theme_id}/header`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getThemeGifts(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/${theme_id}/gift`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getThemeStatus(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/${theme_id}/status`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

/* Theme Setting */
function themeFormData(payload: ThemePayload): FormData {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("desc", payload.desc);
  if (payload.bg_limit !== null)
    formData.append("bg_limit", String(payload.bg_limit));

  if (payload.banner instanceof File) formData.append("banner", payload.banner);
  else formData.append("banner_url", payload.banner);

  formData.append("enroll_start_at", payload.enroll_start_at);
  formData.append("review_start_at", payload.review_start_at);
  formData.append("vote_start_at", payload.vote_start_at);
  formData.append("complete_start_at", payload.complete_start_at);

  if (payload.reviewer_minicode !== null)
    formData.append("reviewer_minicode", payload.reviewer_minicode);
  payload.judge_minicodes.forEach((code) =>
    formData.append("judge_minicodes", code),
  );

  let gift_file_order = 0;
  const collectionsData = payload.collections.map((collection) => {
    const gifts = collection.gifts.map((gift) => {
      if (gift.gift_file instanceof File) {
        formData.append("gift_files", gift.gift_file);
        return {
          theme_name: gift.theme_name,
          gift_name: gift.gift_name,
          gift_url: null,
          gift_file_order: gift_file_order++,
        };
      } else {
        return {
          theme_name: gift.theme_name,
          gift_name: gift.gift_name,
          gift_url: gift.gift_file,
          gift_file_order: null,
        };
      }
    });

    return { ...collection, gifts };
  });
  formData.append("collections", JSON.stringify(collectionsData));

  return formData;
}

export async function createThemeSetting(payload: ThemePayload) {
  const formData = themeFormData(payload);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/setting`,
    {
      method: "POST",
      body: formData, // FormData 사용 시 Content-Type 헤더 설정 금지
      cache: "no-store",
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

export async function getThemeSettings(page: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/setting?page=${page}`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function getThemeSetting(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/${theme_id}/setting`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function patchThemeSetting(
  theme_id: string,
  payload: ThemePayload,
) {
  const formData = themeFormData(payload);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/${theme_id}/setting`,
    {
      method: "PATCH",
      body: formData, // FormData 사용 시 Content-Type 헤더 설정 금지
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      status: res.status,
      message: errorData.message || "테마를 수정하는데 실패했습니다.",
    };
  }

  const data = await res.json();
  return { success: true, ...data };
}

export async function deleteThemeSetting(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/themes/${theme_id}/setting`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      status: res.status,
      message: errorData.message || "테마를 삭제하는데 실패했습니다.",
    };
  }

  return { success: true };
}
