export const metadata = {
  icons: {
    icon: '/Logo.png',
    shortcut: '/Logo.png',
    apple: '/Logo.png',
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
