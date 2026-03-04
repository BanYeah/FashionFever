export async function fetchUsers(page: number, minicode: string | null) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/account/users`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, minicode }),
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function fetchJudges(page: number, minicode: string | null) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/account/judges`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, minicode }),
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  return { success: true, ...data };
}

export async function resetCode(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/account/users/reset-code?minicode=${minicode}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };
  return { success: true };
}

export async function appointJudge(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/account/judges/appoint?minicode=${minicode}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };
  else return { success: true };
}

export async function deleteUser(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/account/users/delete?minicode=${minicode}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };
  return { success: true };
}

export async function expelJudge(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/account/judges/expel?minicode=${minicode}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };
  return { success: true };
}
