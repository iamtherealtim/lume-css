function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.textContent = next === 'dark' ? '☀ Light' : '☾ Dark';
  });
  try { localStorage.setItem('lume-theme', next); } catch (error) {}
}

function initTheme() {
  try {
    const savedTheme = localStorage.getItem('lume-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        button.textContent = savedTheme === 'dark' ? '☀ Light' : '☾ Dark';
      });
    }
  } catch (error) {}
}

function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
    return true;
  }
  return false;
}

function toggleSidebar() {
  const shell = document.querySelector('.admin-shell');
  if (!shell) return;
  shell.classList.toggle('sidebar-open');
}

function closeSidebar() {
  const shell = document.querySelector('.admin-shell');
  if (!shell) return;
  shell.classList.remove('sidebar-open');
}

function showToast(message, variant = 'info') {
  let container = document.querySelector('.lume-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'lume-toast-container lume-toast-container-br';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `lume-toast lume-toast-${variant}`;
  toast.innerHTML = `
    <div class="lume-toast-content">
      <div class="lume-toast-title">Admin Notice</div>
      <div class="lume-toast-body">${message}</div>
    </div>
    <button class="lume-toast-close" aria-label="Close">×</button>
  `;

  toast.querySelector('.lume-toast-close')?.addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.isConnected) toast.remove();
  }, 4200);
}

function switchTabs(tab, panelId) {
  const tabBar = tab.closest('.lume-tabs');
  const wrapper = tabBar?.parentElement;
  const panels = wrapper?.querySelector('.lume-tab-panels');
  if (!tabBar || !panels) return;

  tabBar.querySelectorAll('.lume-tab').forEach((item) => item.classList.remove('is-active'));
  panels.querySelectorAll('.lume-tab-panel').forEach((item) => item.classList.remove('is-active'));
  tab.classList.add('is-active');
  document.getElementById(panelId)?.classList.add('is-active');
}

function setFieldState(input, errorEl, isValid, message) {
  if (!input || !errorEl) return;
  input.setAttribute('aria-invalid', isValid ? 'false' : 'true');
  if (isValid) {
    errorEl.hidden = true;
    errorEl.textContent = '';
    return;
  }
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function initAdminLoginPage() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  const otp = document.getElementById('login-otp');
  const submitBtn = document.getElementById('login-submit');
  const passkeyBtn = document.getElementById('login-passkey');
  const togglePasswordBtn = document.getElementById('login-toggle-password');
  const capsLockHint = document.getElementById('login-capslock');
  const feedback = document.getElementById('login-feedback');

  const emailError = document.getElementById('login-email-error');
  const passwordError = document.getElementById('login-password-error');
  const otpError = document.getElementById('login-otp-error');

  const validateEmail = () => {
    const value = (email?.value || '').trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setFieldState(email, emailError, isValid, 'Please enter a valid work email.');
    return isValid;
  };

  const validatePassword = () => {
    const value = password?.value || '';
    const isValid = value.length >= 8;
    setFieldState(password, passwordError, isValid, 'Password must be at least 8 characters.');
    return isValid;
  };

  const validateOtp = () => {
    const value = (otp?.value || '').trim();
    const isValid = value === '' || /^\d{6}$/.test(value);
    setFieldState(otp, otpError, isValid, 'Code must be 6 digits.');
    return isValid;
  };

  const showFeedback = (message, variant) => {
    if (!feedback) return;
    feedback.className = `lume-callout lume-callout-${variant}`;
    feedback.innerHTML = `<div class="lume-callout-title">Sign-in status</div>${message}`;
    feedback.style.display = 'block';
  };

  email?.addEventListener('blur', validateEmail);
  password?.addEventListener('blur', validatePassword);
  otp?.addEventListener('blur', validateOtp);

  otp?.addEventListener('input', () => {
    otp.value = otp.value.replace(/\D/g, '').slice(0, 6);
  });

  password?.addEventListener('keyup', (event) => {
    if (!capsLockHint || typeof event.getModifierState !== 'function') return;
    capsLockHint.style.display = event.getModifierState('CapsLock') ? 'block' : 'none';
  });

  togglePasswordBtn?.addEventListener('click', () => {
    if (!password || !togglePasswordBtn) return;
    const isPassword = password.type === 'password';
    password.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    togglePasswordBtn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}"></i>`;
    initIcons();
  });

  passkeyBtn?.addEventListener('click', () => {
    showToast('Passkey prompt opened (demo)', 'info');
  });

  form.querySelectorAll('[data-login-provider]').forEach((button) => {
    button.addEventListener('click', () => {
      const provider = button.getAttribute('data-login-provider');
      const labels = {
        google: 'Google',
        github: 'GitHub',
        microsoft: 'Microsoft',
        saml: 'SAML SSO'
      };
      const label = provider ? (labels[provider] || provider.toUpperCase()) : 'SSO';
      showToast(`${label} login started (demo)`, 'info');
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const ok = [validateEmail(), validatePassword(), validateOtp()].every(Boolean);
    if (!ok) {
      showFeedback('Please fix the highlighted fields and try again.', 'danger');
      return;
    }

    if (!submitBtn) return;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-circle"></i><span>Signing in...</span>';
    initIcons();

    const emailValue = (email?.value || '').trim().toLowerCase();
    const passwordValue = password?.value || '';
    const isDemoCreds = emailValue === 'admin@lume.dev' && passwordValue === 'lume1234';

    window.setTimeout(() => {
      if (!isDemoCreds) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="log-in"></i><span>Sign in to dashboard</span>';
        initIcons();
        showFeedback('The email or password is incorrect for this demo. Try admin@lume.dev / lume1234.', 'danger');
        return;
      }

      showFeedback('Authentication successful. Redirecting to dashboard...', 'success');
      window.setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 650);
    }, 900);
  });
}

document.addEventListener('click', (event) => {
  const target = event.target;

  if (target instanceof HTMLElement && target.matches('[data-open-dropdown]')) {
    const id = target.getAttribute('data-open-dropdown');
    const dropdown = document.getElementById(id || '');
    if (dropdown) dropdown.classList.toggle('is-open');
    return;
  }

  document.querySelectorAll('.lume-dropdown.is-open').forEach((dropdown) => {
    if (!dropdown.contains(target)) dropdown.classList.remove('is-open');
  });

  if (target instanceof HTMLElement && target.classList.contains('lume-toast-close')) {
    target.closest('.lume-toast')?.remove();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeSidebar();
    document.querySelectorAll('.lume-dropdown.is-open').forEach((item) => item.classList.remove('is-open'));
    document.querySelectorAll('.lume-modal-overlay.is-open').forEach((item) => item.classList.remove('is-open'));
  }
});

initTheme();
initAdminLoginPage();
if (!initIcons()) {
  window.addEventListener('load', () => {
    initIcons();
  }, { once: true });
}

function revealUiWhenReady() {
  const removePending = () => document.documentElement.removeAttribute('data-ui-init');
  const fontReady = (document.fonts && document.fonts.ready)
    ? Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 900))
      ])
    : Promise.resolve();

  fontReady.finally(() => {
    initIcons();
    removePending();
  });
}

if (document.readyState === 'complete') {
  revealUiWhenReady();
} else {
  window.addEventListener('load', revealUiWhenReady, { once: true });
}
