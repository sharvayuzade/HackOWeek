const form = document.getElementById('admission-form');
const statusBox = document.getElementById('status');
const applicationsBox = document.getElementById('applications');
const totalApplications = document.getElementById('totalApplications');
const latestIntake = document.getElementById('latestIntake');
const programMix = document.getElementById('programMix');
const refreshButton = document.getElementById('refresh');

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle('error', isError);
}

function formatDate(value) {
  if (!value) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function renderProgramMix(byCourse = {}) {
  const entries = Object.entries(byCourse);

  if (!entries.length) {
    programMix.textContent = 'No submissions yet.';
    return;
  }

  programMix.innerHTML = entries
    .map(([course, count]) => `<span class="program-chip">${course} ${count}</span>`)
    .join('');
}

function renderApplications(applications) {
  if (!applications.length) {
    applicationsBox.innerHTML = '<div class="empty-state">No applications have been submitted yet.</div>';
    return;
  }

  applicationsBox.innerHTML = applications
    .slice(0, 5)
    .map(
      (application) => `
        <article class="application">
          <h4>${application.fullName}</h4>
          <div class="meta">${application.course} · ${application.intakeTerm} · ${application.email}</div>
          <div class="meta">Submitted ${formatDate(application.submittedAt)} · Status ${application.status}</div>
          <div class="statement">${application.statement}</div>
        </article>
      `
    )
    .join('');
}

async function loadDashboard() {
  const [statsResponse, applicationsResponse] = await Promise.all([
    fetch('/api/stats'),
    fetch('/api/applications'),
  ]);

  if (!statsResponse.ok || !applicationsResponse.ok) {
    throw new Error('Unable to load dashboard data.');
  }

  const stats = await statsResponse.json();
  const applicationsPayload = await applicationsResponse.json();

  totalApplications.textContent = String(stats.total || 0);
  latestIntake.textContent = stats.latestApplication ? stats.latestApplication.intakeTerm : '--';
  renderProgramMix(stats.byCourse);
  renderApplications(applicationsPayload.applications || []);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Submitting application...');

  const payload = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    course: document.getElementById('course').value,
    intakeTerm: document.getElementById('intakeTerm').value,
    statement: document.getElementById('statement').value,
  };

  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Submission failed.');
    }

    form.reset();
    setStatus(result.message || 'Application submitted successfully.');
    await loadDashboard();
  } catch (error) {
    setStatus(error.message, true);
  }
});

refreshButton.addEventListener('click', async () => {
  try {
    setStatus('Refreshing dashboard...');
    await loadDashboard();
    setStatus('Dashboard refreshed.');
  } catch (error) {
    setStatus(error.message, true);
  }
});

loadDashboard().catch((error) => {
  setStatus(error.message, true);
});