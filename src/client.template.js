/**
 * Browser half of dsh-skin-qq2006.
 *
 * The DSH Web UI loads client modules through a global module table: this file
 * registers one lazy factory whose id equals the package name. Everything the
 * skin creates lives inside `apply` and is released again through
 * `ctx.effect`, so disabling the plugin removes the stylesheet, the root
 * marker and the window chrome, and the stock interface comes back untouched.
 */
window.__ModuleLoader__.load({
  id: "dsh-skin-qq2006",
  factory() {
    const CSS = __CSS__;

    /**
     * The classic client is one window with one title bar. The Web UI has no
     * slot for window chrome, so the bar is appended next to the app root —
     * outside React's tree it never gets reconciled away — and the stylesheet
     * reserves its height on the app frame.
     */
    const CHROME =
      '<span class="qq-wb-icon"></span>' +
      '<span class="qq-wb-title">QQ 2006</span>' +
      '<span class="qq-wb-sub">DeepSeek Harness</span>' +
      '<span class="qq-wb-btns">' +
      '<i class="qq-wb-min"></i><i class="qq-wb-max"></i><i class="qq-wb-close"></i>' +
      "</span>";

    function mountChrome() {
      const bar = document.createElement("div");
      bar.className = "qq-windowbar";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = CHROME;
      document.body.append(bar);
      return bar;
    }

    function apply(ctx) {
      ctx.effect(() => {
        const root = document.documentElement;
        root.setAttribute("data-qq2006", "");
        return () => root.removeAttribute("data-qq2006");
      }, "dsh-skin-qq2006: root marker");

      ctx.effect(() => {
        const tag = document.createElement("style");
        tag.dataset.plugin = "dsh-skin-qq2006";
        tag.dataset.pluginCss = "dsh-skin-qq2006/skin.css";
        tag.textContent = CSS;
        document.head.append(tag);
        return () => tag.remove();
      }, "dsh-skin-qq2006: skin stylesheet");

      ctx.effect(() => {
        const bar = mountChrome();
        return () => bar.remove();
      }, "dsh-skin-qq2006: window chrome");
    }

    return { apply };
  },
});
