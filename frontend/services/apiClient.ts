// input: 无
// output: SESSION_EXPIRED_EVENT
// pos: 前端/服务层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
export const SESSION_EXPIRED_EVENT = 'session-expired';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('linguaCraft_token');
  const headers = new Headers(init?.headers);
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Default to JSON content type if not set, but allow overriding (e.g. for FormData)
  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(input, { ...init, headers });

    if (res.status === 401) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      throw new Error('unauthorized');
    }

    return res;
  } catch (error: any) {
    // Re-throw unauthorized errors so they can be caught if needed, 
    // but usually the event listener will handle the UI.
    throw error;
  }
}
