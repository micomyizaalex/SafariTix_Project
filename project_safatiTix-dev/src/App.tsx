import React from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider } from './components/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import { LandingPage } from './components/LandingPage';
import Layout from './pages/Layout';
import { RequireRole, RedirectByRole } from './components/RouteGuards';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ScheduleDetails from './pages/ScheduleDetails';
import { AdminDashboard } from './components/AdminDashboard';
import { CompanyDashboardLayout } from './components/CompanyDashboardLayout';
import { CompanyHome } from './components/CompanyHome';
import { CommuterDashboard } from './components/CommuterDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { Schedules } from './components/schedules';
import Tickets from './pages/Tickets';
import Buses from './pages/Buses';
import Drivers from './pages/Drivers';
import CompanySettings from './pages/CompanySettings';
import LiveTracking from './pages/LiveTracking';
import Revenue from './pages/Revenue';
import SubscriptionPage from './pages/SubscriptionPage';
import ReportsPage from './pages/ReportsPage';
import DriverTracking from './pages/DriverTracking';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page as default home */}
            <Route path='/' element={<LandingPage />} />

            {/* Other routes wrapped in Layout */}
            <Route path='/app' element={<Layout />}>
              <Route index element={<RedirectByRole><HomePage /></RedirectByRole>} />
              <Route path='login' element={<LoginPage />} />
              <Route path='signup' element={<SignupPage />} />
              <Route path='schedules/:id' element={<ScheduleDetails />} />
              <Route path='*' element={<NotFound />} />
            </Route>

            {/* Dashboard routes */}
            <Route path='/dashboard' element={<Layout />}>
              <Route path='admin' element={<RequireRole allowed={["admin"]}><AdminDashboard/></RequireRole>} />
              
              {/* Company Dashboard with nested routes */}
              <Route path='company' element={<RequireRole allowed={["company_admin"]}><CompanyDashboardLayout/></RequireRole>}>
                <Route index element={<CompanyHome />} />
                <Route path='schedules' element={<Schedules />} />
                <Route path='tickets' element={<Tickets />} />
                <Route path='buses' element={<Buses />} />
                <Route path='drivers' element={<Drivers />} />
                <Route path='tracking' element={<LiveTracking />} />
                <Route path='revenue' element={<Revenue />} />
                <Route path='subscription' element={<SubscriptionPage />} />
                <Route path='reports' element={<ReportsPage />} />
                <Route path='settings' element={<CompanySettings />} />
              </Route>
              
              <Route path='commuter' element={<RequireRole allowed={["commuter"]}><CommuterDashboard/></RequireRole>} />
              <Route path='driver' element={<RequireRole allowed={["driver"]}><DriverDashboard/></RequireRole>} />
              <Route path='*' element={<NotFound />} />
            </Route>

            {/* Alias dashboard routes */}
            <Route path='/driver/dashboard' element={<Layout />}>
              <Route index element={<RequireRole allowed={["driver"]}><DriverDashboard/></RequireRole>} />
              <Route path='tracking' element={<RequireRole allowed={["driver"]}><DriverTracking/></RequireRole>} />
            </Route>
            <Route path='/company/dashboard' element={<RequireRole allowed={["company_admin"]}><CompanyDashboardLayout/></RequireRole>}>
              <Route index element={<CompanyHome />} />
              <Route path='schedules' element={<Schedules />} />
              <Route path='tickets' element={<Tickets />} />
              <Route path='buses' element={<Buses />} />
              <Route path='drivers' element={<Drivers />} />
              <Route path='tracking' element={<LiveTracking />} />
              <Route path='revenue' element={<Revenue />} />
              <Route path='subscription' element={<SubscriptionPage />} />
              <Route path='reports' element={<ReportsPage />} />
              <Route path='settings' element={<CompanySettings />} />
            </Route>

            {/* Fallback route */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
