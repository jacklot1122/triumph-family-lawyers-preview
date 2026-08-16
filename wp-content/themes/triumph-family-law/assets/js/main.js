/* Triumph Family Lawyers — front-end behaviours.
   No dependencies. Forms post to WordPress, so this only handles UI. */

(function () {
  'use strict';

  /* --- Mobile nav ------------------------------------------------------ */

  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        burger.focus();
      }
    });
  }

  /* --- Reveal on scroll ------------------------------------------------- */

  var reveals = document.querySelectorAll('.rv');

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* --- Headshots -------------------------------------------------------- */
  /* Each photo sits above a monogram tile. If the image 404s, drop the <img>
     so the initials underneath show instead of a broken icon. */

  Array.prototype.forEach.call(document.querySelectorAll('.person__shot img'), function (img) {
    var fail = function () {
      img.style.display = 'none';
      var mono = img.parentNode.querySelector('.person__mono');
      if (mono && !mono.querySelector('small')) {
        var note = document.createElement('small');
        note.textContent = 'Photo to be added';
        mono.appendChild(note);
      }
    };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* --- Enquiry forms ---------------------------------------------------- */
  /* Submission is handled server-side by WordPress. All we do here is block a
     double submit and give feedback while the request is in flight. */

  Array.prototype.forEach.call(document.querySelectorAll('form[data-enquiry]'), function (form) {
    form.addEventListener('submit', function (e) {
      if (!form.reportValidity()) {
        e.preventDefault();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.dataset.label = btn.dataset.label || btn.textContent;
        btn.textContent = 'Sending…';

        // Re-enable if the browser restores the page from bfcache.
        window.setTimeout(function () {
          btn.disabled = false;
          btn.textContent = btn.dataset.label;
        }, 8000);
      }
    });
  });

  /* --- Post-submit confirmation ---------------------------------------- */
  /* WordPress redirects back with ?enquiry=sent — bring the panel into view
     and move focus to it so screen readers announce the result. */

  if (window.location.search.indexOf('enquiry=') !== -1) {
    var panel = document.querySelector('.form__ok.is-on, .form__err.is-on');
    if (panel) {
      panel.setAttribute('tabindex', '-1');
      window.setTimeout(function () {
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        panel.focus({ preventScroll: true });
      }, 120);
    }
  }

  /* --- FAQ: one open at a time ------------------------------------------ */

  var faqs = document.querySelectorAll('.faq details');

  Array.prototype.forEach.call(faqs, function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      Array.prototype.forEach.call(faqs, function (other) {
        if (other !== d) other.open = false;
      });
    });
  });
})();
