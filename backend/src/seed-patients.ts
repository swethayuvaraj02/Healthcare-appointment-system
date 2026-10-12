import { db } from './prisma/db.js';

const patients = [
  {
    name: 'Priya Sharma',
    dateOfBirth: '1992-07-18',
    gender: 'Female',
    phone: '9876543211',
    email: 'priya.sharma@example.com',
    address: 'Gandhipuram, Coimbatore',
    emergencyContact: '9876501231',
  },
  {
    name: 'Rahul Menon',
    dateOfBirth: '1985-03-24',
    gender: 'Male',
    phone: '9876543212',
    email: 'rahul.menon@example.com',
    address: 'Peelamedu, Coimbatore',
    emergencyContact: '9876501232',
  },
  {
    name: 'Ananya Krishnan',
    dateOfBirth: '1998-11-05',
    gender: 'Female',
    phone: '9876543213',
    email: 'ananya.krishnan@example.com',
    address: 'Saibaba Colony, Coimbatore',
    emergencyContact: '9876501233',
  },
  {
    name: 'Vikram Raj',
    dateOfBirth: '1979-06-15',
    gender: 'Male',
    phone: '9876543214',
    email: 'vikram.raj@example.com',
    address: 'Singanallur, Coimbatore',
    emergencyContact: '9876501234',
  },
  {
    name: 'Meera Nair',
    dateOfBirth: '1990-09-22',
    gender: 'Female',
    phone: '9876543215',
    email: 'meera.nair@example.com',
    address: 'RS Puram, Coimbatore',
    emergencyContact: '9876501235',
  },
  {
    name: 'Karthik S',
    dateOfBirth: '1995-01-10',
    gender: 'Male',
    phone: '9876543216',
    email: 'karthik.s@example.com',
    address: 'Race Course, Coimbatore',
    emergencyContact: '9876501236',
  },
  {
    name: 'Divya Ramesh',
    dateOfBirth: '1987-12-03',
    gender: 'Female',
    phone: '9876543217',
    email: 'divya.ramesh@example.com',
    address: 'Vadavalli, Coimbatore',
    emergencyContact: '9876501237',
  },
  {
    name: 'Sanjay Kumar',
    dateOfBirth: '1993-04-28',
    gender: 'Male',
    phone: '9876543218',
    email: 'sanjay.kumar@example.com',
    address: 'Ganapathy, Coimbatore',
    emergencyContact: '9876501238',
  },
  {
    name: 'Lakshmi Devi',
    dateOfBirth: '1975-08-19',
    gender: 'Female',
    phone: '9876543219',
    email: 'lakshmi.devi@example.com',
    address: 'Kuniyamuthur, Coimbatore',
    emergencyContact: '9876501239',
  },
  {
    name: 'Arjun Prakash',
    dateOfBirth: '2000-02-14',
    gender: 'Male',
    phone: '9876543220',
    email: 'arjun.prakash@example.com',
    address: 'Kovaipudur, Coimbatore',
    emergencyContact: '9876501240',
  },
  {
    name: 'Nisha Thomas',
    dateOfBirth: '1996-07-30',
    gender: 'Female',
    phone: '9876543221',
    email: 'nisha.thomas@example.com',
    address: 'Ukkadam, Coimbatore',
    emergencyContact: '9876501241',
  },
  {
    name: 'Rohan Iyer',
    dateOfBirth: '1982-10-11',
    gender: 'Male',
    phone: '9876543222',
    email: 'rohan.iyer@example.com',
    address: 'RS Puram, Coimbatore',
    emergencyContact: '9876501242',
  },
];

async function seedPatients() {
  for (const patient of patients) {
    await db.orm.public.Patient.create(patient);
  }

  console.log(`Created ${patients.length} sample patients.`);
}

await seedPatients();