import { Component, type ReactNode } from 'react'

import AccountSetup from '../pages/AccountSetup'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

/**
 * Batas galat aplikasi. Sebelumnya layar kegagalan (`AccountSetup`) tidak
 * pernah tampil karena tidak ada yang memasangnya; sekarang router membungkus
 * dirinya dengan boundary ini supaya galat render jatuh ke layar itu, bukan
 * halaman putih.
 *
 * Class component karena React hanya mengenali `componentDidCatch` /
 * `getDerivedStateFromError` pada class — tidak ada padanan hook.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return <AccountSetup />
    return this.props.children
  }
}
