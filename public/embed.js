/**
 * AHOTEC Chat Widget - Embed script for external websites
 * Add this script to any webpage to show the floating chat widget.
 *
 * Usage:
 *   <script src="https://YOUR_DOMAIN/embed.js" async></script>
 *
 * The script will create a floating iframe pointing to YOUR_DOMAIN/embed/chat
 */
(function() {
  var script = document.currentScript;
  var baseUrl = script ? script.src.replace(/\/embed\.js(\?.*)?$/, '') : '';
  if (!baseUrl) return;

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/chat';
  iframe.title = 'AHOTEC Chat - Lucía';
  iframe.style.cssText = [
    'position: fixed',
    'bottom: 20px',
    'right: 20px',
    'width: 380px',
    'height: 520px',
    'max-height: calc(100vh - 40px)',
    'border: none',
    'border-radius: 12px',
    'box-shadow: 0 4px 24px rgba(0,0,0,0.15)',
    'z-index: 2147483647'
  ].join('; ');
  document.body.appendChild(iframe);
})();
