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

type AppointmentFormErrors = {
  patientId?: string;
  doctorId?: string;
  appointmentAt?: string;
  general?: string;
};

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      message?: unknown;
      response?: {
        data?: {
          message?: unknown;
        };
      };
    };

    const apiMessage = err.response?.data?.message;

    if (Array.isArray(apiMessage)) {
      return apiMessage.filter(
        (message): message is string => typeof message === 'string',
      ).join(' ');
    }

    if (typeof apiMessage === 'string') {
      return apiMessage;
    }

    if (typeof err.message === 'string') {
      return err.message;
    }
  }

  return 'Something went wrong. Please try again.';
}

function toLocalDateTimeValue(date: Date): string {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );

  return localDate.toISOString().slice(0, 16);
}

function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<AppointmentFormErrors>({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);

  const [filterStatus, setFilterStatus] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentAt, setAppointmentAt] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('SCHEDULED');

  const resetForm = () => {
    setPatientId('');
    setDoctorId('');
    setAppointmentAt('');
    setReason('');
    setFormErrors({});
  };

  const closeAddModal = () => {
    if (saving) return;

    setIsAddModalOpen(false);
    resetForm();
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditingAppointment(null);
    resetForm();
  };

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

  const validateAppointmentForm = (): boolean => {
    const errors: AppointmentFormErrors = {};

    if (!patientId) {
      errors.patientId = 'Please select a patient.';
    }

    if (!doctorId) {
      errors.doctorId = 'Please select a doctor.';
    }

    if (!appointmentAt) {
      errors.appointmentAt =
        'Please enter an appointment date and time.';
    } else {
      const selectedDate = new Date(appointmentAt);

      if (Number.isNaN(selectedDate.getTime())) {
        errors.appointmentAt =
          'Please enter a valid appointment date and time.';
      } else if (
        selectedDate <= new Date() &&
        (!editingAppointment ||
          appointmentAt !==
            toLocalDateTimeValue(new Date(editingAppointment.appointmentAt)))
      ) {
        errors.appointmentAt =
          'Appointment date and time must be in the future.';
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  
const handleCreateAppointment = async () => {
  if (!validateAppointmentForm()) {
    return;
  }

  try {
    setSaving(true);

    await createAppointment(
      Number(patientId),
      Number(doctorId),
      appointmentAt,
      reason,
    );

    setIsAddModalOpen(false);
    resetForm();

    await loadAppointments();
  } catch (error: unknown) {
    console.error('Failed to create appointment:', error);

    setFormErrors({
      general: getErrorMessage(error),
    });
  } finally {
    setSaving(false);
  }
};


  const handleUpdateAppointment = async () => {
    if (!editingAppointment) {
      return;
    }

    if (!validateAppointmentForm()) {
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

      setEditingAppointment(null);
      resetForm();

      await loadAppointments();
    } catch (error: unknown) {
      console.error('Failed to update appointment:', error);

      setFormErrors({
        general: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setPatientId(String(appointment.patientId));
    setDoctorId(String(appointment.doctorId));

    setAppointmentAt(
      toLocalDateTimeValue(new Date(appointment.appointmentAt)),
    );

    setReason(appointment.reason || '');
    setStatus(appointment.status);
    setFormErrors({});
  };

  const handlePatientChange = (value: string) => {
    setPatientId(value);

    setFormErrors((current) => ({
      ...current,
      patientId: undefined,
      general: undefined,
    }));
  };

  const handleDoctorChange = (value: string) => {
    setDoctorId(value);

    setFormErrors((current) => ({
      ...current,
      doctorId: undefined,
      general: undefined,
    }));
  };

  const handleAppointmentDateChange = (value: string) => {
    setAppointmentAt(value);

    setFormErrors((current) => ({
      ...current,
      appointmentAt: undefined,
      general: undefined,
    }));
  };

  const handleReasonChange = (value: string) => {
    setReason(value);

    setFormErrors((current) => ({
      ...current,
      general: undefined,
    }));
  };

  return (
    <div className="appointment-page">
      <div className="appointment-container">
        <div className="appointment-header">
          <div>
            <span className="page-eyebrow">
              APPOINTMENT MANAGEMENT
            </span>
            <h1>Appointments</h1>
            <p>Manage patient appointments and schedules.</p>
          </div>

          <button
            type="button"
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
  className="appointment-filter-select"
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
            <div className="state-message">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="state-message">
              No appointments found.
            </div>
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
                    type="button"
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
                    type="button"
                    className="pagination-button"
                    onClick={() =>
                      setPage((currentPage) => currentPage + 1)
                    }
                    disabled={page >= totalPages || loading}
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
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-appointment-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="new-appointment-title">
                  New Appointment
                </h2>
                <p>Schedule a new patient appointment.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeAddModal}
                disabled={saving}
                aria-label="Close new appointment form"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="appointment-patient">
                  Patient
                </label>

                <select
                  id="appointment-patient"
                  className="form-input"
                  value={patientId}
                  onChange={(event) =>
                    handlePatientChange(event.target.value)
                  }
                  disabled={saving}
                  required
                  aria-invalid={Boolean(formErrors.patientId)}
                  aria-describedby={
                    formErrors.patientId
                      ? 'appointment-patient-error'
                      : undefined
                  }
                >
                  <option value="">Select patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>

                {formErrors.patientId && (
                  <p
                    id="appointment-patient-error"
                    className="field-error"
                    role="alert"
                  >
                    {formErrors.patientId}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="appointment-doctor">
                  Doctor
                </label>

                <select
                  id="appointment-doctor"
                  className="form-input"
                  value={doctorId}
                  onChange={(event) =>
                    handleDoctorChange(event.target.value)
                  }
                  disabled={saving}
                  required
                  aria-invalid={Boolean(formErrors.doctorId)}
                  aria-describedby={
                    formErrors.doctorId
                      ? 'appointment-doctor-error'
                      : undefined
                  }
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

                {formErrors.doctorId && (
                  <p
                    id="appointment-doctor-error"
                    className="field-error"
                    role="alert"
                  >
                    {formErrors.doctorId}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="appointment-date">
                  Date &amp; Time
                </label>

                <input
                  id="appointment-date"
                  type="datetime-local"
                  className="form-input"
                  value={appointmentAt}
                  onChange={(event) =>
                    handleAppointmentDateChange(event.target.value)
                  }
                 min={toLocalDateTimeValue(new Date())}
                  disabled={saving}
                  required
                  aria-invalid={Boolean(formErrors.appointmentAt)}
                  aria-describedby={
                    formErrors.appointmentAt
                      ? 'appointment-date-error'
                      : undefined
                  }
                />

                {formErrors.appointmentAt && (
                  <p
                    id="appointment-date-error"
                    className="field-error"
                    role="alert"
                  >
                    {formErrors.appointmentAt}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="appointment-reason">
                  Reason
                </label>

                <textarea
                  id="appointment-reason"
                  className="form-input"
                  placeholder="Enter appointment reason"
                  rows={3}
                  value={reason}
                  onChange={(event) =>
                    handleReasonChange(event.target.value)
                  }
                  disabled={saving}
                />
              </div>

              {formErrors.general && (
                <div
                  className="form-feedback form-feedback-error"
                  role="alert"
                >
                  {formErrors.general}
                </div>
              )}

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
          <div
            className="modal appointment-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-details-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="appointment-details-title">
                  Appointment Details
                </h2>
                <p>View appointment information.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close appointment details"
              >
                ×
              </button>
            </div>

            <div className="details-list">
              <div className="details-item">
                <span className="details-label">
                  Appointment ID
                </span>
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
                  )?.name ||
                    `Patient #${selectedAppointment.patientId}`}
                </span>
              </div>

              <div className="details-item">
                <span className="details-label">Doctor</span>
                <span className="details-value">
                  {doctors.find(
                    (doctor) =>
                      doctor.id === selectedAppointment.doctorId,
                  )?.name ||
                    `Doctor #${selectedAppointment.doctorId}`}
                </span>
              </div>

              <div className="details-item">
                <span className="details-label">
                  Date &amp; Time
                </span>
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
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-appointment-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="edit-appointment-title">
                  Edit Appointment
                </h2>
                <p>Update appointment information.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Close edit appointment form"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-appointment-patient">
                  Patient
                </label>

                <select
                  id="edit-appointment-patient"
                  className="form-input"
                  value={patientId}
                  onChange={(event) =>
                    handlePatientChange(event.target.value)
                  }
                  disabled={saving}
                  required
                  aria-invalid={Boolean(formErrors.patientId)}
                  aria-describedby={
                    formErrors.patientId
                      ? 'edit-appointment-patient-error'
                      : undefined
                  }
                >
                  <option value="">Select patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>

                {formErrors.patientId && (
                  <p
                    id="edit-appointment-patient-error"
                    className="field-error"
                    role="alert"
                  >
                    {formErrors.patientId}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="edit-appointment-doctor">
                  Doctor
                </label>

                <select
                  id="edit-appointment-doctor"
                  className="form-input"
                  value={doctorId}
                  onChange={(event) =>
                    handleDoctorChange(event.target.value)
                  }
                  disabled={saving}
                  required
                  aria-invalid={Boolean(formErrors.doctorId)}
                  aria-describedby={
                    formErrors.doctorId
                      ? 'edit-appointment-doctor-error'
                      : undefined
                  }
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

                {formErrors.doctorId && (
                  <p
                    id="edit-appointment-doctor-error"
                    className="field-error"
                    role="alert"
                  >
                    {formErrors.doctorId}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="edit-appointment-date">
                  Date &amp; Time
                </label>

                <input
                  id="edit-appointment-date"
                  type="datetime-local"
                  className="form-input"
                  value={appointmentAt}
                  onChange={(event) =>
                    handleAppointmentDateChange(event.target.value)
                  }
                  min={toLocalDateTimeValue(new Date())}
                  disabled={saving}
                  required
                  aria-invalid={Boolean(formErrors.appointmentAt)}
                  aria-describedby={
                    formErrors.appointmentAt
                      ? 'edit-appointment-date-error'
                      : undefined
                  }
                />

                {formErrors.appointmentAt && (
                  <p
                    id="edit-appointment-date-error"
                    className="field-error"
                    role="alert"
                  >
                    {formErrors.appointmentAt}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="edit-appointment-reason">
                  Reason
                </label>

                <textarea
                  id="edit-appointment-reason"
                  className="form-input"
                  placeholder="Enter appointment reason"
                  rows={3}
                  value={reason}
                  onChange={(event) =>
                    handleReasonChange(event.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group appointment-status-field">
  <label htmlFor="edit-appointment-status">Status</label>

  <select
    id="edit-appointment-status"
    className="appointment-status-select"
    value={status}
    onChange={(event) => setStatus(event.target.value)}
    disabled={saving}
  >
    {editingAppointment.status === 'SCHEDULED' && (
      <option value="SCHEDULED">Scheduled</option>
    )}

    {editingAppointment.status === 'CONFIRMED' && (
      <option value="CONFIRMED">Confirmed</option>
    )}

    {['SCHEDULED', 'CONFIRMED'].includes(editingAppointment.status) && (
      <>
        {editingAppointment.status === 'SCHEDULED' && (
          <option value="CONFIRMED">Confirmed</option>
        )}

        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="NO_SHOW">No Show</option>
      </>
    )}

    {['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(
      editingAppointment.status,
    ) && (
      <option value={editingAppointment.status}>
        {editingAppointment.status.replace('_', ' ')}
      </option>
    )}
  </select>
</div>

              {formErrors.general && (
                <div
                  className="form-feedback form-feedback-error"
                  role="alert"
                >
                  {formErrors.general}
                </div>
              )}

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
