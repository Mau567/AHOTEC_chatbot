/**
 * AHOTEC Chat Widget - Embed script for external websites
 * Add this script to any webpage to show the floating chat widget.
 *
 * Usage:
 *   <script src="https://YOUR_DOMAIN/embed.js" async></script>
 *
 * Frame is fully invisible (no border, shadow, or background). When closed,
 * the iframe is only the size of the buttons so the rest of the page works normally.
 */
(function() {
  var script = document.currentScript;
  var baseUrl = script ? script.src.replace(/\/embed\.js(\?.*)?$/, '') : '';
  if (!baseUrl) return;

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/chat';
  iframe.title = 'AHOTEC Chat - Lucía';
  iframe.id = 'ahotec-chat-iframe';
  var closedWidth = 70;
  var closedHeight = 88;
  var openWidth = 340;
  var openHeight = 420;

  function setSize(w, h) {
    iframe.style.width = w + 'px';
    iframe.style.height = h + 'px';
  }

  function setClosedStyle() {
    setSize(closedWidth, closedHeight);
    iframe.style.boxShadow = 'none';
    iframe.style.borderRadius = '9999px';
  }

  function setOpenStyle() {
    setSize(openWidth, Math.min(openHeight, (window.innerHeight || 500) - 40));
    iframe.style.boxShadow = 'none'; // keep frame invisible when open too; panel has its own shadow
    iframe.style.borderRadius = '12px';
  }

  setClosedStyle();
  // Fully invisible frame: no border, no shadow, transparent, no outline
  iframe.style.cssText = [
    'position: fixed',
    'bottom: 20px',
    'right: 20px',
    'border: none',
    'outline: none',
    'background: transparent',
    'box-shadow: none',
    'z-index: 2147483647',
    'transition: width 0.2s ease, height 0.2s ease, border-radius 0.2s ease'
  ].join('; ');
  document.body.appendChild(iframe);

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'ahotec-chat-resize') {
      if (e.data.open) {
        setOpenStyle();
      } else {
        setClosedStyle();
      }
    }
  });
})();
