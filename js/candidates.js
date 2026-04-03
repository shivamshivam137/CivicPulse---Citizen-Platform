/* CANDIDATES.JS — Candidate Profiles with Firestore */

/*
  HOW FIRESTORE FETCHING WORKS:
  
  1. db.collection('candidates') — points to the 'candidates' collection
  2. .orderBy('name') — sorts results alphabetically
  3. .get() — fetches ALL documents once (not real-time)
     Returns a "QuerySnapshot" containing all matching documents
  
  4. snapshot.docs — an ARRAY of "DocumentSnapshot" objects
     Each DocumentSnapshot has:
       - .id → the auto-generated document ID
       - .data() → returns a plain JS object with all fields
  
  5. We loop through snapshot.docs, call .data() on each,
     and build HTML strings for each candidate card
  
  6. The HTML is injected into the grid container using innerHTML
  
  WHY THIS IS POWERFUL:
  To update a candidate's profile, you only edit the Firestore
  document (via Firebase Console or code). The HTML updates
  automatically on the next page load — zero code changes needed.
*/

// Sample data to show when Firestore is empty (demo mode)
const SAMPLE_CANDIDATES = [
  {
    name: 'Piyush Goyal',
    party: 'Bharatiya Janata Party',
    constituency: 'Mumbai North',
    age: 60,
    education: 'B.Com, Chartered Accountant, Law Graduate',
    profession: 'Politician & Chartered Accountant',
    assets: '₹21.26 Crore',
    liabilities: '₹4.02 Crore',
    criminalCases: 0,
    criminalDetails: '',
    manifesto: 'Infrastructure development, smart city initiatives, Make in India industrial growth, and metro rail expansion in Mumbai.',
    photoURL: '',
    experience: 'Union Minister, Rajya Sabha MP (3 terms)'
  },
  {
    name: 'Bhushan Patil',
    party: 'Indian National Congress',
    constituency: 'Mumbai North',
    age: 50,
    education: 'B.A. from Mumbai University',
    profession: 'Social Worker & Politician',
    assets: '₹3.41 Crore',
    liabilities: '₹62 Lakh',
    criminalCases: 0,
    criminalDetails: '',
    manifesto: 'Affordable housing, slum rehabilitation, public transport improvement, and employment generation for youth.',
    photoURL: '',
    experience: 'Former Corporator, MCGM'
  },
  {
    name: 'Arvind Sawant',
    party: 'Shiv Sena (UBT)',
    constituency: 'Mumbai South',
    age: 74,
    education: 'B.Com from Mumbai University',
    profession: 'Politician',
    assets: '₹5.83 Crore',
    liabilities: '₹18 Lakh',
    criminalCases: 1,
    criminalDetails: 'IPC 188 (Disobedience to order by public servant) — case pending.',
    manifesto: 'Protecting Mumbai identity, fishermen rights, heritage preservation, and opposition to bullet train land acquisition.',
    photoURL: '',
    experience: '2-term Lok Sabha MP, Former Union Minister'
  },
  {
    name: 'Yamini Jadhav',
    party: 'Shiv Sena (Shinde)',
    constituency: 'Mumbai South',
    age: 45,
    education: 'M.A. from SNDT University',
    profession: 'Social Worker & MLA',
    assets: '₹4.12 Crore',
    liabilities: '₹95 Lakh',
    criminalCases: 0,
    criminalDetails: '',
    manifesto: 'Women safety, coastal road completion, affordable healthcare, and Dharavi redevelopment project.',
    photoURL: '',
    experience: 'MLA from Byculla, Former Corporator'
  },
  {
    name: 'Sunil Tatkare',
    party: 'Nationalist Congress Party (Ajit Pawar)',
    constituency: 'Raigad',
    age: 68,
    education: 'B.Com from Mumbai University',
    profession: 'Politician & Businessman',
    assets: '₹30.54 Crore',
    liabilities: '₹2.15 Crore',
    criminalCases: 2,
    criminalDetails: 'Maharashtra Irrigation Scam (2012) — under investigation. IPC 420 (Cheating) — case pending.',
    manifesto: 'Navi Mumbai airport completion, JNPT expansion, coastal highway development, and farmer welfare.',
    photoURL: '',
    experience: 'Former MLA, Former Minister of Water Resources'
  },
  {
    name: 'Anant Geete',
    party: 'Shiv Sena (UBT)',
    constituency: 'Raigad',
    age: 72,
    education: 'B.Sc., B.Ed. from Mumbai University',
    profession: 'Politician & Educator',
    assets: '₹8.67 Crore',
    liabilities: '₹45 Lakh',
    criminalCases: 0,
    criminalDetails: '',
    manifesto: 'Industrial development in Raigad, konkan railway improvement, tribal welfare, and environmental protection.',
    photoURL: '',
    experience: '5-term Lok Sabha MP, Former Union Minister of Heavy Industries'
  },
  {
    name: 'Amol Kirtikar',
    party: 'Shiv Sena (UBT)',
    constituency: 'Mumbai North-West',
    age: 47,
    education: 'B.E. Mechanical Engineering',
    profession: 'Engineer & Politician',
    assets: '₹7.92 Crore',
    liabilities: '₹1.10 Crore',
    criminalCases: 1,
    criminalDetails: 'IPC 34 (Common intention) — case pending.',
    manifesto: 'Metro connectivity, water supply improvement, green belt protection, and startup ecosystem in Andheri-Jogeshwari belt.',
    photoURL: '',
    experience: 'Former Lok Sabha MP, Former Corporator'
  },
  {
    name: 'Ravindra Waikar',
    party: 'Shiv Sena (Shinde)',
    constituency: 'Mumbai North-West',
    age: 66,
    education: 'B.Com from Mumbai University',
    profession: 'Politician & Real Estate',
    assets: '₹51.90 Crore',
    liabilities: '₹8.32 Crore',
    criminalCases: 0,
    criminalDetails: '',
    manifesto: 'Goregaon-Mulund link road, Aarey forest protection balance, slum redevelopment, and senior citizen welfare.',
    photoURL: '',
    experience: 'Former MLA Jogeshwari East, Former Mumbai Mayor'
  }
];

