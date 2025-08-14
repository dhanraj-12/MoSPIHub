import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Query from './pages/Query'

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route
          path='/'
          element= {<HomePage/>}
        />
        <Route
          path='/query'
          element={<Query/>}
        />
      </Routes>
    </BrowserRouter> 
    
  )
}

export default App
