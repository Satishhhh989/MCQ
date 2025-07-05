// File: script.js

let selectedClass = "";
let selectedSubject = "";

const steps = document.querySelectorAll('.step');

function showStep(stepNum) {
  steps.forEach((step, idx) => {
    step.classList.toggle('active', idx === stepNum - 1);
  });
}

function selectClass(cls) {
  selectedClass = cls;
  showStep(2);
}

function selectSubject(subject) {
  selectedSubject = subject;
  populateChapters();
  showStep(3);
}

function goBack(stepNum) {
  showStep(stepNum);
}

function nextStep(stepNum) {
  if (stepNum === 4) populateTopics();
  showStep(stepNum);
}

// 🔸 Dummy chapter data — Replace with parsed syllabus later
const syllabus = {
  '11': {
    'Physics': [
      {
        chapter: "Kinematics",
        topics: ["Motion in Straight Line", "Projectile Motion"]
      },
      {
        chapter: "Laws of Motion",
        topics: ["Inertia", "Friction"]
      }
    ],
    'Chemistry': [], 'Botany': [], 'Zoology': []
  },
  '12': {
    'Physics': [], 'Chemistry': [], 'Botany': [], 'Zoology': []
  }
};

function populateChapters() {
  const select = document.getElementById('chapterSelect');
  select.innerHTML = "";
  const chapters = syllabus[selectedClass][selectedSubject] || [];
  chapters.forEach((c, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = c.chapter;
    select.appendChild(option);
  });
}

function populateTopics() {
  const chapterIdx = document.getElementById('chapterSelect').value;
  const topicSelect = document.getElementById('topicSelect');
  topicSelect.innerHTML = "";
  const topics = syllabus[selectedClass][selectedSubject][chapterIdx].topics || [];
  topics.forEach(t => {
    const option = document.createElement('option');
    option.value = t;
    option.textContent = t;
    topicSelect.appendChild(option);
  });
}

function generateMCQs() {
  const topic = document.getElementById('topicSelect').value;
  const container = document.getElementById('mcqContainer');
  container.innerHTML = "<p>Generating MCQs for <b>" + topic + "</b>...</p>";

  fetch("https://neet-ai-mcq-backend.onrender.com/generate-mcq", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ topic: topic })
  })
    .then(res => res.json())
    .then(data => {
      const mcqs = data.mcqs || [];
      container.innerHTML = mcqs.map((q, i) => {
        return `
        <div class="mcq">
          <p>Q${i + 1}. ${q.question}</p>
          ${q.options.map((opt, idx) => `
            <label><input type="radio" name="q${i}" /> ${opt}</label>
          `).join('')}
        </div>`;
      }).join('');
      showStep(5);
    })
    .catch(() => {
      container.innerHTML = "<p style='color:red;'>Failed to fetch MCQs. Try again later.</p>";
    });
}

function generateMore() {
  generateMCQs();
}

function exportPDF() {
  const doc = new window.jspdf.jsPDF();
  const elements = document.querySelectorAll(".mcq");
  let y = 10;
  elements.forEach((mcq, i) => {
    const text = mcq.innerText;
    doc.text(text, 10, y);
    y += 10 + text.split("\n").length * 8;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });
  doc.save("neet-mcqs.pdf");
} 

// Inject jsPDF script dynamically for PDF export
const pdfScript = document.createElement('script');
pdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.body.appendChild(pdfScript);
