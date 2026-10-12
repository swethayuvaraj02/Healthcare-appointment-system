import { db } from './prisma/db.js';

const doctors = [
  {
    name: 'Dr. Jane Smith',
    email: 'jane.smith@example.com',
    specialization: 'Cardiology',
    availability: 'Mon-Fri',
  },
  {
    name: 'Dr. Michael Joseph',
    email: 'michael.joseph@example.com',
    specialization: 'Dermatology',
    availability: 'Mon-Fri',
  },
  {
    name: 'Dr. Sneha Rao',
    email: 'sneha.rao@example.com',
    specialization: 'Pediatrics',
    availability: 'Mon-Sat',
  },
  {
    name: 'Dr. Arvind Kumar',
    email: 'arvind.kumar@example.com',
    specialization: 'Orthopedics',
    availability: 'Tue-Sat',
  },
  {
    name: 'Dr. Neha Kapoor',
    email: 'neha.kapoor@example.com',
    specialization: 'Neurology',
    availability: 'Mon-Fri',
  },
];

async function seedDoctors() {
  for (const doctor of doctors) {
    const existingDoctor = await db.orm.public.Doctor
      .where({ email: doctor.email })
      .first();

    if (existingDoctor) {
      console.log(`Skipped ${doctor.name}: already exists.`);
      continue;
    }

    await db.orm.public.Doctor.create(doctor);
  }

  console.log('Doctor seeding completed.');
}

await seedDoctors();