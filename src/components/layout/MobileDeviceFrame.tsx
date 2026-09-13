import type { ReactNode } from 'react'

interface MobileDeviceFrameProps {
  children: ReactNode
}

export function MobileDeviceFrame({ children }: MobileDeviceFrameProps) {
  return (
    <div className="mobile-device-frame">
      <div className="mobile-device-speaker" aria-hidden="true" />
      <div className="mobile-device-screen">
        {children}
      </div>
    </div>
  )
}
