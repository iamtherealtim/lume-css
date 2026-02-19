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
