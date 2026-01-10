import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateRace from './pages/CreateRace'
import RacePage from './pages/RacePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRace />} />
        <Route path="/race/:id" element={<RacePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
