/* COMPLAINTS.JS — Complaint Submission Logic */

// Category options for the complaint form
const COMPLAINT_CATEGORIES = [
  { value: 'pothole', label: '🕳️ Pothole' },
  { value: 'sewage', label: '🚰 Sewage Blockage' },
  { value: 'waterlogging', label: '🌊 Water Logging' },
  { value: 'streetlight', label: '💡 Broken Streetlight' },
  { value: 'garbage', label: '🗑️ Garbage Dump' },
  { value: 'road', label: '🛣️ Road Damage' },
  { value: 'other', label: '📋 Other' }
];

let selectedLocation = null;
let selectedImageFile = null;

// ── Initialize complaint form ──────────────────────────────
function initComplaintForm() {
  const form = document.getElementById('complaint-form');
  const imageInput = document.getElementById('complaint-image');
  const gpsBtn = document.getElementById('gps-btn');
  const imageDropzone = document.getElementById('image-dropzone');

  if (!form) return;

  form.addEventListener('submit', handleComplaintSubmit);
  imageInput?.addEventListener('change', handleImageSelect);
  gpsBtn?.addEventListener('click', fetchGPSLocation);

  // Drag and drop support
  if (imageDropzone) {
    imageDropzone.addEventListener('click', () => imageInput?.click());
    imageDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageDropzone.classList.add('dragover');
    });
    imageDropzone.addEventListener('dragleave', () => {
      imageDropzone.classList.remove('dragover');
    });
    imageDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imageDropzone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        imageInput.files = e.dataTransfer.files;
        handleImageSelect({ target: imageInput });
      }
    });
  }
}

// ── Handle image selection (preview) ───────────────────────
function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showComplaintStatus('Please select an image file.', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showComplaintStatus('Image must be under 5MB.', 'error');
    return;
  }

  selectedImageFile = file;

  // Show preview using FileReader
  const reader = new FileReader();
  reader.onload = (event) => {
    const preview = document.getElementById('image-preview');
    const dropzone = document.getElementById('image-dropzone');
    if (preview) {
      preview.innerHTML = `
        <img src="${event.target.result}" alt="Preview">
        <button type="button" class="remove-image-btn" onclick="removeImage()">✕ Remove</button>
      `;
      preview.style.display = 'block';
    }
    if (dropzone) dropzone.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  selectedImageFile = null;
  const preview = document.getElementById('image-preview');
  const dropzone = document.getElementById('image-dropzone');
  const input = document.getElementById('complaint-image');
  if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
  if (dropzone) dropzone.style.display = '';
  if (input) input.value = '';
}