let allCandidates = [];
let activePartyFilter = 'all';

// ── Load candidates from Firestore ─────────────────────────
async function loadCandidates() {
  const grid = document.getElementById('candidates-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="candidates-empty"><div class="empty-icon">⏳</div><h3>Loading candidates...</h3></div>';

  try {
    /*
      FIRESTORE QUERY BREAKDOWN:
      
      db.collection('candidates') → points to the collection
      .orderBy('name')            → sorts A-Z by name field
      .get()                      → fetches all docs (one-time read)
      
      Returns a QuerySnapshot with:
        .empty  → boolean, true if no documents found
        .size   → number of documents
        .docs   → array of DocumentSnapshot objects
    */
    const snapshot = await db.collection('candidates').orderBy('name').get();

    if (snapshot.empty) {
      // No data in Firestore yet — use sample data for demo
      allCandidates = SAMPLE_CANDIDATES;
    } else {
      /*
        ITERATING THROUGH SNAPSHOTS:
        
        snapshot.docs is an array. Each element is a DocumentSnapshot.
        
        doc.id    → the unique document ID (auto-generated string)
        doc.data() → returns a plain JavaScript object like:
          {
            name: "Rajesh Kumar",
            party: "INC",
            education: "MBA",
            assets: "₹4.2 Cr",
            ...
          }
        
        We use .map() to transform each doc into a JS object
        with the ID included, so we can reference it later.
      */
      allCandidates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    updateStats();
    renderCandidates(allCandidates);

  } catch (error) {
    console.error('Error loading candidates:', error);
    // Fallback to sample data if Firestore fails
    allCandidates = SAMPLE_CANDIDATES;
    updateStats();
    renderCandidates(allCandidates);
  }
}

// ── Render candidate cards into the DOM ────────────────────
/*
  HOW DOM MANIPULATION WORKS HERE:
  
  Instead of writing static HTML for each candidate, we BUILD
  the HTML dynamically from data. This means:
  
  1. Add/remove a candidate in Firestore → page updates automatically
  2. Change a candidate's assets → page shows new value
  3. No HTML editing needed — ever
  
  We use Array.map() to convert each candidate object into
  an HTML string, then .join('') to merge them all, and
  set it as innerHTML of the grid container.
*/
function renderCandidates(candidates) {
  const grid = document.getElementById('candidates-grid');
  if (!grid) return;

  if (candidates.length === 0) {
    grid.innerHTML = `
      <div class="candidates-empty">
        <div class="empty-icon">🔍</div>
        <h3>No candidates found</h3>
        <p>Try a different search term or filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = candidates.map((c, index) => {
    const initials = (c.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const criminalClass = (c.criminalCases > 0) ? 'cases' : 'clean';
    const criminalText = (c.criminalCases > 0) ? `⚠️ ${c.criminalCases} case(s)` : '✅ Clean';
    const delay = Math.min(index + 1, 5);

    return `
      <div class="glass-card candidate-card animate-fade-in-up animate-delay-${delay}" onclick="showCandidateDetail(${index})">
        <div class="candidate-header">
          <div class="candidate-photo">
            ${c.photoURL ? `<img src="${c.photoURL}" alt="${c.name}">` : initials}
          </div>
          <div class="candidate-info">
            <div class="candidate-name">${c.name}</div>
            <div class="candidate-party">${c.party || 'Independent'}</div>
            <div class="candidate-constituency">📍 ${c.constituency || 'N/A'}</div>
          </div>
        </div>
        <div class="candidate-body">
          <div class="detail-row">
            <span class="detail-icon">🎓</span>
            <span class="detail-label">Education</span>
            <span class="detail-value">${c.education || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-icon">💰</span>
            <span class="detail-label">Assets</span>
            <span class="detail-value">${c.assets || 'Not declared'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-icon">⚖️</span>
            <span class="detail-label">Record</span>
            <span class="detail-value"><span class="criminal-badge ${criminalClass}">${criminalText}</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-icon">🏛️</span>
            <span class="detail-label">Experience</span>
            <span class="detail-value">${c.experience || 'First-time candidate'}</span>
          </div>
          <div style="text-align: right; margin-top: 10px; font-size: 0.75rem; color: var(--color-text-muted);">
            Source: <a href="https://myneta.info/" target="_blank" style="color: inherit; text-decoration: underline;">ADR/MyNeta</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Show detailed candidate modal ──────────────────────────
function showCandidateDetail(index) {
  const c = getFilteredCandidates()[index];
  if (!c) return;

  const modal = document.getElementById('candidate-modal');
  if (!modal) return;

  const initials = (c.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-header">
      <button class="modal-close" onclick="closeCandidateModal()">✕</button>
      <div class="modal-photo">
        ${c.photoURL ? `<img src="${c.photoURL}" alt="${c.name}">` : initials}
      </div>
      <div>
        <div class="candidate-name" style="font-size:1.2rem;">${c.name}</div>
        <div class="candidate-party">${c.party || 'Independent'}</div>
        <div class="candidate-constituency">📍 ${c.constituency || 'N/A'} ${c.age ? `· Age ${c.age}` : ''}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <h4>🎓 Education & Profession</h4>
        <p>${c.education || 'Not available'}</p>
        <p style="margin-top:4px; color:var(--color-text-muted); font-size:0.82rem;">${c.profession || ''}</p>
      </div>
      <div class="modal-section">
        <h4>💰 Financial Declaration</h4>
        <div class="detail-row" style="border:none; padding:4px 0;">
          <span class="detail-label">Assets</span>
          <span class="detail-value">${c.assets || 'Not declared'}</span>
        </div>
        <div class="detail-row" style="border:none; padding:4px 0;">
          <span class="detail-label">Liabilities</span>
          <span class="detail-value">${c.liabilities || 'Not declared'}</span>
        </div>
      </div>
      <div class="modal-section">
        <h4>⚖️ Criminal Record</h4>
        <p><span class="criminal-badge ${c.criminalCases > 0 ? 'cases' : 'clean'}">
          ${c.criminalCases > 0 ? `⚠️ ${c.criminalCases} case(s)` : '✅ No criminal cases'}
        </span></p>
        ${c.criminalDetails ? `<p style="margin-top:8px; font-size:0.82rem;">${c.criminalDetails}</p>` : ''}
      </div>
      <div class="modal-section">
        <h4>📜 Manifesto & Promises</h4>
        <p>${c.manifesto || 'No manifesto available yet.'}</p>
      </div>
      <div class="modal-section">
        <h4>🏛️ Political Experience</h4>
        <p>${c.experience || 'First-time candidate'}</p>
      </div>
      <div style="font-size: 0.8rem; color: var(--color-text-muted); text-align: center; margin-top: 16px;">
        Source: Candidate affidavits filed with the Election Commission of India. Data curated via <a href="https://myneta.info/" target="_blank" style="color: var(--color-primary); text-decoration: underline;">MyNeta.info / Association for Democratic Reforms</a>.
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCandidateModal() {
  const modal = document.getElementById('candidate-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ── Search & Filter ────────────────────────────────────────
function getFilteredCandidates() {
  const searchTerm = (document.getElementById('candidate-search')?.value || '').toLowerCase();

  return allCandidates.filter(c => {
    const matchesParty = activePartyFilter === 'all' || (c.party || '').toLowerCase().includes(activePartyFilter);
    const matchesSearch = !searchTerm ||
      (c.name || '').toLowerCase().includes(searchTerm) ||
      (c.party || '').toLowerCase().includes(searchTerm) ||
      (c.constituency || '').toLowerCase().includes(searchTerm);
    return matchesParty && matchesSearch;
  });
}

function applyFilters() {
  const filtered = getFilteredCandidates();
  renderCandidates(filtered);
}

function updateStats() {
  const totalEl = document.getElementById('stat-total');
  const cleanEl = document.getElementById('stat-clean');
  const casesEl = document.getElementById('stat-cases');
  if (totalEl) totalEl.textContent = allCandidates.length;
  if (cleanEl) cleanEl.textContent = allCandidates.filter(c => !c.criminalCases).length;
  if (casesEl) casesEl.textContent = allCandidates.filter(c => c.criminalCases > 0).length;
}

// ── Initialize ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadCandidates();

  // Search input
  document.getElementById('candidate-search')?.addEventListener('input', applyFilters);

  // Party filter tabs
  document.querySelectorAll('.party-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.party-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activePartyFilter = tab.dataset.party;
      applyFilters();
    });
  });

  // Close modal on overlay click
  document.getElementById('candidate-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'candidate-modal') closeCandidateModal();
  });
});
