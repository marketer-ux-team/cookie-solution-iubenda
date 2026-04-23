/* Iubenda Fallback v8 - Core Web Vitals Optimized */
(function () {
  "use strict";

  window.openIubendaPreferences = function () {
    var cs = window._iub && window._iub.cs;
    if (cs && cs.api && typeof cs.api.openPreferences === 'function') {
      cs.api.openPreferences();
    } else if (cs && typeof cs.openPreferences === 'function') {
      cs.openPreferences();
    } else if (cs && typeof cs.showCP === 'function') {
      cs.showCP();
    } else {
      var iubendaLink = document.querySelector('.iubenda-cs-preferences-link');
      if (iubendaLink) {
        iubendaLink.click();
      } else {
        console.warn('Iubenda preferences API not available.');
      }
    }
  };

  function createIubFallback() {
    var blockedIframes = document.querySelectorAll('iframe[data-suppressedsrc]:not(.iub-processed)');

    for (var i = 0; i < blockedIframes.length; i++) {
      var iframe = blockedIframes[i];
      iframe.classList.add('iub-processed');

      var wrapper = document.createElement('div');
      wrapper.className = 'iub-fallback-wrapper';

      var icon = document.createElement('div');
      icon.className = 'iub-fallback-icon';
      icon.textContent = '\uD83C\uDF6A';

      var textContainer = document.createElement('div');
      textContainer.className = 'iub-fallback-text';

      var strongTitle = document.createElement('strong');
      strongTitle.textContent = 'Externer Inhalt blockiert';
      var lineBreak = document.createElement('br');
      var description = document.createTextNode('Bitte akzeptieren Sie alle Cookies, damit Sie diese Inhalte ansehen k\u00F6nnen.');

      textContainer.appendChild(strongTitle);
      textContainer.appendChild(lineBreak);
      textContainer.appendChild(description);

      var btn = document.createElement('a');
      btn.href = '#';
      btn.className = 'button iub-open-prefs';
      btn.textContent = 'Cookie-Einstellungen \u00F6ffnen';

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.openIubendaPreferences();
      });

      wrapper.appendChild(icon);
      wrapper.appendChild(textContainer);
      wrapper.appendChild(btn);

      iframe.parentNode.insertBefore(wrapper, iframe.nextSibling);
    }
  }

  var debounceTimer;
  function debouncedCreateIubFallback() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(createIubFallback, 100);
  }

  function init() {
    createIubFallback();
    if (window.MutationObserver && document.body) {
      var observer = new MutationObserver(debouncedCreateIubFallback);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
