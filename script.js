// --- 1. Data Initialization (Merge Static + LocalStorage) ---
const select = document.getElementById("studentSelect");

// Retrieve custom students from LocalStorage or empty array
const customStudentsIdx = localStorage.getItem('customStudents');
const customStudents = customStudentsIdx ? JSON.parse(customStudentsIdx) : [];

// Combine static (window.students) and custom students
// We modify the global students array to include custom ones so other functions (pdf.js) work transparently
if (window.students) {
  window.students = [...window.students, ...customStudents];
} else {
  // Fallback if data.js didn't load for some reason
  window.students = [...customStudents];
}

// Global reference for easy access
const allStudents = window.students;

// --- 2. Populate Dropdown ---
// Clear existing options
select.innerHTML = '<option value="" disabled selected>Select ID / Name</option>';

allStudents.forEach((s, i) => {
  const opt = document.createElement("option");
  opt.value = i; // The index in the combined array
  opt.textContent = `${s.name} (${s.id})`;
  select.appendChild(opt);
});


// --- 3. Modal & Form Logic ---

function openAddStudentModal() {
  document.getElementById('addStudentModal').classList.add('active');
}

function closeAddStudentModal() {
  document.getElementById('addStudentModal').classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('addStudentModal').addEventListener('click', (e) => {
  if (e.target.id === 'addStudentModal') {
    closeAddStudentModal();
  }
});

function handleNewStudentSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Construct the student object strictly matching data.js structure
  const newStudent = {
    name: formData.get('studentName'),
    id: formData.get('studentId'),
    gender: formData.get('gender'),
    program: formData.get('program'),
    batch: formData.get('batch'),
    father: formData.get('fatherName'),
    parents: [
      {
        name: formData.get('fatherName'),
        email: formData.get('fatherEmail'),
        phone: formData.get('fatherPhone')
      },
      {
        name: formData.get('motherName'),
        email: formData.get('motherEmail'),
        phone: formData.get('motherPhone')
      },
      {
        // Internal consistency: The existing data.js includes student in the parents list
        name: formData.get('studentName'),
        email: formData.get('studentEmail'),
        phone: formData.get('studentPhone')
      }
    ],
    signature: formData.get('signatureUrl')
  };

  // Save to LocalStorage
  const currentCustom = JSON.parse(localStorage.getItem('customStudents') || '[]');
  currentCustom.push(newStudent);
  localStorage.setItem('customStudents', JSON.stringify(currentCustom));

  // Success Feedback
  alert('Student added successfully!');

  // Simple reload to refresh the list and application state
  window.location.reload();
}


// --- 4. Main Application Logic ---

function generatePreview() {
  // Use the combined global array
  const s = allStudents[select.value];

  const outDateVal = document.getElementById("outDate").value;
  const inDateVal = document.getElementById("inDate").value;
  const type = document.getElementById("outingType").value;

  if (!outDateVal || !inDateVal || !type) {
    alert("Please fill all fields");
    return;
  }

  // Hande case where placeholder is selected or invalid value
  if (!s) {
    alert("Please select a valid student identity");
    return;
  }

  // Date formatting helper
  // Input: YYYY-MM-DD
  // Output: D.M.YYYY (for body) or D-M-YYYY (for bottom)
  const formatDate = (dateStr, separator) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1; // 0-indexed
    const year = d.getFullYear();
    return `${day}${separator}${month}${separator}${year}`;
  };

  const outDateFormatted = formatDate(outDateVal, ".");
  const inDateFormatted = formatDate(inDateVal, ".");

  // Bottom date is today
  const todayObj = new Date();
  const todayFormatted = `${todayObj.getDate()}-${todayObj.getMonth() + 1}-${todayObj.getFullYear()}`;

  const preview = document.getElementById("preview");
  preview.style.display = "block";

  // STRICT FORMATTING implementation
  preview.innerHTML = `
  <div class="page">
  <div style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.6; color: black; padding: 20px;">

    <!-- Header -->
    <h3 style="text-align:center; text-transform: uppercase; margin-bottom: 40px; text-decoration: underline;">UNDERTAKING BY PARENTS</h3>

    <!-- Paragraph 1 -->
    <p style="margin-bottom: 30px; text-align: justify;">
      I hereby confirm that my ward, <b>${s.gender === 'Female' ? 'Ms.' : 'Mr.'} ${s.name}</b>, registered under the student
      ID <b>${s.id}</b> of the <b>${s.program}</b> program, is registered for the academic year
      <b>${s.batch}</b>.
    </p>

    <!-- Consent Header -->
    <p style="font-weight: bold; margin-bottom: 20px;">Letter of Consent:</p>

    <!-- Paragraph 2 -->
    <p style="margin-bottom: 30px; text-align: justify;">
      As the father of <b>${s.name}</b> , a <b>B.Tech (${s.batch})</b> <b>${s.program}</b> student at <b>Woxsen University</b>, I respectfully request your permission to allow my ${s.gender === 'Female' ? 'daughter' : 'son'} to depart from the
      campus on <b>${outDateFormatted}</b>, for a <b>${type}</b>. My ${s.gender === 'Female' ? 'daughter' : 'son'} intends to return on <b>${inDateFormatted}</b>.
    </p>

    <!-- Note Paragraph -->
    <p style="margin-bottom: 30px; text-align: justify;">
      Outing & leave are permitted only during university leave declared for festivals, national
      holidays, and weekends.
    </p>

    <!-- Confirmation Header -->
    <p style="font-weight: bold; margin-bottom: 15px;">The Parents/Guardian confirms the following,</p>

    <!-- List -->
    <ol style="margin-bottom: 40px; padding-left: 25px;">
      <li style="margin-bottom: 5px;">I assure you that it is my responsibility for my ward during the outgoings and have been informed of the same by the university officials.</li>
      <li>I firmly insist my ward not to deviate from the campus policy and adhere to the rules and regulations meticulously.</li>
    </ol>

    <!-- Date and Signature Section -->
    <div style="margin-bottom: 10px; overflow: hidden; display: flex; align-items: flex-end; justify-content: space-between;">
      <div style="font-weight: bold; font-size: 16px;">Date: ${todayFormatted}</div>
      <div style="text-align: right;">
         <div style="font-weight: bold; margin-bottom: 5px;">ParentsSignature</div>
         <img src="${s.signature}" width="150" style="display: block; margin-left: auto;">
      </div>
    </div>

    <br>

    <div class="page-break"></div>
    <!-- Contact Table -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12pt;">
      <thead>
        <tr style="background-color: #d9d9d9;">
          <th style="border: 1px solid #bfbfbf; padding: 8px; text-align: center;">Name</th>
          <th style="border: 1px solid #bfbfbf; padding: 8px; text-align: center;">Email</th>
          <th style="border: 1px solid #bfbfbf; padding: 8px; text-align: center;">Mobile Number</th>
        </tr>
      </thead>
      <tbody>
        ${s.parents.map(p => `
        <tr>
          <td style="border: 1px solid #bfbfbf; padding: 8px; text-align: center; font-weight: bold;">${p.name}</td>
          <td style="border: 1px solid #bfbfbf; padding: 8px; text-align: center;">${p.email}</td>
          <td style="border: 1px solid #bfbfbf; padding: 8px; text-align: center; font-weight: bold;">${p.phone}</td>
        </tr>
        `).join("")}
      </tbody>
    </table>

  </div>
  </div>
  `;

  document.getElementById("downloadWrapper").style.display = "flex";
}
