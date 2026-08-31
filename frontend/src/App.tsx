import { Routes, Route } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { HomeScreen } from './components/HomeScreen'
import { LocationView } from './components/LocationView'
import { ItemDetail } from './components/ItemDetail'
import { ItemForm } from './components/ItemForm'
import { LocationsManager } from './components/LocationsManager'
import { ScanScreen } from './components/ScanScreen'

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <Routes>
      <Route path="/" element={<HomeScreen onToggleTheme={toggle} theme={theme} />} />
      <Route path="/location/:id" element={<LocationView />} />
      <Route path="/locations" element={<LocationsManager />} />
      <Route path="/items" element={<LocationView />} />
      <Route path="/item/:id" element={<ItemDetail />} />
      <Route path="/add" element={<ItemForm />} />
      <Route path="/item/:id/edit" element={<ItemForm />} />
      <Route path="/scan" element={<ScanScreen />} />
    </Routes>
  )
}// trigger check
