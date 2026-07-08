(function () {
  "use strict";

  const config = window.GRAM_KAPOORPUR_CONFIG || {};
  const endpoint = String(config.socialEndpoint || config.formEndpoint || "").trim();
  const demoKey = "gramKapoorpurSocialDemo";
  const sessionKey = "gramKapoorpurSocialSession";
  const state = {
    endpoint,
    mode: endpoint ? "shared" : "demo",
    token: localStorage.getItem(sessionKey) || "",
    user: null,
    data: null,
    activeView: "feed"
  };

  const seedData = {
    users: [
      {
        userId: "u_manoj",
        name: "Manoj Singh Sikarwar",
        phone: "9000000000",
        passwordHash: "",
        village: "Kapoorpur",
        profession: "Admin",
        bio: "ग्राम कपूरपुर डिजिटल परिवार में आपका स्वागत है।",
        createdAt: new Date().toISOString(),
        status: ""
      },
      {
        userId: "u_sita",
        name: "Sita Devi",
        phone: "",
        passwordHash: "",
        village: "Kapoorpur",
        profession: "Self help group",
        bio: "",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: ""
      }
    ],
    posts: [
      {
        postId: "p_welcome",
        userId: "u_manoj",
        content: "नमस्ते कपूरपुर! यह गांव की अपनी सोशल चौपाल है। यहां सूचना, शुभकामना, मदद और मनोरंजन शेयर करें।",
        category: "update",
        mediaUrl: "",
        createdAt: new Date().toISOString(),
        status: ""
      },
      {
        postId: "p_fun",
        userId: "u_sita",
        content: "आज का सवाल: कपूरपुर में बच्चों के लिए कौन सी नई activity शुरू होनी चाहिए?",
        category: "fun",
        mediaUrl: "",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: ""
      }
    ],
    comments: [
      {
        commentId: "c_1",
        postId: "p_welcome",
        userId: "u_sita",
        content: "बहुत अच्छा प्रयास।",
        createdAt: new Date().toISOString(),
        status: ""
      }
    ],
    reactions: []
  };

  const questions = [
    "कपूरपुर की सबसे प्यारी जगह कौन सी है?",
    "गांव में बच्चों के लिए कौन सी activity होनी चाहिए?",
    "किस सरकारी सेवा की जानकारी वेबसाइट पर पहले चाहिए?",
    "गांव की कौन सी पुरानी याद आपको सबसे ज्यादा पसंद है?"
  ];

  const $ = (selector) => document.querySelector(selector);

  function init() {
    const badge = $("#modeBadge");
    if (state.mode === "shared") {
      badge.textContent = "Live";
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
    bindEvents();
    loadSession();
  }

  function bindEvents() {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
      button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
    });

    $("#loginForm").addEventListener("submit", handleLogin);
    $("#registerForm").addEventListener("submit", handleRegister);
    $("#logoutButton").addEventListener("click", logout);
    $("#postForm").addEventListener("submit", handlePost);
    $("#profileForm").addEventListener("submit", handleProfile);
    $("#memberSearch").addEventListener("input", renderMembers);
    $("#answerButton").addEventListener("click", () => {
      $("#riddleAnswer").hidden = !$("#riddleAnswer").hidden;
    });

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => showView(button.dataset.view));
    });

    document.querySelectorAll("[data-fun-post]").forEach((button) => {
      button.addEventListener("click", () => startFunPost(button.dataset.funPost));
    });
  }

  async function loadSession() {
    if (!state.token) {
      showAuth();
      return;
    }

    const result = await request({ action: "social_feed", token: state.token });
    if (!result.ok) {
      localStorage.removeItem(sessionKey);
      state.token = "";
      showAuth();
      return;
    }

    state.user = result.user;
    state.data = result.data;
    showApp();
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const phone = cleanPhone(form.phone.value);
    const passwordHash = await hashPassword(phone, form.password.value);
    setAuthNote("Login हो रहा है...");

    const result = await request({
      action: "social_login",
      phone,
      passwordHash
    });

    if (!result.ok) {
      setAuthNote(result.error || "Login नहीं हुआ।", true);
      return;
    }

    completeLogin(result);
  }

  async function handleRegister(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const phone = cleanPhone(form.phone.value);
    const passwordHash = await hashPassword(phone, form.password.value);

    if (phone.length < 10) {
      setAuthNote("कृपया सही मोबाइल नंबर लिखें।", true);
      return;
    }

    setAuthNote("Account बन रहा है...");

    const result = await request({
      action: "social_register",
      name: form.name.value.trim(),
      phone,
      passwordHash,
      village: form.village.value.trim() || "Kapoorpur",
      profession: form.profession.value.trim()
    });

    if (!result.ok) {
      setAuthNote(result.error || "Account नहीं बना।", true);
      return;
    }

    completeLogin(result);
  }

  function completeLogin(result) {
    state.token = result.token;
    state.user = result.user;
    state.data = result.data;
    localStorage.setItem(sessionKey, state.token);
    showApp();
    toast("Welcome, " + state.user.name);
  }

  async function handlePost(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const content = form.content.value.trim();
    if (!content) return;

    const result = await request({
      action: "social_post",
      token: state.token,
      content,
      category: form.category.value,
      mediaUrl: form.mediaUrl.value.trim()
    });

    if (!result.ok) {
      toast(result.error || "Post save नहीं हुआ।");
      return;
    }

    form.reset();
    updateSnapshot(result);
    toast("Post added");
  }

  async function handleReaction(postId) {
    const result = await request({
      action: "social_react",
      token: state.token,
      postId,
      type: "like"
    });

    if (!result.ok) {
      toast(result.error || "Like save नहीं हुआ।");
      return;
    }

    updateSnapshot(result);
  }

  async function handleComment(event, postId) {
    event.preventDefault();
    const input = event.currentTarget.elements.comment;
    const content = input.value.trim();
    if (!content) return;

    const result = await request({
      action: "social_comment",
      token: state.token,
      postId,
      content
    });

    if (!result.ok) {
      toast(result.error || "Comment save नहीं हुआ।");
      return;
    }

    input.value = "";
    updateSnapshot(result);
  }

  async function handleProfile(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = await request({
      action: "social_profile_update",
      token: state.token,
      name: form.name.value.trim(),
      village: form.village.value.trim(),
      profession: form.profession.value.trim(),
      bio: form.bio.value.trim()
    });

    if (!result.ok) {
      toast(result.error || "Profile save नहीं हुई।");
      return;
    }

    state.user = result.user;
    updateSnapshot(result);
    toast("Profile saved");
  }

  async function request(payload) {
    return state.mode === "shared" ? sharedRequest(payload) : demoRequest(payload);
  }

  function sharedRequest(payload) {
    return new Promise((resolve) => {
      const callbackName = "gramSocialCallback_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        cleanup();
        resolve({ ok: false, error: "Shared backend response नहीं आया। Apps Script URL check करें।" });
      }, 12000);

      window[callbackName] = (result) => {
        cleanup();
        resolve(result || { ok: false, error: "Empty response." });
      };

      function cleanup() {
        clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
      }

      const url = new URL(state.endpoint);
      url.searchParams.set("callback", callbackName);
      url.searchParams.set("payload", JSON.stringify(payload));
      script.src = url.toString();
      script.onerror = () => {
        cleanup();
        resolve({ ok: false, error: "Apps Script URL load नहीं हुआ।" });
      };
      document.body.appendChild(script);
    });
  }

  async function demoRequest(payload) {
    await tinyDelay();
    const data = getDemoData();
    const now = new Date().toISOString();

    if (payload.action === "social_register") {
      if (data.users.some((user) => cleanPhone(user.phone) === payload.phone && !isHidden(user))) {
        return fail("इस मोबाइल नंबर से account पहले से है।");
      }
      const user = {
        userId: "u_" + Date.now(),
        name: payload.name,
        phone: payload.phone,
        passwordHash: payload.passwordHash,
        village: payload.village || "Kapoorpur",
        profession: payload.profession || "",
        bio: "",
        createdAt: now,
        lastLogin: now,
        status: ""
      };
      data.users.push(user);
      saveDemoData(data);
      return loginResponse(user, "demo_" + user.userId, data);
    }

    if (payload.action === "social_login") {
      const user = data.users.find((item) => cleanPhone(item.phone) === payload.phone && item.passwordHash === payload.passwordHash && !isHidden(item));
      if (!user) return fail("मोबाइल नंबर या password गलत है।");
      user.lastLogin = now;
      saveDemoData(data);
      return loginResponse(user, "demo_" + user.userId, data);
    }

    const user = userFromToken(payload.token, data);
    if (!user) return fail("Session खत्म हो गया। Login करें।");

    if (payload.action === "social_feed") {
      return loginResponse(user, payload.token, data);
    }

    if (payload.action === "social_post") {
      data.posts.push({
        postId: "p_" + Date.now(),
        userId: user.userId,
        content: payload.content.slice(0, 700),
        category: payload.category || "update",
        mediaUrl: payload.mediaUrl || "",
        createdAt: now,
        status: ""
      });
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    if (payload.action === "social_react") {
      const existing = data.reactions.find((item) => item.postId === payload.postId && item.userId === user.userId && item.type === payload.type);
      if (existing) {
        data.reactions = data.reactions.filter((item) => item !== existing);
      } else {
        data.reactions.push({
          reactionId: "r_" + Date.now(),
          postId: payload.postId,
          userId: user.userId,
          type: payload.type,
          createdAt: now,
          status: ""
        });
      }
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    if (payload.action === "social_comment") {
      data.comments.push({
        commentId: "c_" + Date.now(),
        postId: payload.postId,
        userId: user.userId,
        content: payload.content.slice(0, 300),
        createdAt: now,
        status: ""
      });
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    if (payload.action === "social_profile_update") {
      user.name = payload.name || user.name;
      user.village = payload.village || "";
      user.profession = payload.profession || "";
      user.bio = payload.bio || "";
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    return fail("Unknown action.");
  }

  function showAuth() {
    $("#authScreen").hidden = false;
    $("#appShell").hidden = true;
    $("#logoutButton").hidden = true;
  }

  function showApp() {
    $("#authScreen").hidden = true;
    $("#appShell").hidden = false;
    $("#logoutButton").hidden = false;
    hydrateUser();
    renderAll();
  }

  function hydrateUser() {
    const initial = initials(state.user.name);
    $("#sideAvatar").textContent = initial;
    $("#composerAvatar").textContent = initial;
    $("#sideName").textContent = state.user.name;
    $("#composerName").textContent = state.user.name;
    $("#sideMeta").textContent = [state.user.village, state.user.profession].filter(Boolean).join(" | ") || "Kapoorpur";
    const form = $("#profileForm");
    form.name.value = state.user.name || "";
    form.village.value = state.user.village || "";
    form.profession.value = state.user.profession || "";
    form.bio.value = state.user.bio || "";
  }

  function renderAll() {
    $("#dailyQuestion").textContent = questions[new Date().getDate() % questions.length];
    $("#sideQuestion").textContent = questions[(new Date().getDate() + 1) % questions.length];
    renderFeed();
    renderMembers();
    renderNewMembers();
  }

  function renderFeed() {
    const posts = activeItems(state.data.posts)
      .slice()
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    $("#feedList").innerHTML = posts.length ? posts.map(renderPost).join("") : `<p class="empty-state">अभी कोई पोस्ट नहीं है। पहली पोस्ट आप करें।</p>`;

    document.querySelectorAll("[data-like]").forEach((button) => {
      button.addEventListener("click", () => handleReaction(button.dataset.like));
    });

    document.querySelectorAll("[data-comment-form]").forEach((form) => {
      form.addEventListener("submit", (event) => handleComment(event, form.dataset.commentForm));
    });
  }

  function renderPost(post) {
    const user = findUser(post.userId);
    const reactions = activeItems(state.data.reactions).filter((item) => item.postId === post.postId);
    const comments = activeItems(state.data.comments).filter((item) => item.postId === post.postId);
    const liked = reactions.some((item) => item.userId === state.user.userId && item.type === "like");
    const image = safeMedia(post.mediaUrl);

    return `
      <article class="post-card">
        <div class="post-head">
          <div class="avatar">${escapeHtml(initials(user.name))}</div>
          <div>
            <h3>${escapeHtml(user.name)}</h3>
            <small>${timeAgo(post.createdAt)} | ${escapeHtml(categoryLabel(post.category))}</small>
          </div>
        </div>
        <div class="post-body">
          ${escapeHtml(post.content)}
          ${image ? `<a class="post-media" href="${escapeAttr(image)}" target="_blank" rel="noopener"><img src="${escapeAttr(image)}" alt="Post media" loading="lazy"></a>` : ""}
        </div>
        <div class="post-actions">
          <button type="button" class="${liked ? "active" : ""}" data-like="${escapeAttr(post.postId)}">Like ${reactions.length}</button>
          <button type="button" onclick="document.getElementById('comment_${escapeAttr(post.postId)}').focus()">Comment ${comments.length}</button>
        </div>
        <div class="comments">
          ${comments.map(renderComment).join("")}
          <form class="comment-form" data-comment-form="${escapeAttr(post.postId)}">
            <input id="comment_${escapeAttr(post.postId)}" name="comment" type="text" maxlength="300" placeholder="Comment लिखें...">
            <button type="submit">Send</button>
          </form>
        </div>
      </article>
    `;
  }

  function renderComment(comment) {
    const user = findUser(comment.userId);
    return `
      <div class="comment">
        <strong>${escapeHtml(user.name)}</strong>
        <small>${timeAgo(comment.createdAt)}</small>
        <span>${escapeHtml(comment.content)}</span>
      </div>
    `;
  }

  function renderMembers() {
    const query = $("#memberSearch").value.trim().toLowerCase();
    const users = activeItems(state.data.users)
      .filter((user) => {
        return [user.name, user.village, user.profession].join(" ").toLowerCase().includes(query);
      })
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

    $("#memberGrid").innerHTML = users.length ? users.map((user) => `
      <article class="member-card">
        <div class="avatar">${escapeHtml(initials(user.name))}</div>
        <div>
          <h2>${escapeHtml(user.name)}</h2>
          <p>${escapeHtml([user.profession, user.village].filter(Boolean).join(" | ") || "Kapoorpur")}</p>
        </div>
      </article>
    `).join("") : `<p class="empty-state">कोई सदस्य नहीं मिला।</p>`;
  }

  function renderNewMembers() {
    const members = activeItems(state.data.users)
      .slice()
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, 5);
    $("#newMembers").innerHTML = members.map((user) => `<span>${escapeHtml(user.name)}</span>`).join("");
  }

  function showView(view) {
    state.activeView = view;
    ["feed", "members", "entertainment", "profile"].forEach((name) => {
      $(`#${name}View`).hidden = name !== view;
    });
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === view);
    });
  }

  function switchAuthTab(tab) {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.authTab === tab);
    });
    $("#loginForm").hidden = tab !== "login";
    $("#registerForm").hidden = tab !== "register";
    setAuthNote("");
  }

  function startFunPost(type) {
    showView("feed");
    const textarea = $("#postForm textarea");
    const text = {
      question: `आज का सवाल: ${$("#dailyQuestion").textContent}\nमेरा जवाब: `,
      memory: "गांव की मेरी प्यारी याद: ",
      wish: "कपूरपुर परिवार को शुभकामनाएं: ",
      chaupal: `चौपाल सवाल: ${$("#sideQuestion").textContent}\nमेरा सुझाव: `
    }[type] || "";
    textarea.value = text;
    textarea.focus();
  }

  function updateSnapshot(result) {
    state.user = result.user || state.user;
    state.data = result.data || state.data;
    hydrateUser();
    renderAll();
  }

  function logout() {
    localStorage.removeItem(sessionKey);
    state.token = "";
    state.user = null;
    showAuth();
    toast("Logout हो गया");
  }

  function getDemoData() {
    const saved = localStorage.getItem(demoKey);
    if (!saved) {
      localStorage.setItem(demoKey, JSON.stringify(seedData));
      return clone(seedData);
    }
    try {
      return JSON.parse(saved);
    } catch (error) {
      localStorage.setItem(demoKey, JSON.stringify(seedData));
      return clone(seedData);
    }
  }

  function saveDemoData(data) {
    localStorage.setItem(demoKey, JSON.stringify(data));
  }

  function userFromToken(token, data) {
    if (!token || !token.startsWith("demo_")) return null;
    const userId = token.replace(/^demo_/, "");
    return data.users.find((user) => user.userId === userId && !isHidden(user));
  }

  function loginResponse(user, token, data) {
    return {
      ok: true,
      token,
      user: publicUser(user),
      data: publicSnapshot(data)
    };
  }

  function publicSnapshot(data) {
    return {
      users: activeItems(data.users).map(publicUser),
      posts: activeItems(data.posts),
      comments: activeItems(data.comments),
      reactions: activeItems(data.reactions)
    };
  }

  function publicUser(user) {
    return {
      userId: user.userId,
      name: user.name,
      village: user.village,
      profession: user.profession,
      bio: user.bio,
      createdAt: user.createdAt,
      status: user.status
    };
  }

  function findUser(userId) {
    return activeItems(state.data.users).find((user) => user.userId === userId) || { name: "Kapoorpur Member" };
  }

  function activeItems(items) {
    return (items || []).filter((item) => !isHidden(item));
  }

  function isHidden(item) {
    return ["hidden", "deleted"].includes(String(item.status || "").toLowerCase());
  }

  function categoryLabel(value) {
    return {
      update: "Update",
      photo: "Photo",
      festival: "Festival",
      help: "Help",
      fun: "Fun"
    }[value] || "Update";
  }

  function safeMedia(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol) ? url : "";
    } catch (error) {
      return "";
    }
  }

  function cleanPhone(value) {
    return String(value || "").replace(/[^\d]/g, "").slice(-10);
  }

  async function hashPassword(phone, password) {
    const text = `${phone}:${password}:gram-kapoorpur-social-v1`;
    if (!window.crypto || !window.crypto.subtle) {
      return btoa(unescape(encodeURIComponent(text)));
    }
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function initials(name) {
    return String(name || "K")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "K";
  }

  function timeAgo(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  function setAuthNote(message, bad) {
    $("#authNote").textContent = message;
    $("#authNote").classList.toggle("bad", Boolean(bad));
  }

  function toast(message) {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2600);
  }

  function tinyDelay() {
    return new Promise((resolve) => setTimeout(resolve, 120));
  }

  function fail(error) {
    return { ok: false, error };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  init();
}());
