import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PageTransition from './components/layout/PageTransition';
import AdminLayout from './components/layout/AdminLayout';
import Navbar from './components/layout/Navbar';
import EffectsLayer from './components/layout/EffectsLayer';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const AttendanceRequestsPage = lazy(() => import('./pages/AttendanceRequestsPage'));
const WorkProgramsPage = lazy(() => import('./pages/WorkProgramsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DivisionsPage = lazy(() => import('./pages/DivisionsPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));

// Admin Pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAttendance = lazy(() => import('./pages/admin/AdminAttendance'));
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities'));
const AdminAttendanceRequests = lazy(() => import('./pages/admin/AdminAttendanceRequests'));
const AdminWorkPrograms = lazy(() => import('./pages/admin/AdminWorkPrograms'));
const AdminDivisions = lazy(() => import('./pages/admin/AdminDivisions'));

const AppLoading = () => (
  <div className="app-loading min-h-screen flex items-center justify-center">
    <div className="glass-card-static px-10 py-8 text-center">
      <LoadingSpinner size="lg" text="Menyiapkan pengalaman KKN..." />
    </div>
  </div>
);

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
          <Suspense fallback={<AppLoading />}><Routes>
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
