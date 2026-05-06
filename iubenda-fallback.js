/* Iubenda Fallback v9 - Overlay positioning + auto-remove on consent */
(function () {
  "use strict";

  var PADLOCK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';

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

  function acceptAllConsent() {
    var cs = window._iub && window._iub.cs;
    if (cs && cs.api && typeof cs.api.consentGiven === 'function') {
      cs.api.consentGiven();
    } else {
      window.openIubendaPreferences();
    }
  }

  function watchIframeForUnblock(iframe, wrapper) {
    var observer = new MutationObserver(function () {
      var src = iframe.getAttribute('src') || '';
      if (src && src.indexOf('about:blank') === -1) {
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        iframe.classList.remove('iub-processed');
        observer.disconnect();
      }
    });
    observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });
  }

  function buildWrapper() {
    var wrapper = document.createElement('div');
    wrapper.className = 'iub-fallback-wrapper';

    var icon = document.createElement('div');
    icon.className = 'iub-fallback-icon';
    icon.innerHTML = PADLOCK_SVG;

    var title = document.createElement('div');
    title.className = 'iub-fallback-title';
    title.textContent = 'Wir benötigen Ihre Zustimmung, um diesen Inhalt zu laden';

    var text = document.createElement('div');
    text.className = 'iub-fallback-text';
    text.textContent = 'Um auf die eingebetteten Inhalte zugreifen zu können, müssen Sie dem Dienst des Drittanbieters zustimmen, da dieser Daten über Ihre Aktivitäten sammeln kann.';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'iub-fallback-button';
    btn.textContent = 'Ich bin einverstanden';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      acceptAllConsent();
    });

    wrapper.appendChild(icon);
    wrapper.appendChild(title);
    wrapper.appendChild(text);
    wrapper.appendChild(btn);

    return wrapper;
  }

  function createIubFallback() {
    var blockedIframes = document.querySelectorAll('iframe[data-suppressedsrc]:not(.iub-processed)');

    for (var i = 0; i < blockedIframes.length; i++) {
      var iframe = blockedIframes[i];
      iframe.classList.add('iub-processed');

      var parent = iframe.parentNode;
      if (parent && window.getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }

      var wrapper = buildWrapper();
      iframe.parentNode.insertBefore(wrapper, iframe.nextSibling);

      watchIframeForUnblock(iframe, wrapper);
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
