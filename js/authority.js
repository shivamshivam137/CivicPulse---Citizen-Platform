/*
  AUTHORITY.JS — Mayor/Councilor Dashboard Logic

  HOW ROLE & AREA AUTHORIZATION WORKS:
  ────────────────────────────────────
  1. User logs in. We fetch their user document from the `users` collection.
  2. We check if `role` is 'mayor' or 'councilor'.
  3. If yes, we read their `jurisdiction_area` field (e.g., 'Andheri').
  4. We secure the UI by redirecting or showing "Access Denied" if they lack the role.

  HOW THE LOCATION FIRESTORE QUERY WORKS:
  ───────────────────────────────────────
  Instead of fetching ALL complaints (like a super-admin does), the authority
  ONLY fetches complaints that match their assigned area:
  
  db.collection('complaints')
    .where('area', '==', userArea)   ← THIS IS THE MAGIC FILTER!
    .orderBy('createdAt', 'desc')
    .get()
  
  This ensures the Mayor of Andheri ONLY sees complaints securely
  filtered for Andheri. A user in Vashi submitting a complaint
  will simply not show up in the Andheri Mayor's dashboard.
  
  HOW THE UPDATE FUNCTION WORKS:
  ──────────────────────────────
  When the authority clicks "Resolve", we call:
  
  db.collection('complaints').doc(id).update({ status: 'resolved' })
  
  This tells Firestore to find that specific complaint and ONLY
  update the "status" field, leaving the title, image, and description untouched.
*/

let currentAuthorityArea = null;
let currentAuthorityRole = null;
let areaComplaints = [];
let currentFilter = 'all';

// ── Check Authority Role & Area ────────────────────────────
function checkAuthorityAccess() {
  const authPanel = document.getElementById('authority-panel');
  const deniedPanel = document.getElementById('access-denied');
  const loginPrompt = document.getElementById('login-prompt');

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      if (authPanel) authPanel.style.display = 'none';
      if (deniedPanel) deniedPanel.style.display = 'none';
      if (loginPrompt) loginPrompt.style.display = 'block';
      return;
    }

    if (loginPrompt) loginPrompt.style.display = 'none';

    try {
      const userDoc = await db.collection('users').doc(user.uid).get();

      if (userDoc.exists) {
        const data = userDoc.data();
        if (data.role === 'mayor' || data.role === 'councilor') {
          currentAuthorityRole = data.role;
          currentAuthorityArea = data.jurisdiction_area || 'Global';
          
          if (authPanel) authPanel.style.display = 'block';
          if (deniedPanel) deniedPanel.style.display = 'none';
          
          updateHeaderInfo();
          loadAreaComplaints();
        } else {
          showAccessDenied();
        }
      } else {
        showAccessDenied();
      }
    } catch (error) {
      console.error('Authority check error:', error);
      showAccessDenied();
    }
  });
}

function showAccessDenied() {
  const authPanel = document.getElementById('authority-panel');
  const deniedPanel = document.getElementById('access-denied');
  if (authPanel) authPanel.style.display = 'none';
  if (deniedPanel) deniedPanel.style.display = 'block';
}

function updateHeaderInfo() {
  const titleEl = document.getElementById('auth-title-text');
  const badgeEl = document.getElementById('auth-ward-badge');
  const roleName = currentAuthorityRole === 'mayor' ? 'Mayor' : 'Ward Councilor';

  if (titleEl) titleEl.textContent = `${roleName} Dashboard`;
  if (badgeEl) badgeEl.textContent = `📍 Jurisdiction: ${currentAuthorityArea}`;
}

// ── Load Complaints strictly for this Area (Real-time) ──────
function loadAreaComplaints() {
  let query = db.collection('complaints');
  
  // Secure Location Filter: Only fetch complaints for the assigned area.
  if (currentAuthorityArea && currentAuthorityArea !== 'Global') {
    query = query.where('area', '==', currentAuthorityArea);
  }
  
  query.orderBy('createdAt', 'desc').onSnapshot(
    (snapshot) => {
      areaComplaints = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      updateStats();
      renderTable(areaComplaints);
    },
    (error) => {
      console.error('Error fetching area complaints:', error);
      showToast('Error loading area complaints in real-time.', 'error');
      
      areaComplaints = [];
      updateStats();
      renderTable(areaComplaints);
    }
  );
}

// ── Update Dashboard Stats ─────────────────────────────────
function updateStats() {
  const total = areaComplaints.length;
  const pending = areaComplaints.filter(c => c.status === 'pending').length;
  const inProgress = areaComplaints.filter(c => c.status === 'in-progress').length;
  const resolved = areaComplaints.filter(c => c.status === 'resolved').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-progress').textContent = inProgress;
  document.getElementById('stat-resolved').textContent = resolved;
}

// ── Render Complaints Table ────────────────────────────────
function renderTable(complaints) {
  const tbody = document.getElementById('auth-complaints-tbody');
  if (!tbody) return;

  const filtered = currentFilter === 'all'
    ? complaints
    : complaints.filter(c => c.status === currentFilter);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="auth-empty">
          <div class="empty-icon">🏙️</div>
          <p>No complaints found for this area under this filter.</p>
        </div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const date = c.createdAt?.toDate
      ? c.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    return `
      <tr>
        <td>
          <div class="complaint-title">${c.title || 'Untitled'}</div>
          <div class="complaint-desc">${c.description || ''}</div>
          <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px;">📍 ${c.address || c.area || 'Unknown'}</div>
        </td>
        <td><span class="status-badge ${c.category?.toLowerCase() || ''}">${c.category || 'General'}</span></td>
        <td>${date}</td>
        <td><span class="status-badge ${c.status}">${c.status || 'pending'}</span></td>
        <td>
          <select class="status-select" onchange="updateStatus('${c.id}', this.value)">
            <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
            <option value="in-progress" ${c.status === 'in-progress' ? 'selected' : ''}>🔄 In Progress</option>
            <option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>✅ Resolved</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Update Complaint Status in Firestore ───────────────────
async function updateStatus(complaintId, newStatus) {
  try {
    const user = firebase.auth().currentUser;

    await db.collection('complaints').doc(complaintId).update({
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: `${currentAuthorityRole} (${user.email})`
    });

    // onSnapshot automatically catches this write and safely updates the ui
    showToast(`Status updated to "${newStatus}"`, 'success');

  } catch (error) {
    console.error('Update error:', error);
    showToast('Failed to update status. Are you authorized?', 'error');
  }
}

// ── Toast Notification ─────────────────────────────────────
function showToast(message, type = 'success') {
  let toast = document.getElementById('auth-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'auth-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `auth-toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Initialize ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuthorityAccess();

  document.getElementById('auth-filter-status')?.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderTable(areaComplaints);
  });
});
