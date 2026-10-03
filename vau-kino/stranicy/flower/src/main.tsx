import { StrictMode } from 'react'
import { MotionConfig } from 'framer-motion'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ContentProvider } from './content/useContent'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* «user»: Motion по умолчанию НЕ уважает системное «меньше движения» */}
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        <App />
      </ContentProvider>
    </MotionConfig>
  </StrictMode>,
)
