/**
 * AUTH.JS — Firebase Authentication Logic
 * Handles user sign up, login, Google Auth, logout, auth state persistence,
 * welcome gate modal, and post-login profile completion popup.
 */
// ─────────────────────────────────────────────────────────────
// 1. AUTH MODAL — Show / Hide
// ─────────────────────────────────────────────────────────────
// The modal is injected into every page by global.js.
// These functions control its visibility.

function showAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Default to login tab
    switchAuthTab('login');
  }
}

function hideAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    clearAuthErrors();
  }
}

function clearAuthErrors() {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

function showAuthError(message) {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function setAuthLoading(isLoading) {
  const btns = document.querySelectorAll('.auth-submit-btn, .google-btn');
  btns.forEach(btn => {
    btn.disabled = isLoading;
    if (isLoading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Please wait...';
    } else if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
    }
  });
}


// ─────────────────────────────────────────────────────────────
// 1B. WELCOME GATE MODAL — Show / Hide
// ─────────────────────────────────────────────────────────────
// Shown on first visit when user is not logged in and hasn't
// chosen "Continue as Guest" yet. Uses sessionStorage so it
// only appears once per browser session.

function showWelcomeModal() {
  const modal = document.getElementById('welcome-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function hideWelcomeModal() {
  const modal = document.getElementById('welcome-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Decides whether to show the welcome modal.
 * Called once after auth state is resolved on page load.
 */
function maybeShowWelcomeModal(user) {
  // Already logged in → no need
  if (user) return;
  // User previously chose "Continue as Guest" this session
  if (sessionStorage.getItem('guestMode') === 'true') return;
  // Show the welcome gate
  showWelcomeModal();
}


// ─────────────────────────────────────────────────────────────
// 1C. PROFILE COMPLETION MODAL — Show / Hide / Save
// ─────────────────────────────────────────────────────────────
// Shown after login/signup if the user's Firestore profile
// document is missing key fields (nickname, phone, area).

function showProfileModal(user) {
  const modal = document.getElementById('profile-complete-modal');
  if (!modal) return;

  // Set the avatar in the modal header
  const avatarEl = document.getElementById('profile-modal-avatar');
  if (avatarEl) {
    const initials = (user.displayName || user.email || '?')
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    avatarEl.textContent = initials;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideProfileModal() {
  const modal = document.getElementById('profile-complete-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Checks Firestore for profile completeness.
 * If key fields are missing, shows the profile completion modal.
 */
async function checkProfileAndPrompt(user) {
  try {
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      const data = doc.data();
      // Consider profile "complete" if at least nickname AND area are filled
      const isComplete = data.nickname && data.nickname.trim() !== ''
                      && data.area && data.area.trim() !== '';
      if (isComplete) return; // Profile is already filled — skip
    }
    // Document doesn't exist or fields are empty → prompt
    showProfileModal(user);
  } catch (error) {
    console.error('Profile completeness check failed:', error);
    // Don't block the user if the check fails
  }
}

/**
 * Handles the quick profile form submission from the modal.
 */
async function handleQuickProfileSave(e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const saveBtn = document.getElementById('profile-modal-save');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  try {
    const nickname   = document.getElementById('quick-nickname').value.trim();
    const phone      = document.getElementById('quick-phone').value.trim();
    const profession = document.getElementById('quick-profession').value.trim();
    const area       = document.getElementById('quick-area').value;

    await db.collection('users').doc(user.uid).set({
      nickname,
      phone,
      profession,
      area,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    hideProfileModal();
    showProfileToast();
  } catch (error) {
    console.error('Quick profile save failed:', error);
    // Reset button so user can retry
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Continue';
    }
  }
}

/**
 * Shows a brief success toast after saving profile.
 */
function showProfileToast() {
  const toast = document.getElementById('profile-save-toast');
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


// ─────────────────────────────────────────────────────────────
// 2. SWITCH BETWEEN LOGIN / SIGNUP TABS
// ─────────────────────────────────────────────────────────────
// The modal has two views: Login and Sign Up.
// This function toggles between them by showing/hiding forms.

function switchAuthTab(tab) {
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginTab   = document.getElementById('tab-login');
  const signupTab  = document.getElementById('tab-signup');
  
  if (!loginForm || !signupForm) return;

  clearAuthErrors();

  if (tab === 'login') {
    loginForm.style.display  = 'block';
    signupForm.style.display = 'none';
    loginTab?.classList.add('active');
    signupTab?.classList.remove('active');
  } else {
    loginForm.style.display  = 'none';
    signupForm.style.display = 'block';
    loginTab?.classList.remove('active');
    signupTab?.classList.add('active');
  }
}


// ─────────────────────────────────────────────────────────────
// 3. EMAIL/PASSWORD SIGN UP
// ─────────────────────────────────────────────────────────────

async function handleSignUp(e) {
  e.preventDefault();
  clearAuthErrors();

  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm  = document.getElementById('signup-confirm').value;

  // Client-side validation
  if (!name || !email || !password) {
    showAuthError('Please fill in all fields.');
    return;
  }

  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }

  if (password !== confirm) {
    showAuthError('Passwords do not match.');
    return;
  }

  setAuthLoading(true);

  try {
    // Create the user in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Save the display name to the user's profile
    await userCredential.user.updateProfile({ displayName: name });
    hideAuthModal();
  } catch (error) {
    // Firebase error codes are descriptive strings
    // We convert them to user-friendly messages
    showAuthError(getFirebaseErrorMessage(error.code));
  } finally {
    setAuthLoading(false);
  }
}


// ─────────────────────────────────────────────────────────────
// 4. EMAIL/PASSWORD LOGIN
// ─────────────────────────────────────────────────────────────

async function handleLogin(e) {
  e.preventDefault();
  clearAuthErrors();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAuthError('Please enter both email and password.');
    return;
  }

  setAuthLoading(true);

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    hideAuthModal();
  } catch (error) {
    showAuthError(getFirebaseErrorMessage(error.code));
  } finally {
    setAuthLoading(false);
  }
}


// ─────────────────────────────────────────────────────────────
// 5. GOOGLE SIGN-IN
// ─────────────────────────────────────────────────────────────

async function handleGoogleSignIn() {
  clearAuthErrors();
  setAuthLoading(true);

  try {
    const result = await auth.signInWithPopup(googleProvider);
    hideAuthModal();
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      showAuthError(getFirebaseErrorMessage(error.code));
    }
  } finally {
    setAuthLoading(false);
  }
}


// ─────────────────────────────────────────────────────────────
// 6. LOGOUT
// ─────────────────────────────────────────────────────────────

async function handleLogout() {
  try {
    // Clear guest mode so the welcome modal reappears after logout
    sessionStorage.removeItem('guestMode');
    await auth.signOut();
  } catch (error) {
    // Suppress error in quiet mode
  }
}


// ─────────────────────────────────────────────────────────────
// 7. AUTH STATE OBSERVER
// ─────────────────────────────────────────────────────────────
// Global listener for auth state changes to toggle UI visibility.

function initAuthStateObserver() {
  auth.onAuthStateChanged((user) => {
    const loginBtn    = document.getElementById('sidebar-login-btn');
    const profileArea = document.getElementById('sidebar-profile');
    const profileName = document.getElementById('profile-name');
    const profileEmail= document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');

    if (user) {
      // ── USER IS LOGGED IN ──
      // Hide welcome modal if it was open
      hideWelcomeModal();
      // Clear guest mode since they logged in
      sessionStorage.removeItem('guestMode');

      // Hide login button, show profile
      if (loginBtn)    loginBtn.style.display = 'none';
      if (profileArea) profileArea.style.display = 'flex';

      // Fill in user data
      if (profileName)  profileName.textContent = user.displayName || 'Citizen';
      if (profileEmail) profileEmail.textContent = user.email;
      
      // Set avatar (Google photo or initials fallback)
      if (profileAvatar) {
        if (user.photoURL) {
          profileAvatar.innerHTML = `<img src="${user.photoURL}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        } else {
          const initials = (user.displayName || user.email || '?')
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          profileAvatar.textContent = initials;
        }
      }

      // Show elements marked for logged-in users
      document.querySelectorAll('[data-auth="logged-in"]').forEach(el => el.style.display = '');
      document.querySelectorAll('[data-auth="logged-out"]').forEach(el => el.style.display = 'none');

      // ── CHECK PROFILE COMPLETENESS ──
      // After login, check if the user's profile is filled.
      // If not, show the "Complete Your Profile" popup.
      checkProfileAndPrompt(user);

    } else {
      // ── USER IS LOGGED OUT ──
      // Show login button, hide profile
      if (loginBtn)    loginBtn.style.display = '';
      if (profileArea) profileArea.style.display = 'none';

      // Hide elements meant for logged-in users
      document.querySelectorAll('[data-auth="logged-in"]').forEach(el => el.style.display = 'none');
      document.querySelectorAll('[data-auth="logged-out"]').forEach(el => el.style.display = '');

      // ── SHOW WELCOME MODAL IF NEEDED ──
      maybeShowWelcomeModal(null);
    }
  });
}


// ─────────────────────────────────────────────────────────────
// 8. FRIENDLY ERROR MESSAGES
// ─────────────────────────────────────────────────────────────

function getFirebaseErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use':    'This email is already registered. Try logging in instead.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/user-disabled':           'This account has been disabled. Contact support.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/weak-password':           'Password is too weak. Use at least 6 characters.',
    'auth/popup-closed-by-user':    'Sign-in popup was closed. Please try again.',
    'auth/network-request-failed':  'Network error. Check your internet connection.',
    'auth/too-many-requests':       'Too many failed attempts. Please wait and try again.',
    'auth/invalid-credential':      'Invalid email or password. Please check and try again.',
  };
  return messages[code] || `Authentication error: ${code}`;
}


// ─────────────────────────────────────────────────────────────
// 9. INITIALIZE
// ─────────────────────────────────────────────────────────────

function initAuth() {
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm)  loginForm.addEventListener('submit', handleLogin);
  if (signupForm) signupForm.addEventListener('submit', handleSignUp);

  // Tab switchers
  document.getElementById('tab-login')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));

  // Google sign-in buttons (there are two — one in each tab)
  document.querySelectorAll('.google-btn').forEach(btn => {
    btn.addEventListener('click', handleGoogleSignIn);
  });

  // Modal close button
  document.getElementById('auth-modal-close')?.addEventListener('click', hideAuthModal);

  // Close modal when clicking overlay background
  document.getElementById('auth-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'auth-modal') hideAuthModal();
  });

  // Logout button in sidebar
  document.getElementById('sidebar-logout-btn')?.addEventListener('click', handleLogout);

  // Login button in sidebar
  document.getElementById('sidebar-login-btn')?.addEventListener('click', showAuthModal);

  // ── WELCOME MODAL BUTTONS ──
  document.getElementById('welcome-login-btn')?.addEventListener('click', () => {
    hideWelcomeModal();
    showAuthModal();
    switchAuthTab('login');
  });

  document.getElementById('welcome-signup-btn')?.addEventListener('click', () => {
    hideWelcomeModal();
    showAuthModal();
    switchAuthTab('signup');
  });

  document.getElementById('welcome-guest-btn')?.addEventListener('click', () => {
    sessionStorage.setItem('guestMode', 'true');
    hideWelcomeModal();
  });

  // ── PROFILE COMPLETION MODAL BUTTONS ──
  document.getElementById('profile-quick-form')?.addEventListener('submit', handleQuickProfileSave);
  document.getElementById('profile-modal-skip')?.addEventListener('click', hideProfileModal);

  // Start listening for auth state changes
  initAuthStateObserver();
}

// Don't call initAuth() here — it's called from global.js
// after the sidebar and modal are injected into the DOM.
