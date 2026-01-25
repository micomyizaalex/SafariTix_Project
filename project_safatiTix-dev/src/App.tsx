import React from 'react'
import { ThemeProvider } from './components/ThemeContext'
import { AuthProvider } from './components/AuthContext'
import {BrowserRouter, Outlet, Routes, Route} from 'react-router-dom'
import HomePage from "./pages/HomePage"
import  {LandingPage}  from './components/LandingPage'
import Layout from './pages/Layout'
import { RequireRole, RedirectByRole } from './components/RouteGuards'
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
                  <Route index element={<RedirectByRole><HomePage/></RedirectByRole>}/>
                    <Route path='login' element={<LoginPage/>}/>
                    <Route path='signup' element={<SignupPage/>}/>
                    <Route path='*' element={<NotFound/>}/>
                </Route>




                <Route path='/dashboard' element={<Layout/>}>
                  <Route path='admin' element={<RequireRole allowed={["admin"]}><AdminDashboard/></RequireRole>}/>
                  <Route path='company' element={<RequireRole allowed={["company_admin"]}><CompanyDashboard/></RequireRole>}/>
                  <Route path='commuter' element={<RequireRole allowed={["commuter"]}><CommuterDashboard/></RequireRole>}/>
                  <Route path='driver' element={<RequireRole allowed={["driver"]}><DriverDashboard/></RequireRole>}/>
                  <Route path='*' element={<NotFound/>}/>
                </Route>

                {/* Alias routes per requirement */}
                <Route path='/driver/dashboard' element={<Layout/>}>
                  <Route index element={<RequireRole allowed={["driver"]}><DriverDashboard/></RequireRole>} />
                </Route>
                <Route path='/company/dashboard' element={<Layout/>}>
                  <Route index element={<RequireRole allowed={["company_admin"]}><CompanyDashboard/></RequireRole>} />
                </Route>




             </Routes>
         </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App