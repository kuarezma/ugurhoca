/* eslint-disable */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  var metrics = { lcp: 0, cls: 0, inp: 0, url: location.pathname };

  try {
    var lcpObserver = new PerformanceObserver(function (entryList) {
      var entries = entryList.getEntries();
      if (entries.length > 0) {
        var lastEntry = entries[entries.length - 1];
        metrics.lcp = Math.round(lastEntry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {}

  try {
    var clsValue = 0;
    var clsObserver = new PerformanceObserver(function (entryList) {
      var entries = entryList.getEntries();
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].hadRecentInput && typeof entries[i].value === 'number') {
          clsValue += entries[i].value;
          metrics.cls = Number(clsValue.toFixed(4));
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}

  try {
    var maxDuration = 0;
    var inpObserver = new PerformanceObserver(function (entryList) {
      var entries = entryList.getEntries();
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].interactionId && entries[i].duration > maxDuration) {
          maxDuration = entries[i].duration;
          metrics.inp = Math.round(maxDuration);
        }
      }
    });
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch (e) {}

  function sendMetrics() {
    if (metrics.lcp === 0 && metrics.cls === 0 && metrics.inp === 0) return;
    if (location.hostname === 'localhost' || location.search.indexOf('debug=rum') !== -1) {
      console.log('⚡ [RUM Metrikleri]', metrics);
    }
    if (navigator.sendBeacon) {
      var payload = JSON.stringify({
        lcp: metrics.lcp,
        cls: metrics.cls,
        inp: metrics.inp,
        url: metrics.url,
        timestamp: Date.now()
      });
      navigator.sendBeacon('/api/rum', payload);
    }
  }

  window.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendMetrics();
  });
})();
