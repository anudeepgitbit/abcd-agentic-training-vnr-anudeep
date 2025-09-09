require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { teachersData, studentsData } = require('../data/seedData');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    console.log('Cleared existing data');

    // Insert teachers
    const teachers = await Teacher.insertMany(teachersData);
    console.log(`Inserted ${teachers.length} teachers`);

    // Insert students
    const students = await Student.insertMany(studentsData);
    console.log(`Inserted ${students.length} students`);

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Teachers:');
    teachersData.forEach(teacher => {
      console.log(`  Email: ${teacher.email}, Password: password123, Role: teacher`);
    });
    console.log('Students:');
    studentsData.forEach(student => {
      console.log(`  Email: ${student.email}, Password: password123, Role: student`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
