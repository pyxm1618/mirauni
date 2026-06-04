export function useOgImageResolver() {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl || 'https://mirauni.com').replace(/\/+$/, '')

  return (customPath?: string) => {
    if (customPath) {
      if (customPath.startsWith('http://') || customPath.startsWith('https://')) {
        return customPath
      }
      const normalizedPath = customPath.startsWith('/') ? customPath : `/${customPath}`
      return `${siteUrl}${normalizedPath}`
    }
    return `${siteUrl}/logo.png`
  }
}
