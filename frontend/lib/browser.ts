export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

  // Check for mobile user agents
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  const isMobileUA = mobileRegex.test(userAgent)

  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Check screen size as fallback
  const isSmallScreen = window.innerWidth < 768

  return isMobileUA || (isTouchDevice && isSmallScreen)
}

export const isServer = typeof window === 'undefined';
