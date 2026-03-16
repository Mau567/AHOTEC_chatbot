/**
 * AHOTEC Chat Widget - Embed script for external websites
 * Add this script to any webpage to show the floating chat widget.
 *
 * Usage:
 *   <script src="https://YOUR_DOMAIN/embed.js" async></script>
 *
 * The iframe is only the size of the button when closed, so it doesn't block the page.
 * When the user opens the chat, the iframe expands to show the panel.
 */
(function() {
  var script = document.currentScript;
  var baseUrl = script ? script.src.replace(/\/embed\.js(\?.*)?$/, '') : '';
  if (!baseUrl) return;

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/chat';
  iframe.title = 'AHOTEC Chat - Lucía';
  iframe.id = 'ahotec-chat-iframe';
  // When closed: minimal fit for chat button + language button, no visible frame
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
    iframe.style.borderRadius = '9999px'; // pill so it hugs the round button
  }

  function setOpenStyle() {
    setSize(openWidth, Math.min(openHeight, (window.innerHeight || 500) - 40));
    iframe.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15)';
    iframe.style.borderRadius = '12px';
  }

  setClosedStyle();
  iframe.style.cssText = [
    'position: fixed',
    'bottom: 20px',
    'right: 20px',
    'border: none',
    'background: transparent',
    'z-index: 2147483647',
    'transition: width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease, border-radius 0.2s ease'
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
