import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../services/dashboardService';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">Healthcare Management</span>
            <h1>Dashboard</h1>
            <p>Overview of your healthcare management system</p>
          </div>
        </div>

        <div className="dashboard-message">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">Healthcare Management</span>
            <h1>Dashboard</h1>
            <p>Overview of your healthcare management system</p>
          </div>
        </div>

        <div className="dashboard-message dashboard-error">
          {error || 'Unable to load dashboard data.'}
        </div>
      </div>
    );
  }

  const appointmentStatuses = [
    {
      label: 'Scheduled',
      value: stats.appointmentStatusCounts.SCHEDULED,
      className: 'scheduled',
    },
    {
      label: 'Confirmed',
      value: stats.appointmentStatusCounts.CONFIRMED,
      className: 'confirmed',
    },
    {
      label: 'Completed',
      value: stats.appointmentStatusCounts.COMPLETED,
      className: 'completed',
    },
    {
      label: 'Cancelled',
      value: stats.appointmentStatusCounts.CANCELLED,
      className: 'cancelled',
    },
    {
      label: 'No Show',
      value: stats.appointmentStatusCounts.NO_SHOW,
      className: 'no-show',
    },
  ];

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-page">
      {/* Header */}

      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            Healthcare Management
          </span>

          <h1>Dashboard</h1>

          <p>
            Overview of patients, doctors and appointments
          </p>
        </div>

        <div className="dashboard-overview-badge">
          <span className="overview-dot" />
          System Overview
        </div>
      </div>

      {/* Stats */}

      <div className="dashboard-stats">
        <div className="dashboard-card patients-card">
          <div className="dashboard-card-top">
            <div className="dashboard-card-icon">P</div>

            <span className="dashboard-card-caption">
              Patients
            </span>
          </div>

          <div className="dashboard-card-value">
            {stats.totalPatients}
          </div>

          <div className="dashboard-card-footer">
            <span>Registered patients</span>
          </div>
        </div>

        <div className="dashboard-card doctors-card">
          <div className="dashboard-card-top">
            <div className="dashboard-card-icon">D</div>

            <span className="dashboard-card-caption">
              Doctors
            </span>
          </div>

          <div className="dashboard-card-value">
            {stats.totalDoctors}
          </div>

          <div className="dashboard-card-footer">
            <span>Registered doctors</span>
          </div>
        </div>

        <div className="dashboard-card appointments-card">
          <div className="dashboard-card-top">
            <div className="dashboard-card-icon">A</div>

            <span className="dashboard-card-caption">
              Appointments
            </span>
          </div>

          <div className="dashboard-card-value">
            {stats.totalAppointments}
          </div>

          <div className="dashboard-card-footer">
            <span>Total appointments</span>
          </div>
        </div>
      </div>

      {/* Appointment Overview */}

      <div className="dashboard-section appointment-overview">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Analytics</span>

            <h2>Appointment Overview</h2>

            <p>
              Current appointment status breakdown
            </p>
          </div>

          <div className="section-total">
            <span>Total</span>
            <strong>{stats.totalAppointments}</strong>
          </div>
        </div>

        <div className="appointment-chart">
          {appointmentStatuses.map((item) => {
            const percentage =
              stats.totalAppointments > 0
                ? (item.value / stats.totalAppointments) * 100
                : 0;

            return (
              <div className="chart-row" key={item.label}>
                <div className="chart-label">
                  <span className={`chart-status-dot ${item.className}`} />
                  <span>{item.label}</span>
                </div>

                <div className="chart-track">
                  <div
                    className={`chart-bar ${item.className}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="chart-value">
                  <strong>{item.value}</strong>
                  <span>{Math.round(percentage)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointments */}

      <div className="dashboard-section upcoming-section">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Schedule</span>

            <h2>Upcoming Appointments</h2>

            <p>
              Your next scheduled appointments
            </p>
          </div>

          <div className="upcoming-count">
            {stats.upcomingAppointments.length} upcoming
          </div>
        </div>

        {stats.upcomingAppointments.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">A</div>
            <strong>No upcoming appointments</strong>
            <span>
              There are no scheduled appointments at the moment.
            </span>
          </div>
        ) : (
          <div className="upcoming-list">
            {stats.upcomingAppointments.map((appointment) => {
              const appointmentDate = new Date(
                appointment.appointmentAt,
              );

              return (
                <div
                  className="upcoming-item"
                  key={appointment.id}
                >
                  <div className="appointment-date-block">
                    <span>
                      {appointmentDate.toLocaleDateString('en-IN', {
                        month: 'short',
                      })}
                    </span>

                    <strong>
                      {appointmentDate.toLocaleDateString('en-IN', {
                        day: '2-digit',
                      })}
                    </strong>

                    <small>
                      {appointmentDate.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                  </div>

                  <div className="upcoming-main">
                    <div className="upcoming-patient">
                      {appointment.patientName}
                    </div>

                    <div className="upcoming-doctor">
                      {appointment.doctorSpecialization}
                    </div>

                    {appointment.reason && (
                      <div className="upcoming-reason">
                        {appointment.reason}
                      </div>
                    )}
                  </div>

                  <div className="upcoming-meta">
                    <div className="upcoming-full-date">
                      {formatAppointmentDate(
                        appointment.appointmentAt,
                      )}
                    </div>

                    <span
                      className={`upcoming-status status-${appointment.status.toLowerCase()}`}
                    >
                      <span className="status-dot" />
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;