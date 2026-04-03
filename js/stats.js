/**
 * STATS.JS — Real-Time Homepage Statistics Engine
 * Fetches live data from Firestore and animates the counters.
 */

// Animated count-up effect
function animateCounter(element, target, duration = 1500, prefix = '', suffix = '') {
  if (!element) return;

  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic for a natural deceleration feel
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);

    element.textContent = prefix + current.toLocaleString('en-IN') + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Format currency for Funds Tracked
function formatFunds(amount) {
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + ' Cr';
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + ' L';
  return '₹' + amount.toLocaleString('en-IN');
}

// Fetch and display real-time stats
function loadHomeStats() {
  const citizensEl = document.getElementById('stat-citizens');
  const resolvedEl = document.getElementById('stat-resolved');
  const filedEl    = document.getElementById('stat-filed');
  const fundsEl    = document.getElementById('stat-funds');

  // If we're not on the homepage, bail out
  if (!citizensEl && !resolvedEl && !filedEl) return;

  // 1. Active Citizens — real-time listener on users collection
  db.collection('users').onSnapshot(
    (snapshot) => {
      const count = snapshot.size;
      animateCounter(citizensEl, count);
    },
    (err) => {
      if (citizensEl) citizensEl.textContent = '--';
    }
  );

  // 2. Complaints Filed + Issues Resolved — single listener, derive both
  db.collection('complaints').onSnapshot(
    (snapshot) => {
      const totalFiled = snapshot.size;
      let totalResolved = 0;

      snapshot.docs.forEach(doc => {
        if (doc.data().status === 'resolved') totalResolved++;
      });

      animateCounter(filedEl, totalFiled);
      animateCounter(resolvedEl, totalResolved);
    },
    (err) => {
      if (filedEl) filedEl.textContent = '--';
      if (resolvedEl) resolvedEl.textContent = '--';
    }
  );

  // 3. Funds Tracked — placeholder (can be wired to a real collection later)
  //    For now, derive a simulated value from complaint count
  db.collection('complaints').get().then((snapshot) => {
    const simulatedFunds = snapshot.size * 125000; // ₹1.25L per complaint avg
    if (fundsEl) {
      const target = simulatedFunds || 0;
      const startTime = performance.now();
      const duration = 1500;

      function updateFunds(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        fundsEl.textContent = formatFunds(current);
        if (progress < 1) requestAnimationFrame(updateFunds);
      }
      requestAnimationFrame(updateFunds);
    }
  }).catch(() => {
    if (fundsEl) fundsEl.textContent = '₹--';
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', loadHomeStats);
