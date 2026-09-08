(function () {
  'use strict';
  window.loadDeferredScript = function (src, attributes) {
    attributes = attributes || {};
    var injected = false;

    function inject() {
      if (injected) return;
      injected = true;
      if (document.querySelector('script[src="' + src + '"]')) return;

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      for (var key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
          script.setAttribute(key, attributes[key]);
        }
      }
      document.head.appendChild(script);
    }

    function triggerEarly() {
      inject();
      cleanup();
    }

    function cleanup() {
      window.removeEventListener('scroll', triggerEarly);
      window.removeEventListener('touchstart', triggerEarly);
      window.removeEventListener('click', triggerEarly);
      window.removeEventListener('keydown', triggerEarly);
    }

    window.addEventListener('scroll', triggerEarly, {
      passive: true,
      once: true,
    });
    window.addEventListener('touchstart', triggerEarly, {
      passive: true,
      once: true,
    });
    window.addEventListener('click', triggerEarly, {
      passive: true,
      once: true,
    });
    window.addEventListener('keydown', triggerEarly, {
      passive: true,
      once: true,
    });

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        function () {
          inject();
          cleanup();
        },
        { timeout: 3500 },
      );
    } else {
      setTimeout(function () {
        inject();
        cleanup();
      }, 2500);
    }
  };
})();
