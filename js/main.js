/**
 * Data Science Lab - Mohan Babu University (MBU)
 * Main Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive modules
  initNavigation();
  initSearch();
  initAddExperiment();
  initSectionReveals();
});

/**
 * 1. HEADER NAVIGATION & MOBILE MENU
 * Handles:
 * - Hamburger menu toggle and aria state
 * - Smooth scrolling to sections with sticky header offset
 * - Active nav link indicator on scroll for all 5 sections
 * - Sticky header scroll elevation
 * - Keyboard / click-outside dismissal
 */
function initNavigation() {
  const toggleBtn = document.getElementById('navToggleBtn');
  const siteNav = document.getElementById('siteNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.getElementById('mainHeader');

  if (!toggleBtn || !siteNav) return;

  function closeMenu() {
    toggleBtn.classList.remove('is-active');
    siteNav.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    toggleBtn.classList.add('is-active');
    siteNav.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = siteNav.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!siteNav.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
      closeMenu();
      toggleBtn.focus();
    }
  });

  // Smooth scroll and mobile menu close on click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          closeMenu();

          const headerOffset = header ? header.offsetHeight + 16 : 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: targetId === '#heroSection' ? 0 : offsetPosition,
            behavior: 'smooth'
          });

          // Update active link immediately
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });

  // Active section tracking on scroll across all 5 sections
  const navSectionIds = [
    'heroSection',
    'modulesSection',
    'experimentsSection',
    'toolsSection',
    'resourcesSection'
  ];

  function updateActiveLinkOnScroll() {
    // 1. Sticky header shadow / border elevation
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    // 2. Active nav link calculation
    const headerOffset = header ? header.offsetHeight + 50 : 120;
    const scrollPos = window.scrollY + headerOffset;

    // If at very top, highlight Home
    if (window.scrollY < 120) {
      navLinks.forEach(l => l.classList.remove('active'));
      const homeLink = document.querySelector('.nav-link[href="#heroSection"]');
      if (homeLink) homeLink.classList.add('active');
      return;
    }

    // If reached bottom of page, highlight Resources
    if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
      navLinks.forEach(l => l.classList.remove('active'));
      const resLink = document.querySelector('.nav-link[href="#resourcesSection"]');
      if (resLink) resLink.classList.add('active');
      return;
    }

    for (let i = navSectionIds.length - 1; i >= 0; i--) {
      const id = navSectionIds[i];
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) {
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
        break;
      }
    }
  }

  window.addEventListener('scroll', updateActiveLinkOnScroll, { passive: true });
  updateActiveLinkOnScroll();
}

/**
 * SECTION REVEAL ANIMATIONS
 * Subtle entrance animation when sections enter viewport
 */
function initSectionReveals() {
  const revealElements = document.querySelectorAll('.js-reveal');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }
}

/**
 * 4. GLOBAL SEARCH FUNCTIONALITY
 * Global search across all 5 Modules and 10 Experiments:
 * - Real-time autocomplete suggestions dropdown
 * - Case-insensitive matching, supports extra spaces and alias phrasing
 * - Direct navigation on click or Enter key
 * - Inline feedback message: "No module or experiment found."
 */
