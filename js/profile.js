// PROFILE.JS — User Profile and Complaints Management

// ── Initialize Auth & Check Access ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'index.html'; // Redirect to home if logged out
      return;
    }
    
    // Set Header Info
    document.getElementById('profile-page-name').textContent = user.displayName || 'Citizen';
    document.getElementById('profile-page-email').textContent = user.email || '';
    document.getElementById('profile-page-avatar').textContent = (user.displayName || user.email || '?').slice(0, 2).toUpperCase();
    
    // Load profile data and complaints
    await loadUserProfile(user.uid);
    loadMyComplaints(user.uid);
  });

  // Setup Form Listener
  const form = document.getElementById('profile-form');
  const btn = document.getElementById('save-profile-btn');
  
  // Enable save button only when user types
  form.addEventListener('input', () => {
    btn.disabled = false;
  });

  form.addEventListener('submit', handleProfileUpdate);
});

// ── Load User Profile Data ─────────────────────────────────
async function loadUserProfile(uid) {
  try {
    const docRef = db.collection('users').doc(uid);
    const snapshot = await docRef.get();
    
    if (snapshot.exists) {
      const data = snapshot.data();
      
      // If role exists, update badge
      if (data.role) {
        document.getElementById('profile-page-role').textContent = data.role.toUpperCase();
      }
      
      // Populate Form Fields
      if (data.nickname) document.getElementById('prof-nickname').value = data.nickname;
      if (data.phone) document.getElementById('prof-phone').value = data.phone;
      if (data.profession) document.getElementById('prof-profession').value = data.profession;
      if (data.address) document.getElementById('prof-address').value = data.address;
      if (data.area) {
        const areaDropdown = document.getElementById('prof-area');
        if (areaDropdown) areaDropdown.value = data.area;
      }
    }
  } catch (error) {
    console.error("Error loading profile data:", error);
  }
}

// ── Update Profile Data ────────────────────────────────────
async function handleProfileUpdate(e) {
  e.preventDefault();
  
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  const btn = document.getElementById('save-profile-btn');
  const statusEl = document.getElementById('profile-status');
  
  btn.textContent = 'Saving...';
  btn.disabled = true;
  
  try {
    const nickname = document.getElementById('prof-nickname').value.trim();
    const phone = document.getElementById('prof-phone').value.trim();
    const profession = document.getElementById('prof-profession').value.trim();
    const address = document.getElementById('prof-address').value.trim();
    const area = document.getElementById('prof-area').value;
    
    await db.collection('users').doc(user.uid).set({
      nickname,
      phone,
      profession,
      address,
      area,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }); // Merge ensures we don't overwrite role/email!

    showStatus('Profile updated successfully!', 'success');
  } catch (error) {
    console.error("Error updating profile:", error);
    showStatus('Failed to update profile.', 'error');
    btn.disabled = false;
  }
}

function showStatus(text, type) {
  const statusEl = document.getElementById('profile-status');
  statusEl.textContent = text;
  statusEl.className = `alert-message ${type}`;
  statusEl.style.display = 'block';
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

// ── Load User's Personal Complaints ─────────────────────────
async function loadMyComplaints(uid) {
  const container = document.getElementById('my-complaints-list');
  container.innerHTML = '<div class="loading-spinner">Loading your civic reports...</div>';

  try {
    // We only use where() here, and sort the array manually in JS.
    // Why? Combinding .where() and .orderBy() in Firestore requires a custom Composite Index.
    // Sorting in JS prevents the app from crashing if the user hasn't created the index yet!
    const snapshot = await db.collection('complaints').where('userId', '==', uid).get();
    
    if (snapshot.empty) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: var(--space-xl);">
          <h3>No reports yet</h3>
          <p class="text-muted" style="margin-top: 8px;">You haven't submitted any civic issues.</p>
          <a href="complaints.html" class="btn-primary" style="display: inline-block; margin-top: var(--space-md); text-decoration: none;">Report an Issue</a>
        </div>
      `;
      return;
    }

    // Sort manually in JS (Newest first)
    const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    complaints.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    container.innerHTML = complaints.map(d => {
      const date = d.createdAt ? d.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown Date';
      const statusClass = d.status === 'resolved' ? 'badge-success' : d.status === 'in-progress' ? 'badge-warning' : 'badge-danger';
      
      const upvotes = (d.upvoters || []).length;
      const downvotes = (d.downvoters || []).length;
      const score = upvotes - downvotes;

      return `
        <div class="glass-card my-complaint-card">
          <div class="my-complaint-header">
            <span class="badge ${statusClass}">${d.status?.toUpperCase() || 'PENDING'}</span>
            <span class="my-complaint-date" style="font-size: 0.8rem; color: var(--color-text-muted);">${date}</span>
          </div>
          
          <div class="my-complaint-title">${d.title}</div>
          <div class="my-complaint-desc">${d.description}</div>
          
          <div class="my-complaint-footer">
            <span class="badge badge-outline">📍 ${d.area || d.address || 'Location provided'}</span>
            <span title="Community Score">🏆 Score: ${score > 0 ? '+' : ''}${score}</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error("Error fetching your complaints:", error);
    container.innerHTML = '<div class="alert-message error">Failed to load local complaints. Database error.</div>';
  }
}
