// input: fs, path
// output: 无
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import fs from 'fs'
import path from 'path'
function main(){ const file = path.join(process.cwd(), 'data', 'vocab', 'index.json'); const ok = fs.existsSync(file); console.log('index exists', ok) }
main()
