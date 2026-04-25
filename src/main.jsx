import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import KaunHai from './KaunHai.jsx'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: '2026-01-30',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <KaunHai />
    </PostHogProvider>
  </StrictMode>,
)
