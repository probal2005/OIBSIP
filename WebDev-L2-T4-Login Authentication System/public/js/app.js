/**
 * App Controller
 * Manages UI Routing, Validation, Interactivity, and Auth State
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const views = {
    login: document.getElementById('loginView'),
    register: document.getElementById('registerView'),
    dashboard: document.getElementById('dashboardView'),
  };

  const navBtns = {
    login: document.getElementById('navLoginBtn'),
    register: document.getElementById('navRegisterBtn'),
    userBadge: document.getElementById('navUserBadge'),
    navUsername: document.getElementById('navUsername'),
    logoutBtn: document.getElementById('navLogoutBtn'),
  };

  // Forms & Inputs
  const loginForm = document.getElementById('loginForm');
  const loginIdentifierInput = document.getElementById('loginIdentifier');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginIdentifierError = document.getElementById('loginIdentifierError');
  const loginPasswordError = document.getElementById('loginPasswordError');

  const registerForm = document.getElementById('registerForm');
  const regUsernameInput = document.getElementById('regUsername');
  const regEmailInput = document.getElementById('regEmail');
  const regPasswordInput = document.getElementById('regPassword');
  const regConfirmPasswordInput = document.getElementById('regConfirmPassword');
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');

  const regUsernameError = document.getElementById('regUsernameError');
  const regEmailError = document.getElementById('regEmailError');
  const regPasswordError = document.getElementById('regPasswordError');
  const regConfirmPasswordError = document.getElementById('regConfirmPasswordError');

  // Password Requirement Badges
  const reqMinChar = document.getElementById('reqMinChar');
  const reqNumber = document.getElementById('reqNumber');

  // Dashboard Elements
  const dashAvatarLetter = document.getElementById('dashAvatarLetter');
  const dashUsernameDisplay = document.getElementById('dashUsernameDisplay');
  const dashUserVal = document.getElementById('dashUserVal');
  const dashEmailVal = document.getElementById('dashEmailVal');
  const dashCreatedVal = document.getElementById('dashCreatedVal');
  const dashboardLogoutBtn = document.getElementById('dashboardLogoutBtn');

  // Alert Box Elements
  const alertBox = document.getElementById('alertBox');
  const alertIcon = document.getElementById('alertIcon');
  const alertMessage = document.getElementById('alertMessage');
  const alertCloseBtn = document.getElementById('alertCloseBtn');

  let currentUser = null;

  // --- Alert System Utility ---
  function showAlert(message, type = 'danger', duration = 5000) {
    alertMessage.textContent = message;
    alertBox.className = `alert-box alert-${type}`;

    if (type === 'danger') {
      alertIcon.className = 'fa-solid fa-circle-exclamation alert-icon';
    } else {
      alertIcon.className = 'fa-solid fa-circle-check alert-icon';
    }

    alertBox.classList.remove('hidden');

    if (duration > 0) {
      setTimeout(() => {
        hideAlert();
      }, duration);
    }
  }

  function hideAlert() {
    alertBox.classList.add('hidden');
  }

  alertCloseBtn.addEventListener('click', hideAlert);

  // --- Password Visibility Toggle ---
  document.querySelectorAll('.password-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'fa-regular fa-eye';
      }
    });
  });

  // --- Password Complexity Live Check ---
  function checkPasswordRequirements(password) {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);

    if (hasMinLength) {
      reqMinChar.classList.add('valid');
      reqMinChar.querySelector('i').className = 'fa-solid fa-circle-check';
    } else {
      reqMinChar.classList.remove('valid');
      reqMinChar.querySelector('i').className = 'fa-solid fa-circle-xmark';
    }

    if (hasNumber) {
      reqNumber.classList.add('valid');
      reqNumber.querySelector('i').className = 'fa-solid fa-circle-check';
    } else {
      reqNumber.classList.remove('valid');
      reqNumber.querySelector('i').className = 'fa-solid fa-circle-xmark';
    }

    return hasMinLength && hasNumber;
  }

  regPasswordInput.addEventListener('input', (e) => {
    checkPasswordRequirements(e.target.value);
  });

  // --- Router & View Management ---
  async function navigateTo(targetHash) {
    hideAlert();
    clearFieldErrors();

    // Default to login if no hash or invalid hash
    let route = targetHash.replace('#', '') || 'login';
    if (!['login', 'register', 'dashboard'].includes(route)) {
      route = 'login';
    }

    // Auth Protection Guard for Dashboard
    if (route === 'dashboard') {
      const authStatus = await AuthAPI.checkAuth();
      if (!authStatus.authenticated) {
        currentUser = null;
        updateNavState(null);
        showAlert('Access restricted. Please log in to view the dashboard.', 'danger');
        window.location.hash = 'login';
        return;
      }
      currentUser = authStatus.user;
      renderDashboard(currentUser);
    }

    // Hide all views
    Object.values(views).forEach((view) => view.classList.add('hidden'));

    // Show target view
    if (views[route]) {
      views[route].classList.remove('hidden');
    }

    updateNavState(currentUser, route);
  }

  function updateNavState(user, activeRoute) {
    if (user) {
      navBtns.login.classList.add('hidden');
      navBtns.register.classList.add('hidden');
      navBtns.userBadge.classList.remove('hidden');
      navBtns.logoutBtn.classList.remove('hidden');
      navBtns.navUsername.textContent = user.username;
    } else {
      navBtns.userBadge.classList.add('hidden');
      navBtns.logoutBtn.classList.add('hidden');
      navBtns.login.classList.remove('hidden');
      navBtns.register.classList.remove('hidden');

      navBtns.login.classList.toggle('active', activeRoute === 'login');
      navBtns.register.classList.toggle('active', activeRoute === 'register');
    }
  }

  function renderDashboard(user) {
    dashAvatarLetter.textContent = user.username.charAt(0).toUpperCase();
    dashUsernameDisplay.textContent = user.username;
    dashUserVal.textContent = user.username;
    dashEmailVal.textContent = user.email;

    const createdDate = new Date(user.createdAt);
    dashCreatedVal.textContent = createdDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Clear Field Errors
  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    document.querySelectorAll('input').forEach((el) => el.classList.remove('input-error'));
  }

  // Button Loading State helper
  function setButtonLoading(btn, isLoading, text = '') {
    const span = btn.querySelector('span');
    const spinner = btn.querySelector('.spinner');

    if (isLoading) {
      btn.disabled = true;
      if (span) span.style.opacity = '0.5';
      if (spinner) spinner.classList.remove('hidden');
    } else {
      btn.disabled = false;
      if (span) span.style.opacity = '1';
      if (spinner) spinner.classList.add('hidden');
    }
  }

  // --- Registration Handler ---
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearFieldErrors();

    const username = regUsernameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value;
    const confirmPassword = regConfirmPasswordInput.value;

    let hasError = false;

    // 1. Basic Form Validation (no empty submissions)
    if (!username) {
      regUsernameError.textContent = 'Username is required.';
      regUsernameInput.classList.add('input-error');
      hasError = true;
    }

    if (!email) {
      regEmailError.textContent = 'Email is required.';
      regEmailInput.classList.add('input-error');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      regEmailError.textContent = 'Please enter a valid email format.';
      regEmailInput.classList.add('input-error');
      hasError = true;
    }

    if (!password) {
      regPasswordError.textContent = 'Password is required.';
      regPasswordInput.classList.add('input-error');
      hasError = true;
    } else if (!checkPasswordRequirements(password)) {
      regPasswordError.textContent = 'Password must be at least 8 characters with 1 number.';
      regPasswordInput.classList.add('input-error');
      hasError = true;
    }

    if (!confirmPassword) {
      regConfirmPasswordError.textContent = 'Please confirm your password.';
      regConfirmPasswordInput.classList.add('input-error');
      hasError = true;
    } else if (password !== confirmPassword) {
      regConfirmPasswordError.textContent = 'Passwords do not match.';
      regConfirmPasswordInput.classList.add('input-error');
      hasError = true;
    }

    if (hasError) return;

    setButtonLoading(registerSubmitBtn, true);

    const result = await AuthAPI.register({ username, email, password });

    setButtonLoading(registerSubmitBtn, false);

    if (result.success) {
      registerForm.reset();
      checkPasswordRequirements('');
      showAlert('Registration successful! Please log in with your credentials.', 'success');
      window.location.hash = 'login';
    } else {
      showAlert(result.message || 'Registration failed.', 'danger');
    }
  });

  // --- Login Handler ---
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearFieldErrors();

    const identifier = loginIdentifierInput.value.trim();
    const password = loginPasswordInput.value;

    let hasError = false;

    // Basic Form Validation (no empty submissions)
    if (!identifier) {
      loginIdentifierError.textContent = 'Username or Email is required.';
      loginIdentifierInput.classList.add('input-error');
      hasError = true;
    }

    if (!password) {
      loginPasswordError.textContent = 'Password is required.';
      loginPasswordInput.classList.add('input-error');
      hasError = true;
    }

    if (hasError) return;

    setButtonLoading(loginSubmitBtn, true);

    const result = await AuthAPI.login({ identifier, password });

    setButtonLoading(loginSubmitBtn, false);

    if (result.success) {
      currentUser = result.user;
      loginForm.reset();
      showAlert(`Welcome back, ${currentUser.username}!`, 'success', 3000);
      window.location.hash = 'dashboard';
    } else {
      // Incorrect credential handling: clear error message (do not reveal which field is wrong)
      showAlert(result.message || 'Invalid username/email or password.', 'danger');
    }
  });

  // --- Logout Handler ---
  async function handleLogout() {
    hideAlert();
    const res = await AuthAPI.logout();
    currentUser = null;
    updateNavState(null, 'login');
    showAlert(res.message || 'You have logged out.', 'success', 4000);
    window.location.hash = 'login';
  }

  dashboardLogoutBtn.addEventListener('click', handleLogout);
  navBtns.logoutBtn.addEventListener('click', handleLogout);

  // --- Hash Route Listener ---
  window.addEventListener('hashchange', () => {
    navigateTo(window.location.hash);
  });

  // --- Initial Page Load Initialization ---
  async function init() {
    const authStatus = await AuthAPI.checkAuth();
    if (authStatus.authenticated) {
      currentUser = authStatus.user;
      updateNavState(currentUser);
    }
    navigateTo(window.location.hash || '#login');
  }

  init();
});

