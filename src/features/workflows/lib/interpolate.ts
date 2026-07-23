function isIndexable(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object"
}

function getByPath(value: unknown, path: string): unknown {
  const keys = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)

  let current: unknown = value

  for (const key of keys) {
    if (!isIndexable(current)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

function stringifyResolved(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function interpolate(
  text: string,
  outputs: Record<string, unknown>
): string {
  return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, expression: string) => {
    const trimmed = expression.trim()
    const nodeIdMatch = trimmed.match(/^([^.[\]]+)(.*)$/)
    if (!nodeIdMatch) return ""

    const nodeId = nodeIdMatch[1]
    const rest = nodeIdMatch[2]
    if (!nodeId || rest === undefined) return ""

    const root = outputs[nodeId]
    const path = rest.replace(/^\./, "")
    const resolved = path ? getByPath(root, path) : root

    return stringifyResolved(resolved)
  })
}
