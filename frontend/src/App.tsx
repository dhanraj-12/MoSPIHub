import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Query from './pages/Query'
import AddSurvey from './pages/SurveyTableUploader'
import HomePage from './pages/HomePage'
import SurveyPage from './pages/SurveyPage'

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route
          path='/'
          element= {<HomePage/>}
        />
        <Route
          path='/query-surveys'
          element={<SurveyPage/>}
        />
        <Route
          path='/upload-workflow'
          element={<AddSurvey/>}
        />

        <Route
          path='/query-processing'
          element={<Query/>}
        />
      </Routes>
    </BrowserRouter> 
    
  )
}

export default App