/*
  ── GPS Location ──────────────────────────────────────────────
  
  HOW IT WORKS:
  navigator.geolocation.getCurrentPosition() uses the browser's
  built-in Geolocation API. On mobile, this uses GPS hardware.
  On desktop, it uses IP-based location (less accurate).
  
  The user MUST grant permission when the browser asks.
  If denied, we fall back to manual address entry.
*/
function fetchGPSLocation() {
  const gpsBtn = document.getElementById('gps-btn');
  const gpsStatus = document.getElementById('gps-status');

  if (!navigator.geolocation) {
    if (gpsStatus) gpsStatus.textContent = 'Geolocation not supported by your browser.';
    return;
  }

  if (gpsBtn) {
    gpsBtn.disabled = true;
    gpsBtn.textContent = '📡 Fetching...';
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      selectedLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
      if (gpsStatus) {
        gpsStatus.textContent = `📍 ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)} (±${Math.round(selectedLocation.accuracy)}m)`;
        gpsStatus.classList.add('success');
      }
      if (gpsBtn) {
        gpsBtn.textContent = '✅ Location Captured';
        gpsBtn.disabled = false;
      }
    },
    (error) => {
      const messages = {
        1: 'Location permission denied. Please enter address manually.',
        2: 'Location unavailable. Please enter address manually.',
        3: 'Location request timed out. Try again.'
      };
      if (gpsStatus) gpsStatus.textContent = messages[error.code] || 'Location error.';
      if (gpsBtn) { gpsBtn.textContent = '📍 Retry GPS'; gpsBtn.disabled = false; }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

/*
  ── Submit Complaint ──────────────────────────────────────────
  
  THE ASYNC FLOW (this is the most important part):
  
  Step 1: Validate all form fields
  Step 2: Check if user is logged in (auth.currentUser)
  Step 3: If image exists → upload to Firebase Storage FIRST
          - storage.ref('complaints/filename').put(file)
          - This streams the raw file bytes to Google Cloud
          - Returns a "snapshot" when upload is complete
          - snapshot.ref.getDownloadURL() gives us the public URL
  Step 4: ONLY AFTER the image URL is ready, create the
          Firestore document with ALL data including the URL
          - db.collection('complaints').add({...})
  Step 5: Show success message, reset form
  
  WHY THIS ORDER MATTERS:
  If we tried to save the Firestore doc BEFORE the image
  finished uploading, the imageURL field would be empty.
  The `await` keyword ensures Step 4 doesn't run until
  Step 3 is completely finished.
*/
async function handleComplaintSubmit(e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    showComplaintStatus('Please login to submit a complaint.', 'error');
    if (typeof showAuthModal === 'function') showAuthModal();
    return;
  }

  const title = document.getElementById('complaint-title').value.trim();
  const category = document.getElementById('complaint-category').value;
  const area = document.getElementById('complaint-area').value;
  const description = document.getElementById('complaint-description').value.trim();
  const address = document.getElementById('complaint-address').value.trim();

  if (!title || !category || !area || !description) {
    showComplaintStatus('Please fill in all required fields.', 'error');
    return;
  }

  const submitBtn = document.getElementById('complaint-submit-btn');
  const progressBar = document.getElementById('upload-progress');

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

  try {
    let imageURL = null;

    // ── STEP 3: Upload image to Firebase Storage ─────────
    if (selectedImageFile) {
      /*
        HOW THE UPLOAD WORKS:
        
        1. We create a unique filename using timestamp + original name
           to prevent filename collisions in Storage.
        
        2. storage.ref('complaints/...') creates a reference (a pointer)
           to where the file WILL be stored in the cloud.
        
        3. .put(selectedImageFile) starts streaming the actual file
           bytes from the user's device to Google Cloud Storage.
           This is the actual upload — it transfers the binary data.
        
        4. uploadTask.on('state_changed', ...) lets us track progress
           in real-time (bytes transferred / total bytes).
        
        5. We wrap the upload in a Promise so we can `await` it.
           The Promise resolves ONLY when the upload is 100% done.
        
        6. After upload completes, .getDownloadURL() generates a
           public HTTPS URL that anyone can use to view the image.
      */
      const fileName = `${Date.now()}_${selectedImageFile.name}`;
      const storageRef = storage.ref(`complaints/${user.uid}/${fileName}`);
      const uploadTask = storageRef.put(selectedImageFile);

      imageURL = await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Progress callback — fires multiple times during upload
            const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressBar) {
              progressBar.style.display = 'block';
              progressBar.querySelector('.progress-fill').style.width = `${percent}%`;
              progressBar.querySelector('.progress-text').textContent = `Uploading: ${Math.round(percent)}%`;
            }
          },
          (error) => reject(error),      // Error callback
          async () => {
            // Complete callback — upload finished, now get the URL
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            resolve(url);
          }
        );
      });
    }

    // ── STEP 4: Save complaint to Firestore ──────────────
    /*
      WHY THIS IS AFTER THE UPLOAD:
      `imageURL` only has a value AFTER the Promise above resolves.
      If there's no image, imageURL stays null — that's fine.
      
      db.collection('complaints').add() creates a new document
      with an auto-generated ID in the 'complaints' collection.
      
      firebase.firestore.FieldValue.serverTimestamp() uses the
      SERVER's clock, not the user's device clock, ensuring
      consistent timestamps regardless of timezone.
    */
    await db.collection('complaints').add({
      title,
      category,
      area,
      description,
      address: address || null,
      location: selectedLocation ? new firebase.firestore.GeoPoint(selectedLocation.lat, selectedLocation.lng) : null,
      imageURL,
      status: 'pending',
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userEmail: user.email,
      upvoters: [],
      downvoters: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showComplaintStatus('✅ Complaint submitted successfully! It will be reviewed shortly.', 'success');
    resetComplaintForm();
    // loadComplaints(); // No longer needed — onSnapshot updates automatically

  } catch (error) {
    console.error('Submission error:', error);
    showComplaintStatus(`Error: ${error.message}`, 'error');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Complaint'; }
    if (progressBar) progressBar.style.display = 'none';
  }
}

function resetComplaintForm() {
  const form = document.getElementById('complaint-form');
  if (form) form.reset();
  removeImage();
  selectedLocation = null;
  const gpsStatus = document.getElementById('gps-status');
  const gpsBtn = document.getElementById('gps-btn');
  if (gpsStatus) { gpsStatus.textContent = ''; gpsStatus.classList.remove('success'); }
  if (gpsBtn) gpsBtn.textContent = '📍 Get My Location';
}

function showComplaintStatus(message, type) {
  const el = document.getElementById('complaint-status');
  if (el) {
    el.textContent = message;
    el.className = `complaint-status ${type}`;
    el.style.display = 'block';
    if (type === 'success') setTimeout(() => { el.style.display = 'none'; }, 5000);
  }
}

