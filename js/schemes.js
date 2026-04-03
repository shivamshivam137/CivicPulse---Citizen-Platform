// ── SCHEMES DATA DICTIONARY ────────────────────────────────
const SCHEME_DATA = {
  "https://pmkisan.gov.in/": {
    "title": "PM-KISAN",
    "background": "linear-gradient(135deg, #10b981, #06b6d4)",
    "icon": "🌾",
    "badgeValue": "Agriculture",
    "badgeClass": "badge-success",
    "ministry": "Ministry of Agriculture",
    "summary": [
      "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector Scheme designed to provide income support to all landholding farmer families in the country to supplement their financial needs for procuring various inputs related to agriculture and allied activities as well as domestic needs.",
      "Under the Scheme, an income support of ₹6,000/- per year in three equal installments will be provided to all landholding farmer families."
    ],
    "benefits": [
      "Direct benefit transfer of ₹6000 per year.",
      "Money is credited directly into the bank accounts of the beneficiaries.",
      "Prevents farmers from falling into the clutches of moneylenders for meeting expenses.",
      "Open to small and marginal farming families holding cultivated land."
    ]
  },
  "https://pmjay.gov.in/": {
    "title": "Ayushman Bharat (PM-JAY)",
    "background": "linear-gradient(135deg, #ef4444, #f59e0b)",
    "icon": "🏥",
    "badgeValue": "Health",
    "badgeClass": "badge-danger",
    "ministry": "Ministry of Health",
    "summary": [
      "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY) is the largest health assurance scheme in the world aiming to provide a health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.",
      "It provides cashless access to health care services for the beneficiary at the point of service, meaning households do not need to pay out-of-pocket for vital medical treatments."
    ],
    "benefits": [
      "No cap on family size, age, or gender.",
      "Pre-existing conditions are covered from day one.",
      "Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization expenses like diagnostics and medicines.",
      "Benefits of the scheme are portable across the country."
    ]
  },
  "https://nrega.nic.in/": {
    "title": "MNREGA",
    "background": "linear-gradient(135deg, #f59e0b, #ef4444)",
    "icon": "💼",
    "badgeValue": "Employment",
    "badgeClass": "badge-warning",
    "ministry": "Ministry of Rural Development",
    "summary": [
      "Mahatma Gandhi National Rural Employment Guarantee Act (MNREGA) guarantees the 'right to work' by providing at least 100 days of guaranteed wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.",
      "It aims at enhancing the livelihood security of people in rural areas by generating wage employment through works that develop the infrastructure base of that area."
    ],
    "benefits": [
      "Legal guarantee of 100 days wage employment.",
      "Work is generally provided within 5 km radius of the village.",
      "If work is not provided within 15 days of applying, applicants are entitled to an unemployment allowance.",
      "At least one-third of beneficiaries must be women."
    ]
  },
  "https://pmaymis.gov.in/": {
    "title": "PM Awas Yojana",
    "background": "var(--gradient-primary)",
    "icon": "🏠",
    "badgeValue": "Housing",
    "badgeClass": "badge-primary",
    "ministry": "Ministry of Housing",
    "summary": [
      "Pradhan Mantri Awas Yojana (PMAY) is a flagship mission by the Government of India being implemented to provide 'Housing for All'. The scheme addresses the housing shortage among the Economically Weaker Section (EWS) and Lower Income Groups (LIG).",
      "Beneficiaries receive financial assistance and interest subsidies to construct, purchase, or renovate their homes."
    ],
    "benefits": [
      "Credit Linked Subsidy applied upfront on the housing loan principal.",
      "Preference given to female head of families, widows, and persons with disabilities.",
      "Maximum subsidy amount can reach up to ₹2.67 lakhs.",
      "Subsidized interest rate of 6.5% for up to 20 years."
    ]
  },
  "https://wcd.nic.in/bbbp-schemes": {
    "title": "Beti Bachao Beti Padhao",
    "background": "linear-gradient(135deg, #ec4899, #8b5cf6)",
    "icon": "👩",
    "badgeValue": "Women",
    "badgeClass": "badge-primary",
    "ministry": "Min. of Women & Child Dev.",
    "summary": [
      "Beti Bachao Beti Padhao (BBBP) is a joint initiative aiming to address the declining Child Sex Ratio (CSR) and related issues of women empowerment over a life-cycle continuum.",
      "It actively focuses on preventing gender-biased sex selective elimination, ensuring the survival and protection of the girl child, and ensuring her education and participation."
    ],
    "benefits": [
      "Mass communication campaigns to change societal mindsets.",
      "Promotes the right to inherit property by girls.",
      "Incentivizes schools adopting policies for the girl child.",
      "Prevents gender discrimination and female foeticide."
    ]
  },
  "https://scholarships.gov.in/": {
    "title": "National Scholarship Portal",
    "background": "linear-gradient(135deg, #06b6d4, #4f46e5)",
    "icon": "🎓",
    "badgeValue": "Education",
    "badgeClass": "badge-primary",
    "ministry": "Ministry of Education",
    "summary": [
      "The National Scholarship Portal (NSP) is a one-stop digital platform hosting multiple scholarship schemes offered by Central Government, State Governments, and University Grants Commission (UGC).",
      "It provides a simplified, transparent, and direct disbursement process ensuring that the scholarship funds reach the students without any leakage."
    ],
    "benefits": [
      "Single integrated application for all student scholarships.",
      "Automated and fast tracking of application statuses.",
      "Direct Benefit Transfer (DBT) directly into the student's bank account.",
      "Reduces duplicate applications and processing delays."
    ]
  },
  "https://www.pmuy.gov.in/": {
    "title": "PM Ujjwala Yojana",
    "background": "linear-gradient(135deg, #f59e0b, #10b981)",
    "icon": "🔥",
    "badgeValue": "Women",
    "badgeClass": "badge-warning",
    "ministry": "Ministry of Petroleum",
    "summary": [
      "Pradhan Mantri Ujjwala Yojana (PMUY) aims to safeguard the health of women & children by providing them with a clean cooking fuel (LPG) inside their homes, replacing highly polluting traditional fuels like wood and cow-dung.",
      "The scheme empowers women by issuing the LPG connection strictly in the name of the household's female head."
    ],
    "benefits": [
      "Provides financial support of ₹1600 for each new LPG connection.",
      "Prevents respiratory illnesses caused by indoor smoke pollution.",
      "Free first refill and stove provided to beneficiaries.",
      "Targeted at adult women belonging to BPL households."
    ]
  },
  "https://www.digitalindia.gov.in/": {
    "title": "Digital India",
    "background": "linear-gradient(135deg, #8b5cf6, #4f46e5)",
    "icon": "💻",
    "badgeValue": "Employment",
    "badgeClass": "badge-warning",
    "ministry": "Ministry of Electronics & IT",
    "summary": [
      "Digital India is a flagship program of the Government of India with a vision to transform India into a digitally empowered society and knowledge economy.",
      "It focuses on providing high-speed internet networks to rural areas, delivering government services digitally, and promoting digital literacy."
    ],
    "benefits": [
      "Aims to connect 2.5 lakh gram panchayats with broadband.",
      "Creates digital infrastructure as a core utility to every citizen.",
      "Provides digital lockers to store certificates electronically.",
      "Enhances e-governance, making government services available in real-time."
    ]
  }
};

