import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const targetId = decodeURIComponent(location.hash.slice(1))
    let frameId = 0
    let timeoutId = 0
    let attempts = 0

    const scrollToHash = () => {
      const target = document.getElementById(targetId)

      if (target !== null) {
        target.scrollIntoView({ block: 'start', behavior: 'smooth' })
        return
      }

      if (attempts >= 8) {
        return
      }

      attempts += 1
      timeoutId = window.setTimeout(() => {
        frameId = window.requestAnimationFrame(scrollToHash)
      }, 80)
    }

    frameId = window.requestAnimationFrame(scrollToHash)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [location.hash, location.pathname])

  return null
}
