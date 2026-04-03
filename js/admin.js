/*
  ADMIN.JS — Admin Panel with Role-Based Access Control
  
  HOW ROLE-BASED AUTHORIZATION WORKS:
  ───────────────────────────────────
  
  1. User logs in via Firebase Auth → we get their UID
  2. We check Firestore collection "users" for a document with that UID
  3. That document has a field: role = "admin" or "user"
  4. If role === "admin" → show admin panel
     If role !== "admin" → show "Access Denied" screen
  
  IMPORTANT: This is CLIENT-SIDE authorization only!
  It hides the UI from regular users, but a tech-savvy person
  could bypass it by editing JavaScript. For REAL security,
  you must also set Firestore Security Rules on the server:
  
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /complaints/{id} {
        allow read: if true;
        allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
      }
    }
  }
  
  HOW THE FIRESTORE UPDATE WORKS:
  ──────────────────────────────
  To change a complaint's status:
  
  db.collection('complaints')   → points to complaints collection  
    .doc(complaintId)           → points to ONE specific document by ID
    .update({ status: 'resolved' })  → changes ONLY the status field
                                       other fields remain unchanged
  
  .update() is different from .set():
    .update() → changes only specified fields (partial update)
    .set()    → REPLACES the entire document
*/

let isAdmin = false;
let allComplaints = [];
let currentFilter = 'all';

// ── Check Admin Role ───────────────────────────────────────
/*
  THE AUTHORIZATION CHECK:
  
  1. firebase.auth().onAuthStateChanged(user => ...)
     → fires whenever login state changes
  
  2. If user is logged in, we query:
     db.collection('users').doc(user.uid).get()
     → fetches the user's profile document
  
  3. Check: userDoc.data().role === 'admin'
     → if yes, show admin panel
     → if no, show access denied
  
  This prevents regular users from SEEING admin controls.
  But remember: Firestore Security Rules prevent them from
  EXECUTING admin operations even if they hack the JS.
*/
function checkAdminAccess() {
  const adminPanel = document.getElementById('admin-panel');
  const deniedPanel = document.getElementById('access-denied');
  const loginPrompt = document.getElementById('login-prompt');

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      if (adminPanel) adminPanel.style.display = 'none';
      if (deniedPanel) deniedPanel.style.display = 'none';
      if (loginPrompt) loginPrompt.style.display = 'block';
      return;
    }

    if (loginPrompt) loginPrompt.style.display = 'none';

    try {
      const userDoc = await db.collection('users').doc(user.uid).get();

      if (userDoc.exists && userDoc.data().role === 'admin') {
        isAdmin = true;
        if (adminPanel) adminPanel.style.display = 'block';
        if (deniedPanel) deniedPanel.style.display = 'none';
        loadAllComplaints();
      } else {
        isAdmin = false;
        if (adminPanel) adminPanel.style.display = 'none';
        if (deniedPanel) deniedPanel.style.display = 'block';
      }
    } catch (error) {
      console.error('Admin check error:', error);
      if (adminPanel) adminPanel.style.display = 'none';
      if (deniedPanel) deniedPanel.style.display = 'block';
    }
  });
}

// ── Load All Complaints (Real-time) ────────────────────────
function loadAllComplaints() {
  db.collection('complaints')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        allComplaints = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        updateAdminStats();
        renderComplaintsTable(allComplaints);
      },
      (error) => {
        console.error('Error loading complaints:', error);
        showToast('Error loading real-time data.', 'error');
      }
    );
}

// ── Update Admin Stats ─────────────────────────────────────
function updateAdminStats() {
  const total = allComplaints.length;
  const pending = allComplaints.filter(c => c.status === 'pending').length;
  const inProgress = allComplaints.filter(c => c.status === 'in-progress').length;
  const resolved = allComplaints.filter(c => c.status === 'resolved').length;

  document.getElementById('admin-total').textContent = total;
  document.getElementById('admin-pending').textContent = pending;
  document.getElementById('admin-progress').textContent = inProgress;
  document.getElementById('admin-resolved').textContent = resolved;
}

// ── Render Complaints Table ────────────────────────────────
function renderComplaintsTable(complaints) {
  const tbody = document.getElementById('complaints-tbody');
  if (!tbody) return;

  const filtered = currentFilter === 'all'
    ? complaints
    : complaints.filter(c => c.status === currentFilter);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="admin-empty">
          <div class="empty-icon">📭</div>
          <p>No complaints found for this filter.</p>
        </div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const date = c.createdAt?.toDate
      ? c.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';
    const initials = (c.userName || c.userEmail || '?').slice(0, 2).toUpperCase();

    return `
      <tr>
        <td>
          <div class="complaint-title">${c.title || 'Untitled'}</div>
          <div class="complaint-desc">${c.description || ''}</div>
        </td>
        <td><span class="status-badge ${c.category?.toLowerCase() || ''}">${c.category || 'General'}</span></td>
        <td>
          <div class="user-cell">
            <div class="user-avatar-sm">${initials}</div>
            <div class="user-email">${c.userEmail || 'anonymous'}</div>
          </div>
        </td>
        <td>${date}</td>
        <td><span class="status-badge ${c.status}">${c.status || 'pending'}</span></td>
        <td>
          <select class="status-select" onchange="updateComplaintStatus('${c.id}', this.value)">
            <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
            <option value="in-progress" ${c.status === 'in-progress' ? 'selected' : ''}>🔄 In Progress</option>
            <option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>✅ Resolved</option>
            <option value="rejected" ${c.status === 'rejected' ? 'selected' : ''}>❌ Rejected</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Update Complaint Status in Firestore ───────────────────
/*
  HOW FIRESTORE .update() WORKS:
  
  db.collection('complaints')
    .doc('abc123')              ← targets ONE specific document by its ID
    .update({                   ← partial update (only changes listed fields)
      status: 'resolved',      ← changes status from 'pending' to 'resolved'
      resolvedAt: timestamp,   ← adds a new field with current time
      resolvedBy: adminEmail   ← records who resolved it
    })
  
  KEY DIFFERENCE:
    .update() → changes ONLY the fields you specify
               all other fields remain untouched
    .set()    → REPLACES the entire document
               fields you don't include are DELETED
  
  Always use .update() for status changes!
*/
async function updateComplaintStatus(complaintId, newStatus) {
  try {
    const user = firebase.auth().currentUser;

    await db.collection('complaints').doc(complaintId).update({
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: user?.email || 'admin'
    });

    // onSnapshot automatically catches this write and safely updates the ui
    showToast(`Status updated to "${newStatus}"`, 'success');

  } catch (error) {
    console.error('Update error:', error);
    showToast('Failed to update status. Check permissions.', 'error');
  }
}

// ── Toast Notification ─────────────────────────────────────
function showToast(message, type = 'success') {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.className = 'admin-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `admin-toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Initialize ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();

  // Status filter dropdown
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderComplaintsTable(allComplaints);
  });
});
