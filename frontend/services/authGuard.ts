// input: 无
// output: forceLogout
// pos: 前端/服务层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
export function forceLogout() {
  try {
    localStorage.removeItem('linguaCraft_token')
    localStorage.removeItem('linguaCraft_refresh')
  } catch {}
  try {
    window.dispatchEvent(new Event('force-logout'))
  } catch {}
}
