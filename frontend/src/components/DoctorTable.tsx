import type { Doctor } from '../services/doctorService';
import '../pages/DoctorManagement.css';

interface DoctorTableProps {
  doctors: Doctor[];
  onView: (id: number) => void;
  onEdit: (doctor: Doctor) => void;
  onDeactivate: (id: number) => void;
}

function DoctorTable({
  doctors,
  onView,
  onEdit,
  onDeactivate,
}: DoctorTableProps) {
  return (
    <div className="table-card">
      <table className="doctor-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Specialization</th>
            <th>Availability</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.id}</td>
              <td>{doctor.email}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.availability || 'Not specified'}</td>

              <td>
                <span
                  className={`status-badge ${
                    doctor.isActive
                      ? 'status-active'
                      : 'status-inactive'
                  }`}
                >
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>

              <td>
                <div className="action-buttons">
                  <button
                    className="action-button"
                    onClick={() => onView(doctor.id)}
                  >
                    View
                  </button>

                  <button
                    className="action-button"
                    onClick={() => onEdit(doctor)}
                  >
                    Edit
                  </button>

                  <button
                    className="action-button danger"
                    onClick={() => onDeactivate(doctor.id)}
                    disabled={!doctor.isActive}
                  >
                    Deactivate
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DoctorTable;