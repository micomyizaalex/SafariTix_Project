import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import Layout from './pages/Layout';
import AdminLayout from './layouts/AdminLayout';
import CompanyLayout from './layouts/CompanyLayout';
import CommuterLayout from './layouts/CommuterLayout';
import DriverLayout from './layouts/DriverLayout';

// Pages - Public
import { LandingPage } from './pages/public/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFound from './pages/NotFound';
import FirstLoginChange from './pages/FirstLoginChange';

// Pages - Commuter
import CommuterDashboard from './pages/commuter/CommuterDashboard';
import PaymentPage from './pages/commuter/PaymentPage';
import ScheduleDetails from './pages/ScheduleDetails';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Pages - Company
import CompanyDashboard from './pages/company/CompanyDashboard';
import DriverTracking from './pages/company/DriverTracking';

// Pages - Driver
import DriverDashboard from './pages/driver/DriverDashboard';

// Pages - Account
import AccountSettings from './pages/account/AccountSettings';

// Components
import { ThemeProvider } from './components/ThemeContext';
import { RequireRole, RedirectByRole } from './components/RouteGuards';

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          <Route path='/' element={<Layout />}>
            <Route path='/' element={<LandingPage />} />
            <Route path='home' element={<RedirectByRole><HomePage /></RedirectByRole>} />
            <Route path='login' element={<LoginPage />} />
            <Route path='signup' element={<SignupPage />} />
            <Route path='schedules/:id' element={<ScheduleDetails />} />
            <Route path='*' element={<NotFound />} />
          </Route>

          {/* Dashboard routes - new layouts */}
          <Route path='/dashboard' element={<Layout />}>
            <Route path='admin' element={<RequireRole allowed={["admin"]}><AdminLayout/></RequireRole>}>
              <Route index element={<AdminDashboard/>} />
            </Route>

            <Route path='company' element={<RequireRole allowed={["company_admin"]}><CompanyLayout/></RequireRole>}>
              <Route index element={<CompanyDashboard/>} />
            </Route>

            <Route path='commuter' element={<RequireRole allowed={["commuter"]}><CommuterLayout/></RequireRole>}>
              <Route index element={<CommuterDashboard/>} />
              <Route path='payment' element={<PaymentPage/>} />
            </Route>

            <Route path='account' element={<RequireRole allowed={["commuter"]}><AccountSettings/></RequireRole>} />

            <Route path='driver' element={<RequireRole allowed={["driver"]}><DriverLayout/></RequireRole>}>
              <Route index element={<DriverDashboard/>} />
            </Route>

            <Route path='*' element={<NotFound />} />
          </Route>


          <Route path='/driver/dashboard' element={<Layout />}>
            <Route index element={<RequireRole allowed={["driver"]}><DriverDashboard/></RequireRole>} />
            <Route path='tracking' element={<RequireRole allowed={["driver"]}><DriverTracking/></RequireRole>} />
          </Route>
          
          <Route path='/company/dashboard' element={<Layout />}>
            <Route index element={<RequireRole allowed={["company_admin","company"]}><CompanyDashboard/></RequireRole>} />
          </Route>

          {/* Fallback route */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;