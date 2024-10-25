const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Create connection pool to MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'course_assignment',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Register student
app.post('/registerStudent', async (req, res) => {
  const { matric, name, nationality } = req.body;
  if (!matric || !name || !nationality) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const query = 'INSERT INTO student (matric, name, nationality) VALUES (?, ?, ?)';
    await db.execute(query, [matric, name, nationality]);
    console.log("Student from ", nationality ,
      " Has been registered with matric of: " , matric,
      " in the names of: ", name);
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Register course
app.post('/registerCourse', async (req, res) => {
  const { courseCode, courseName } = req.body;
  if (!courseCode || !courseName) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const query = 'INSERT INTO course (courseCode, courseName) VALUES (?, ?)';
    await db.execute(query, [courseCode, courseName]);
    console.log("A course with code: ", courseCode,
      " is created with a name: ", courseName);
    res.status(201).json({ message: 'Course registered successfully' });
  } catch (error) {
    console.error('Error registering course:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Assign course to student
app.post('/assignCourse', async (req, res) => {
  const { matric, courseCode } = req.body;
  try {
    const assignQuery = 'INSERT INTO takes (matric, courseCode) VALUES (?, ?)';
    await db.execute(assignQuery, [matric, courseCode]);
    res.status(201).json({ message: 'Course assigned successfully' });
  } catch (error) {
    console.error('Error assigning course:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

//Get all courses:
// Route to get all courses
app.get('/allCourses', async (req, res) => {
  try {
    const [courses] = await db.execute('SELECT * FROM course');
    res.json(courses);
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

//Fetch all students:
app.get('/allStudents', async (req, res) => {
  try {
    const [students] = await db.execute('SELECT * FROM student');
    res.json(students);
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Fetch students registered in a course
app.get('/courses/:courseCode/students', async (req, res) => {
  const courseCode = req.params.courseCode;
  try {
      const [students] = await db.query(`
          SELECT s.matric, s.name
          FROM student s
          JOIN takes t ON s.matric = t.matric
          WHERE t.courseCode = ?
      `, [courseCode]);
      console.log("Students Fetched Successfully.")

      res.json(students);
  } catch (err) {
      res.status(500).send('Error fetching students');
  }
});

// Submit marks for a course
app.post('/marks/:courseCode', async (req, res) => {
  const courseCode = req.params.courseCode;
  const marksData = req.body; // Array of students' marks

  try {
      for (const { matric, courseWork, finalExam, total } of marksData) {
          await db.query(`
              INSERT INTO marks (matric, courseCode, courseWork, finalExam, totalMark)
              VALUES (?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE courseWork = ?, finalExam = ?, totalMark = ?
          `, [matric, courseCode, courseWork, finalExam, total, courseWork, finalExam, total]);
      }
      console.log("Marks Submited Successfully.")
      res.status(200).send('Marks submitted successfully');
  } catch (err) {
      res.status(500).send('Error submitting marks');
      console.log(err)
  }
});

// Fetch courses taken by a student
app.get('/report/student-courses', async (req, res) => {
  const { matric } = req.query;
  try {
    const query = `
      SELECT c.courseCode, c.courseName
      FROM course c
      JOIN takes t ON c.courseCode = t.courseCode
      WHERE t.matric = ?`;
    const [courses] = await db.execute(query, [matric]);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Fetch students enrolled in a course
app.get('/report/course-students', async (req, res) => {
  const { courseCode } = req.query;
  console.log(`Received courseCode: ${courseCode}`); // Add logging

  try {
    const query = `
      SELECT s.matric, s.name
      FROM student s
      JOIN takes t ON s.matric = t.matric
      WHERE LOWER(t.courseCode) = LOWER(?);`
    const [students] = await db.execute(query, [courseCode]);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Report: Courses with highest enrollment
app.get('/coursesWithHighestEnrollment', async (req, res) => {
  try {
    const query = `
      SELECT c.courseCode, c.courseName, COUNT(t.matric) AS totalStudents
      FROM course c
      LEFT JOIN takes t ON c.courseCode = t.courseCode
      GROUP BY c.courseCode
      ORDER BY totalStudents DESC`;
    const [courses] = await db.execute(query);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Report: Students enrolled in multiple courses
app.get('/studentsInMultipleCourses', async (req, res) => {
  try {
    const query = `
      SELECT s.matric, s.name, COUNT(t.courseCode) AS totalCourses
      FROM student s
      JOIN takes t ON s.matric = t.matric
      GROUP BY s.matric
      HAVING totalCourses > 1`;
    const [students] = await db.execute(query);
    res.json(students);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Report: Students with no courses assigned
app.get('/studentsWithNoCourses', async (req, res) => {
  try {
    const query = `
      SELECT s.matric, s.name
      FROM student s
      LEFT JOIN takes t ON s.matric = t.matric
      WHERE t.courseCode IS NULL`;
    const [students] = await db.execute(query);
    res.json(students);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Report: Courses with no students
app.get('/coursesWithNoStudents', async (req, res) => {
  try {
    const query = `
      SELECT c.courseCode, c.courseName
      FROM course c
      LEFT JOIN takes t ON c.courseCode = t.courseCode
      WHERE t.matric IS NULL`;
    const [courses] = await db.execute(query);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/courses/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  try {
    const searchQuery = `SELECT courseCode, courseName FROM course WHERE courseCode LIKE ? OR courseName LIKE ?`;
    const [courses] = await db.execute(searchQuery, [`%${query}%`, `%${query}%`]);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Fetch the student by matric to match the name
app.get('/student/:matric', async (req, res) => {
  const matric = req.params.matric;
  console.log('Matric received in API:', matric); // Check the exact value

  try {
      const [results] = await db.execute('SELECT name FROM student WHERE matric = ?', [matric]);

      if (results.length > 0) {
          res.json(results[0]); // Return the student's name
      } else {
          res.status(404).json({ message: 'No student found' });
      }
  } catch (error) {
      res.status(500).json({ error: 'Error fetching student' });
  }
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
