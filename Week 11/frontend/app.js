const API_BASE = "http://localhost:5000/api";

const tabSignup = document.getElementById("tab-signup");
const tabLogin = document.getElementById("tab-login");
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const syncForm = document.getElementById("sync-form");
const fetchLatestBtn = document.getElementById("fetch-latest");
const logoutBtn = document.getElementById("logout");
const authMessage = document.getElementById("auth-message");
const syncMessage = document.getElementById("sync-message");
const latestOutput = document.getElementById("latest-output");

const setMessage = (element, text, isError = false) => {
  element.textContent = text;
  element.classList.toggle("error", isError);
};

const saveToken = (token) => localStorage.setItem("jwt_token", token);
const getToken = () => localStorage.getItem("jwt_token");
const clearToken = () => localStorage.removeItem("jwt_token");
const saveRefreshToken = (token) => localStorage.setItem("refresh_token", token);
const getRefreshToken = () => localStorage.getItem("refresh_token");
const clearRefreshToken = () => localStorage.removeItem("refresh_token");

const setTab = (activeTab) => {
  const signupActive = activeTab === "signup";
  tabSignup.classList.toggle("active", signupActive);
  tabLogin.classList.toggle("active", !signupActive);
  signupForm.classList.toggle("active", signupActive);
  loginForm.classList.toggle("active", !signupActive);
};

tabSignup.addEventListener("click", () => setTab("signup"));
tabLogin.addEventListener("click", () => setTab("login"));

const apiRequest = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token found. Please login again.");
  }

  const result = await apiRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });

  saveToken(result.token);
  if (result.refreshToken) {
    saveRefreshToken(result.refreshToken);
  }

  return result.token;
};

const apiRequestWithAutoRefresh = async (path, options = {}) => {
  const token = getToken();
  try {
    return await apiRequest(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    if (!error.message.toLowerCase().includes("token")) {
      throw error;
    }

    const newToken = await refreshAccessToken();
    return apiRequest(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newToken}`
      }
    });
  }
};

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(authMessage, "Creating account...");

  try {
    const body = {
      name: document.getElementById("signup-name").value.trim(),
      email: document.getElementById("signup-email").value.trim(),
      password: document.getElementById("signup-password").value
    };

    const result = await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body)
    });

    saveToken(result.token);
    saveRefreshToken(result.refreshToken);
    setMessage(authMessage, `Welcome ${result.user.name}. JWT saved.`, false);
    signupForm.reset();
  } catch (error) {
    setMessage(authMessage, error.message, true);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(authMessage, "Signing in...");

  try {
    const body = {
      email: document.getElementById("login-email").value.trim(),
      password: document.getElementById("login-password").value
    };

    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    });

    saveToken(result.token);
    saveRefreshToken(result.refreshToken);
    setMessage(authMessage, `Signed in as ${result.user.email}`, false);
    loginForm.reset();
  } catch (error) {
    setMessage(authMessage, error.message, true);
  }
});

syncForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!getToken()) {
    setMessage(syncMessage, "Login/signup first to get a JWT token.", true);
    return;
  }

  setMessage(syncMessage, "Syncing encrypted wearable profile...");

  try {
    const body = {
      provider: document.getElementById("provider").value.trim(),
      deviceId: document.getElementById("device-id").value.trim(),
      profileData: {
        steps: Number(document.getElementById("steps").value),
        heartRate: Number(document.getElementById("heart-rate").value),
        sleepHours: Number(document.getElementById("sleep-hours").value),
        spo2: Number(document.getElementById("spo2").value),
        stress: Number(document.getElementById("stress").value)
      }
    };

    const result = await apiRequestWithAutoRefresh("/profiles/sync", {
      method: "POST",
      body: JSON.stringify(body)
    });

    setMessage(syncMessage, `${result.message} (${new Date(result.syncedAt).toLocaleString()})`, false);
    syncForm.reset();
  } catch (error) {
    setMessage(syncMessage, error.message, true);
  }
});

fetchLatestBtn.addEventListener("click", async () => {
  if (!getToken()) {
    setMessage(syncMessage, "No JWT token found. Please login first.", true);
    return;
  }

  setMessage(syncMessage, "Fetching latest profile...");

  try {
    const result = await apiRequestWithAutoRefresh("/profiles/latest", {
      method: "GET"
    });

    latestOutput.textContent = JSON.stringify(result, null, 2);
    setMessage(syncMessage, "Latest profile loaded.", false);
  } catch (error) {
    setMessage(syncMessage, error.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken })
      });
    } catch {
      // Force local logout even if network call fails.
    }
  }

  clearToken();
  clearRefreshToken();
  setMessage(authMessage, "Logged out and tokens removed.", false);
  setMessage(syncMessage, "", false);
});

if (getToken()) {
  setMessage(authMessage, "JWT already present in local storage.", false);
}
