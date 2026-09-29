/** 通用工具函数 */

/** 格式化 ISO 时间为 MM-DD HH:mm */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

/** 相对时间：刚刚 / n分钟前 / n小时前 / 昨天 / M月D日 */
export function relativeTime(iso: string): string {
  const now = Date.now()
  const t = new Date(iso).getTime()
  const diff = now - t
  const min = 60_000
  const hour = 3_600_000
  const day = 86_400_000
  if (diff < min) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / min)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 2 * day) return '昨天'
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 格式化日期 YYYY-MM-DD */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** 截止日期显示：M月D日 */
export function dueDateLabel(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 是否已逾期 */
export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false
  return new Date(dateStr).getTime() < Date.now()
}

/** 姓名首字 */
export function nameInitial(name: string): string {
  return name ? name.charAt(0) : '?'
}

/** 简易 Markdown 渲染（支持标题、列表、代码块、行内代码、加粗） */
export function renderMarkdown(md: string): string {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const lines = md.split('\n')
  const html: string[] = []
  let inCode = false
  let inList = false
  let listType = 'ul'

  const closeList = () => {
    if (inList) {
      html.push(`</${listType}>`)
      inList = false
    }
  }

  const inline = (s: string) =>
    escapeHtml(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')

  for (const raw of lines) {
    const line = raw
    if (line.trim().startsWith('```')) {
      closeList()
      if (!inCode) {
        html.push('<pre class="md-pre"><code>')
        inCode = true
      } else {
        html.push('</code></pre>')
        inCode = false
      }
      continue
    }
    if (inCode) {
      html.push(escapeHtml(line))
      continue
    }
    if (/^#{1,4}\s/.test(line)) {
      closeList()
      const level = line.match(/^#+/)![0].length
      html.push(`<h${level}>${inline(line.replace(/^#+\s/, ''))}</h${level}>`)
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList || listType !== 'ul') {
        closeList()
        html.push('<ul>')
        inList = true
        listType = 'ul'
      }
      html.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`)
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (!inList || listType !== 'ol') {
        closeList()
        html.push('<ol>')
        inList = true
        listType = 'ol'
      }
      html.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`)
      continue
    }
    if (/^\|.*\|$/.test(line.trim())) {
      // 表格行：简化处理
      closeList()
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim())
      if (cells.every((c) => /^-+$/.test(c))) continue
      const tag = html.some((h) => h.startsWith('<table')) ? 'td' : 'th'
      if (tag === 'th') html.push('<table>')
      html.push(`<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`)
      continue
    }
    if (line.trim() === '') {
      closeList()
      continue
    }
    closeList()
    html.push(`<p>${inline(line)}</p>`)
  }
  closeList()
  if (inCode) html.push('</code></pre>')
  return html.join('\n')
}

/** 项目图标颜色（按 key 稳定取色） */
const PROJECT_COLORS = [
  '#4f46e5',
  '#0ea5e9',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#9333ea',
  '#0d9488',
  '#6366f1'
]

export function projectColor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0
  }
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length]
}

/** 生成唯一 ID */
export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
