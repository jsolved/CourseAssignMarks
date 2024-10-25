// Toggle visibility of sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// Handle form submission for registering student
document.getElementById('studentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const studentData = {
        matric: document.getElementById('matric').value,
        name: document.getElementById('name').value,
        nationality: document.getElementById('nationality').value
    };

    // Post student data to the server
    fetch('http://localhost:3000/registerStudent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Reset form fields after submission
        document.getElementById('studentForm').reset();
    })
    .catch(error => console.error('Error:', error));
});

// Handle form submission for registering course
document.getElementById('courseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const courseData = {
        courseCode: document.getElementById('courseCode').value,
        courseName: document.getElementById('courseName').value
    };

    // Post course data to the server
    fetch('http://localhost:3000/registerCourse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Reset form fields after submission
        document.getElementById('courseForm').reset();
    })
    .catch(error => console.error('Error:', error));
});

//Handle the fetching of students in a course:
async function fetchStudentsForMarks() {
    const courseCode = document.getElementById('courseCodeMarks').value;
    const response = await fetch(`http://localhost:3000/courses/${courseCode}/students`);
    const students = await response.json();

    const studentsMarksSection = document.getElementById('studentsMarksSection');
    studentsMarksSection.innerHTML = ''; // Clear previous data

    students.forEach(student => {
        const studentMarkup = `
            <div>
                <p>${student.name} (${student.matric})</p>
                <label for="courseWork_${student.matric}">Course Work (out of 50):</label>
                <input type="float" id="courseWork_${student.matric}" name="courseWork" required min="0" max="50" onchange="updateTotal('${student.matric}')">

                <label for="finalExam_${student.matric}">Final Exam (out of 50):</label>
                <input type="float" id="finalExam_${student.matric}" name="finalExam" required min="0" max="50" onchange="updateTotal('${student.matric}')">

                <label for="total_${student.matric}">Total:</label>
                <input type="float" id="total_${student.matric}" name="total" disabled>
            </div>
        `;
        studentsMarksSection.innerHTML += studentMarkup;
    });
}

function updateTotal(matric) {
    const courseWork = document.getElementById(`courseWork_${matric}`).value || 0;
    const finalExam = document.getElementById(`finalExam_${matric}`).value || 0;
    const total = parseFloat(courseWork) + parseFloat(finalExam);
    document.getElementById(`total_${matric}`).value = total;
}



