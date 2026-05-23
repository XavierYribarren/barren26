export const metadata = {
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

// html/body required here by Next.js — lang is set per-locale via HtmlLang component
// <head> must be explicit so React 19 doesn't try to hoist metadata into <html> directly
export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
