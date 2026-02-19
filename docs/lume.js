(function () {
  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function queryAll(selector, root) {
    return toArray((root || document).querySelectorAll(selector));
  }

  function open(target) {
    if (target) target.classList.add('is-open');
  }

  function close(target) {
    if (target) target.classList.remove('is-open');
  }

  function toggle(target) {
    if (target) target.classList.toggle('is-open');
  }

  function findTarget(trigger) {
    var selector = trigger.getAttribute('data-lume-target');
    return selector ? document.querySelector(selector) : null;
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
        if (toggleTrigger.getAttribute('data-lume-toggle') === 'dropdown') {
          closeAllMenus(toggleTrigger);
        }
        toggle(toggleTarget);
      }
      return;
    }

    var openTrigger = event.target.closest('[data-lume-open]');
    if (openTrigger) {
      var openTarget = findTarget(openTrigger);
      if (openTarget) open(openTarget);
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
      if (toast) toast.remove();
      return;
    }

    var openOverlay = event.target.closest('.lume-modal-overlay.is-open, .lume-drawer-overlay.is-open');
    if (openOverlay && event.target === openOverlay) {
      close(openOverlay);
      return;
    }

    closeAllMenus(event.target);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;

    queryAll('.lume-modal-overlay.is-open, .lume-drawer-overlay.is-open, .lume-dropdown.is-open').forEach(function (node) {
      close(node);
    });
  });

  window.Lume = {
    open: open,
    close: close,
    toggle: toggle
  };
})();
