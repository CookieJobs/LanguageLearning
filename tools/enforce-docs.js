import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const IGNORE_DIRS = new Set(['node_modules', '.git', '.vercel', 'dist', 'build', '.husky'])
const TARGET_EXTS = new Set(['.ts', '.tsx', '.js', '.prisma', '.sql', '.yml', '.yaml', '.toml', '.conf'])

const commentByExt = (fp) => {
  const ext = path.extname(fp).toLowerCase()
  if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.prisma') return '//'
  if (ext === '.sql') return '--'
  if (ext === '.yml' || ext === '.yaml' || ext === '.toml' || ext === '.conf' || fp.endsWith('Dockerfile')) return '#'
  return null
}

const isCodeFile = (fp) => {
  if (fp.endsWith('Dockerfile')) return true
  const ext = path.extname(fp).toLowerCase()
  return TARGET_EXTS.has(ext)
}

const shouldIgnore = (dir) => IGNORE_DIRS.has(path.basename(dir))

const listDir = (dir) => fs.readdirSync(dir, { withFileTypes: true })

const readFile = (fp) => fs.readFileSync(fp, 'utf8')
const writeFile = (fp, content) => fs.writeFileSync(fp, content)

const ensureFolderReadme = (dir, write) => {
  const readmePath = path.join(dir, 'README.md')
  const lines = []
  const rel = path.relative(ROOT, dir)
  const archetype = inferFolderArchetype(rel)
  lines.push(archetype.line1)
  lines.push(archetype.line2)
  lines.push(archetype.line3)
  lines.push('一旦我所属的文件夹有所变化，请更新我。')
  lines.push('')
  lines.push('文件清单：')
  const entries = listDir(dir)
  for (const e of entries) {
    if (e.isDirectory()) continue
    const name = e.name
    const role = inferFileRole(path.join(dir, name), rel)
    const func = inferFileFunction(path.join(dir, name))
    lines.push(`- ${name} — ${role} — ${func}`)
  }
  const target = lines.join('\n') + '\n'
  if (!fs.existsSync(readmePath)) {
    if (write) writeFile(readmePath, target)
    return { created: true, updated: false }
  }
  const cur = readFile(readmePath)
  const hasUpdateStmt = cur.includes('一旦我所属的文件夹有所变化，请更新我。')
  const hasFileList = cur.includes('文件清单：')
  if (hasUpdateStmt && hasFileList) return { created: false, updated: false }
  const next = hasUpdateStmt ? cur.replace('文件清单：', '文件清单：') + '' : cur.trimEnd() + '\n\n' + target
  if (write) writeFile(readmePath, next)
  return { created: false, updated: true }
}

const inferFolderArchetype = (rel) => {
  if (rel.startsWith('frontend/components')) return {
    line1: '组件层：原子 UI 组件集合',
    line2: '数据来源：仅 props/context，无直连 API',
    line3: '关系：被页面组合使用'
  }
  if (rel.startsWith('frontend/pages')) return {
    line1: '页面层：路由页面与组合组件',
    line2: '数据来源：服务与上下文',
    line3: '关系：承载业务流与导航'
  }
  if (rel.startsWith('frontend/services')) return {
    line1: '服务层：前端 API 客户端与 AI 服务',
    line2: '数据来源：后端 / 外部 API',
    line3: '关系：供页面/组件调用'
  }
  if (rel.startsWith('frontend/router')) return {
    line1: '路由层：认证守卫与路由切换',
    line2: '数据来源：上下文与存储',
    line3: '关系：驱动页面访问控制'
  }
  if (rel.startsWith('frontend/contexts')) return {
    line1: '上下文层：全局状态共享',
    line2: '数据来源：服务与本地存储',
    line3: '关系：供组件/页面消费'
  }
  if (rel.startsWith('backend/src/modules')) return {
    line1: '后端模块层：NestJS 模块/控制器/服务',
    line2: '数据来源：Prisma/外部 API/JWT',
    line3: '关系：对外提供 REST 接口'
  }
  if (rel.startsWith('backend/src/common')) return {
    line1: '后端通用层：共享服务与守卫',
    line2: '数据来源：配置与依赖注入',
    line3: '关系：供模块层复用'
  }
  if (rel.startsWith('deploy')) return {
    line1: '部署资产：Docker/NGINX/Compose',
    line2: '数据来源：环境变量与镜像',
    line3: '关系：生产与预发部署'
  }
  if (rel.startsWith('data')) return {
    line1: '数据资产：词表与索引',
    line2: '数据来源：外部数据源与脚本生成',
    line3: '关系：供服务加载与校验'
  }
  return {
    line1: '目录职责：请补充三行架构说明',
    line2: '数据来源：请补充',
    line3: '关系：请补充'
  }
}

const inferFileRole = (fp, relDir) => {
  const name = path.basename(fp)
  if (name.endsWith('.controller.ts')) return '控制器'
  if (name.endsWith('.service.ts')) return '服务'
  if (name.endsWith('.module.ts')) return '模块'
  if (relDir.startsWith('frontend/components')) return '组件'
  if (relDir.startsWith('frontend/pages')) return '页面'
  if (relDir.startsWith('frontend/services')) return '服务'
  if (relDir.startsWith('frontend/router')) return '路由'
  if (relDir.startsWith('frontend/contexts')) return '上下文'
  if (name === 'Dockerfile') return '构建'
  if (name.endsWith('.yml') || name.endsWith('.yaml')) return '编排'
  if (name.endsWith('.sql')) return '迁移/查询'
  if (name.endsWith('.prisma')) return '模型'
  if (name.endsWith('.conf')) return '配置'
  return '文件'
}

