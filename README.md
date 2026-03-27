# Outing Permission PDF Generator

A professional, client-side web application designed to generate official university outing permission PDFs. It strictly adheres to the required university format (Times New Roman, justified text, specific phrasing) while providing a modern, responsive user interface.


## Features

### Modern User Interface
- **Split-Screen Layout:** View the data entry form and the live PDF preview side-by-side on desktop.
- **Responsive Design:** Seamlessly adapts to mobile devices, stacking the layout vertically.
- **Real-Time Preview:** See exactly what your PDF will look like before downloading.

### Smart Logic
- **Gender Intelligence:** Automatically adjusts text to "Mr./Son" or "Ms./Daughter" based on the selected student's gender.
- **Trip Duration Calculator:** Instantly calculates the number of days for the outing.
- **Quick Actions:** One-click buttons to select "This Weekend" or "Next Weekend" automatically.
- **Smart Validation:** Prevents invalid date selections (e.g., returning before departing).

### Precise Output
- **A4 Format:** The preview and output are exact A4 dimensions (210mm x 297mm).
- **Strict Typography:** Uses "Times New Roman" and specific font sizes to match official requirements.
- **Auto-Naming:** Downloads files as `StudentName_StudentID.pdf` for easy organization.

---

## Setup & Usage

### 1. Launching the App
Since this is a static web application, you have two options:
*   **Local:** Simply double-click `index.html` to open it in your browser.
*   **Hosted:** Deploy the files to GitHub Pages, Vercel, or Netlify (see Deployment section).

### 2. Generating a Pass
1.  **Select Identity:** Choose your profile from the "Student Identity" dropdown. The form will auto-fill your details.
2.  **Set Dates:**
    *   Manually pick "Departing" and "Returning" dates.
    *   *OR* use the **"This Weekend"** / **"Next Weekend"** chips for auto-selection.
3.  **Choose Type:** Select the purpose (e.g., Weekend Outing, Festival Outing).
4.  **Preview:** The A4 sheet on the right (or bottom on mobile) will update instantly.
5.  **Download:** Click the green **"Download PDF"** button to save the file.

---

## Configuration (`data.js`)

All student data is stored in `data.js`. You can add as many profiles as needed.

### Adding a New Student
Open `data.js` and add a new object to the `window.students` array. **Crucial:** Ensure the `gender` field is set correctly.

```javascript
{
    name: "Student Name",
    id: "Student id",
    gender: "Male/Female", 
    program: "Course",
    batch: "2024-202x",
    father: "Father Name",
    parents: [
        // Contact details for the table
        { name: "Father Name", email: "...", phone: "..." },
        { name: "Mother Name", email: "...", phone: "..." }
    ],
    // Signature must be a direct image URL (hosted on PostImages, Imgur, etc.)
    signature: "https://i.postimg.cc/your-image-id.png" 
}
```

### Signature Hosting
The application cannot access your local file system for security reasons. You must host your signature image online:
1.  Upload your signature (transparent PNG recommended) to a free host like [PostImages](https://postimages.org/).
2.  Copy the **"Direct Link"** (ends in .png or .jpg).
3.  Paste it into the `signature` field in `data.js`.

---

## Technical Details

*   **Frameworks:** Vanilla HTML5, CSS3, JavaScript (ES6+).
*   **Libraries:**
    *   `html2pdf.js`: For converting the DOM element to a PDF file.
    *   `FontAwesome`: For the UI icons.
    *   `Google Fonts`: Uses 'Inter' for the UI and 'Times New Roman' for the PDF.
*   **Structure:**
    *   `index.html`: Main layout and UI structure.
    *   `script.js`: UI logic, date calculations, and dynamic text binding.
    *   `pdf.js`: PDF generation configuration and trigger.
    *   `data.js`: Static database of student profiles.

---

## Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Signature not showing** | Ensure the URL in `data.js` is a *direct link* to the image (check if it ends in .png/.jpg). |
| **"Mr./Son" incorrect** | Check the `gender` field in `data.js`. It must be exactly `"Male"` or `"Female"` (case-sensitive). |
| **Layout looks broken** | Ensure your browser window is wide enough for split-screen, or scroll down on mobile. |
| **PDF text looks weird** | The PDF generator relies on your system fonts. Ensure Times New Roman is installed (standard on all OS). |

---

## Deployment

To share this tool with others without sending files:
1.  Create a detailed GitHub repository.
2.  Upload the `outing-pdf-generator` folder contents.
3.  Go to **Settings** > **Pages** and enable GitHub Pages on the `main` branch.
4.  Share the generated link!