//Handle submission of Marks.
document.getElementById('marksEntryForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = getElementById('marksEntryForm');

    const courseCode = document.getElementById('courseCodeMarks').value;
    const studentsMarks = [];

    const studentDivs = document.querySelectorAll('#studentsMarksSection div');
    studentDivs.forEach(div => {
        const matric = div.querySelector('p').innerText.match(/\((.*?)\)/)[1]; // Extract matric from text
        const courseWork = div.querySelector(`[id="courseWork_${matric}"]`).value;
        const finalExam = div.querySelector(`[id="finalExam_${matric}"]`).value;
        const total = div.querySelector(`[id="total_${matric}"]`).value;

        studentsMarks.push({ matric, courseWork, finalExam, total });
    });

    const response = await fetch(`http://localhost:3000/marks/${courseCode}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentsMarks),
    });

    if (response.ok) {
        alert('Marks submitted successfully');
        form.reset();
    } else {
        alert('Error submitting marks');
    }
});


// Fetch Courses Taken by Student using matric number
function fetchStudentCourses() {
    const matric = document.getElementById('studentMatric').value;
    fetch(`http://localhost:3000/report/student-courses?matric=${matric}`)
    .then(response => response.json())
    .then(data => {
        displayReport(data, 'Courses Taken by Student');
    })
    .catch(error => console.error('Error:', error));
}

// Fetch Students in a course
function fetchCourseStudents() {
    // Capture the value of the input
    const courseCode = document.getElementById('courseCode').value.trim();
    console.log(`Captured course code from input: "${courseCode}"`);

    // Check if the input value is empty
    if (!courseCode) {
        console.log("Course code is empty, prompting for input");
        alert('Please enter a course code');
        return; // Prevent the fetch request if the courseCode is empty
    }

    // Encode the course code to handle spaces
    const encodedCourseCode = encodeURIComponent(courseCode);
    console.log(`Encoded courseCode for request: "${encodedCourseCode}"`);

    // Make the fetch request
    fetch(`http://localhost:3000/report/course-students?courseCode=${encodedCourseCode}`)
        .then(response => {
            console.log(`Response status: ${response.status}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Students received from server:', data);
            if (data.length === 0) {
                console.log('No students found for this course.');
                alert('No students found for this course.');
            } else {
                displayReport(data, 'Students Enrolled in:', courseCode);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Fetch other reports
function showReport(reportType) {
    let endpoint;
    switch (reportType) {
        case 'coursesWithHighestEnrollment':
            endpoint = 'http://localhost:3000/coursesWithHighestEnrollment';
            break;
        case 'studentsInMultipleCourses':
            endpoint = 'http://localhost:3000/studentsInMultipleCourses';
            break;
        case 'studentsWithNoCourses':
            endpoint = 'http://localhost:3000/studentsWithNoCourses';
            break;
        case 'coursesWithNoStudents':
            endpoint = 'http://localhost:3000/coursesWithNoStudents';
            break;
        case 'allStudents':
            endpoint = 'http://localhost:3000/allStudents';
            break;
        case 'allCourses':
            endpoint = 'http://localhost:3000/allCourses';
            break;
        default:
            return;
    }

    fetch(endpoint)
    .then(response => response.json())
    .then(data => {
        displayReport(data, reportType.replace(/([A-Z])/g, ' $1'));
        //showSection('reportSection');
    })
    .catch(error => console.error('Error:', error));
}

// Function to display the report data in a table
function displayReport(data, reportTitle) {
    const reportSection = document.getElementById('reportSection');

    // Clear the previous content
    reportSection.innerHTML = '';

    // Create a table structure
    const table = document.createElement('table');
    table.classList.add('styled-table'); // We'll style this in CSS

    // Add report title
    const titleElement = document.createElement('h3');
    titleElement.textContent = reportTitle;
    reportSection.appendChild(titleElement);

    if (data.length > 0) {
        // Generate table headers dynamically
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Populate table rows dynamically
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        reportSection.appendChild(table);
    } else {
        reportSection.innerHTML += `<p>No data available</p>`;
    }
}

// Handle typing in the course field to suggest courses
document.getElementById('courseAssign').addEventListener('input', function() {
    const courseQuery = this.value;

    if (courseQuery.length > 2) {
        fetch(`http://localhost:3000/courses/search?query=${courseQuery}`)
            .then(response => response.json())
            .then(courses => {
                const suggestions = document.getElementById('courseSuggestions');
                suggestions.innerHTML = '';  // Clear previous suggestions

                if (courses.length > 0) {
                    courses.forEach(course => {
                        const li = document.createElement('li');
                        li.textContent = `${course.courseCode} - ${course.courseName}`;
                        li.addEventListener('click', function() {
                            document.getElementById('courseAssign').value = course.courseCode;
                            suggestions.innerHTML = '';  // Clear suggestions after selecting
                        });
                        suggestions.appendChild(li);
                    });
                } else {
                    suggestions.innerHTML = `<li>No courses found</li>`;
                }
            })
            .catch(error => console.error('Error fetching courses:', error));
    }
});

//Return the student name after entering the matric number
document.getElementById('studentMatricAssign').addEventListener('input', function() {
    const matric = this.value;

    if (matric.length > 0) {
        fetch(`http://localhost:3000/student/${encodeURIComponent(matric)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Check what data is returned
            if (data.name) {
                document.getElementById('studentNameDisplay').textContent = `Student : ${data.name}`;
            } else {
                document.getElementById('studentNameDisplay').textContent = "No student found";
            }
        })
        .catch(error => console.error('Error fetching student:', error));
    } else {
        document.getElementById('studentNameDisplay').textContent = "";
    }
});


// Handle form submission for assigning course to student
document.getElementById('assignCourseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const assignData = {
        matric: document.getElementById('studentMatricAssign').value,
        courseCode: document.getElementById('courseAssign').value
    };

    // Post assignment data to the server
    fetch('http://localhost:3000/assignCourse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Reset the form after successful assignment
        document.getElementById('assignCourseForm').reset();
        document.getElementById('studentNameDisplay').textContent = '';
        document.getElementById('courseSuggestions').innerHTML = '';
    })
    .catch(error => console.error('Error assigning course:', error));
});

