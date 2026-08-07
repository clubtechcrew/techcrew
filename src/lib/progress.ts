export const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const
export const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
export const PROGRESS_WEEKS = 60

export interface ProgressUpdate {
  memberId: number
  title: string
  content: string
  posted: boolean
}

export interface ProgressDay {
  day: number
  date: Date
  updates: ProgressUpdate[]
}

export interface ProgressWeek {
  start: Date
  end: Date
  days: ProgressDay[]
}

export interface ProgressContext {
  schedule: Record<number, number[]>
  updates: Map<string, { title: string; content: string }>
}

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const todayStart = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const startOfWeek = (ref: Date) => {
  const d = new Date(ref)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

export const startOfMonth = (ref: Date) => {
  const d = new Date(ref)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

export const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const addMonths = (d: Date, n: number) => {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}

export const fmtDay = (d: Date) => `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
export const fmtDayLong = (d: Date) => `${DAY_FULL[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
export const fmtRange = (week: ProgressWeek) => `${fmtDay(week.start)} – ${fmtDay(week.end)}`

export function buildProgressDay(date: Date, ctx: ProgressContext): ProgressDay {
  const dayIdx = (date.getDay() + 6) % 7
  const memberIds = ctx.schedule[dayIdx] ?? []
  const key = toISODate(date)
  const updates = memberIds.map(memberId => {
    const row = ctx.updates.get(`${memberId}:${key}`)
    return {
      memberId,
      title: row?.title ?? '',
      content: row?.content ?? '',
      posted: Boolean(row),
    }
  })
  return { day: dayIdx, date, updates }
}

export function buildProgressWeek(monday: Date, ctx: ProgressContext): ProgressWeek {
  const days = [0, 1, 2, 3, 4, 5, 6].map(i => buildProgressDay(addDays(monday, i), ctx))
  return { start: monday, end: addDays(monday, 6), days }
}

export function buildMonthDays(monthStartDate: Date, ctx: ProgressContext): ProgressDay[] {
  const now = todayStart()
  const year = monthStartDate.getFullYear()
  const month = monthStartDate.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const days: ProgressDay[] = []
  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(year, month, i)
    if (date.getTime() > now.getTime()) break
    days.push(buildProgressDay(date, ctx))
  }
  return days
}
