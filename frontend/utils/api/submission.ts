import { SubmissionPayload } from "@/types/api/submission";

export async function createSubmission(
  theme_id: string,
  payload: SubmissionPayload,
) {
  const formData = new FormData();

  let content_file_order = 0;
  const contentData = payload.files.map((file) => {
    if (file instanceof File) {
      formData.append("content_files", file);
      return {
        content_url: null,
        content_file_order: content_file_order++,
      };
    } else {
      return {
        content_url: file,
        content_file_order: null,
      };
    }
  });

  formData.append("contents", JSON.stringify(contentData));

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/submissions/${theme_id}`,
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
      message: errorData.message || "스타일을 저장하는데 실패했습니다.",
    };
  }

  return { success: true };
}

export async function getSubmission(theme_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/submissions/${theme_id}`,
    { cache: "no-store", credentials: "include" },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function patchSubmission(submissionId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/submissions/${submissionId}`,
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
      message: errorData.message || "스타일을 변경하는데 실패했습니다.",
    };
  }

  return { success: true };
}