const inferFileFunction = (fp) => {
  const name = path.basename(fp)
  if (name.endsWith('.controller.ts')) return '定义路由与处理器'
  if (name.endsWith('.service.ts')) return '封装业务逻辑'
  if (name.endsWith('.module.ts')) return '聚合提供者与控制器'
  if (name.endsWith('.tsx')) return '渲染 UI 组件'
  if (name.endsWith('.ts') || name.endsWith('.js')) return '导出函数/类/常量'
  if (name === 'Dockerfile') return '镜像构建'
  if (name.endsWith('.yml') || name.endsWith('.yaml')) return '服务编排'
  if (name.endsWith('.sql')) return '数据库操作'
  if (name.endsWith('.prisma')) return '数据模型与生成'
  if (name.endsWith('.conf')) return '服务端配置'
  return '功能说明'
}

const parseImports = (code) => {
  const modules = new Set()
  const importRegex = /import\s+[^'"\n]+from\s+['"]([^'"\n]+)['"]/g
  const requireRegex = /require\(\s*['"]([^'"\n]+)['"]\s*\)/g
  let m
  while ((m = importRegex.exec(code))) modules.add(m[1])
  while ((m = requireRegex.exec(code))) modules.add(m[1])
  return Array.from(modules)
}

const parseExports = (code) => {
  const names = new Set()
  const defaultRegex = /export\s+default\s+(class|function)?\s*([A-Za-z0-9_]+)/
  const namedRegex = /export\s+(?:const|function|class)\s+([A-Za-z0-9_]+)/g
  const allRegex = /export\s*\{\s*([^}]+)\s*\}/g
  const ctrlRegex = /@Controller\(['"]([^'"\n]+)['"]\)/
  let m
  if ((m = defaultRegex.exec(code))) names.add(m[2])
  while ((m = namedRegex.exec(code))) names.add(m[1])
  while ((m = allRegex.exec(code))) m[1].split(',').map(s => s.trim()).forEach(n => { if (n) names.add(n) })
  if ((m = ctrlRegex.exec(code))) names.add(`route:${m[1]}`)
  return Array.from(names)
}

const inferPos = (fp) => {
  const rel = path.relative(ROOT, fp)
  if (rel.startsWith('frontend/components')) return '前端/组件层'
  if (rel.startsWith('frontend/pages')) return '前端/页面层'
  if (rel.startsWith('frontend/services')) return '前端/服务层'
  if (rel.startsWith('frontend/router')) return '前端/路由层'
  if (rel.startsWith('frontend/contexts')) return '前端/上下文层'
  if (rel.startsWith('backend/src/modules/auth')) return '后端/鉴权模块'
  if (rel.startsWith('backend/src/modules/learning')) return '后端/学习模块'
  if (rel.startsWith('backend/src/modules/stats')) return '后端/统计模块'
  if (rel.startsWith('backend/src/modules/user')) return '后端/用户模块'
  if (rel.startsWith('backend/src/common')) return '后端/通用层'
  if (rel.startsWith('deploy')) return '部署/配置'
  if (rel.startsWith('data')) return '数据资产'
  return '系统/通用'
}

const hasHeader = (code, prefix) => {
  const head = code.split(/\r?\n/, 5)
  return head.some(l => l.startsWith(prefix) && l.toLowerCase().includes('input:'))
}

const makeHeader = (fp, code) => {
  const prefix = commentByExt(fp)
  const imports = isCodeFile(fp) ? parseImports(code) : []
  const exports = (fp.endsWith('.ts') || fp.endsWith('.tsx') || fp.endsWith('.js')) ? parseExports(code) : []
  const inputStr = imports.length ? imports.join(', ') : '无'
  const outputStr = exports.length ? exports.join(', ') : '无'
  const posStr = inferPos(fp)
  const lines = [
    `${prefix} input: ${inputStr}`,
    `${prefix} output: ${outputStr}`,
    `${prefix} pos: ${posStr}`,
    `${prefix} 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。`
  ]
  return lines.join('\n') + '\n'
}

const ensureFileHeader = (fp, write) => {
  const prefix = commentByExt(fp)
  if (!prefix) return { skipped: true }
  const code = readFile(fp)
  if (hasHeader(code, prefix)) return { ok: true }
  const header = makeHeader(fp, code)
  const out = header + code
  if (write) writeFile(fp, out)
  return { inserted: true }
}

const walk = (dir, visitor) => {
  const entries = listDir(dir)
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (shouldIgnore(p)) continue
      visitor('dir', p)
      walk(p, visitor)
    } else {
      visitor('file', p)
    }
  }
}

const run = (write) => {
  const report = { readmesCreated: 0, readmesUpdated: 0, headersInserted: 0, filesChecked: 0 }
  const targetDirs = new Set()
  walk(ROOT, (type, p) => {
    if (type === 'dir') {
      const rel = path.relative(ROOT, p)
      if (!rel) return
      // target directories by heuristic
      if (
        rel.startsWith('backend') ||
        rel.startsWith('frontend') ||
        rel.startsWith('deploy') ||
        rel.startsWith('data')
      ) targetDirs.add(p)
    } else if (type === 'file') {
      if (isCodeFile(p)) {
        report.filesChecked += 1
        const r = ensureFileHeader(p, write)
        if (r.inserted) report.headersInserted += 1
      }
    }
  })
  for (const d of targetDirs) {
    const { created, updated } = ensureFolderReadme(d, write)
    if (created) report.readmesCreated += 1
    if (updated) report.readmesUpdated += 1
  }
  return report
}

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const rep = run(write)
const msg = `docs: readmes+${rep.readmesCreated}/${rep.readmesUpdated} headers+${rep.headersInserted} files=${rep.filesChecked}`
console.log(msg)
if (!write && (rep.readmesCreated || rep.readmesUpdated || rep.headersInserted)) {
  process.exitCode = 1
}
