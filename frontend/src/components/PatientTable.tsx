import type { Patient } from '../services/patientService';
import '../pages/PatientManagement.css';

interface PatientTableProps {
  patients: Patient[];
  onView: (id: number) => void;
  onEdit: (patient: Patient) => void;
  onDeactivate: (patient: Patient) => void;
}

function PatientTable({
  patients,
  onView,
  onEdit,
  onDeactivate,
}: PatientTableProps) {
  return (
    <div className="table-card">
      <table className="patient-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.id}</td>

              <td>{patient.name}</td>

              <td>{patient.gender}</td>

              <td>{patient.phone}</td>

              <td>
                {patient.email || 'Not provided'}
              </td>

              <td>
                <span
                  className={`status-badge ${
                    patient.isActive
                      ? 'status-active'
                      : 'status-inactive'
                  }`}
                >
                  {patient.isActive
                    ? 'Active'
                    : 'Inactive'}
                </span>
              </td>

              <td>
  <div className="action-buttons">
    <button
      className="action-button"
      onClick={() => onView(patient.id)}
    >
      View
    </button>

    <button
      className="action-button"
      onClick={() => onEdit(patient)}
    >
      Edit
    </button>

    <button
      className="action-button danger"
      onClick={() => onDeactivate(patient)}
      disabled={!patient.isActive}
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

export default PatientTable;