// ── Schemes Page Logic ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const tabs  = document.querySelectorAll('.scheme-tab');
  const cards = document.querySelectorAll('.scheme-card');
  const searchInput = document.getElementById('scheme-search');

  // 1. Filtering Logic
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeInUp 0.4s ease-out both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 2. Search Logic
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  // 3. Modal Logic
  const modal = document.getElementById('scheme-modal');
  const closeBtn = document.getElementById('scheme-modal-close');

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault(); // Stop instant redirect
      const url = card.getAttribute('href');
      const data = SCHEME_DATA[url];

      if (data) {
        // Populate Modal
        document.getElementById('modal-icon').textContent = data.icon;
        document.getElementById('modal-icon').style.background = data.background;
        
        const badge = document.getElementById('modal-badge');
        badge.textContent = data.badgeValue;
        badge.className = `badge ${data.badgeClass || ''}`;
        
        document.getElementById('modal-title').textContent = data.title;
        document.getElementById('modal-ministry').textContent = data.ministry;
        
        const summaryHtml = data.summary.map(p => `<p>${p}</p>`).join('');
        document.getElementById('modal-summary').innerHTML = summaryHtml;
        
        const bulletsHtml = data.benefits.map(b => `<li>${b}</li>`).join('');
        document.getElementById('modal-bullets').innerHTML = bulletsHtml;

        document.getElementById('modal-apply-btn').href = url;

        // Show Modal
        modal.classList.add('active');
      } else {
        // Fallback if no data mapped
        window.open(url, '_blank');
      }
    });
  });

  // Close Modal Events
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
});
