import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import PatientTable from '../components/PatientTable';
import {
  createPatient,
  deactivatePatient,
  getPatients,
  updatePatient,
  type Patient,
} from '../services/patientService';

function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    null,
  );
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deactivatingPatient, setDeactivatingPatient] =
    useState<Patient | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
    });
    setFormError('');
  };

  const loadPatients = useCallback(async () => {
  try {
    const data = await getPatients(search, page, PAGE_SIZE);

    setPatients(data.data);
    setTotalPages(data.pagination.totalPages);
    setTotalPatients(data.pagination.total);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
  } finally {
    setLoading(false);
    setSaving(false);
  }
}, [search, page]);

  const handleView = (id: number) => {
    const patient = patients.find((item) => item.id === id);

    if (patient) {
      setSelectedPatient(patient);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);

    setFormData({
      name: patient.name,
      dateOfBirth: patient.dateOfBirth.slice(0, 10),
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact,
    });

    setFormError('');
    setShowAddModal(true);
  };

  const handleDeactivate = async () => {
    if (!deactivatingPatient) {
      return;
    }

    try {
      setSaving(true);

      await deactivatePatient(deactivatingPatient.id);

      await loadPatients();

      setDeactivatingPatient(null);
    } catch (error) {
      console.error('Failed to deactivate patient:', error);
      setSaving(false);
      window.alert('Unable to deactivate patient. Please try again.');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleCreatePatient = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError('');

    if (
      !formData.name.trim() ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.phone.trim() ||
      !formData.emergencyContact.trim()
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);

      if (editingPatient) {
        await updatePatient(
          editingPatient.id,
          formData.name.trim(),
          formData.dateOfBirth,
          formData.gender,
          formData.phone.trim(),
          formData.email.trim(),
          formData.address.trim(),
          formData.emergencyContact.trim(),
        );
      } else {
        await createPatient(
          formData.name.trim(),
          formData.dateOfBirth,
          formData.gender,
          formData.phone.trim(),
          formData.email.trim(),
          formData.address.trim(),
          formData.emergencyContact.trim(),
        );
      }

      await loadPatients();

      setShowAddModal(false);
      setEditingPatient(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save patient:', error);
      setFormError('Unable to save patient. Please try again.');
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseFormModal = () => {
    if (saving) {
      return;
    }

    setShowAddModal(false);
    setEditingPatient(null);
    resetForm();
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPatients();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPatients]);

  return (
    <div className="patient-page">
      <div className="patient-container">
        <div className="patient-header">
          <div className="patient-heading">
            <span className="page-eyebrow">PATIENT MANAGEMENT</span>
            <h1>Patients</h1>
            <p>Manage patient records, contact information, and status.</p>
          </div>

          <button
            className="primary-button"
            onClick={handleOpenAddModal}
            disabled={saving}
          >
            <span>+</span>
            Add Patient
          </button>
        </div>

        <div className="patient-toolbar">
          <div className="search-container">
            <div className="search-icon">⌕</div>

            <input
              type="text"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search by name, email, or phone..."
              className="search-input"
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => handleSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="patient-summary">
            <span className="patient-summary-label">Total patients</span>
            <strong>{totalPatients}</strong>
          </div>
        </div>

        {loading ? (
          <div className="state-message">
            <div className="loading-spinner" />
            <span>Loading patients...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="state-message empty-state">
            <div className="empty-state-icon">⌕</div>
            <h3>No patients found</h3>
            <p>
              {search
                ? 'Try adjusting your search.'
                : 'Add your first patient to get started.'}
            </p>

            {!search && (
              <button
                className="primary-button"
                onClick={handleOpenAddModal}
              >
                + Add Patient
              </button>
            )}
          </div>
        ) : (
          <PatientTable
            patients={patients}
            onView={handleView}
            onEdit={handleEdit}
            onDeactivate={setDeactivatingPatient}
          />
        )}

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
                {totalPatients} patients
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

        {selectedPatient && (
          <div className="modal-overlay">
            <div className="modal patient-details-modal">
              <div className="modal-header">
                <div className="modal-title-group">
                  <div className="patient-avatar large">
                    {selectedPatient.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <span className="modal-eyebrow">PATIENT DETAILS</span>
                    <h2>{selectedPatient.name}</h2>
                    <p>Patient ID #{selectedPatient.id}</p>
                  </div>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setSelectedPatient(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="details-status">
                <span
                  className={`status-badge ${
                    selectedPatient.isActive
                      ? 'status-active'
                      : 'status-inactive'
                  }`}
                >
                  <span className="status-dot" />
                  {selectedPatient.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="details-section">
                <h3>Personal Information</h3>

                <div className="details-grid">
                  <div className="details-item">
                    <span className="details-label">Date of Birth</span>
                    <span className="details-value">
                      {new Date(
                        selectedPatient.dateOfBirth,
                      ).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="details-item">
                    <span className="details-label">Gender</span>
                    <span className="details-value">
                      {selectedPatient.gender}
                    </span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Contact Information</h3>

                <div className="details-grid">
                  <div className="details-item">
                    <span className="details-label">Phone</span>
                    <span className="details-value">
                      {selectedPatient.phone}
                    </span>
                  </div>

                  <div className="details-item">
                    <span className="details-label">Email</span>
                    <span className="details-value">
                      {selectedPatient.email || 'Not provided'}
                    </span>
                  </div>

                  <div className="details-item details-item-full">
                    <span className="details-label">Address</span>
                    <span className="details-value">
                      {selectedPatient.address || 'Not provided'}
                    </span>
                  </div>

                  <div className="details-item details-item-full">
                    <span className="details-label">
                      Emergency Contact
                    </span>
                    <span className="details-value">
                      {selectedPatient.emergencyContact}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setSelectedPatient(null)}
                >
                  Close
                </button>

                <button
                  className="primary-button"
                  onClick={() => {
                    setSelectedPatient(null);
                    handleEdit(selectedPatient);
                  }}
                >
                  Edit Patient
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal patient-form-modal">
              <div className="modal-header">
                <div>
                  <span className="modal-eyebrow">
                    {editingPatient
                      ? 'UPDATE RECORD'
                      : 'NEW PATIENT'}
                  </span>

                  <h2>
                    {editingPatient
                      ? 'Edit Patient'
                      : 'Add Patient'}
                  </h2>

                  <p>
                    {editingPatient
                      ? 'Update the patient information below.'
                      : 'Enter the patient information below.'}
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={handleCloseFormModal}
                  disabled={saving}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreatePatient}>
                <div className="form-section">
                  <h3>Personal Information</h3>

                  <div className="form-grid">
                    <div className="form-group form-group-full">
                      <label htmlFor="name">Full Name</label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter patient name"
                        className="form-input"
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="dateOfBirth">
                        Date of Birth
                      </label>

                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender">Gender</label>

                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        disabled={saving}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contact Information</h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="form-input"
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        className="form-input"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label htmlFor="address">Address</label>

                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                        className="form-input"
                        rows={3}
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label htmlFor="emergencyContact">
                        Emergency Contact
                      </label>

                      <input
                        id="emergencyContact"
                        name="emergencyContact"
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="Enter emergency contact"
                        className="form-input"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="form-error">{formError}</p>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCloseFormModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? 'Saving...'
                      : editingPatient
                        ? 'Save Changes'
                        : 'Add Patient'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deactivatingPatient && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="confirmation-icon">!</div>

              <div className="modal-header">
                <div>
                  <span className="modal-eyebrow">PATIENT STATUS</span>
                  <h2>Deactivate Patient</h2>
                  <p>
                    This action will change the patient's status to
                    inactive.
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setDeactivatingPatient(null)}
                  disabled={saving}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="confirmation-patient">
                <div className="patient-avatar">
                  {deactivatingPatient.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{deactivatingPatient.name}</strong>
                  <span>
                    Patient ID #{deactivatingPatient.id}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setDeactivatingPatient(null)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={handleDeactivate}
                  disabled={saving}
                >
                  {saving ? 'Deactivating...' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientManagement;