(function () {
  if (new URLSearchParams(location.search).get("embed") !== "1") return;

  document.documentElement.classList.add("embed");

  var pane = new URLSearchParams(location.search).get("pane");

  function showPane(name) {
    if (!name) return;
    document.querySelectorAll(".nav-item[data-pane]").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.pane === name);
    });
    document.querySelectorAll(".pane").forEach(function (p) {
      p.classList.toggle("on", p.id === "pane-" + name);
    });
    var iframe = document.querySelector("#pane-" + name + " iframe[data-src]");
    if (iframe && (!iframe.src || iframe.src.endsWith("about:blank"))) {
      var loader = iframe.closest(".iframe-wrap")?.querySelector(".iframe-loading");
      iframe.addEventListener(
        "load",
        function () {
          iframe.classList.add("loaded");
          if (loader) loader.classList.add("gone");
        },
        { once: true },
      );
      iframe.src = iframe.dataset.src;
    }
  }

  function init() {
    if (pane) showPane(pane);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
