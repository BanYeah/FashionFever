export async function registerUser(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ minicode }),
      cache: "no-store",
    }
  );

  if (!res.ok) return { success: false, status: res.status };
  else return { success: true };
}

export async function checkUserExist(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/exist/${minicode}`,
    { cache: "no-store" }
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, data };
}

export async function checkJudgeExist(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/judges/exist/${minicode}`,
    { cache: "no-store" }
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, data };
}