function initSearch() {
  const searchInput = document.getElementById('experimentSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const countIndicator = document.getElementById('searchCountIndicator');
  const searchContainer = document.querySelector('.search-container');
  const searchInputWrapper = document.querySelector('.search-input-wrapper');
  const dropdown = document.getElementById('searchSuggestionsDropdown');
  const feedbackMsg = document.getElementById('searchFeedbackMsg');

  if (!searchInput) return;

  const SEARCH_ITEMS = [
    // 5 Modules
    {
      type: 'module',
      number: 1,
      label: 'MODULE 1',
      title: 'Introduction',
      url: 'module1.html',
      keywords: ['introduction', 'intro', 'module 1', '1 module', 'module1', 'mod 1', 'mod1', 'm1']
    },
    {
      type: 'module',
      number: 2,
      label: 'MODULE 2',
      title: 'Data Extraction',
      url: 'module2.html',
      keywords: ['data extraction', 'extraction', 'module 2', '2 module', 'module2', 'mod 2', 'mod2', 'm2']
    },
    {
      type: 'module',
      number: 3,
      label: 'MODULE 3',
      title: 'Data Visualization',
      url: 'module3.html',
      keywords: ['data visualization', 'matplotlib', 'seaborn', 'pandas plotting', 'plots', 'charts', 'scatter', 'histogram', 'density', 'kde', 'facet grid', 'module 3', '3 module', 'module3', 'mod 3', 'mod3', 'm3']
    },
    {
      type: 'module',
      number: 4,
      label: 'MODULE 4',
      title: 'Statistical Thinking',
      url: 'module4.html',
      keywords: ['statistical thinking', 'distributions', 'probability', 'pmf', 'cdf', 'variance', 'outliers', 'iqr', 'class size paradox', 'percentiles', 'normal distribution', 'lognormal', 'exponential', 'module 4', '4 module', 'module4', 'mod 4', 'mod4', 'm4']
    },
    {
      type: 'module',
      number: 5,
      label: 'MODULE 5',
      title: 'Time Series Analysis & Predictive Modeling',
      url: 'module5.html',
      keywords: ['time series', 'predictive modeling', 'forecasting', 'moving average', 'autocorrelation', 'acf', 'sentiment analysis', 'model evaluation', 'data leakage', 'module 5', '5 module', 'module5', 'mod 5', 'mod5', 'm5']
    },

    // 10 Experiments
    {
      type: 'experiment',
      number: 1,
      label: 'EXPERIMENT 1',
      title: 'Reading and Writing CSV, JSON, and Excel Data using Pandas',
      url: 'experiment1.html',
      keywords: ['csv', 'json', 'excel', 'pandas', 'read_csv', 'to_csv', 'read_json', 'to_json', 'read_excel', 'to_excel', 'dataframe', 'file io', 'openpyxl', 'experiment 1', '1 experiment', 'experiment1', 'exp 1', 'exp1', 'e1']
    },
    {
      type: 'experiment',
      number: 2,
      label: 'EXPERIMENT 2',
      title: 'Interacting with Web APIs and Databases',
      url: 'experiment2.html',
      keywords: ['web api', 'api', 'database', 'sqlite', 'sqlite3', 'github', 'requests', 'read_sql_query', 'sql', 'pandas', 'experiment 2', '2 experiment', 'experiment2', 'exp 2', 'exp2', 'e2']
    },
    {
      type: 'experiment',
      number: 3,
      label: 'EXPERIMENT 3',
      title: 'Data Cleaning and Preparation',
      url: 'experiment3.html',
      keywords: ['data cleaning', 'preparation', 'missing data', 'dropna', 'fillna', 'isna', 'data transformation', 'map', 'rename', 'outlier detection', 'regex', 're.split', 'experiment 3', '3 experiment', 'experiment3', 'exp 3', 'exp3', 'e3']
    },
    {
      type: 'experiment',
      number: 4,
      label: 'EXPERIMENT 4',
      title: 'Data Visualization with Matplotlib & Seaborn',
      url: 'experiment4.html',
      keywords: ['data visualization', 'visualization', 'matplotlib', 'seaborn', 'plots', 'plotting', 'experiment 4', '4 experiment', 'experiment4', 'exp 4', 'exp4', 'e4']
    },
    {
      type: 'experiment',
      number: 5,
      label: 'EXPERIMENT 5',
      title: 'Hypothesis Testing & Statistical Inference',
      url: 'experiment5.html',
      keywords: ['hypothesis testing', 'hypothesis', 'statistical inference', 'statistics', 'stats', 'experiment 5', '5 experiment', 'experiment5', 'exp 5', 'exp5', 'e5']
    },
    {
      type: 'experiment',
      number: 6,
      label: 'EXPERIMENT 6',
      title: 'Linear Regression Analysis',
      url: 'experiment6.html',
      keywords: ['linear regression', 'regression', 'linear regression analysis', 'experiment 6', '6 experiment', 'experiment6', 'exp 6', 'exp6', 'e6']
    },
    {
      type: 'experiment',
      number: 7,
      label: 'EXPERIMENT 7',
      title: 'Data Aggregation',
      url: 'experiment7.html',
      keywords: ['data aggregation', 'aggregation', 'groupby', 'aggregate', 'agg', 'iris', 'summary statistics', 'experiment 7', '7 experiment', 'experiment7', 'exp 7', 'exp7', 'e7']
    },
    {
      type: 'experiment',
      number: 8,
      label: 'EXPERIMENT 8',
      title: 'Clustering Techniques (K-Means)',
      url: 'experiment8.html',
      keywords: ['clustering techniques', 'clustering', 'k-means', 'kmeans', 'cluster', 'experiment 8', '8 experiment', 'experiment8', 'exp 8', 'exp8', 'e8']
    },
    {
      type: 'experiment',
      number: 9,
      label: 'EXPERIMENT 9',
      title: 'Correlation & Covariance Analysis',
      url: 'experiment9.html',
      keywords: ['correlation', 'covariance', 'pearson', 'correlation analysis', 'experiment 9', '9 experiment', 'experiment9', 'exp 9', 'exp9', 'e9']
    },
    {
      type: 'experiment',
      number: 10,
      label: 'EXPERIMENT 10',
      title: 'Model Evaluation & Performance Metrics',
      url: 'experiment10.html',
      keywords: ['model evaluation', 'evaluation', 'performance metrics', 'metrics', 'pipeline', 'predict', 'experiment 10', '10 experiment', 'experiment10', 'exp 10', 'exp10', 'e10']
    },
    // About Me / Developer Profile
    {
      type: 'profile',
      number: 0,
      label: 'ABOUT ME',
      title: 'Mounika Pasam • Education, Skills & Career Goals',
      url: 'about.html',
      keywords: ['about', 'about me', 'mounika', 'mounika pasam', 'profile', 'developer', 'skills', 'education', 'interests', 'career', 'portfolio', 'student', 'author']
    }
  ];

  let currentSuggestions = [];
  let selectedIndex = -1;

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function getMatchingItems(rawQuery) {
    if (!rawQuery) return [];
    const q = rawQuery.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!q) return [];

    // Pure category query: "module", "modules", "mod" -> All modules
    if (q === 'module' || q === 'modules' || q === 'mod') {
      return SEARCH_ITEMS.filter(item => item.type === 'module');
    }

    // Pure category query: "experiment", "experiments", "exp" -> All experiments
    if (q === 'experiment' || q === 'experiments' || q === 'exp') {
      return SEARCH_ITEMS.filter(item => item.type === 'experiment');
    }

    // Pattern: "module X" or "X module" or "mod X" or "mX"
    const modPattern = /^(?:module|mod|m)\s*(10|[1-9])$/i;
    const modReverse = /^(10|[1-9])\s*(?:module|mod|m)$/i;
    const mMatch = q.match(modPattern) || q.match(modReverse);
    if (mMatch) {
      const num = parseInt(mMatch[1], 10);
      return SEARCH_ITEMS.filter(item => item.type === 'module' && item.number === num);
    }

    // Pattern: "experiment X" or "X experiment" or "exp X" or "eX"
    const expPattern = /^(?:experiment|exp|e)\s*(10|[1-9])$/i;
    const expReverse = /^(10|[1-9])\s*(?:experiment|exp|e)$/i;
    const eMatch = q.match(expPattern) || q.match(expReverse);
    if (eMatch) {
      const num = parseInt(eMatch[1], 10);
      return SEARCH_ITEMS.filter(item => item.type === 'experiment' && item.number === num);
    }

    // Token-based check for category + number
    const hasModuleWord = /\b(?:module|mod)\b/i.test(q);
    const hasExpWord = /\b(?:experiment|exp)\b/i.test(q);
    const numTokenMatch = q.match(/\b(10|[1-9])\b/);
    const tokenNum = numTokenMatch ? parseInt(numTokenMatch[1], 10) : null;

    if (hasModuleWord && tokenNum !== null) {
      return SEARCH_ITEMS.filter(item => item.type === 'module' && item.number === tokenNum);
    }

    if (hasExpWord && tokenNum !== null) {
      return SEARCH_ITEMS.filter(item => item.type === 'experiment' && item.number === tokenNum);
    }

    // Standalone number query (e.g., "1", "6", "10")
    if (/^(10|[1-9])$/.test(q)) {
      const num = parseInt(q, 10);
      return SEARCH_ITEMS.filter(item => item.number === num);
    }

    // Keyword, title, topic or prefix match
    return SEARCH_ITEMS.filter(item => {
      const labelLower = item.label.toLowerCase();
      const titleLower = item.title.toLowerCase();

      if (labelLower === q || labelLower.startsWith(q)) return true;
      if (titleLower === q || titleLower.includes(q)) return true;

      const keywordMatched = item.keywords.some(k => k === q || k.includes(q) || q.includes(k));
      if (keywordMatched) {
        if (tokenNum !== null) return item.number === tokenNum;
        return true;
      }

      return false;
    });
  }

  function hideSuggestions() {
    if (dropdown) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
    }
    currentSuggestions = [];
    selectedIndex = -1;
  }

  function showInvalidMessage() {
    hideSuggestions();
    if (feedbackMsg) {
      feedbackMsg.textContent = 'No module or experiment found.';
      feedbackMsg.style.display = 'block';
    }
    if (countIndicator) {
      countIndicator.style.display = 'none';
    }
    if (searchInputWrapper) {
      searchInputWrapper.classList.remove('search-shake');
      void searchInputWrapper.offsetWidth; // trigger reflow
      searchInputWrapper.classList.add('search-shake');
    }
  }

  function hideInvalidMessage() {
    if (feedbackMsg) {
      feedbackMsg.style.display = 'none';
    }
    if (countIndicator) {
      countIndicator.style.display = 'block';
    }
  }

  function navigateTo(url) {
    if (!url) return;
    window.location.href = url;
  }

  function updateActiveSuggestion() {
    if (!dropdown) return;
    const items = dropdown.querySelectorAll('.search-suggestion-item');
    items.forEach((itemEl, idx) => {
      if (idx === selectedIndex) {
        itemEl.classList.add('is-selected');
        itemEl.scrollIntoView({ block: 'nearest' });
      } else {
        itemEl.classList.remove('is-selected');
      }
    });
  }

  function renderSuggestions(items) {
    currentSuggestions = items;
    selectedIndex = -1;

    if (!dropdown) return;
    dropdown.innerHTML = '';

    items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'search-suggestion-item';
      row.setAttribute('role', 'option');
      row.setAttribute('tabindex', '-1');
      row.setAttribute('data-index', idx);

      const isMod = item.type === 'module';
      const isProfile = item.type === 'profile';
      const pillClass = isMod ? 'pill-module' : (isProfile ? 'pill-profile' : 'pill-experiment');
      const pillLabel = isMod ? 'MODULE' : (isProfile ? 'ABOUT' : 'EXPERIMENT');

      row.innerHTML = `
        <div class="suggestion-left">
          <span class="suggestion-pill ${pillClass}">${pillLabel}</span>
          <span class="suggestion-text">${item.label}</span>
          ${item.title ? `<span class="suggestion-desc">— ${escapeHtml(item.title)}</span>` : ''}
        </div>
        <div class="suggestion-right">
          <svg class="suggestion-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      `;

      row.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateTo(item.url);
      });

      row.addEventListener('mouseenter', () => {
        selectedIndex = idx;
        updateActiveSuggestion();
      });

      dropdown.appendChild(row);
    });

    dropdown.style.display = 'block';
    if (countIndicator) {
      countIndicator.style.display = 'none';
    }
  }

  function handleSearchSubmit() {
    const rawVal = searchInput.value;
    const cleanQ = rawVal.trim().toLowerCase().replace(/\s+/g, ' ');

    if (!cleanQ) {
      showInvalidMessage();
      return;
    }

    // If an item in dropdown is active, open it
    if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
      navigateTo(currentSuggestions[selectedIndex].url);
      return;
    }

    const matches = getMatchingItems(rawVal);
    if (matches.length === 1) {
      navigateTo(matches[0].url);
    } else if (matches.length > 1) {
      // Prioritize exact label / phrasing match
      const exact = matches.find(m =>
        m.label.toLowerCase() === cleanQ ||
        cleanQ === `${m.type} ${m.number}` ||
        cleanQ === `${m.number} ${m.type}` ||
        m.keywords.includes(cleanQ)
      );
      if (exact) {
        navigateTo(exact.url);
      } else {
        navigateTo(matches[0].url);
      }
    } else {
      showInvalidMessage();
    }
  }

  // Real-time typing listener
  searchInput.addEventListener('input', () => {
    const rawVal = searchInput.value;
    const cleanQ = rawVal.trim().toLowerCase().replace(/\s+/g, ' ');

    if (clearBtn) {
      clearBtn.style.display = rawVal.trim().length > 0 ? 'flex' : 'none';
    }

    if (!cleanQ) {
      hideSuggestions();
      hideInvalidMessage();
      return;
    }

    const matches = getMatchingItems(rawVal);
    if (matches.length > 0) {
      hideInvalidMessage();
      renderSuggestions(matches);
    } else {
      hideSuggestions();
      showInvalidMessage();
    }
  });

  // Keyboard navigation & Enter submit
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
      return;
    }

    if (e.key === 'ArrowDown') {
      if (currentSuggestions.length > 0) {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
        updateActiveSuggestion();
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      if (currentSuggestions.length > 0) {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateActiveSuggestion();
      }
      return;
    }

    if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  // Focus re-opens suggestions if input has matching content
  searchInput.addEventListener('focus', () => {
    const rawVal = searchInput.value;
    if (rawVal.trim()) {
      const matches = getMatchingItems(rawVal);
      if (matches.length > 0) {
        hideInvalidMessage();
        renderSuggestions(matches);
      }
    }
  });

  // Clear button click
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      hideSuggestions();
      hideInvalidMessage();
      searchInput.focus();
    });
  }

  // Dismiss dropdown on outside click
  document.addEventListener('click', (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
      hideSuggestions();
    }
  });
}



/**
 * 7. OUR LAB - ADD EXPERIMENT ACTION
 * Displays notification that Add Experiment functionality will be added later.
 */
function initAddExperiment() {
  const addBtn = document.getElementById('addExperimentBtn');
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimer = null;

  if (!addBtn) return;

  function showToast(message) {
    if (!toast) {
      alert(message);
      return;
    }

    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  addBtn.addEventListener('click', () => {
    showToast("Add Experiment functionality will be added later.");
  });
}
