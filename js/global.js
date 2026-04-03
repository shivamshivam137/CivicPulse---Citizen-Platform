/**
 * GLOBAL.JS — Common UI, Navigation, and Theming
 * Handled dynamically across all pages: sidebar injection, active tabs, theme toggling.
 */

const navSections = [
  {
    label: 'Main Menu',
    items: [
      {
        label: 'Home',
        href: 'index.html',
        icon: '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/>'
      },
      {
        label: 'Complaints',
        href: 'complaints.html',
        icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
      },
      {
        label: 'Candidates',
        href: 'candidates.html',
        icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
      },
      {
        label: 'Fund Dashboard',
        href: 'fund-dashboard.html',
        icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="6 10 10 7 14 12 18 8"/>'
      },
      {
        label: 'Chatbot',
        href: 'chatbot.html',
        icon: '<path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20h6v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1.5 2 3 2 3-2 3-2"/><line x1="9" y1="22" x2="9" y2="24"/><line x1="15" y1="22" x2="15" y2="24"/>'
      },
      {
        label: 'Admin Panel',
        href: 'admin.html',
        icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        restrictTo: ['admin']
      },
      {
        label: 'Authority Dashboard',
        href: 'authority.html',
        icon: '<path d="M2 22h20"/><path d="M12 2v20"/><path d="M6 6h12"/><path d="M6 10h12"/><path d="M6 14h12"/><path d="M6 18h12"/>',
        restrictTo: ['mayor', 'councilor']
      }
    ]
  },
  {
    label: 'Explore',
    items: [
      {
        label: 'About',
        href: 'about.html',
        icon: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
      },
      {
        label: 'Learning',
        href: 'learning.html',
        icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'
      },
      {
        label: 'Schemes',
        href: 'schemes.html',
        icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
      },
      {
        label: 'Participation',
        href: 'participation.html',
        icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>'
      }
    ]
  }
];


// ─────────────────────────────────────────────────────────────
// 2. BUILD & INJECT THE SIDEBAR HTML
// ─────────────────────────────────────────────────────────────
// This function runs on every page load. It builds the sidebar
// HTML string from the navItems array and injects it into the
// <div id="sidebar-root"> that exists in every HTML page.
//
// ESSENTIAL-TO-KNOW:
// - `window.location.pathname` gives us the current page path
//   (e.g., "/complaints.html"). We compare this against each
//   nav item's href to decide which link gets the "active" class.
// - We use `.split('/').pop()` to extract just the filename,
//   which makes it work regardless of deployment subdirectory.

