import { bangs } from "./bang";
import "./global.css";

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "leta";
  const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG);

  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Snabb*</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container">
          <input
            type="text"
            class="url-input"
            value="https://snabb.musen.dev?q=%s"
            readonly
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
        <div class="default-engine-container">
          <label for="default-engine">Select default search engine:</label>
          <input list="bangs-list" id="default-engine" class="default-engine-input" />
          <datalist id="bangs-list">
            ${bangs.map(bang => `<option value="[ !${bang.t} ] ${bang.s}" data-value="${bang.t}"></option>`).join('')}
          </datalist>
        </div>
      </div>
      <footer class="footer">
        <a href="https://www.musen.dev" target="_blank">musen</a>
        •
        <a href="https://bsky.app/profile/musen.dev" target="_blank">@musen.dev</a>
        •
        <a href="https://github.com/musenkishi/unduck" target="_blank">github</a>
        <p class="footer-footnote">*This is a fork of Theo's <a href="https://github.com/t3dotgg/unduck" target="_blank">Und*ck</a>. Adding more features e.g. it defaults to Mullvad's <a href="https://leta.mullvad.net/faq" target="_blank">Leta</a>, an anonymized search proxy, instead of plain Google.</p>
      </footer>
    </div>
  `;

  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;
  const defaultEngineInput = app.querySelector<HTMLInputElement>(".default-engine-input")!;

  // Set the default value of the input field
  if (defaultBang) {
    defaultEngineInput.value = `[ !${defaultBang.t} ] ${defaultBang.s}`;
  }

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });

  defaultEngineInput.addEventListener("change", () => {
    const selectedOption = document.querySelector(`#bangs-list option[value="${defaultEngineInput.value}"]`) as HTMLOptionElement;
    if (selectedOption) {
      const selectedBang = selectedOption.getAttribute("data-value");
      localStorage.setItem("default-bang", selectedBang!);
    }
  });
}

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "leta";
const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG);

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/")
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
