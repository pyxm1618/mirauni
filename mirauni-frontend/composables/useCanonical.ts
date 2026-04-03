export function useCanonical(path: string) {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl || 'https://mirauni.com').replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const canonical = `${siteUrl}${normalizedPath}`

  useHead({
    link: [
      { rel: 'canonical', href: canonical }
    ]
  })

  return canonical
}
