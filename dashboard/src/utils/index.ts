export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function ago(time: number) {
    const v = Math.floor(new Date().getTime() / 1000) - time
    if (v < 60) {
        return `${v}秒前`
    }
    if (v < 3600) {
        return `${Math.floor(v / 60)}分钟前`
    }
    if (v < 3600 * 24) {
        return `${Math.floor(v / 3600)}小时前`
    }
    const days = Math.floor(v / (3600 * 24))
    if (days < 2) {
        return `昨天`
    }

    const d = new Date(time * 1000)
    const year = `${d.getFullYear()}`
    const month = `${d.getMonth() + 1}`.padStart(2, "0")
    const date = `${d.getDate()}`.padStart(2, "0")

    return `${year}-${month}-${date}`
}

export function today() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function toDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function formattedNumerical(v?: number, fractionDigits = 2) {
  if (!v || isNaN(v)) {
    return (0).toFixed(fractionDigits)
  }
  return v.toFixed(fractionDigits).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
}

export function formattedDate(d: Date) {
  const year = `${d.getFullYear()}`
  const month = `${d.getMonth() + 1}`.padStart(2, "0")
  const date = `${d.getDate()}`.padStart(2, "0")

  return `${year}-${month}-${date}`
}

export function formattedDateTime(d: Date) {
  const year = `${d.getFullYear()}`;
  const month = `${d.getMonth() + 1}`.padStart(2, "0")
  const date = `${d.getDate()}`.padStart(2, "0")
  const hours = `${d.getHours()}`.padStart(2, "0")
  const minutes = `${d.getMinutes()}`.padStart(2, "0")
  const seconds = `${d.getSeconds()}`.padStart(2, "0")

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
}
