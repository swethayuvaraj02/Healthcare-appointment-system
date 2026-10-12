import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import DoctorTable from '../components/DoctorTable';
import {
  createDoctor,
  deactivateDoctor,
  getDoctor,
  getDoctors,
  updateDoctor,
  type Doctor,
} from '../services/doctorService';
import './DoctorManagement.css';

function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const PAGE_SIZE = 5;

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [doctorToDeactivate, setDoctorToDeactivate] = useState<number | null>(
    null,
  );

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newAvailability, setNewAvailability] = useState('');

  const loadDoctors = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getDoctors(search, page, PAGE_SIZE);

      setDoctors(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalDoctors(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    let isMounted = true;

    const fetchDoctors = async () => {
      setLoading(true);

      try {
        const data = await getDoctors(search, page, PAGE_SIZE);

        if (!isMounted) {
          return;
        }

        setDoctors(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalDoctors(data.pagination.total);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, [search, page]);

  const handleView = async (id: number) => {
    try {
      const doctor = await getDoctor(id);
      setSelectedDoctor(doctor);
    } catch (error) {
      console.error('Failed to fetch doctor:', error);
      window.alert('Failed to load doctor details.');
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor({ ...doctor });
  };

  const handleDeactivate = (id: number) => {
    setDoctorToDeactivate(id);
  };

  const confirmDeactivate = async () => {
    if (doctorToDeactivate === null) {
      return;
    }

    try {
      setSaving(true);

      await deactivateDoctor(doctorToDeactivate);
      await loadDoctors();

      if (selectedDoctor?.id === doctorToDeactivate) {
        setSelectedDoctor(null);
      }

      setDoctorToDeactivate(null);
    } catch (error) {
      console.error('Failed to deactivate doctor:', error);
      window.alert('Failed to deactivate doctor.');
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCreateDoctor = async () => {
  if (
    !newName.trim() ||
    !newEmail.trim() ||
    !newSpecialization.trim()
  ) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    await createDoctor(
      newName.trim(),
      newEmail.trim(),
      newSpecialization.trim(),
      newAvailability.trim(),
    );

    await loadDoctors();
    setNewName('');
    setNewEmail('');
    setNewSpecialization('');
    setNewAvailability('');
    setShowAddForm(false);
  } catch (error) {
    console.error('Failed to create doctor:', error);
    alert('Failed to create doctor. Please check the details and try again.');
  }
};

  const handleUpdateDoctor = async () => {
    if (!editingDoctor) {
      return;
    }

    if (
      !editingDoctor.name?.trim() ||
      !editingDoctor.email?.trim() ||
      !editingDoctor.specialization.trim()
    ) {
      window.alert('Name, email, and specialization are required.');
      return;
    }

    try {
      setSaving(true);

      await updateDoctor(
        editingDoctor.id,
        editingDoctor.name.trim(),
        editingDoctor.email.trim(),
        editingDoctor.specialization.trim(),
        editingDoctor.availability?.trim() || '',
      );

      await loadDoctors();
      setEditingDoctor(null);
    } catch (error) {
      console.error('Failed to update doctor:', error);
      window.alert('Failed to update doctor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="doctor-page">
      <div className="doctor-container">
        <div className="doctor-header">
          <div>
            <span className="page-eyebrow">DOCTOR MANAGEMENT</span>
            <h1>Doctors</h1>
            <p>Manage doctors, specializations, and availability.</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add Doctor
          </button>
        </div>

        <div className="search-summary-container">
          <div className="search-container">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by specialization..."
              className="search-input"
            />
          </div>

          <div className="total-card">
            <span>Total Doctors</span>
            <strong>{totalDoctors}</strong>
          </div>
        </div>

        {loading ? (
          <div className="state-message">
            <p>Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="state-message">
            <p>No doctors found.</p>
          </div>
        ) : (
          <DoctorTable
            doctors={doctors}
            onView={handleView}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
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
                {totalDoctors} doctors
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

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Add Doctor</h2>

              <div className="form-group">
                <label htmlFor="newName">Name</label>
                <input
                  id="newName"
                  className="form-input"
                  type="text"
                  placeholder="Enter doctor name"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newEmail">Email</label>
                <input
                  id="newEmail"
                  className="form-input"
                  type="email"
                  placeholder="Enter doctor email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newSpecialization">Specialization</label>
                <input
                  id="newSpecialization"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Cardiology"
                  value={newSpecialization}
                  onChange={(event) =>
                    setNewSpecialization(event.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newAvailability">Availability</label>
                <input
                  id="newAvailability"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Mon-Fri"
                  value={newAvailability}
                  onChange={(event) =>
                    setNewAvailability(event.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={handleCreateDoctor}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Doctor'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedDoctor && (
          <div className="modal-overlay">
            <div className="modal doctor-details-modal">
              <div className="doctor-details-header">
                <div className="doctor-profile">
                  <div className="doctor-avatar">
                    {selectedDoctor.name?.charAt(0).toUpperCase() || 'D'}
                  </div>

                  <div className="doctor-profile-info">
                    <span className="doctor-details-eyebrow">
                      DOCTOR DETAILS
                    </span>

                    <h2>{selectedDoctor.name || 'Unknown Doctor'}</h2>

                    <p>Doctor ID #{selectedDoctor.id}</p>
                  </div>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setSelectedDoctor(null)}
                >
                  ×
                </button>
              </div>

              <div className="doctor-status-row">
                <span
                  className={`doctor-detail-status ${
                    selectedDoctor.isActive ? 'active' : 'inactive'
                  }`}
                >
                  <span className="status-dot" />
                  {selectedDoctor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="doctor-detail-section">
                <h3>Professional Information</h3>

                <div className="doctor-detail-grid">
                  <div className="doctor-detail-item">
                    <span>Doctor ID</span>
                    <strong>{selectedDoctor.id}</strong>
                  </div>

                  <div className="doctor-detail-item">
                    <span>Specialization</span>
                    <strong>{selectedDoctor.specialization}</strong>
                  </div>

                  <div className="doctor-detail-item">
                    <span>Availability</span>
                    <strong>
                      {selectedDoctor.availability || 'Not specified'}
                    </strong>
                  </div>

                  <div className="doctor-detail-item">
                    <span>Status</span>
                    <strong>
                      {selectedDoctor.isActive ? 'Active' : 'Inactive'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="doctor-detail-section">
                <h3>Contact Information</h3>

                <div className="doctor-detail-grid">
                  <div className="doctor-detail-item doctor-detail-item-full">
                    <span>Email</span>
                    <strong>{selectedDoctor.email || 'Not available'}</strong>
                  </div>
                </div>
              </div>

              <div className="doctor-details-footer">
                <button
                  className="secondary-button"
                  onClick={() => setSelectedDoctor(null)}
                >
                  Close
                </button>

                <button
                  className="primary-button"
                  onClick={() => {
                    handleEdit(selectedDoctor);
                    setSelectedDoctor(null);
                  }}
                >
                  Edit Doctor
                </button>
              </div>
            </div>
          </div>
        )}

        {doctorToDeactivate !== null && (
          <div className="modal-overlay">
            <div className="modal confirmation-modal">
              <h2>Deactivate Doctor</h2>

              <p>
                Are you sure you want to deactivate this doctor?
              </p>

              <p className="confirmation-warning">
                This doctor will no longer be active in the system.
              </p>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setDoctorToDeactivate(null)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="action-button danger"
                  onClick={confirmDeactivate}
                  disabled={saving}
                >
                  {saving ? 'Deactivating...' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingDoctor && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Doctor</h2>

              <div className="form-group">
                <label htmlFor="editName">Name</label>
                <input
                  id="editName"
                  className="form-input"
                  type="text"
                  value={editingDoctor.name || ''}
                  onChange={(event) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      name: event.target.value,
                    })
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="editEmail">Email</label>
                <input
                  id="editEmail"
                  className="form-input"
                  type="email"
                  value={editingDoctor.email || ''}
                  onChange={(event) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      email: event.target.value,
                    })
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="editSpecialization">Specialization</label>
                <input
                  id="editSpecialization"
                  className="form-input"
                  type="text"
                  value={editingDoctor.specialization}
                  onChange={(event) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      specialization: event.target.value,
                    })
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="editAvailability">Availability</label>
                <input
                  id="editAvailability"
                  className="form-input"
                  type="text"
                  value={editingDoctor.availability || ''}
                  onChange={(event) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      availability: event.target.value,
                    })
                  }
                  disabled={saving}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setEditingDoctor(null)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={handleUpdateDoctor}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorManagement;