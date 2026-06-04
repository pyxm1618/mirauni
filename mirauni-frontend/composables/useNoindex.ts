export function useNoindex() {
  useSeoMeta({
    robots: 'noindex, nofollow'
  })
}
