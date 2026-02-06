(function () {
  function render(el, data) {
    el.innerHTML = `
      <div style="border:1px solid #222;padding:12px;border-radius:6px;font-family:Arial,sans-serif;">
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#777;">ICI.ndex</div>
        <div style="font-size:20px;font-weight:700;margin:6px 0;color:#111;">${data.score}/100</div>
        <div style="font-size:12px;color:#444;">Signal: ${data.signal}</div>
      </div>
    `;
  }

  window.ICIWidget = {
    load: async function (selector, apiKey, apiBase) {
      const el = document.querySelector(selector);
      if (!el) return;
      const res = await fetch(`${apiBase}/v1/index`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      const data = await res.json();
      render(el, data);
    }
  };
})();
