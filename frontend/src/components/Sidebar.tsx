import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    navigate('/login', { replace: true });
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        {!isCollapsed && (
          <div className="sidebar-logo">
            <h2>Healthcare</h2>
            <span>Management System</span>
          </div>
        )}

        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '☰' : '×'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
          title={isCollapsed ? 'Dashboard' : ''}
        >
          <span className="nav-icon">D</span>

          {!isCollapsed && (
            <span className="nav-label">Dashboard</span>
          )}
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
          title={isCollapsed ? 'Patients' : ''}
        >
          <span className="nav-icon">P</span>

          {!isCollapsed && (
            <span className="nav-label">Patients</span>
          )}
        </NavLink>

        <NavLink
          to="/doctors"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
          title={isCollapsed ? 'Doctors' : ''}
        >
          <span className="nav-icon">D</span>

          {!isCollapsed && (
            <span className="nav-label">Doctors</span>
          )}
        </NavLink>

        <NavLink
          to="/appointments"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
          title={isCollapsed ? 'Appointments' : ''}
        >
          <span className="nav-icon">A</span>

          {!isCollapsed && (
            <span className="nav-label">Appointments</span>
          )}
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button
          className="logout-button"
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="nav-icon">↪</span>

          {!isCollapsed && (
            <span className="nav-label">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;