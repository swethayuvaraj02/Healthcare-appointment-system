import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react';

import DoctorTable from '../components/DoctorTable';

import {
  activateDoctor,
  createDoctor,
  deactivateDoctor,
  getDoctor,
  getDoctors,
  updateDoctor,
  type Doctor,
} from '../services/doctorService';
import './DoctorManagement.css';

const PAGE_SIZE = 10;

type DoctorFormErrors = {
  name?: string;
  email?: string;
  specialization?: string;
  general?: string;
};

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
      return apiMessage
        .filter(
          (message): message is string =>
            typeof message === 'string',
        )
        .join(' ');
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

function validateDoctorFields(
  name: string,
  email: string,
  specialization: string,
): DoctorFormErrors {
  const errors: DoctorFormErrors = {};

  if (!name.trim()) {
    errors.name = 'Please enter the doctor name.';
  }

  if (!email.trim()) {
    errors.email = 'Please enter the email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!specialization.trim()) {
    errors.specialization =
      'Please enter the doctor specialization.';
  }

  return errors;
}

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const [selectedDoctor, setSelectedDoctor] =
    useState<Doctor | null>(null);

  const [editingDoctor, setEditingDoctor] =
    useState<Doctor | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);

  const [doctorToDeactivate, setDoctorToDeactivate] =
    useState<Doctor | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newAvailability, setNewAvailability] = useState('');

  const [formErrors, setFormErrors] =
    useState<DoctorFormErrors>({});

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setPageError('');

    try {
      const data = await getDoctors(search, page, PAGE_SIZE);

      setDoctors(data.data);
      setTotalPages(Math.max(1, data.pagination.totalPages));
      setTotalDoctors(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadDoctors();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadDoctors]);

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const resetAddForm = () => {
    setNewName('');
    setNewEmail('');
    setNewSpecialization('');
    setNewAvailability('');
    setFormErrors({});
  };

  const openAddModal = () => {
    resetAddForm();
    setShowAddForm(true);
  };

  const closeAddModal = () => {
    if (saving) return;

    setShowAddForm(false);
    resetAddForm();
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditingDoctor(null);
    setFormErrors({});
  };

  const handleView = async (id: number) => {
    try {
      const doctor = await getDoctor(id);
      setSelectedDoctor(doctor);
    } catch (error) {
      console.error('Failed to fetch doctor:', error);
      setPageError(
        'Failed to load doctor details. Please try again.',
      );
    }
  };

  const handleCreateDoctor = async () => {
    const errors = validateDoctorFields(
      newName,
      newEmail,
      newSpecialization,
    );

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      await createDoctor(
        newName.trim(),
        newEmail.trim(),
        newSpecialization.trim(),
        newAvailability.trim(),
      );

      setShowAddForm(false);
      resetAddForm();

      if (page !== 1) {
        setPage(1);
      } else {
        await loadDoctors();
      }
    } catch (error) {
      console.error('Failed to create doctor:', error);

      setFormErrors({
        general: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctor) {
      return;
    }

    const errors = validateDoctorFields(
      editingDoctor.name,
      editingDoctor.email,
      editingDoctor.specialization,
    );

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      await updateDoctor(
        editingDoctor.id,
        editingDoctor.name.trim(),
        editingDoctor.email.trim(),
        editingDoctor.specialization.trim(),
        editingDoctor.availability?.trim() ?? '',
      );

      setEditingDoctor(null);
      setFormErrors({});

      await loadDoctors();
    } catch (error) {
      console.error('Failed to update doctor:', error);

      setFormErrors({
        general: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateDoctor = async () => {
  if (!doctorToDeactivate) return;

  try {
    setSaving(true);

    if (doctorToDeactivate.isActive) {
      await deactivateDoctor(doctorToDeactivate.id);
    } else {
      await activateDoctor(doctorToDeactivate.id);
    }

    setDoctorToDeactivate(null);
    setSelectedDoctor(null);

    await loadDoctors();
  } catch (error) {
    console.error('Failed to update doctor status:', error);
    setPageError(getErrorMessage(error));
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor({ ...doctor });
    setFormErrors({});
  };

  return (
    <div className="doctor-page">
      <div className="doctor-container">
        <div className="doctor-header">
          <div>
            <span className="page-eyebrow">
              DOCTOR MANAGEMENT
            </span>

            <h1>Doctor Management</h1>

            <p>
              Manage doctors and their availability.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openAddModal}
            disabled={saving}
          >
            + Add Doctor
          </button>
        </div>

        <div className="search-summary-container">
          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder="Search doctors..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search doctors"
            />
          </div>

          <div className="total-card">
            <span>Total Doctors</span>
            <strong>{totalDoctors}</strong>
          </div>
        </div>

        {pageError && (
          <div
            className="form-feedback form-feedback-error"
            role="alert"
            style={{ marginBottom: 16 }}
          >
            {pageError}
          </div>
        )}

        <div className="table-card">
          {loading ? (
            <div className="state-message">
              Loading doctors...
            </div>
          ) : doctors.length === 0 ? (
            <div className="state-message">
              No doctors found.
            </div>
          ) : (
            <DoctorTable
              doctors={doctors}
              onView={handleView}
              onEdit={handleEdit}
              onDeactivate={(id: number) => {
                const doctor = doctors.find(
                  (item) => item.id === id,
                );

                if (doctor) {
                  setDoctorToDeactivate(doctor);
                }
              }}
            />
          )}

          <div className="pagination">
            <button
              type="button"
              className="pagination-button"
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              disabled={page <= 1 || loading}
            >
              ← Previous
            </button>

            <div className="pagination-center">
              <span className="pagination-page">
                Page {page} of {Math.max(1, totalPages)}
              </span>

              <span className="pagination-total">
                {totalDoctors} doctors
              </span>
            </div>

            <button
              type="button"
              className="pagination-button"
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    Math.max(1, totalPages),
                    current + 1,
                  ),
                )
              }
              disabled={
                page >= totalPages || loading
              }
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-doctor-title"
          >
            <h2 id="add-doctor-title">
              Add Doctor
            </h2>

            <div className="form-group">
              <label htmlFor="add-doctor-name">
                Name *
              </label>

              <input
                id="add-doctor-name"
                type="text"
                className="form-input"
                value={newName}
                onChange={(event) => {
                  setNewName(event.target.value);
                  setFormErrors((current) => ({
                    ...current,
                    name: undefined,
                    general: undefined,
                  }));
                }}
                disabled={saving}
                required
              />

              {formErrors.name && (
                <p className="field-error" role="alert">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="add-doctor-email">
                Email *
              </label>

              <input
                id="add-doctor-email"
                type="email"
                className="form-input"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.target.value);
                  setFormErrors((current) => ({
                    ...current,
                    email: undefined,
                    general: undefined,
                  }));
                }}
                disabled={saving}
                required
              />

              {formErrors.email && (
                <p className="field-error" role="alert">
                  {formErrors.email}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="add-doctor-specialization">
                Specialization *
              </label>

              <input
                id="add-doctor-specialization"
                type="text"
                className="form-input"
                value={newSpecialization}
                onChange={(event) => {
                  setNewSpecialization(event.target.value);
                  setFormErrors((current) => ({
                    ...current,
                    specialization: undefined,
                    general: undefined,
                  }));
                }}
                disabled={saving}
                required
              />

              {formErrors.specialization && (
                <p className="field-error" role="alert">
                  {formErrors.specialization}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="add-doctor-availability">
                Availability
              </label>

              <input
                id="add-doctor-availability"
                type="text"
                className="form-input"
                value={newAvailability}
                onChange={(event) =>
                  setNewAvailability(event.target.value)
                }
                placeholder="e.g. Mon-Fri, 9 AM-5 PM"
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
                onClick={() =>
                  void handleCreateDoctor()
                }
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Create Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDoctor && (
        <div className="modal-overlay">
          <div
            className="modal doctor-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-details-title"
          >
            <div className="doctor-details-header">
              <div className="doctor-profile">
                <div className="doctor-avatar">
                  {selectedDoctor.name
                    ?.charAt(0)
                    .toUpperCase() || 'D'}
                </div>

                <div className="doctor-profile-info">
                  <span className="doctor-details-eyebrow">
                    DOCTOR PROFILE
                  </span>

                  <h2 id="doctor-details-title">
                    {selectedDoctor.name ||
                      `Doctor #${selectedDoctor.id}`}
                  </h2>

                  <p>
                    {selectedDoctor.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="doctor-status-row">
              <span
                className={`doctor-detail-status ${
                  selectedDoctor.isActive
                    ? 'active'
                    : 'inactive'
                }`}
              >
                <span className="status-dot" />

                {selectedDoctor.isActive
                  ? 'Active'
                  : 'Inactive'}
              </span>
            </div>

            <div className="doctor-detail-section">
              <h3>Doctor Information</h3>

              <div className="doctor-detail-grid">
                <div className="doctor-detail-item">
                  <span>Doctor ID</span>
                  <strong>
                    {selectedDoctor.id}
                  </strong>
                </div>

                <div className="doctor-detail-item">
                  <span>Name</span>
                  <strong>
                    {selectedDoctor.name ||
                      'Not provided'}
                  </strong>
                </div>

                <div className="doctor-detail-item">
                  <span>Email</span>
                  <strong>
                    {selectedDoctor.email}
                  </strong>
                </div>

                <div className="doctor-detail-item">
                  <span>Specialization</span>
                  <strong>
                    {selectedDoctor.specialization}
                  </strong>
                </div>

                <div className="doctor-detail-item doctor-detail-item-full">
                  <span>Availability</span>
                  <strong>
                    {selectedDoctor.availability ||
                      'Not specified'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="doctor-details-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedDoctor(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingDoctor && (
        <div className="modal-overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-doctor-title"
          >
            <h2 id="edit-doctor-title">
              Edit Doctor
            </h2>

            <div className="form-group">
              <label htmlFor="edit-doctor-name">
                Name *
              </label>

              <input
                id="edit-doctor-name"
                type="text"
                className="form-input"
                value={editingDoctor.name}
                onChange={(event) => {
                  setEditingDoctor({
                    ...editingDoctor,
                    name: event.target.value,
                  });

                  setFormErrors((current) => ({
                    ...current,
                    name: undefined,
                    general: undefined,
                  }));
                }}
                disabled={saving}
                required
              />

              {formErrors.name && (
                <p className="field-error" role="alert">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-doctor-email">
                Email *
              </label>

              <input
                id="edit-doctor-email"
                type="email"
                className="form-input"
                value={editingDoctor.email}
                onChange={(event) => {
                  setEditingDoctor({
                    ...editingDoctor,
                    email: event.target.value,
                  });

                  setFormErrors((current) => ({
                    ...current,
                    email: undefined,
                    general: undefined,
                  }));
                }}
                disabled={saving}
                required
              />

              {formErrors.email && (
                <p className="field-error" role="alert">
                  {formErrors.email}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-doctor-specialization">
                Specialization *
              </label>

              <input
                id="edit-doctor-specialization"
                type="text"
                className="form-input"
                value={editingDoctor.specialization}
                onChange={(event) => {
                  setEditingDoctor({
                    ...editingDoctor,
                    specialization: event.target.value,
                  });

                  setFormErrors((current) => ({
                    ...current,
                    specialization: undefined,
                    general: undefined,
                  }));
                }}
                disabled={saving}
                required
              />

              {formErrors.specialization && (
                <p className="field-error" role="alert">
                  {formErrors.specialization}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-doctor-availability">
                Availability
              </label>

              <input
                id="edit-doctor-availability"
                type="text"
                className="form-input"
                value={
                  editingDoctor.availability ?? ''
                }
                onChange={(event) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    availability:
                      event.target.value,
                  })
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
                onClick={closeEditModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  void handleUpdateDoctor()
                }
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
{doctorToDeactivate && (
  <div className="modal-overlay">
    <div
      className={`confirmation-modal doctor-deactivate-modal ${
  doctorToDeactivate.isActive ? '' : 'doctor-activate-modal'
}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-doctor-title"
    >
      <div className="doctor-deactivate-icon">
        !
      </div>

      <span className="doctor-deactivate-eyebrow">
        DOCTOR STATUS
      </span>

     <h2 id="deactivate-doctor-title">
  {doctorToDeactivate.isActive
    ? 'Deactivate Doctor'
    : 'Activate Doctor'}
</h2>

      <p className="doctor-deactivate-description">
  {doctorToDeactivate.isActive
    ? "Are you sure you want to deactivate this doctor?"
    : "Are you sure you want to reactivate this doctor?"}
</p>

      <div className="doctor-deactivate-profile">
        <div className="doctor-deactivate-avatar">
          {doctorToDeactivate.name
            ?.charAt(0)
            .toUpperCase() || 'D'}
        </div>

        <div className="doctor-deactivate-info">
          <strong>
            {doctorToDeactivate.name ||
              `Doctor #${doctorToDeactivate.id}`}
          </strong>

          <span>
            Doctor ID #{doctorToDeactivate.id}
          </span>
        </div>
      </div>

      <div className="doctor-deactivate-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setDoctorToDeactivate(null)}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="button"
          className="doctor-deactivate-button"
          onClick={() => void handleDeactivateDoctor()}
          disabled={saving}
        >
         {saving
  ? doctorToDeactivate.isActive
    ? 'Deactivating...'
    : 'Activating...'
  : doctorToDeactivate.isActive
    ? 'Deactivate'
    : 'Activate'}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}