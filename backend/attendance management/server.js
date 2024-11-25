// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');

// Create an instance of Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data storage
let students = [];
let teachers = [];

// Routes for Teacher
app.post('/teachers', (req, res) => {
    const teacher = { id: teachers.length + 1, ...req.body };
    teachers.push(teacher);
    res.status(201).send(teacher);
});

// Routes for Student
app.post('/students', (req, res) => {
    const student = { id: students.length + 1, attendance: [], ...req.body };
    students.push(student);
    res.status(201).send(student);
});

// Get all students
app.get('/students', (req, res) => {
    res.status(200).send(students);
});

// Record attendance
app.post('/students/:id/attendance', (req, res) => {
    const { id } = req.params;
    const { date, present } = req.body;

    const student = students.find(s => s.id == id);
    if (!student) {
        return res.status(404).send('Student not found');
    }

    student.attendance.push({ date, present });
    res.status(200).send(student);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
