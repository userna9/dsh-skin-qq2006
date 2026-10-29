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
     * The classic client is one window: a title bar that names the open
     * conversation, and a status strip along the bottom. The Web UI has no slot
     * for window chrome, so both are appended next to the app root — outside
     * React's tree they never get reconciled away — and the stylesheet reserves
     * their height on the app frame.
     */
    const TITLEBAR =
      '<span class="qq-wb-icon"></span>' +
      '<span class="qq-wb-title">QQ 2006</span>' +
      '<span class="qq-wb-doc"></span>' +
      '<span class="qq-wb-btns">' +
      '<i class="qq-wb-min"></i><i class="qq-wb-max"></i><i class="qq-wb-close"></i>' +
      "</span>";

    const STATUSBAR =
      '<span class="qq-sb-icons">' +
      "<i></i><i></i><i></i><i></i><i></i>" +
      "</span>" +
      '<span class="qq-sb-right">' +
      '<span class="qq-sb-safe"><b></b>安全</span>' +
      '<span class="qq-sb-clock"></span>' +
      "</span>";

    function mountChrome() {
      const bar = document.createElement("div");
      bar.className = "qq-windowbar";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = TITLEBAR;
      document.body.append(bar);

      const status = document.createElement("div");
      status.className = "qq-statusbar";
      status.setAttribute("aria-hidden", "true");
      status.innerHTML = STATUSBAR;
      document.body.append(status);

      return { bar, status };
    }

    /** Mirror the open conversation into the title bar, like "QQ 2006 – xxx". */
    function watchSession(bar) {
      const doc = bar.querySelector(".qq-wb-doc");
      let last = null;
      const sync = () => {
        const crumb = document.querySelector('[class*="_crumbCurrent"]');
        const name = crumb ? (crumb.textContent || "").trim() : "";
        if (name === last) return;
        last = name;
        doc.textContent = name ? "– " + name : "";
        doc.title = name;
      };
      sync();
      const timer = setInterval(sync, 900);
      return () => clearInterval(timer);
    }

    /** A ticking clock in the status strip, like the tray in the original. */
    function watchClock(status) {
      const clock = status.querySelector(".qq-sb-clock");
      const tick = () => {
        const d = new Date();
        clock.textContent =
          String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
        clock.title = d.toLocaleDateString();
      };
      tick();
      const timer = setInterval(tick, 15000);
      return () => clearInterval(timer);
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
        const { bar, status } = mountChrome();
        const stopSession = watchSession(bar);
        const stopClock = watchClock(status);
        return () => {
          stopSession();
          stopClock();
          bar.remove();
          status.remove();
        };
      }, "dsh-skin-qq2006: window chrome");
    }

    return { apply };
  },
});
