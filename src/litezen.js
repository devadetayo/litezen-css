/**
 * litezen.js v0.0.1
 * Helper script for Litezen interactive components
 */
;(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // ACCORDION
    document.querySelectorAll('.lz-accordion-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var content = header.nextElementSibling;
        var open = content.classList.toggle('open');
        header.classList.toggle('lz-active', open);
        header.setAttribute('aria-expanded', open);
      });
    });

    // TABS
    document.querySelectorAll('.tabs').forEach(function(tabGroup) {
      var tabs    = tabGroup.querySelectorAll('.tab');
      var panels  = tabGroup.querySelectorAll('.tab-panel');
      tabs.forEach(function(tab, i) {
        tab.addEventListener('click', function() {
          tabs.forEach(function(t) {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          panels.forEach(function(p) { p.classList.remove('active'); });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
          panels[i].classList.add('active');
        });
      });
    });

    // MEGA‑MENU & DROPDOWN‑CLICK
    document.querySelectorAll('.lz-megamenu, .lz-dropdown-click').forEach(function(menu) {
      menu.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('show');
      });
    });
    document.addEventListener('click', function() {
      document.querySelectorAll('.lz-megamenu.show, .lz-dropdown-click.show').forEach(function(m) {
        m.classList.remove('show');
      });
    });

    // MODAL
    document.querySelectorAll('[data-lz-modal-trigger]').forEach(function(trigger) {
      var modalId = trigger.getAttribute('data-lz-modal-trigger');
      var modal   = document.getElementById(modalId);
      var backdrop = document.querySelector(
        '.modal-backdrop[data-lz-modal-backdrop="' + modalId + '"]'
      );
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        modal   && modal.classList.add('active');
        backdrop && backdrop.classList.add('active');
      });
    });
    document.querySelectorAll('.modal-close').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var modal = btn.closest('.modal');
        var id    = modal.id;
        var backdrop = document.querySelector(
          '.modal-backdrop[data-lz-modal-backdrop="' + id + '"]'
        );
        modal.classList.remove('active');
        backdrop && backdrop.classList.remove('active');
      });
    });
    document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
      backdrop.addEventListener('click', function() {
        var id = backdrop.getAttribute('data-lz-modal-backdrop');
        var modal = document.getElementById(id);
        backdrop.classList.remove('active');
        modal && modal.classList.remove('active');
      });
    });

    // LIGHTBOX (Gallery)
    document.querySelectorAll('.lz-gallery-item img').forEach(function(img) {
      img.addEventListener('click', function() {
        var lightbox = document.querySelector('.lz-lightbox');
        if (!lightbox) return;
        var lbImg = lightbox.querySelector('img');
        lbImg.src = img.src;
        lightbox.classList.add('active');
      });
    });
    document.querySelectorAll('.lz-lightbox, .lz-lightbox-close').forEach(function(el) {
      el.addEventListener('click', function(e) {
        var lightbox = el.classList.contains('lz-lightbox')
          ? el
          : el.closest('.lz-lightbox');
        lightbox.classList.remove('active');
      });
    });

    // TOASTS (Auto‑dismiss)
    document.querySelectorAll('.lz-toast').forEach(function(toast) {
      var delay = parseInt(toast.getAttribute('data-lz-delay'), 10) || 3000;
      setTimeout(function() {
        toast.remove();
      }, delay);
    });

  });
})();
