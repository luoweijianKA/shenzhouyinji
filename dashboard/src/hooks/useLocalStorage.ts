import { useState, useEffect } from 'react'

export const useLocalStorage = (key: string, defalutValue: any) => {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key)
    return storedValue && storedValue.length > 0 && storedValue !== 'undefined' 
        ? JSON.parse(storedValue) 
        : defalutValue
  })

  useEffect(
    () => {
      if (value && value.length > 0) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    },
    [key, value]
  )

  return [value, setValue]
}