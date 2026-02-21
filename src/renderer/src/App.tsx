import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/conversations/:id" element={<HomePage />} />
      </Routes>
    </MainLayout>
  )
}

export default App
