import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('calhub_lang')?.value ?? 'mn'
  const resolvedLocale = locale === 'en' ? 'en' : 'mn'

  const messages = (await import(`./${resolvedLocale}.json`)).default

  return { locale: resolvedLocale, messages }
})