// ── XSS Sanitization Helper ──────────────────────────────────
const escapeHTML = (str) => {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
};

// ── Load existing complaints from Firestore (Real-time) ──────
function loadComplaints() {
  const container = document.getElementById('complaints-list');
  if (!container) return;

  container.innerHTML = '<div class="loading-spinner">Loading complaints...</div>';

  db.collection('complaints')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .onSnapshot(
      (snapshot) => {
        if (snapshot.empty) {
          container.innerHTML = '<p class="text-muted" style="text-align:center; padding:2rem;">No complaints yet. Be the first to report an issue!</p>';
          return;
        }

        let docsArray = [...snapshot.docs];
        
        // Location-Priority Sorting
        if (typeof currentUserArea !== 'undefined' && currentUserArea) {
          docsArray.sort((a, b) => {
            const aMatch = a.data().area === currentUserArea ? 1 : 0;
            const bMatch = b.data().area === currentUserArea ? 1 : 0;
            return bMatch - aMatch;
          });
        }

        container.innerHTML = docsArray.map(doc => {
          const d = doc.data();
          const date = d.createdAt ? d.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now';
          const categoryLabel = COMPLAINT_CATEGORIES.find(c => c.value === d.category)?.label || d.category;
          const statusClass = d.status === 'resolved' ? 'badge-success' : d.status === 'in-progress' ? 'badge-warning' : 'badge-danger';

          const currentUserUid = auth.currentUser ? auth.currentUser.uid : null;
          
          // Voting Logic (Toggle only, no negative)
          const upvoters = d.upvoters || [];
          const voteScore = upvoters.length;
          
          const hasUpvoted = currentUserUid && upvoters.includes(currentUserUid);
          const upAction = hasUpvoted ? 'remove-up' : 'up';

          // XSS Prevention: Sanitize user input before injecting into innerHTML
          const safeTitle = escapeHTML(d.title);
          const safeDesc = escapeHTML(d.description);
          const safeAddress = escapeHTML(d.address);
          const safeArea = escapeHTML(d.area);
          const safeUserName = escapeHTML(d.userName);

          return `
            <div class="glass-card complaint-item">
              ${d.imageURL ? `<div class="complaint-image"><img src="${d.imageURL}" alt="${safeTitle}" loading="lazy"></div>` : ''}
              <div class="complaint-details">
                <div class="complaint-meta">
                  <span class="badge ${statusClass}">${d.status || 'pending'}</span>
                  <span class="badge badge-primary">${categoryLabel}</span>
                  ${safeArea ? `<span class="badge badge-outline">📍 ${safeArea}</span>` : ''}
                  <span class="complaint-date">${date}</span>
                </div>
                <h3>${safeTitle}</h3>
                <p>${safeDesc}</p>
                ${safeAddress ? `<div class="complaint-location">📍 ${safeAddress}</div>` : ''}
                
                <div class="complaint-author">
                  <span>By ${safeUserName}</span>
                  
                  <!-- Voting UI -->
                  <div class="complaint-actions">
                    <button class="vote-btn ${hasUpvoted ? 'voted-up' : ''}" onclick="handleVote('${doc.id}', '${upAction}')" title="Upvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <span class="vote-score">${voteScore > 0 ? '+' : ''}${voteScore}</span>
                  </div>
                </div>
                
              </div>
            </div>
          `;
        }).join('');
      },
      (error) => {
        console.error('Error loading complaints:', error);
        container.innerHTML = '<p class="text-muted" style="text-align:center;">Error loading complaints.</p>';
      }
    );
}

// ── Handle Vote Action ─────────────────────────────────────
async function handleVote(complaintId, action) {
  const user = auth.currentUser;
  if (!user) {
    showComplaintStatus('Please login to vote on complaints.', 'error');
    if (typeof showAuthModal === 'function') showAuthModal();
    return;
  }
  
  const uid = user.uid;
  const docRef = db.collection('complaints').doc(complaintId);
  
  // Firestore FieldValues to add/remove securely without downloading the whole array
  const union = firebase.firestore.FieldValue.arrayUnion(uid);
  const remove = firebase.firestore.FieldValue.arrayRemove(uid);

  try {
    if (action === 'up') {
      await docRef.update({ upvoters: union });
    } else if (action === 'remove-up') {
      await docRef.update({ upvoters: remove });
    }
  } catch (error) {
    console.error('Voting error:', error);
    showComplaintStatus('Failed to record vote. Please try again.', 'error');
  }
}

let currentUserArea = null;

// ── Init on page load ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initComplaintForm();
  
  // Re-render complaints when auth state changes so vote buttons update instantly
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) currentUserArea = doc.data().area;
      } catch (e) { console.error('Failed to grab area setting', e); }
    } else {
      currentUserArea = null;
    }
    loadComplaints();
  });
});
