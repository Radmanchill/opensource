const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const validator = require('validator');

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Array to store student data
const studentData = [];

// POST route to handle form submissions for VNR students
app.post('/VNR_students', (req, res) => {
    const { name, roll_no, section, branch, email } = req.body;

    // Validate that email ends with 'ac.in'
    if (!validator.isEmail(email) || !email.endsWith('ac.in')) {
        return res.status(400).send('Invalid email address. Must end with ac.in');
    }

    // Prepare data in CSV format
    const csvLine = `${name},${roll_no},${section},${branch},${email}\n`;

    // Append data to CSV file
    fs.appendFile('vnr_students.csv', csvLine, (err) => {
        if (err) {
            console.error('Error writing to CSV file', err);
            return res.status(500).send('Server error');
        }

        // Store student data in the array
        studentData.push({ name, roll_no, section, branch, email });
        
        res.send('Student data saved successfully!');
    });
});

// GET route to serve an About page for VNR, displaying submitted student data
app.get('/vnr_about', (req, res) => {
    let htmlContent = `
        <h1>About VNR</h1>
        <p>VNR Vignana Jyothi Institute of Engineering and Technology is a prestigious engineering institution committed 
        to providing high-quality education and fostering innovation. Established with a mission to nurture future leaders 
        and professionals, VNR offers a wide range of undergraduate and postgraduate programs across various engineering 
        and technology disciplines.</p>
    `;

    if (studentData.length === 0) {
        htmlContent += '<p>No student data submitted yet.</p>';
    } else {
        htmlContent += '<h2>Submitted Student Data:</h2><ul>';
        studentData.forEach(student => {
            htmlContent += `<li>${student.name}, Roll No: ${student.roll_no}, Section: ${student.section}, Branch: ${student.branch}, Email: ${student.email}</li>`;
        });
        htmlContent += '</ul>';
    }

    res.send(htmlContent);
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
