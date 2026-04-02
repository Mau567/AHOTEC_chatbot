/**
 * AHOTEC Chat Widget - Embed script for external websites
 * Add this script to any webpage to show the floating chat widget.
 *
 * Usage:
 *   <script src="https://YOUR_DOMAIN/embed.js" async></script>
 *
 * The frame size is driven by the chatbot: the widget measures itself and
 * posts width/height to the parent, so the iframe always matches the chatbot exactly.
 */
(function() {
  var script = document.currentScript;
  var baseUrl = script ? script.src.replace(/\/embed\.js(\?.*)?$/, '') : '';
  if (!baseUrl) return;

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/chat';
  iframe.title = 'AHOTEC Chat - Lucía';
  iframe.id = 'ahotec-chat-iframe';
  // Must match ChatWidget embed postMessage: 320px panel + 14px shadow pad = 334 (same closed vs open width).
  var closedW = 334;
  var closedH = 120;
  /** Widest iframe width used while open — closed state keeps this width so the frame doesn’t slide horizontally. */
  var iframeMaxW = 0;
  var resizeRaf = null;
  var pendingResize = null;
  var lastAppliedKey = '';

  function setSize(w, h) {
    iframe.style.width = w + 'px';
    iframe.style.height = h + 'px';
  }

  function setFrameStyle(open) {
    iframe.style.boxShadow = 'none';
    iframe.style.borderRadius = open ? '12px' : '20px';
    // Open: clip to exact panel (no inner page scroll). Closed: allow bubble/FAB shadows past the frame edge.
    iframe.style.overflow = open ? 'hidden' : 'visible';
  }

  setSize(closedW, closedH);
  setFrameStyle(false);
  var margin = 20;
  iframe.style.cssText = [
    'position: fixed',
    'bottom: ' + margin + 'px',
    'right: ' + margin + 'px',
    'width: ' + closedW + 'px',
    'height: ' + closedH + 'px',
    'border: none',
    'outline: none',
    'background: transparent',
    'box-shadow: none',
    'z-index: 2147483647',
    'overflow: visible',
    // No width/height transition: animated iframe resize fights postMessage sizing and causes flicker/collapse.
    'transition: border-radius 0.2s ease'
  ].join('; ');
  document.body.appendChild(iframe);

  function flushResize() {
    resizeRaf = null;
    var d = pendingResize;
    pendingResize = null;
    if (!d || d.type !== 'ahotec-chat-resize') return;

    var w = d.width;
    var h = d.height;
    var open = d.open;
    var vw = window.innerWidth || 400;
    var vh = window.innerHeight || 600;
    var gutter = margin * 2;
    var maxW = Math.max(200, vw - gutter);
    var maxH = Math.max(240, vh - gutter);

    var fw;
    var fh;

    if (!open) {
      if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
        var cw = iframeMaxW > 0 ? Math.max(w, iframeMaxW) : w;
        fw = Math.min(Math.round(cw), maxW);
        fh = Math.min(Math.round(h), maxH);
      } else {
        fw = closedW;
        fh = closedH;
      }
    } else if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
      fw = Math.min(Math.round(w), maxW);
      fh = Math.min(Math.round(h), maxH);
      iframeMaxW = Math.max(iframeMaxW, fw);
    } else {
      return;
    }

    var key = fw + 'x' + fh + ':' + !!open;
    if (key === lastAppliedKey) return;
    lastAppliedKey = key;
    setFrameStyle(!!open);
    setSize(fw, fh);
  }

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'ahotec-chat-resize') {
      pendingResize = e.data;
      if (resizeRaf == null) {
        resizeRaf = requestAnimationFrame(flushResize);
      }
    }
  });
})();
