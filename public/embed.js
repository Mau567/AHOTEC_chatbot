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
  // Initial closed size: wide enough for the greeting card layout before the first resize message (avoids narrow iframe reflow).
  var closedW = 288;
  var closedH = 120;

  function setSize(w, h) {
    iframe.style.width = w + 'px';
    iframe.style.height = h + 'px';
  }

  function setFrameStyle(open) {
    iframe.style.boxShadow = 'none';
    // Rounded rectangle when closed so the greeting card (above the FAB) is not clipped by a circle.
    iframe.style.borderRadius = open ? '12px' : '20px';
    iframe.style.overflow = 'visible';
  }

  setSize(closedW, closedH);
  setFrameStyle(false);
  iframe.style.cssText = [
    'position: fixed',
    'bottom: 20px',
    'right: 20px',
    'width: ' + closedW + 'px',
    'height: ' + closedH + 'px',
    'border: none',
    'outline: none',
    'background: transparent',
    'box-shadow: none',
    'z-index: 2147483647',
    'overflow: visible',
    'transition: width 0.2s ease, height 0.2s ease, border-radius 0.2s ease'
  ].join('; ');
  document.body.appendChild(iframe);

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'ahotec-chat-resize') {
      var w = e.data.width;
      var h = e.data.height;
      var open = e.data.open;
      if (!open) {
        // Closed: use widget-reported size (bubble + button) when provided, else compact button-only.
        if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
          setSize(w, h);
        } else {
          setSize(closedW, closedH);
        }
        setFrameStyle(false);
      } else if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
        if (h > (window.innerHeight || 500) - 40) {
          h = (window.innerHeight || 500) - 40;
        }
        setSize(w, h);
        setFrameStyle(true);
      }
    }
  });
})();
