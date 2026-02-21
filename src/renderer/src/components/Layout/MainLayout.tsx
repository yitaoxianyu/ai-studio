import React from 'react'
import TitleBar from './TitleBar'
import IconSidebar from './IconSidebar'
import Sidebar from './Sidebar'
import { useLocation } from 'react-router-dom'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()
  const isSettingsPage = location.pathname === '/settings'

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Icon Sidebar - Always visible */}
        <IconSidebar />
        
        {/* Secondary Sidebar - Only show on chat page, not settings */}
        {!isSettingsPage && <Sidebar />}
        
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
