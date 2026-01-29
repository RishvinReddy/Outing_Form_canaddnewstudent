// --- 1. Data Strategy: Master List (Seed Once, Then LocalStorage) ---
const select = document.getElementById("studentSelect");
const STORAGE_KEY = 'masterStudentList';

// Initial Load Strategy:
// 1. Check if 'masterStudentList' exists in LocalStorage.
// 2. If NO: Take 'window.students' (from data.js), save it to LocalStorage.
// 3. If YES: Load it. (This means edits/deletes persist, and data.js is ignored after first run).

let allStudents = [];

function loadStudents() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    allStudents = JSON.parse(stored);
  } else {
    // Seed from data.js
    if (window.students && window.students.length > 0) {
      allStudents = [...window.students];
      saveStudents(); // Persist immediately
    } else {
      allStudents = [];
    }
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allStudents));
}

// Reset data to factory settings (re-read data.js)
function resetDataFactory() {
  if (confirm("WARNING: This will wipe all custom changes and restore data.js defaults. Continue?")) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
}

// Initialize
loadStudents();


// --- 2. Populate Dropdown ---
function renderDropdown() {
  select.innerHTML = '<option value="" disabled selected>Select ID / Name</option>';
  allStudents.forEach((s, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${s.name} (${s.id})`;
    select.appendChild(opt);
  });

  // Ensure form is locked initially until a student & PIN are provided
  // However, avoid error if function not defined yet (hoisting handles it usually, but be safe)
  if (typeof toggleFormLock === 'function') {
    toggleFormLock(true);
  }
}
renderDropdown();


// --- 3. Modal & Form Logic (Public & Admin) ---

function openAddStudentModal(keepData = false) {
  document.getElementById('addStudentModal').classList.add('active');

  if (!keepData) {
    // Reset form on fresh open
    document.getElementById('addStudentForm').reset();
    document.getElementById('addStudentForm').dataset.editIndex = "";
  }
}

function closeAddStudentModal() {
  document.getElementById('addStudentModal').classList.remove('active');
}

// Close modal when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
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
    signature: formData.get('signatureUrl'),
    pin: formData.get('studentPin') || "00000" // Default if missing
  };

  const editIndex = form.dataset.editIndex;

  if (editIndex && editIndex !== "") {
    // EDIT MODE
    allStudents[editIndex] = newStudent;
    alert('Student updated successfully!');
  } else {
    // ADD MODE
    allStudents.push(newStudent);
    alert('Student added successfully!');
  }

  saveStudents();

  // Refresh UI
  renderDropdown();
  closeAddStudentModal();

  // If Admin dashboard is open, refresh it too
  if (document.getElementById('adminDashboardModal').classList.contains('active')) {
    renderAdminList();
  }
}


// --- 4. Admin Auth & Dashboard Logic ---

// Admin Session Key
const ADMIN_SESSION_KEY = 'adminSessionActive';

// Enterprise Admin Credentials
const ADMIN_CREDENTIALS = {
  sessionId: "28476",
  mobile: "9848723235",
  answer: "sumit"
};

function openAdminAuth() {
  if (localStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
    openAdminDashboard();
  } else {
    document.getElementById('adminAuthModal').classList.add('active');
    // Reset inputs
    document.getElementById('adminSessionId').value = '';
    document.getElementById('adminMobile').value = '';
    document.getElementById('adminAnswer').value = '';
    document.getElementById('adminError').style.display = 'none';
    document.getElementById('adminSessionId').focus();
  }
}

function closeAdminAuth() {
  document.getElementById('adminAuthModal').classList.remove('active');
}

function verifyAdminAccess() {
  const sessionId = document.getElementById("adminSessionId").value.trim();
  const mobile = document.getElementById("adminMobile").value.trim();
  const answer = document.getElementById("adminAnswer").value.trim().toLowerCase();

  if (
    sessionId === ADMIN_CREDENTIALS.sessionId &&
    mobile === ADMIN_CREDENTIALS.mobile &&
    answer === ADMIN_CREDENTIALS.answer
  ) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    closeAdminAuth();
    openAdminDashboard();
  } else {
    const error = document.getElementById("adminError");
    error.style.display = "block";

    // Simple shake effect
    const card = document.querySelector('.admin-card');
    card.style.transform = "translateX(5px)";
    setTimeout(() => { card.style.transform = "translateX(-5px)"; }, 50);
    setTimeout(() => { card.style.transform = "translateX(5px)"; }, 100);
    setTimeout(() => { card.style.transform = "translateX(0)"; }, 150);
  }
}

function adminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  closeAdminDashboard();
  alert("Logged out of Admin Mode");
}

function closeAdminDashboard() {
  document.getElementById('adminDashboardModal').classList.remove('active');
}

function openAdminDashboard() {
  document.getElementById('adminDashboardModal').classList.add('active');
  renderAdminList();
}

function renderAdminList() {
  const tbody = document.getElementById('studentListBody');
  const totalCount = document.getElementById('totalCount');

  tbody.innerHTML = '';
  // Safely update count if element exists
  if (totalCount) totalCount.textContent = allStudents.length;

  allStudents.forEach((s, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td><span style="font-weight: 600; color: #0f172a;">${s.name}</span></td>
            <td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 0.85rem;">${s.id}</span></td>
            <td>${s.program}</td>
            <td><span style="font-family: monospace; color: #64748b; letter-spacing: 1px;">${s.pin || "----"}</span></td>
            <td class="text-right">
                <button onclick="editStudent(${i})" style="margin-right: 5px; background: none; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 4px; cursor: pointer; color: #3b82f6;" title="Edit">
                   <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteStudent(${i})" style="background: none; border: 1px solid #fee2e2; background: #fef2f2; padding: 6px 10px; border-radius: 4px; cursor: pointer; color: #ef4444;" title="Delete">
                   <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function deleteStudent(index) {
  if (confirm(`Are you sure you want to delete ${allStudents[index].name}?`)) {
    allStudents.splice(index, 1);
    saveStudents();
    renderAdminList();
    renderDropdown(); // Update main dropdown
  }
}

function exportDataJS() {
  // Generate the content exactly as data.js expects
  const content = `window.students = ${JSON.stringify(allStudents, null, 4)};`;

  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  document.body.appendChild(a); // Required for Firefox sometimes
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("Downloaded 'data.js'. Replace the file in your project folder to make changes permanent.");
}

function editStudent(index) {
  // Reuse the Add Student Modal but populate it
  const s = allStudents[index];
  const form = document.getElementById('addStudentForm');

  // Set form values
  form.studentName.value = s.name;
  form.studentId.value = s.id;
  form.gender.value = s.gender;
  form.program.value = s.program;
  form.batch.value = s.batch;

  // Parents[0] is Father
  form.fatherName.value = s.parents[0].name;
  form.fatherEmail.value = s.parents[0].email;
  form.fatherPhone.value = s.parents[0].phone;

  // Parents[1] is Mother
  form.motherName.value = s.parents[1].name;
  form.motherEmail.value = s.parents[1].email;
  form.motherPhone.value = s.parents[1].phone;

  // Parents[2] is Student Contact (if exists)
  if (s.parents[2]) {
    form.studentEmail.value = s.parents[2].email;
    form.studentPhone.value = s.parents[2].phone;
  }

  form.studentPin.value = s.pin || "00000"; // Populate PIN
  form.signatureUrl.value = s.signature;

  // Mark form as 'Edit Mode'
  form.dataset.editIndex = index;

  // Show modal
  closeAdminDashboard(); // Close dash temporarily
  openAddStudentModal(true); // Pass true to keep the populated data
}



// --- 5. PIN Authentication Logic ---

const pinSection = document.getElementById('pin-auth-section');
const pinInputs = document.querySelectorAll('.pin-input');
const pinError = document.getElementById('pin-error');
const pinSuccess = document.getElementById('pin-success');
const formElementsToLock = [
  'outDate', 'inDate', 'outingType', 'previewBtn' // IDs of elements to lock
];

function handleStudentChange() {
  // 1. Reset everything
  pinSection.style.display = 'block';
  pinInputs.forEach(input => {
    input.value = '';
    input.classList.remove('success', 'error');
    input.disabled = false;
  });
  pinError.style.display = 'none';
  pinSuccess.style.display = 'none';

  // 2. Lock Form
  toggleFormLock(true);

  // 3. Focus first box
  pinInputs[0].focus();
}

function toggleFormLock(locked) {
  // Lock/Unlock Date Inputs and Selects
  document.getElementById('outDate').disabled = locked;
  document.getElementById('inDate').disabled = locked;
  document.getElementById('outingType').disabled = locked;

  // Lock/Unlock Preview Button
  // We target the button via its onclick handler or just by querying standard buttons in the box
  const previewBtn = document.querySelector('button[onclick="generatePreview()"]');
  if (previewBtn) {
    previewBtn.disabled = locked;
    previewBtn.style.opacity = locked ? '0.5' : '1';
    previewBtn.style.cursor = locked ? 'not-allowed' : 'pointer';
  }
}

// Initialize PIN Listeners
pinInputs.forEach((input, index) => {
  input.addEventListener('keydown', (e) => {
    // Backspace: move to prev
    if (e.key === 'Backspace' && !input.value && index > 0) {
      pinInputs[index - 1].focus();
    }
  });

  input.addEventListener('input', (e) => {
    const val = e.target.value;

    // 1. Only allow numbers
    if (!/^\d*$/.test(val)) {
      e.target.value = '';
      return;
    }

    // 2. Auto-advance
    if (val && index < pinInputs.length - 1) {
      pinInputs[index + 1].focus();
    }

    // 3. Check specific PIN logic when full
    checkPin();
  });
});

function getenteredPin() {
  return Array.from(pinInputs).map(i => i.value).join('');
}

function checkPin() {
  const entered = getenteredPin();
  if (entered.length < 5) return; // Wait for full PIN

  const selectedIndex = select.value;
  if (!selectedIndex) return;

  const student = allStudents[selectedIndex];

  // PIN Check logic
  if (!student.pin) {
    pinError.textContent = "PIN not configured. Contact admin.";
    pinError.style.display = 'block';
    return;
  }

  const correctPin = student.pin;

  if (entered === correctPin) {
    // SUCCESS
    pinInputs.forEach(i => {
      i.classList.add('success');
      i.classList.remove('error');
      i.disabled = true; // Lock the active inputs
    });
    pinSuccess.style.display = 'block';
    pinError.style.display = 'none';

    toggleFormLock(false); // UNLOCK FORM
  } else {
    // ERROR
    pinInputs.forEach(i => i.classList.add('error'));
    pinError.style.display = 'block';
    pinSuccess.style.display = 'none';

    // Shake animation? Optional.
    setTimeout(() => {
      pinInputs.forEach(i => {
        i.value = '';
        i.classList.remove('error');
      });
      pinInputs[0].focus();
    }, 1000);
  }
}


// --- 6. Main Application Logic ---

function generatePreview() {
  if (!select.value) {
    if (allStudents.length === 0) {
      alert("No data available. Please add a student.");
    } else {
      alert("Please select a student identity");
    }
    return;
  }

  const s = allStudents[select.value];

  const outDateVal = document.getElementById("outDate").value;
  const inDateVal = document.getElementById("inDate").value;
  const type = document.getElementById("outingType").value;

  if (!outDateVal || !inDateVal || !type) {
    alert("Please fill all fields");
    return;
  }

  // Date formatting helper
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
