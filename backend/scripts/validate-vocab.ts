import fs from 'fs'
import path from 'path'
function main(){ const file = path.join(process.cwd(), 'data', 'vocab', 'index.json'); const ok = fs.existsSync(file); console.log('index exists', ok) }
main()
