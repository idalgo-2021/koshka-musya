
// Custom hook for throttled input
import * as React from "react";

export function useThrottledValue<T>(value: T, delay: number) {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastRan = React.useRef(Date.now())

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, delay - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}

// Custom hook for throttled filter updates
export function useThrottledFilter(
  initialValue: string,
  onUpdate: (value: any) => void,
  parser: (value: string) => any,
  delay: number = 500
) {
  const [localValue, setLocalValue] = React.useState(initialValue)
  const throttledValue = useThrottledValue(localValue, delay)

  React.useEffect(() => {
    const parsedValue = parser(throttledValue)
    onUpdate(parsedValue)
  }, [throttledValue, onUpdate, parser])

  return [localValue, setLocalValue] as const
}
