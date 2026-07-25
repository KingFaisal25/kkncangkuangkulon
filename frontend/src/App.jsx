import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PageTransition from './components/layout/PageTransition';
import AdminLayout from './components/layout/AdminLayout';
import Navbar from './components/layout/Navbar';
import EffectsLayer from './components/layout/EffectsLayer';

// Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
import DashboardPage from './pages/DashboardPage';
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
import HistoryPage from './pages/HistoryPage';
import ActivitiesPage from './pages/ActivitiesPage';
import AttendanceRequestsPage from './pages/AttendanceRequestsPage';
import WorkProgramsPage from './pages/WorkProgramsPage';
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
import NotFoundPage from './pages/NotFoundPage';
const DivisionsPage = lazy(() => import('./pages/DivisionsPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));

// Admin Pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminActivities from './pages/admin/AdminActivities';
import AdminAttendanceRequests from './pages/admin/AdminAttendanceRequests';
import AdminWorkPrograms from './pages/admin/AdminWorkPrograms';
import AdminDivisions from './pages/admin/AdminDivisions';

// Layout wrapper for participant routes to include Navbar
const PesertaLayout = ({ children }) => (
  <div className="min-h-screen bg-surface">
    <div className="gradient-mesh" />
    <Navbar />
    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageTransition>
        {children}
      </PageTransition>
    </main>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <EffectsLayer />
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" /></div>}><Routes>
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />

            {/* Protected Peserta Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                <PesertaLayout>
                  <DashboardPage />
                </PesertaLayout>
              } />
              <Route path="/attendance" element={
                <PesertaLayout>
                  <AttendancePage />
                </PesertaLayout>
              } />
              <Route path="/activities" element={<PesertaLayout><ActivitiesPage /></PesertaLayout>} />
              <Route path="/requests" element={<PesertaLayout><AttendanceRequestsPage /></PesertaLayout>} />
              <Route path="/programs" element={<PesertaLayout><WorkProgramsPage /></PesertaLayout>} />
              <Route path="/reports" element={<PesertaLayout><ReportsPage /></PesertaLayout>} />
              <Route path="/divisions" element={<PesertaLayout><DivisionsPage /></PesertaLayout>} />
              <Route path="/finance" element={<PesertaLayout><FinancePage /></PesertaLayout>} />
              <Route path="/history" element={
                <PesertaLayout>
                  <HistoryPage />
                </PesertaLayout>
              } />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              } />
              <Route path="/admin/users" element={
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              } />
              <Route path="/admin/activities" element={<AdminLayout><AdminActivities /></AdminLayout>} />
              <Route path="/admin/requests" element={<AdminLayout><AdminAttendanceRequests /></AdminLayout>} />
              <Route path="/admin/programs" element={<AdminLayout><AdminWorkPrograms /></AdminLayout>} />
              <Route path="/admin/attendance" element={
                <AdminLayout>
                  <AdminAttendance />
                </AdminLayout>
              } />
              <Route path="/admin/divisions" element={<AdminLayout><AdminDivisions /></AdminLayout>} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes></Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
