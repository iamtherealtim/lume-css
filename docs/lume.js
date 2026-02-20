(function () {
  var defaultToastDuration = 4500;

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function queryAll(selector, root) {
    return toArray((root || document).querySelectorAll(selector));
  }

  function isOverlay(target) {
    return !!(target && target.classList && (target.classList.contains('lume-modal-overlay') || target.classList.contains('lume-drawer-overlay')));
  }

  function getDialogRoot(overlay) {
    if (!overlay) return null;
    return overlay.querySelector('.lume-modal, .lume-drawer') || overlay;
  }

  function getFocusable(container) {
    if (!container) return [];
    return queryAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter(function (node) {
      return node.offsetParent !== null || node === document.activeElement;
    });
  }

  function applyBodyScrollLock() {
    var hasOpenOverlay = !!document.querySelector('.lume-modal-overlay.is-open, .lume-drawer-overlay.is-open');
    document.body.style.overflow = hasOpenOverlay ? 'hidden' : '';
  }

  function focusOverlay(target) {
    if (!isOverlay(target)) return;
    var root = getDialogRoot(target);
    var focusables = getFocusable(root);
    if (focusables.length > 0) {
      focusables[0].focus();
      return;
    }
    if (root && !root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
    if (root) root.focus();
  }

  function scheduleToastDismiss(toast) {
    if (!toast || toast.__lumeDismissTimer) return;
    var raw = toast.getAttribute('data-lume-autodismiss');
    if (raw === 'false') return;

    var duration = parseInt(raw || '', 10);
    if (!Number.isFinite(duration) || duration <= 0) duration = defaultToastDuration;

    toast.__lumeDismissTimer = window.setTimeout(function () {
      if (toast.isConnected) toast.remove();
      toast.__lumeDismissTimer = null;
    }, duration);
  }

  function initToastTimers() {
    queryAll('.lume-toast').forEach(scheduleToastDismiss);
  }

  function openDropdownAndFocusFirst(dropdown) {
    if (!dropdown) return;
    open(dropdown);
    var items = getFocusable(dropdown).filter(function (item) {
      return item.classList.contains('lume-dropdown-item') || item.getAttribute('role') === 'menuitem';
    });
    if (items.length > 0) items[0].focus();
  }

  function open(target) {
    if (!target) return;
    target.classList.add('is-open');
    if (isOverlay(target)) {
      applyBodyScrollLock();
      focusOverlay(target);
    }
    if (target.classList && target.classList.contains('lume-toast')) {
      scheduleToastDismiss(target);
    }
  }

  function close(target) {
    if (!target) return;
    target.classList.remove('is-open');
    if (isOverlay(target)) {
      applyBodyScrollLock();
      if (target.__lumeTrigger && typeof target.__lumeTrigger.focus === 'function') {
        target.__lumeTrigger.focus();
      }
    }
  }

  function toggle(target) {
    if (target) target.classList.toggle('is-open');
  }

  function findTarget(trigger) {
    var selector = trigger.getAttribute('data-lume-target');
    return selector ? document.querySelector(selector) : null;
  }

  function getDropdownItems(dropdown) {
    return queryAll('.lume-dropdown-item, [role="menuitem"]', dropdown).filter(function (item) {
      return !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true';
    });
  }

  function resolveTabPanel(tab, tabBar, index) {
    if (!tab || !tabBar) return null;
    var explicitId = tab.getAttribute('aria-controls') || tab.getAttribute('data-lume-panel');
    if (explicitId) return document.getElementById(explicitId);

    var wrapper = tabBar.parentElement;
    var panelsWrap = wrapper ? wrapper.querySelector('.lume-tab-panels') : null;
    var panels = panelsWrap ? queryAll('.lume-tab-panel', panelsWrap) : [];
    return panels[index] || null;
  }

  function setTabState(tabBar, activeTab, shouldFocus) {
    var tabs = queryAll('.lume-tab', tabBar);
    tabs.forEach(function (tab, index) {
      var isActive = tab === activeTab;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');

      var panel = resolveTabPanel(tab, tabBar, index);
      if (panel) {
        panel.classList.toggle('is-active', isActive);
        panel.setAttribute('role', 'tabpanel');
        panel.hidden = !isActive;
      }
    });

    if (shouldFocus && activeTab && typeof activeTab.focus === 'function') {
      activeTab.focus();
    }
  }

  function initTabsA11y() {
    queryAll('.lume-tabs').forEach(function (tabBar) {
      tabBar.setAttribute('role', 'tablist');
      var activeTab = tabBar.querySelector('.lume-tab.is-active') || tabBar.querySelector('.lume-tab');
      if (activeTab) setTabState(tabBar, activeTab, false);
    });
  }

  function handleTabKeyboard(event) {
    var tab = event.target.closest('.lume-tab');
    if (!tab) return;
    var tabBar = tab.closest('.lume-tabs');
    if (!tabBar) return;

    var tabs = queryAll('.lume-tab', tabBar);
    if (tabs.length === 0) return;
    var currentIndex = tabs.indexOf(tab);
    if (currentIndex < 0) return;

    var key = event.key;
    var nextIndex = -1;
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (key === 'Home') {
      nextIndex = 0;
    } else if (key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex < 0) return;
    event.preventDefault();
    setTabState(tabBar, tabs[nextIndex], true);
  }

  function trapFocusOnOverlay(event) {
    if (event.key !== 'Tab') return;
    var topOverlay = queryAll('.lume-modal-overlay.is-open, .lume-drawer-overlay.is-open').slice(-1)[0];
    if (!topOverlay) return;

    var root = getDialogRoot(topOverlay);
    var focusables = getFocusable(root);
    if (focusables.length === 0) {
      event.preventDefault();
      if (root) root.focus();
      return;
    }

    var current = document.activeElement;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    }
  }

  function handleDropdownKeyboard(event) {
    var key = event.key;
    var supported = key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End';
    if (!supported) return;

    var activeDropdown = event.target.closest('.lume-dropdown.is-open') || document.querySelector('.lume-dropdown.is-open');
    if (!activeDropdown) return;

    var items = getDropdownItems(activeDropdown);
    if (items.length === 0) return;
    event.preventDefault();

    var currentIndex = items.indexOf(document.activeElement);
    if (key === 'Home') {
      items[0].focus();
      return;
    }

    if (key === 'End') {
      items[items.length - 1].focus();
      return;
    }

    if (currentIndex < 0) {
      currentIndex = key === 'ArrowUp' ? items.length : -1;
    }

    var step = key === 'ArrowUp' ? -1 : 1;
    var nextIndex = (currentIndex + step + items.length) % items.length;
    items[nextIndex].focus();
  }

  function closeAllMenus(exceptNode) {
    queryAll('.lume-dropdown.is-open').forEach(function (dropdown) {
      if (!exceptNode || !dropdown.contains(exceptNode)) close(dropdown);
    });
  }

  document.addEventListener('click', function (event) {
    var toggleTrigger = event.target.closest('[data-lume-toggle]');
    if (toggleTrigger) {
      var toggleTarget = findTarget(toggleTrigger);
      if (toggleTarget) {
        toggleTarget.__lumeTrigger = toggleTrigger;
        if (toggleTrigger.getAttribute('data-lume-toggle') === 'dropdown') {
          closeAllMenus(toggleTrigger);
        }
        toggle(toggleTarget);
        if (toggleTrigger.getAttribute('data-lume-toggle') === 'dropdown' && toggleTarget.classList.contains('is-open')) {
          openDropdownAndFocusFirst(toggleTarget);
        }
      }
      return;
    }

    var openTrigger = event.target.closest('[data-lume-open]');
    if (openTrigger) {
      var openTarget = findTarget(openTrigger);
      if (openTarget) {
        openTarget.__lumeTrigger = openTrigger;
        open(openTarget);
      }
      return;
    }

    var closeTrigger = event.target.closest('[data-lume-close]');
    if (closeTrigger) {
      var closeTarget = findTarget(closeTrigger) || closeTrigger.closest('.lume-modal-overlay, .lume-drawer-overlay, .lume-dropdown');
      if (closeTarget) close(closeTarget);
      return;
    }

    var dismissTrigger = event.target.closest('[data-lume-dismiss="toast"], .lume-toast-close');
    if (dismissTrigger) {
      var toast = dismissTrigger.closest('.lume-toast');
      if (toast) {
        if (toast.__lumeDismissTimer) {
          window.clearTimeout(toast.__lumeDismissTimer);
          toast.__lumeDismissTimer = null;
        }
        toast.remove();
      }
      return;
    }

    var removable = event.target.closest('[data-lume-remove]');
    if (removable) {
      var selector = removable.getAttribute('data-lume-remove');
      var removableTarget = selector ? removable.closest(selector) : removable.closest('.lume-tag, .lume-badge, .lume-chip');
      if (removableTarget) removableTarget.remove();
      return;
    }

    var openOverlay = event.target.closest('.lume-modal-overlay.is-open, .lume-drawer-overlay.is-open');
    if (openOverlay && event.target === openOverlay) {
      close(openOverlay);
      return;
    }

    var tabTrigger = event.target.closest('.lume-tab');
    if (tabTrigger) {
      var tabBar = tabTrigger.closest('.lume-tabs');
      if (tabBar) setTabState(tabBar, tabTrigger, false);
    }

    closeAllMenus(event.target);
  });

  document.addEventListener('keydown', function (event) {
    trapFocusOnOverlay(event);
    handleDropdownKeyboard(event);
    handleTabKeyboard(event);

    if (event.key !== 'Escape') return;

    queryAll('.lume-modal-overlay.is-open, .lume-drawer-overlay.is-open, .lume-dropdown.is-open').forEach(function (node) {
      close(node);
    });
  });

  initToastTimers();
  var toastObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      toArray(mutation.addedNodes).forEach(function (node) {
        if (!node || node.nodeType !== 1) return;
        if (node.classList && node.classList.contains('lume-toast')) {
          scheduleToastDismiss(node);
          return;
        }
        queryAll('.lume-toast', node).forEach(scheduleToastDismiss);
      });
    });
  });
  toastObserver.observe(document.body, { childList: true, subtree: true });

  initTabsA11y();

  window.Lume = {
    open: open,
    close: close,
    toggle: toggle
  };
})();
