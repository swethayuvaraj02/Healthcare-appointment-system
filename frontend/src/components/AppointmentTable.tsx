import type { Appointment } from '../services/appointmentService';
import type { Patient } from '../services/patientService';
import type { Doctor } from '../services/doctorService';

interface AppointmentTableProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onView: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
}

function AppointmentTable({
  appointments,
  patients,
  doctors,
  onView,
  onEdit,
}: AppointmentTableProps) {
  const getPatientName = (id: number) => {
    return (
      patients.find((patient) => patient.id === id)?.name ||
      `Patient #${id}`
    );
  };

  const getDoctorName = (id: number) => {
    return (
      doctors.find((doctor) => doctor.id === id)?.name ||
      `Doctor #${id}`
    );
  };

  return (
    <div className="table-card">
      <table className="appointment-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date & Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>

              <td>{getPatientName(appointment.patientId)}</td>

              <td>{getDoctorName(appointment.doctorId)}</td>

              <td>
                {new Date(appointment.appointmentAt).toLocaleString(
                  'en-IN',
                  {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  },
                )}
              </td>

              <td>
  <span
    className="appointment-reason"
    title={appointment.reason || 'Not provided'}
  >
    {appointment.reason || 'Not provided'}
  </span>
</td>

              <td>
                <span
                  className={`status-badge status-${appointment.status.toLowerCase()}`}
                >
                  {appointment.status.replace('_', ' ')}
                </span>
              </td>

              <td>
                <div className="action-buttons">
                  <button
                    className="action-button"
                    onClick={() => onView(appointment)}
                  >
                    View
                  </button>

                  <button
                    className="action-button"
                    onClick={() => onEdit(appointment)}
                  >
                    Edit
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

export default AppointmentTable;