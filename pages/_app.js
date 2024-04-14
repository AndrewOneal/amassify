import { SessionProvider } from "next-auth/react"
import { BrowserRouter as Router } from 'react-router-dom'
import '../styles/globals.css'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
        <Component {...pageProps} />
    </SessionProvider>
  )
}
