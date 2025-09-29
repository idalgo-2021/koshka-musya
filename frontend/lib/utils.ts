import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert a string like snake_case, kebab-case, spaced words, or mixed to camelCase
export function toCamelCase(input: string): string {
  return input
    .replace(/^[_.\-\s]+/, '')
    .toLowerCase()
    .replace(/([_.\-\s]+)([a-z0-9])/g, (_m, _sep, chr: string) => chr.toUpperCase())
    .replace(/([0-9]+)([a-z])/g, (_m, num: string, chr: string) => `${num}${chr.toUpperCase()}`)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') return false
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

// Deeply transform all object keys to camelCase. Handles arrays and nested objects.
export function camelCaseKeysDeep<T = unknown>(input: T): T {
  const seen = new WeakMap<object, any>()

  const transform = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(transform)
    }
    if (value && typeof value === 'object') {
      if (!isPlainObject(value)) return value
      if (seen.has(value)) return seen.get(value)
      const out: Record<string, any> = {}
      seen.set(value, out)
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        out[toCamelCase(String(key))] = transform(val)
      }
      return out
    }
    return value
  }

  return transform(input)
}
