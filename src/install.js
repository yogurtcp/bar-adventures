import { icon } from "./race-art.js";
const ICON = new URL("../assets/app-v1/bar-192.png", import.meta.url).href;
const displayMode = matchMedia("(display-mode: standalone)");
let installPrompt = null;
let installed = false;
const standalone = () =>
  installed || displayMode.matches || navigator.standalone === true;
const refresh = () => {
  const b = document.getElementById("install");
  if (b) b.hidden = standalone();
};
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  refresh();
  const offer = document.getElementById("install-native");
  if (offer) offer.hidden = false;
});
window.addEventListener("appinstalled", () => {
  installed = true;
  installPrompt = null;
  document.getElementById("install-dialog")?.close();
  refresh();
});
displayMode.addEventListener("change", refresh);
export function installButton() {
  return standalone()
    ? ""
    : `<button type="button" class="icon-button install-button" id="install" aria-label="Install Bar’s Adventures" title="Install Bar’s Adventures"><img src="${ICON}" alt=""/><span>${icon("install")}</span></button>`;
}
async function promptInstall() {
  const event = installPrompt;
  if (!event) return false;
  installPrompt = null;
  try {
    const result = await event.prompt();
    const choice = result || (await event.userChoice);
    if (choice?.outcome === "accepted") {
      installed = true;
      refresh();
      document.getElementById("install-dialog")?.close();
    }
    return true;
  } catch {
    return false;
  }
}
function showGuide() {
  if (document.getElementById("install-dialog")) return;
  const apple =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/.test(navigator.userAgent);
  const steps = apple
    ? [
        "Open the browser’s Share menu " + icon("share") + ".",
        "Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>. If offered, keep <strong>Open as Web App</strong> on.",
      ]
    : android
      ? [
          "Open Chrome’s three-dot menu <strong>⋮</strong>.",
          "Choose <strong>Install app</strong> or <strong>Add to Home screen → Install</strong>.",
        ]
      : [
          "Open your browser’s app-install icon in the address bar or its menu.",
          "Choose <strong>Install Bar’s Adventures</strong> or <strong>Install this site as an app</strong>.",
        ];
  const dialog = document.createElement("dialog");
  dialog.id = "install-dialog";
  dialog.className = "install-dialog";
  dialog.innerHTML = `<button type="button" class="icon-button install-close" aria-label="Close install instructions">${icon("close")}</button><img class="install-portrait" src="${ICON}" alt="Smiling Bar"/><h2>Install Bar’s Adventures</h2><p>Add Bar to your home screen, then open his icon to play in an app window without browser tabs.</p><ol>${steps.map((step) => `<li>${step}</li>`).join("")}</ol><p class="install-note">Already installed? Open Bar’s icon from your home screen or app list.</p><button type="button" id="install-native" class="install-native" ${installPrompt ? "" : "hidden"}>${icon("install")} Install</button>`;
  const app = document.getElementById("app");
  const previous = document.activeElement;
  const close = () => {
    app.inert = false;
    dialog.remove();
    if (previous?.isConnected) previous.focus();
  };
  dialog.addEventListener("close", close, { once: true });
  dialog.querySelector(".install-close").onclick = () => dialog.close();
  dialog.querySelector("#install-native").onclick = async () => {
    const b = dialog.querySelector("#install-native");
    b.disabled = true;
    if (await promptInstall()) {
      if (dialog.open) dialog.close();
    } else b.disabled = false;
  };
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  document.body.append(dialog);
  app.inert = true;
  dialog.showModal();
}
export function bindInstallButton(root) {
  root.querySelector("#install")?.addEventListener("click", async (event) => {
    const b = event.currentTarget;
    b.disabled = true;
    const offered = await promptInstall();
    b.disabled = false;
    if (!offered) showGuide();
  });
  refresh();
}
// The stable root URL gives the worker the same scope as the manifest on both
// localhost and GitHub Pages. An update waits for existing game tabs to close.
if ("serviceWorker" in navigator && isSecureContext) {
  const root = new URL("../", import.meta.url);
  navigator.serviceWorker
    .register(new URL("sw.js", root), {
      scope: root.pathname,
      updateViaCache: "none",
    })
    .catch(() => {});
}
