
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

interface StaffUser {
  id?: number;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

function getStoredUser(): StaffUser | null {
  try {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser) as StaffUser;
  } catch {
    return null;
  }
}

function Sidebar() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [user, setUser] = useState<StaffUser | null>(
    getStoredUser,
  );

  const displayName =
    user?.name?.trim() ||
    user?.fullName?.trim() ||
    user?.email?.split('@')[0] ||
    'Hospital Staff';

  const displayRole = user?.role
    ? user.role
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Staff';

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    setUser(null);
    setShowLogoutDialog(false);

    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="sidebar-top">
          {!isCollapsed && (
            <div className="sidebar-logo">
              <h2>Healthcare</h2>
              <span>Management System</span>
            </div>
          )}

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              isCollapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
            }
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
              <span className="nav-label">
                Dashboard
              </span>
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
              <span className="nav-label">
                Patients
              </span>
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
              <span className="nav-label">
                Doctors
              </span>
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
              <span className="nav-label">
                Appointments
              </span>
            )}
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div
            className="sidebar-user-profile"
            title={
              isCollapsed
                ? `${displayName} - ${displayRole}`
                : undefined
            }
          >
            <div className="sidebar-user-avatar">
              {initials || 'HS'}
            </div>

            {!isCollapsed && (
              <div className="sidebar-user-info">
                <strong className="sidebar-user-name">
                  {displayName}
                </strong>

                <span className="sidebar-user-role">
                  {displayRole}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className="nav-icon">↪</span>

            {!isCollapsed && (
              <span className="nav-label">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {showLogoutDialog && (
        <div
          className="logout-modal-overlay"
          onClick={cancelLogout}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="logout-modal-icon">
              ↪
            </div>

            <h2 id="logout-dialog-title">
              Confirm Logout
            </h2>

            <p>
              Are you sure you want to log out of
              your account?
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-button"
                onClick={cancelLogout}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-button"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
