/**
 * Browser half of dsh-skin-qq2006.
 *
 * The DSH Web UI loads client modules through a global module table: this file
 * registers one lazy factory whose id equals the package name. Everything the
 * skin touches is created inside `apply` through `ctx.effect`, so disabling the
 * plugin (or a hot reload) removes the <style> element and the root marker
 * again and the stock interface comes back untouched.
 */
window.__ModuleLoader__.load({
  id: "dsh-skin-qq2006",
  factory() {
    const CSS = __CSS__;

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
    }

    return { apply };
  },
});
