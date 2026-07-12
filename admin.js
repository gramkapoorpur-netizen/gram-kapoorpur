(function () {
  "use strict";

  const config = window.GRAM_KAPOORPUR_CONFIG || {};
  const state = {
    endpoint: localStorage.getItem("gramKapoorpurAdminEndpoint") || config.socialEndpoint || config.formEndpoint || "",
    token: sessionStorage.getItem("gramKapoorpurAdminToken") || "",
    unlocked: sessionStorage.getItem("gramKapoorpurAdminGate") === "yes",
    activeSheet: "users",
    data: {}
  };
  const adminMobile = "7619559629";
  const adminGateSalt = "kapoorpur-social-admin-mobile-v1";
  const adminGateHash = "39d38aa7c42d42a59f793838ba137cc693dafc698d384dea27c8c0bd0bbd4c88";

  const sheets = {
    users: {
      title: "Users / Profiles",
      rowName: "profile",
      editable: true,
      fields: [
        "userId",
        "name",
        "phone",
        "passwordHash",
        "recoveryHash",
        "email",
        "role",
        "village",
        "profession",
        "bio",
        "avatarUrl",
        "avatarType",
        "avatarName",
        "createdAt",
        "lastLogin",
        "status"
      ]
    },
    socialPosts: {
      title: "Social Posts",
      rowName: "post",
      editable: true,
      fields: [
        "postId",
        "userId",
        "content",
        "category",
        "mediaUrl",
        "mediaType",
        "mediaName",
        "createdAt",
        "status"
      ]
    },
    socialComments: {
      title: "Comments",
      rowName: "comment",
      editable: true,
      fields: [
        "commentId",
        "postId",
        "userId",
        "content",
        "createdAt",
        "status"
      ]
    },
    socialReactions: {
      title: "Reactions",
      rowName: "reaction",
      editable: true,
      fields: [
        "reactionId",
        "postId",
        "userId",
        "type",
        "createdAt",
        "status"
      ]
    },
    socialFriends: {
      title: "Friends",
      rowName: "friend link",
      editable: true,
      fields: [
        "friendId",
        "requesterId",
        "addresseeId",
        "status",
        "createdAt",
        "updatedAt"
      ]
    },
    socialMessages: {
      title: "Messages",
      rowName: "message",
      editable: true,
      fields: [
        "messageId",
        "fromUserId",
        "toUserId",
        "content",
        "createdAt",
        "status"
      ]
    },
    sessions: {
      title: "Sessions",
      rowName: "session",
      editable: true,
      fields: [
        "sessionToken",
        "userId",
        "createdAt",
        "lastSeen",
        "status"
      ]
    }
  };

  const labels = {
    title_hi: "Hindi title",
    title_en: "English title",
    body_hi: "Hindi details",
    body_en: "English details",
    type_hi: "Hindi type",
    type_en: "English type",
    important: "Important: yes/no",
    date: "Date",
    time: "Time",
    place_hi: "Hindi place",
    place_en: "English place",
    details_hi: "Hindi details",
    details_en: "English details",
    name_hi: "Hindi name",
    name_en: "English name",
    role_hi: "Hindi role",
    role_en: "English role",
    phone: "Phone",
    category: "Category",
    image: "Image URL",
    caption_hi: "Hindi caption",
    caption_en: "English caption",
    status: "Status: blank, hidden, deleted",
    name: "Name",
    email: "Email",
    role: "Role",
    village: "Village",
    profession: "Profession",
    bio: "Bio",
    avatarUrl: "Profile photo URL",
    avatarType: "Profile photo type",
    avatarName: "Profile photo name",
    userId: "User ID",
    passwordHash: "Password hash",
    recoveryHash: "Recovery PIN hash",
    createdAt: "Created at",
    lastLogin: "Last login",
    postId: "Post ID",
    content: "Content",
    mediaUrl: "Media URL",
    mediaType: "Media type",
    mediaName: "Media name",
    commentId: "Comment ID",
    reactionId: "Reaction ID",
    type: "Type",
    friendId: "Friend ID",
    requesterId: "Requester ID",
    addresseeId: "Addressee ID",
    updatedAt: "Updated at",
    messageId: "Message ID",
    fromUserId: "From user ID",
    toUserId: "To user ID",
    sessionToken: "Session token",
    lastSeen: "Last seen",
    notes: "Notes"
  };

  function init() {
    document.getElementById("endpointInput").value = state.endpoint;
    document.getElementById("tokenInput").value = state.token;

    bindEvents();
    renderTabs();
    renderForm();
    renderTable();
    renderGate();
  }

  function bindEvents() {
    document.getElementById("adminGateForm").addEventListener("submit", handleGateLogin);

    document.getElementById("settingsForm").addEventListener("submit", (event) => {
      event.preventDefault();
      saveSettings();
    });

    document.getElementById("loadButton").addEventListener("click", () => {
      saveSettings();
      loadData();
    });

    document.getElementById("logoutButton").addEventListener("click", () => {
      state.token = "";
      state.unlocked = false;
      sessionStorage.removeItem("gramKapoorpurAdminToken");
      sessionStorage.removeItem("gramKapoorpurAdminGate");
      document.getElementById("tokenInput").value = "";
      renderGate();
      setStatus("Token cleared from this browser.", "good");
    });

    document.getElementById("rowForm").addEventListener("submit", saveRow);
    document.getElementById("resetFormButton").addEventListener("click", resetForm);
    document.getElementById("tableSearch").addEventListener("input", renderTable);
  }

  async function handleGateLogin(event) {
    event.preventDefault();
    const mobile = cleanPhone(document.getElementById("adminMobileInput").value);
    const password = document.getElementById("adminPasswordInput").value;
    const hash = await hashValue(`${mobile}:${password}:${adminGateSalt}`);
    if (mobile === adminMobile && hash === adminGateHash) {
      state.unlocked = true;
      sessionStorage.setItem("gramKapoorpurAdminGate", "yes");
      document.getElementById("adminGateForm").reset();
      renderGate();
      return;
    }
    setGateStatus("Mobile number or password is wrong.", "bad");
  }

  function renderGate() {
    document.getElementById("adminGate").hidden = state.unlocked;
    document.getElementById("adminApp").hidden = !state.unlocked;
  }

  function saveSettings() {
    state.endpoint = document.getElementById("endpointInput").value.trim();
    state.token = document.getElementById("tokenInput").value.trim();
    localStorage.setItem("gramKapoorpurAdminEndpoint", state.endpoint);
    sessionStorage.setItem("gramKapoorpurAdminToken", state.token);
    setStatus("Settings saved in this browser.", "good");
  }

  async function loadData() {
    if (!requireSettings()) return;
    setStatus("Loading admin data...", "");

    const result = await api("admin_list", {
      sheets: Object.keys(sheets)
    });

    if (!result.ok) {
      setStatus(result.error || "Could not load data.", "bad");
      return;
    }

    state.data = result.data || {};
    setStatus("Admin data loaded.", "good");
    renderStats();
    renderTable();
  }

  async function saveRow(event) {
    event.preventDefault();
    if (!requireSettings()) return;

    const sheetKey = document.getElementById("editingSheet").value || state.activeSheet;
    const sheet = sheets[sheetKey];
    if (!sheet || !sheet.editable) return;

    const values = {};
    sheet.fields.forEach((field) => {
      values[field] = document.getElementById(`field_${field}`).value.trim();
    });

    const rowNumber = document.getElementById("editingRow").value;
    setStatus("Saving row...", "");

    const result = await api("admin_upsert", {
      sheet: sheetKey,
      rowNumber,
      values
    });

    if (!result.ok) {
      setStatus(result.error || "Could not save row.", "bad");
      return;
    }

    setStatus("Row saved.", "good");
    resetForm();
    await loadData();
  }

  async function hideRow(sheetKey, rowNumber) {
    if (!requireSettings()) return;
    const label = sheets[sheetKey].rowName;
    if (!window.confirm(`Hide this ${label}?`)) return;

    const result = await api("admin_hide", { sheet: sheetKey, rowNumber });
    if (!result.ok) {
      setStatus(result.error || "Could not hide row.", "bad");
      return;
    }

    setStatus("Row hidden.", "good");
    await loadData();
  }

  async function deleteRow(sheetKey, rowNumber) {
    if (!requireSettings()) return;
    const label = sheets[sheetKey].rowName;
    if (!window.confirm(`Permanently delete this ${label}? This cannot be undone.`)) return;

    const result = await api("admin_delete", { sheet: sheetKey, rowNumber });
    if (!result.ok) {
      setStatus(result.error || "Could not delete row.", "bad");
      return;
    }

    setStatus("Row deleted.", "good");
    await loadData();
  }

  async function api(action, payload) {
    return jsonpRequest({
      action,
      token: state.token,
      ...payload
    });
  }

  function jsonpRequest(payload) {
    return new Promise((resolve) => {
      let url;
      try {
        url = new URL(state.endpoint);
      } catch (error) {
        resolve({
          ok: false,
          error: "Apps Script URL is not valid."
        });
        return;
      }

      const callbackName = "gramAdminCallback_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        cleanup();
        resolve({
          ok: false,
          error: "Request failed. Check the Apps Script URL, deployment access, and token."
        });
      }, 15000);

      window[callbackName] = (result) => {
        cleanup();
        resolve(result || { ok: false, error: "Empty response." });
      };

      function cleanup() {
        clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
      }

      url.searchParams.set("callback", callbackName);
      url.searchParams.set("payload", JSON.stringify(payload));
      script.src = url.toString();
      script.onerror = () => {
        cleanup();
        resolve({
          ok: false,
          error: "Apps Script could not be loaded."
        });
      };
      document.body.appendChild(script);
    });
  }

  function requireSettings() {
    saveSettings();
    if (!state.endpoint) {
      setStatus("Add your Apps Script Web App URL first.", "bad");
      return false;
    }
    if (!state.token) {
      setStatus("Enter your private admin token.", "bad");
      return false;
    }
    return true;
  }

  function renderTabs() {
    const tabs = document.getElementById("tabs");
    tabs.innerHTML = Object.entries(sheets).map(([key, sheet]) => `
      <button type="button" class="${key === state.activeSheet ? "active" : ""}" data-sheet="${escapeAttr(key)}">
        ${escapeHtml(sheet.title)}
      </button>
    `).join("");

    tabs.querySelectorAll("[data-sheet]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeSheet = button.dataset.sheet;
        resetForm();
        renderTabs();
        renderForm();
        renderTable();
      });
    });
  }

  function renderStats() {
    document.getElementById("statUsers").textContent = rowCount("users");
    document.getElementById("statPosts").textContent = rowCount("socialPosts");
    document.getElementById("statComments").textContent = rowCount("socialComments");
    document.getElementById("statMessages").textContent = rowCount("socialMessages");
  }

  function rowCount(sheetKey) {
    return (state.data[sheetKey] && state.data[sheetKey].rows ? state.data[sheetKey].rows.length : 0);
  }

  function renderForm(row) {
    const sheet = sheets[state.activeSheet];
    const form = document.getElementById("rowForm");
    const fields = document.getElementById("formFields");

    document.getElementById("editorEyebrow").textContent = sheet.title;
    document.getElementById("editorTitle").textContent = sheet.editable ? (row ? "Edit row" : "Add row") : "Read only";
    document.getElementById("editingSheet").value = state.activeSheet;
    document.getElementById("editingRow").value = row ? row.rowNumber : "";
    form.querySelector("button[type='submit']").disabled = !sheet.editable;

    if (!sheet.editable) {
      fields.innerHTML = "<p class=\"empty\">This section is read only.</p>";
      return;
    }

    fields.innerHTML = sheet.fields.map((field) => {
      const value = row && row.object ? row.object[field] || "" : "";
      const isLong = field.includes("body") || field.includes("details") || field === "notes";
      const input = isLong
        ? `<textarea id="field_${escapeAttr(field)}">${escapeHtml(value)}</textarea>`
        : `<input id="field_${escapeAttr(field)}" type="${field === "date" ? "date" : "text"}" value="${escapeAttr(value)}">`;
      return `
        <label>
          <span>${escapeHtml(labels[field] || field)}</span>
          ${input}
        </label>
      `;
    }).join("");
  }

  function renderTable() {
    const sheetKey = state.activeSheet;
    const sheet = sheets[sheetKey];
    const data = state.data[sheetKey] || { headers: sheet.fields, rows: [] };
    const query = document.getElementById("tableSearch").value.trim().toLowerCase();
    const rows = (data.rows || []).filter((row) => {
      return JSON.stringify(row.object || {}).toLowerCase().includes(query);
    });

    document.getElementById("tableEyebrow").textContent = sheet.title;
    document.getElementById("tableTitle").textContent = `${rows.length} rows`;

    const container = document.getElementById("tableContainer");
    if (!rows.length) {
      container.innerHTML = "<p class=\"empty\">No rows loaded.</p>";
      return;
    }

    const headers = data.headers && data.headers.length ? data.headers : sheet.fields;
    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Row</th>
            ${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => renderTableRow(sheetKey, sheet, headers, row)).join("")}
        </tbody>
      </table>
    `;

    container.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        const row = rows.find((item) => String(item.rowNumber) === button.dataset.edit);
        renderForm(row);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    container.querySelectorAll("[data-hide]").forEach((button) => {
      button.addEventListener("click", () => hideRow(sheetKey, button.dataset.hide));
    });

    container.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => deleteRow(sheetKey, button.dataset.delete));
    });
  }

  function renderTableRow(sheetKey, sheet, headers, row) {
    return `
      <tr>
        <td class="actions">
          <div class="actions-row">
            ${sheet.editable ? `<button type="button" class="small" data-edit="${escapeAttr(row.rowNumber)}">Edit</button>` : ""}
            ${sheet.editable ? `<button type="button" class="small secondary" data-hide="${escapeAttr(row.rowNumber)}">Hide</button>` : ""}
            ${sheet.editable ? `<button type="button" class="small danger" data-delete="${escapeAttr(row.rowNumber)}">Delete</button>` : ""}
          </div>
        </td>
        <td>${escapeHtml(row.rowNumber)}</td>
        ${headers.map((header) => `<td>${escapeHtml(row.object ? row.object[header] || "" : "")}</td>`).join("")}
      </tr>
    `;
  }

  function resetForm() {
    renderForm();
  }

  function setStatus(message, type) {
    const line = document.getElementById("statusLine");
    line.textContent = message;
    line.className = `status-line ${type || ""}`;
  }

  function setGateStatus(message, type) {
    const line = document.getElementById("adminGateStatus");
    line.textContent = message;
    line.className = `status-line ${type || ""}`;
  }

  function cleanPhone(value) {
    return String(value || "").replace(/[^\d]/g, "").slice(-10);
  }

  async function hashValue(text) {
    if (!window.crypto || !window.crypto.subtle) {
      return btoa(unescape(encodeURIComponent(text)));
    }
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
