interface ThemeInfo {
  theme_id: string;
  status: string;
}

export class PurgeCacheUtil {
  static async imageUser(userId: string) {
    const prefixes = [
      `${process.env.R2_PUBLIC_ENDPOINT}/submission/${userId}/`,
    ];

    const url = `https://api.cloudflare.com/client/v4/zones/${process.env.CACHE_ZONE_ID}/purge_cache`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CACHE_SECRET_ACCESS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefixes: prefixes,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData);
    }
  }

  static async imageTheme(themeId: string) {
    const prefixes = [`${process.env.R2_PUBLIC_ENDPOINT}/theme/${themeId}/`];

    const url = `https://api.cloudflare.com/client/v4/zones/${process.env.CACHE_ZONE_ID}/purge_cache`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CACHE_SECRET_ACCESS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefixes: prefixes,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData);
    }
  }

  static async apiTheme(themes: ThemeInfo[]) {
    if (themes.length === 0) return;

    /* GET /schedules/timeline
       GET /schedules/voting-now
       GET /themes */
    const files = [
      `${process.env.API_PREFIX}/schedules/timeline`,
      `${process.env.API_PREFIX}/schedules/voting-now`,
      `${process.env.API_PREFIX}/themes?page=1`,
      `${process.env.API_PREFIX}/themes?page=2`,
    ];

    /* GET /themes/:theme_id/header
       GET /themes/:theme_id/gift */
    const enrolling = themes
      .filter(
        (row: ThemeInfo) =>
          row.status === 'ENROLLING' || row.status === 'DELETE',
      ) // updated to 'ENROLLING'
      .map((row: ThemeInfo) => row.theme_id);
    for (const themeId of enrolling) {
      files.push(`${process.env.API_PREFIX}/themes/${themeId}/header`);
      files.push(`${process.env.API_PREFIX}/themes/${themeId}/gift`);
    }

    /* GET /records/:theme_id/ranking */
    const complete = themes
      .filter(
        (row: ThemeInfo) =>
          row.status === 'COMPLETE' || row.status === 'DELETE',
      ) // updated to 'COMPLETE'
      .map((row: ThemeInfo) => row.theme_id);
    for (const themeId of complete) {
      files.push(`${process.env.API_PREFIX}/records/${themeId}/ranking`);
    }

    /* GET /themes/:theme_id/status */
    const updated = themes.map((row: ThemeInfo) => row.theme_id);
    for (const themeId of updated)
      files.push(`${process.env.API_PREFIX}/themes/${themeId}/status`);

    const url = `https://api.cloudflare.com/client/v4/zones/${process.env.CACHE_ZONE_ID}/purge_cache`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CACHE_SECRET_ACCESS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: files,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData);
    }
  }
}
