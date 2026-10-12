import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import PatientManagement from './pages/PatientManagement';
import DoctorManagement from './pages/DoctorManagement';
import AppointmentManagement from './pages/AppointmentManagement';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <div className="app-layout">
                <Sidebar />

                <main className="app-content">
                  <Routes>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/patients"
                      element={<PatientManagement />}
                    />
                    <Route path="/doctors" element={<DoctorManagement />} />
                    <Route
                      path="/appointments"
                      element={<AppointmentManagement />}
                    />
                  </Routes>
                </main>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;