function buildSidebar() {
  const root = document.getElementById('sidebar-root');
  if (!root) return;

  // Determine which page we are on
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Build the nav links HTML from grouped sections
  const navLinksHTML = navSections.map(section => {
    const linksHTML = section.items.map(item => {
      const isActive = currentPage === item.href ? 'active' : '';
      const isRestricted = item.restrictTo ? `restricted-nav-item` : '';
      const restrictAttr = item.restrictTo ? `data-restrict-to="${item.restrictTo.join(',')}" style="display: none;"` : '';
      
      const i18nKey = 'nav_' + item.href.split('.')[0].replace('-', '_');

      return `
        <a href="${item.href}" class="${isActive} ${isRestricted}" ${restrictAttr}>
          <svg viewBox="0 0 24 24">${item.icon}</svg>
          <span data-i18n="${i18nKey}">${item.label}</span>
        </a>
      `;
    }).join('');
    return `
      <div class="nav-section-label">${section.label}</div>
      ${linksHTML}
    `;
  }).join('');

  // Full sidebar HTML
  const sidebarHTML = `
    <!-- Mobile Header (hidden on desktop via CSS) -->
    <header class="mobile-header">
      <button class="hamburger" id="hamburger-btn" aria-label="Open menu">
        <svg viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <span class="logo">CivicPulse</span>
      <div style="width:40px"></div>
    </header>

    <!-- Overlay (mobile: dims background when sidebar is open) -->
    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="brand-text">
          <h2 data-i18n="app_title">CivicPulse</h2>
          <span data-i18n="app_subtitle">Citizen Platform</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${navLinksHTML}
      </nav>

      <!-- Login Button (shown when logged out) -->
      <button class="sidebar-login-btn" id="sidebar-login-btn">
        <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        <span data-i18n="btn_login">Login / Sign Up</span>
      </button>

      <!-- User Profile (shown when logged in) -->
      <div class="sidebar-profile" id="sidebar-profile">
        <div class="profile-avatar" id="profile-avatar"></div>
        <div class="profile-info">
          <div class="profile-name" id="profile-name">Citizen</div>
          <div class="profile-email" id="profile-email">email@example.com</div>
        </div>
        <button class="sidebar-logout-btn" id="sidebar-logout-btn" title="Logout">
          <span class="sr-only" data-i18n="btn_logout">Logout</span>
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>

      <div class="sidebar-footer">
        <button class="theme-toggle" id="theme-toggle-btn">
          <span class="toggle-label">
            <svg viewBox="0 0 24 24" id="theme-icon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <span id="theme-label" data-i18n="dark_mode">Dark Mode</span>
          </span>
          <div class="toggle-switch"></div>
        </button>

        <select id="lang-selector" class="lang-selector" style="margin-top: 12px; width: 100%; padding: 8px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--color-border); color: var(--color-text); outline: none; cursor: pointer;">
          <option value="en">A|अ English</option>
          <option value="hi">A|अ हिंदी</option>
          <option value="mr">A|अ मराठी</option>
        </select>
      </div>
    </aside>

    <!-- ── AUTH MODAL ──────────────────────────────────────── -->
    <div class="auth-modal-overlay" id="auth-modal">
      <div class="auth-modal-card">
        <button class="auth-modal-close" id="auth-modal-close">✕</button>
        
        <div class="auth-header">
          <div class="auth-logo">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 data-i18n="auth_welcome">Welcome to CivicPulse</h2>
          <p data-i18n="auth_subtitle">Your voice matters. Sign in to make it count.</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab active" id="tab-login" data-i18n="auth_tab_login">Login</button>
          <button class="auth-tab" id="tab-signup" data-i18n="auth_tab_signup">Sign Up</button>
        </div>

        <div class="auth-body">
          <div class="auth-error" id="auth-error"></div>

          <!-- LOGIN FORM -->
          <form id="login-form">
            <div class="auth-field">
              <label for="login-email" data-i18n="auth_label_email">Email Address</label>
              <input type="email" id="login-email" placeholder="you@example.com" required>
            </div>
            <div class="auth-field">
              <label for="login-password" data-i18n="auth_label_pass">Password</label>
              <input type="password" id="login-password" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="auth-submit-btn" data-i18n="auth_btn_login">Login</button>
          </form>

          <!-- SIGNUP FORM (hidden by default) -->
          <form id="signup-form" style="display:none;">
            <div class="auth-field">
              <label for="signup-name" data-i18n="auth_label_name">Full Name</label>
              <input type="text" id="signup-name" placeholder="Your full name" required>
            </div>
            <div class="auth-field">
              <label for="signup-email" data-i18n="auth_label_email">Email Address</label>
              <input type="email" id="signup-email" placeholder="you@example.com" required>
            </div>
            <div class="auth-field">
              <label for="signup-password" data-i18n="auth_label_pass">Password</label>
              <input type="password" id="signup-password" placeholder="Min 6 characters" required>
            </div>
            <div class="auth-field">
              <label for="signup-confirm" data-i18n="auth_label_confirm">Confirm Password</label>
              <input type="password" id="signup-confirm" placeholder="Re-enter password" required>
            </div>
            <button type="submit" class="auth-submit-btn" data-i18n="auth_btn_signup">Create Account</button>
          </form>

          <div class="auth-divider" data-i18n="auth_divider">or continue with</div>

          <button type="button" class="google-btn">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span data-i18n="auth_btn_google">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  `;

  root.innerHTML = sidebarHTML;

  // After injecting, wire up the interactive behavior
  initThemeToggle();
  initMobileMenu();
  initSidebarLinks();
  checkSidebarRoles();

  const sidebarSelector = document.getElementById('lang-selector');
  if (sidebarSelector && typeof getCurrentLang === 'function') {
    sidebarSelector.value = getCurrentLang();
  }

  // FIX: Force translation scan immediately after sidebar HTML is created!
  if (typeof applyTranslations === 'function') applyTranslations();

  // Initialize auth UI (if auth.js is loaded)
  if (typeof initAuth === 'function') {
    initAuth();
  }
}

