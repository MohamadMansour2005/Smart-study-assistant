const COGNITO_DOMAIN = "https://us-east-1rrvxfdy3b.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "2q9po6er7i28hfpj1lin9r4qnr";
const REDIRECT_URI = "http://localhost:5500/frontend/index.html";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const PUBLIC_PAGES = [
  "/frontend/login.html"
];

function buildLoginUrl() {
  return (
    `${COGNITO_DOMAIN}/login` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&scope=email+openid` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
  );
}

function buildLogoutUrl() {
  return (
    `${COGNITO_DOMAIN}/logout` +
    `?client_id=${CLIENT_ID}` +
    `&logout_uri=${encodeURIComponent(REDIRECT_URI)}`
  );
}

function getCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

function isLoggedIn() {
  return !!localStorage.getItem("authCode");
}

function login() {
  window.location.href = buildLoginUrl();
}

function logout() {
  localStorage.removeItem("authCode");
  window.location.href = buildLogoutUrl();
}

function protectPage() {
  const currentPath = window.location.pathname;

  if (PUBLIC_PAGES.includes(currentPath)) {
    return;
  }

  const code = getCodeFromUrl();

  if (code) {
    localStorage.setItem("authCode", code);
    window.history.replaceState({}, document.title, REDIRECT_URI);
    return;
  }

  if (!isLoggedIn()) {
    window.location.href = buildLoginUrl();
  }
}

function updateAuthButtons() {
  if (!loginBtn || !logoutBtn) return;

  if (isLoggedIn()) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

loginBtn?.addEventListener("click", login);
logoutBtn?.addEventListener("click", logout);

protectPage();
updateAuthButtons();