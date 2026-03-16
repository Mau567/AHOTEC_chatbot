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
  // Initial size (chat button + language button with room); widget will send actual size once loaded
  var fallbackW = 100;
  var fallbackH = 130;

  function setSize(w, h) {
    iframe.style.width = (w || fallbackW) + 'px';
    iframe.style.height = (h || fallbackH) + 'px';
  }

  function setFrameStyle(open) {
    iframe.style.boxShadow = 'none';
    iframe.style.borderRadius = open ? '12px' : '9999px';
  }

  setSize(fallbackW, fallbackH);
  setFrameStyle(false);
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
      var w = e.data.width;
      var h = e.data.height;
      var open = e.data.open;
      if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
        if (open && h > (window.innerHeight || 500) - 40) {
          h = (window.innerHeight || 500) - 40;
        }
        setSize(w, h);
      }
      setFrameStyle(!!open);
    }
  });
})();
