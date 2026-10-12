import { useCallback, useEffect, useState } from 'react';
import AppointmentTable from '../components/AppointmentTable';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  type Appointment,
} from '../services/appointmentService';
import { getPatients, type Patient } from '../services/patientService';
import { getDoctors, type Doctor } from '../services/doctorService';
import './AppointmentManagement.css';

function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);

  const [filterStatus, setFilterStatus] = useState('');

  const PAGE_SIZE = 5;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentAt, setAppointmentAt] = useState('');
  const [status, setStatus] = useState('SCHEDULED');
  const [reason, setReason] = useState('');

  const loadAppointments = useCallback(async () => {
    try {
      const data = await getAppointments(
        filterStatus || undefined,
        undefined,
        undefined,
        page,
        PAGE_SIZE,
      );

      setAppointments(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalAppointments(data.pagination.total);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  }, [filterStatus, page]);

  useEffect(() => {
    let cancelled = false;

    const fetchAppointments = async () => {
      setLoading(true);

      try {
        const data = await getAppointments(
          filterStatus || undefined,
          undefined,
          undefined,
          page,
          PAGE_SIZE,
        );

        if (!cancelled) {
          setAppointments(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotalAppointments(data.pagination.total);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load appointments:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchAppointments();

    return () => {
      cancelled = true;
    };
  }, [filterStatus, page]);

  useEffect(() => {
    let cancelled = false;

    const fetchFormData = async () => {
      try {
        const [patientData, doctorData] = await Promise.all([
          getPatients('', 1, 100),
          getDoctors('', 1, 100),
        ]);

        if (!cancelled) {
          setPatients(patientData.data);
          setDoctors(doctorData.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Failed to load patient and doctor data:',
            error,
          );
        }
      }
    };

    void fetchFormData();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setPatientId('');
    setDoctorId('');
    setAppointmentAt('');
    setStatus('SCHEDULED');
    setReason('');
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const closeEditModal = () => {
    setEditingAppointment(null);
    resetForm();
  };

  const handleCreateAppointment = async () => {
    if (!patientId || !doctorId || !appointmentAt) {
      window.alert(
        'Please select a patient, doctor, and appointment date & time.',
      );
      return;
    }

    try {
      setSaving(true);

      await createAppointment(
        Number(patientId),
        Number(doctorId),
        appointmentAt,
        status,
        reason.trim(),
      );

      await loadAppointments();

      closeAddModal();

      window.alert('Appointment created successfully.');
    } catch (error) {
      console.error('Failed to create appointment:', error);

      window.alert(
        'Failed to create appointment. Please check the details and try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) {
      return;
    }

    if (!patientId || !doctorId || !appointmentAt) {
      window.alert(
        'Please select a patient, doctor, and appointment date & time.',
      );
      return;
    }

    try {
      setSaving(true);

      await updateAppointment(
        editingAppointment.id,
        Number(patientId),
        Number(doctorId),
        appointmentAt,
        status,
        reason.trim(),
      );

      await loadAppointments();

      closeEditModal();

      window.alert('Appointment updated successfully.');
    } catch (error) {
      console.error('Failed to update appointment:', error);

      window.alert(
        'Failed to update appointment. Please check the details and try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);

    setPatientId(String(appointment.patientId));
    setDoctorId(String(appointment.doctorId));

    setAppointmentAt(
      new Date(appointment.appointmentAt).toISOString().slice(0, 16),
    );

    setStatus(appointment.status);
    setReason(appointment.reason || '');
  };

  return (
    <div className="appointment-page">
      <div className="appointment-container">
        <div className="appointment-header">
          <div>
            <span className="page-eyebrow">APPOINTMENT MANAGEMENT</span>
            <h1>Appointments</h1>
            <p>Manage patient appointments and schedules.</p>
          </div>

          <button
            className="primary-button"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            disabled={saving}
          >
            + New Appointment
          </button>
        </div>

        <div className="filter-container">
          <span className="filter-label">Filter by status</span>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(event) => {
              setFilterStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>

        <div className="appointment-content">
          {loading ? (
            <div className="state-message">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="state-message">No appointments found.</div>
          ) : (
            <>
              <AppointmentTable
                appointments={appointments}
                patients={patients}
                doctors={doctors}
                onView={(appointment) =>
                  setSelectedAppointment(appointment)
                }
                onEdit={handleEdit}
              />

              {totalPages > 1 && (
                <div className="pagination">
            <button
              className="pagination-button"
              onClick={() =>
                setPage((currentPage) => currentPage - 1)
              }
              disabled={page === 1 || loading}
            >
              ← Previous
            </button>

            <div className="pagination-center">
              <span className="pagination-page">
                Page {page} of {totalPages}
              </span>
              <span className="pagination-total">
                {totalAppointments} appointments
              </span>
            </div>

            <button
              className="pagination-button"
              onClick={() =>
                setPage((currentPage) => currentPage + 1)
              }
              disabled={page === totalPages || loading}
            >
              Next →
            </button>
          </div>
        )}
            </>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>New Appointment</h2>
                <p>Schedule a new patient appointment.</p>
              </div>

              <button
                className="modal-close"
                onClick={closeAddModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="appointment-patient">Patient</label>

                <select
                  id="appointment-patient"
                  className="form-input"
                  value={patientId}
                  onChange={(event) => setPatientId(event.target.value)}
                  disabled={saving}
                >
                  <option value="">Select patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="appointment-doctor">Doctor</label>

                <select
                  id="appointment-doctor"
                  className="form-input"
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  disabled={saving}
                >
                  <option value="">Select doctor</option>

                  {doctors
                    .filter((doctor) => doctor.isActive)
                    .map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name || `Doctor #${doctor.id}`} -{' '}
                        {doctor.specialization}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="appointment-date">Date &amp; Time</label>

                <input
                  id="appointment-date"
                  type="datetime-local"
                  className="form-input"
                  value={appointmentAt}
                  onChange={(event) =>
                    setAppointmentAt(event.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointment-status">Status</label>

                <select
                  id="appointment-status"
                  className="form-input"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={saving}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="appointment-reason">Reason</label>

                <textarea
                  id="appointment-reason"
                  className="form-input"
                  placeholder="Enter appointment reason"
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleCreateAppointment}
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal appointment-details-modal">
            <div className="modal-header">
              <div>
                <h2>Appointment Details</h2>
                <p>View appointment information.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                ×
              </button>
            </div>

            <div className="details-list">
              <div className="details-item">
                <span className="details-label">Appointment ID</span>
                <span className="details-value">
                  {selectedAppointment.id}
                </span>
              </div>

              <div className="details-item">
                <span className="details-label">Patient</span>
                <span className="details-value">
                  {patients.find(
                    (patient) =>
                      patient.id === selectedAppointment.patientId,
                  )?.name || `Patient #${selectedAppointment.patientId}`}
                </span>
              </div>

              <div className="details-item">
                <span className="details-label">Doctor</span>
                <span className="details-value">
                  {doctors.find(
                    (doctor) =>
                      doctor.id === selectedAppointment.doctorId,
                  )?.name || `Doctor #${selectedAppointment.doctorId}`}
                </span>
              </div>

              <div className="details-item">
                <span className="details-label">Date &amp; Time</span>
                <span className="details-value">
                  {new Date(
                    selectedAppointment.appointmentAt,
                  ).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="details-item">
                <span className="details-label">Status</span>
                <span className="details-value">
                  <span
                    className={`status-badge status-${selectedAppointment.status.toLowerCase()}`}
                  >
                    {selectedAppointment.status.replace('_', ' ')}
                  </span>
                </span>
              </div>

              <div className="details-item">
                <span className="details-label">Reason</span>
                <span className="details-value">
                  {selectedAppointment.reason || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingAppointment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Edit Appointment</h2>
                <p>Update appointment information.</p>
              </div>

              <button
                className="modal-close"
                onClick={closeEditModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-appointment-patient">Patient</label>

                <select
                  id="edit-appointment-patient"
                  className="form-input"
                  value={patientId}
                  onChange={(event) => setPatientId(event.target.value)}
                  disabled={saving}
                >
                  <option value="">Select patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-appointment-doctor">Doctor</label>

                <select
                  id="edit-appointment-doctor"
                  className="form-input"
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  disabled={saving}
                >
                  <option value="">Select doctor</option>

                  {doctors
                    .filter((doctor) => doctor.isActive)
                    .map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name || `Doctor #${doctor.id}`} -{' '}
                        {doctor.specialization}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-appointment-date">Date &amp; Time</label>

                <input
                  id="edit-appointment-date"
                  type="datetime-local"
                  className="form-input"
                  value={appointmentAt}
                  onChange={(event) =>
                    setAppointmentAt(event.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-appointment-status">Status</label>

                <select
                  id="edit-appointment-status"
                  className="form-input"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={saving}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-appointment-reason">Reason</label>

                <textarea
                  id="edit-appointment-reason"
                  className="form-input"
                  placeholder="Enter appointment reason"
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleUpdateAppointment}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentManagement;
