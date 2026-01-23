import React from 'react'
import { ThemeProvider } from './components/ThemeContext'
import { AuthProvider } from './components/AuthContext'
import {BrowserRouter, Outlet, Routes, Route} from 'react-router-dom'
import HomePage from "./pages/HomePage"
import  {LandingPage}  from './components/LandingPage'
import Layout from './pages/Layout'
import NotFound from './pages/NotFound'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { AdminDashboard } from './components/AdminDashboard'
import { CompanyDashboard } from './components/CompanyDashboard'
import { CommuterDashboard } from './components/CommuterDashboard'
import { DriverDashboard } from './components/DriverDashboard'

const App = () => {




  return (
    <ThemeProvider>
      <AuthProvider>
         <BrowserRouter>
             <Routes>
              {/* routes for users  */}
                <Route path='/' element={<Layout/>}>
                    <Route index element={<HomePage/>}/>
                    <Route path='login' element={<LoginPage/>}/>
                    <Route path='signup' element={<SignupPage/>}/>
                    <Route path='*' element={<NotFound/>}/>
                </Route>




                <Route path='/dashboard' element={<Layout/>}>
                  <Route path='admin' element={<AdminDashboard/>}/>
                  <Route path='company' element={<CompanyDashboard/>}/>
                  <Route path='commuter' element={<CommuterDashboard/>}/>
                  <Route path='driver' element={<DriverDashboard/>}/>
                  <Route path='*' element={<NotFound/>}/>
                </Route>




             </Routes>
         </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App