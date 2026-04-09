import { useEffect, useEffectEvent, useState } from 'react'

function readValue<T>(key: string, initialValue: T) {
  if (typeof window === 'undefined') {
    return initialValue
  }

  try {
    const storedValue = window.localStorage.getItem(key)

    if (storedValue === null) {
      return initialValue
    }

    return JSON.parse(storedValue) as T
  } catch {
    return initialValue
  }
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readValue(key, initialValue))
  const persistValue = useEffectEvent((nextValue: T) => {
    window.localStorage.setItem(key, JSON.stringify(nextValue))
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    persistValue(value)
  }, [key, value])

  return [value, setValue] as const
}