// ─────────────────────────────────────────────────────────────
// 2A. CHECK ROLES FOR RESTRICTED LINKS
// ─────────────────────────────────────────────────────────────
function checkSidebarRoles() {
  if (typeof firebase === 'undefined') return;
  
  firebase.auth().onAuthStateChanged(async (user) => {
    const restrictedItems = document.querySelectorAll('.restricted-nav-item');
    
    if (!user) {
      restrictedItems.forEach(item => { item.style.display = 'none'; });
      return;
    }
    
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        const role = doc.data().role;
        restrictedItems.forEach(item => {
          const allowedRoles = item.getAttribute('data-restrict-to').split(',');
          if (allowedRoles.includes(role)) {
            item.style.display = 'flex'; // Un-hide
          } else {
            item.style.display = 'none';
          }
        });
      }
    } catch (e) {
      console.error('Role check failed', e);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// 2B. INITIALIZE SIDEBAR SPECIAL LINKS
// ─────────────────────────────────────────────────────────────
function initSidebarLinks() {
  const profileDiv = document.getElementById('sidebar-profile');
  if (profileDiv) {
    profileDiv.style.cursor = 'pointer';
    profileDiv.addEventListener('click', (e) => {
      // Don't redirect if they clicked the logout button
      if (e.target.closest('#sidebar-logout-btn')) return;
      window.location.href = 'profile.html';
    });
  }
}


// ─────────────────────────────────────────────────────────────
// 3. DARK / LIGHT THEME TOGGLE
// ─────────────────────────────────────────────────────────────
// 
// HOW THE THEME SYSTEM WORKS:
// ---------------------------
// 1. On page load, we check localStorage for a saved preference.
//    If the user previously chose "dark", we set `data-theme="dark"`
//    on the <body> element IMMEDIATELY (before the page renders).
// 
// 2. ALL CSS variables respond to this attribute:
//    [data-theme="dark"] { --color-bg: #0b1120; ... }
//    This means EVERY element using var(--color-bg) instantly
//    switches to the dark color. No JavaScript loops needed!
// 
// 3. When the user clicks the toggle, we flip the attribute,
//    update the icon, and save to localStorage so it persists
//    across page reloads and navigations to other pages.
//
// ESSENTIAL-TO-KNOW:
// - localStorage.getItem('theme') is checked on EVERY page load
//   (not just once). This is what keeps the theme consistent
//   as the user navigates between pages.

function initThemeToggle() {
  const btn    = document.getElementById('theme-toggle-btn');
  const icon   = document.getElementById('theme-icon');
  const label  = document.getElementById('theme-label');
  if (!btn) return;

  // Update the button's icon & label to match current theme
  function updateToggleUI() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    // Set translation tag and text
    label.setAttribute('data-i18n', isDark ? 'light_mode' : 'dark_mode');
    label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    if (typeof applyTranslations === 'function') applyTranslations();

    icon.innerHTML = isDark
      ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
      : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }

  btn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateToggleUI();
  });

  updateToggleUI();
}


// ─────────────────────────────────────────────────────────────
// 4. MOBILE MENU (Hamburger)
// ─────────────────────────────────────────────────────────────
// On screens < 768px:
// - The CSS hides the sidebar (transform: translateX(-100%))
// - Clicking the hamburger adds .open class → sidebar slides in
// - Clicking the overlay OR any nav link closes the sidebar
//
// ESSENTIAL-TO-KNOW:
// - We also close the sidebar after a nav click so the user
//   immediately sees the new page without manually closing.

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');
  if (!hamburger || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Close sidebar when any nav link is clicked (mobile)
  sidebar.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
  
  // Feature: Clickable Brand Logo toggles mobile sidebar and goes home
  const brand = document.querySelector('.sidebar-brand');
  if (brand) {
    brand.style.cursor = 'pointer';
    brand.addEventListener('click', () => {
      closeSidebar();
      window.location.href = 'index.html';
    });
  }
}


// ─────────────────────────────────────────────────────────────
// 5. APPLY SAVED THEME IMMEDIATELY (before DOM renders)
// ─────────────────────────────────────────────────────────────
// This runs BEFORE the sidebar is even built. It applies the
// saved theme preference to <body> so there's no flash of the
// wrong theme colors when the page first loads.

(function applyStoredTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
})();


// ─────────────────────────────────────────────────────────────
// 6. INITIALIZE WHEN DOM IS READY
// ─────────────────────────────────────────────────────────────
// DOMContentLoaded fires after the HTML is fully parsed but
// before images/fonts finish loading. This is the ideal time
// to inject the sidebar because the <div id="sidebar-root">
// element is guaranteed to exist.

document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
});
