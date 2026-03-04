import { useAuthStore } from "../store/authStore";

export async function registerUser(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minicode }),
      cache: "no-store",
    },
  );

  if (!res.ok) return { success: false, status: res.status };
  else return { success: true };
}

export async function checkUserExist(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/exist/${minicode}`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };
  return { success: true };
}

export async function checkJudgeExist(minicode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/judge/exist/${minicode}`,
    { cache: "no-store" },
  );

  if (!res.ok) return { success: false, status: res.status };
  return { success: true };
}

export async function loginUser(minicode: string, enter_code: string) {
  const { setUser, setInitialized } = useAuthStore.getState();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minicode, enter_code }),
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      status: res.status,
      message: errorData.message,
    };
  }

  const data = await res.json();
  setUser(data.data);
  setInitialized(true);

  return { success: true };
}

export async function loginJudge(minicode: string, enter_code: string) {
  const { setUser, setInitialized } = useAuthStore.getState();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/judge/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minicode, enter_code }),
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      status: res.status,
      message: errorData.message,
    };
  }

  const data = await res.json();
  setUser(data.data);
  setInitialized(true);

  return { success: true };
}

export async function loginAdmin(enter_code: string) {
  const { setUser, setInitialized } = useAuthStore.getState();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/admin/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enter_code }),
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };

  const data = await res.json();
  setUser(data.data);
  setInitialized(true);

  return { success: true };
}

export async function logout() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/logout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!res.ok) return { success: false, status: res.status };

  const { setUser, setInitialized } = useAuthStore.getState();
  setUser(null);
  setInitialized(true);

  return { success: true };
}
