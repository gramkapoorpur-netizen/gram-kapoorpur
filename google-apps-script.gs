const ADMIN_TOKEN_PROPERTY = "ADMIN_TOKEN";

const SHEETS = {
  users: {
    name: "users",
    editable: true,
    headers: ["userId", "name", "phone", "passwordHash", "recoveryHash", "email", "role", "village", "profession", "bio", "createdAt", "lastLogin", "status"]
  },
  socialPosts: {
    name: "socialPosts",
    editable: true,
    headers: ["postId", "userId", "content", "category", "mediaUrl", "createdAt", "status"]
  },
  socialComments: {
    name: "socialComments",
    editable: true,
    headers: ["commentId", "postId", "userId", "content", "createdAt", "status"]
  },
  socialReactions: {
    name: "socialReactions",
    editable: true,
    headers: ["reactionId", "postId", "userId", "type", "createdAt", "status"]
  },
  socialFriends: {
    name: "socialFriends",
    editable: true,
    headers: ["friendId", "requesterId", "addresseeId", "status", "createdAt", "updatedAt"]
  },
  socialMessages: {
    name: "socialMessages",
    editable: true,
    headers: ["messageId", "fromUserId", "toUserId", "content", "createdAt", "status"]
  },
  sessions: {
    name: "sessions",
    editable: true,
    headers: ["sessionToken", "userId", "createdAt", "lastSeen", "status"]
  }
};

function doPost(e) {
  const data = parseBody_(e);
  return route_(data);
}

function doGet(e) {
  const data = parseBody_(e);

  if (!data.action) {
    return respond_({
      ok: true,
      message: "Gram Kapoorpur endpoint is active."
    }, e);
  }

  return route_(data, e);
}

function setupAdminToken() {
  PropertiesService.getScriptProperties().setProperty(
    ADMIN_TOKEN_PROPERTY,
    "change-this-to-a-long-private-token"
  );
}

function route_(data, e) {
  if (data.action && String(data.action).indexOf("admin_") === 0) {
    return handleAdmin_(data, e);
  }

  if (data.action && String(data.action).indexOf("social_") === 0) {
    return handleSocial_(data, e);
  }

  return respond_({
    ok: false,
    error: "Unknown action."
  }, e);
}

function handleSocial_(data, e) {
  try {
    if (data.action === "social_register") {
      return respond_(socialRegister_(data), e);
    }

    if (data.action === "social_login") {
      return respond_(socialLogin_(data), e);
    }

    if (data.action === "social_reset_password") {
      return respond_(socialResetPassword_(data), e);
    }

    const user = userFromSession_(data.token);
    if (!user) {
      return respond_({
        ok: false,
        error: "Session expired. Please login again."
      }, e);
    }

    if (data.action === "social_feed") {
      touchSession_(data.token);
      return respond_(socialResponse_(user, data.token), e);
    }

    if (data.action === "social_post") {
      socialPost_(user, data);
      return respond_(socialResponse_(user, data.token), e);
    }

    if (data.action === "social_comment") {
      socialComment_(user, data);
      return respond_(socialResponse_(user, data.token), e);
    }

    if (data.action === "social_react") {
      socialReact_(user, data);
      return respond_(socialResponse_(user, data.token), e);
    }

    if (data.action === "social_share") {
      socialShare_(user, data);
      return respond_(socialResponse_(user, data.token), e);
    }

    if (data.action === "social_friend_request") {
      socialFriendRequest_(user, data);
      return respond_(socialResponse_(user, data.token), e);
    }

    if (data.action === "social_friend_respond") {
      socialFriendRespond_(user, data);
      return respond_(socialResponse_(user, data.token), e);
    }

    if (data.action === "social_message") {
      socialMessage_(user, data);
      return respond_(socialResponse_(user, data.token), e);
    }

    if (data.action === "social_profile_update") {
      const updatedUser = socialProfileUpdate_(user, data);
      return respond_(socialResponse_(updatedUser, data.token), e);
    }

    return respond_({
      ok: false,
      error: "Unknown social action."
    }, e);
  } catch (error) {
    return respond_({
      ok: false,
      error: error.message
    }, e);
  }
}

function socialRegister_(data) {
  const phone = cleanPhone_(data.phone);
  const name = cleanText_(data.name, 80);
  const passwordHash = cleanText_(data.passwordHash, 140);
  const recoveryHash = cleanText_(data.recoveryHash, 140);

  if (!name) throw new Error("Name is required.");
  if (phone.length < 10) throw new Error("Valid phone number is required.");
  if (!passwordHash) throw new Error("Password is required.");
  if (!recoveryHash) throw new Error("Recovery PIN is required.");

  const usersSheet = ensureSheet_("users");
  const users = readRows_("users").rows;
  const existing = users.find(function (row) {
    return cleanPhone_(row.object.phone) === phone && !isHidden_(row.object);
  });

  if (existing) throw new Error("This phone number already has an account.");

  const now = new Date().toISOString();
  const userId = "u_" + Utilities.getUuid();
  appendObject_(usersSheet, SHEETS.users.headers, {
    userId: userId,
    name: name,
    phone: phone,
    passwordHash: passwordHash,
    recoveryHash: recoveryHash,
    email: "",
    role: "member",
    village: cleanText_(data.village || "Kapoorpur", 80),
    profession: cleanText_(data.profession, 80),
    bio: "",
    createdAt: now,
    lastLogin: now,
    status: ""
  });

  const user = getUserById_(userId);
  const token = createSession_(userId);
  return socialResponse_(user, token);
}

function socialLogin_(data) {
  const phone = cleanPhone_(data.phone);
  const passwordHash = cleanText_(data.passwordHash, 140);
  const users = readRows_("users").rows;
  const found = users.find(function (row) {
    return cleanPhone_(row.object.phone) === phone &&
      row.object.passwordHash === passwordHash &&
      !isHidden_(row.object);
  });

  if (!found) throw new Error("Phone number or password is wrong.");

  const usersSheet = ensureSheet_("users");
  const headers = getHeaders_("users", usersSheet);
  setCellByHeader_(usersSheet, found.rowNumber, headers, "lastLogin", new Date().toISOString());
  const token = createSession_(found.object.userId);
  return socialResponse_(found.object, token);
}

function socialResetPassword_(data) {
  const phone = cleanPhone_(data.phone);
  const recoveryHash = cleanText_(data.recoveryHash, 140);
  const passwordHash = cleanText_(data.passwordHash, 140);
  const rows = readRows_("users").rows;
  const found = rows.find(function (row) {
    return cleanPhone_(row.object.phone) === phone &&
      row.object.recoveryHash === recoveryHash &&
      !isHidden_(row.object);
  });

  if (!found) throw new Error("Phone number or recovery PIN is wrong.");

  const usersSheet = ensureSheet_("users");
  const headers = getHeaders_("users", usersSheet);
  setCellByHeader_(usersSheet, found.rowNumber, headers, "passwordHash", passwordHash);
  setCellByHeader_(usersSheet, found.rowNumber, headers, "lastLogin", new Date().toISOString());
  return { ok: true };
}

function socialPost_(user, data) {
  const content = cleanText_(data.content, 700);
  if (!content) throw new Error("Post cannot be empty.");

  appendObject_(ensureSheet_("socialPosts"), SHEETS.socialPosts.headers, {
    postId: "p_" + Utilities.getUuid(),
    userId: user.userId,
    content: content,
    category: cleanText_(data.category || "update", 30),
    mediaUrl: cleanText_(data.mediaUrl, 500),
    createdAt: new Date().toISOString(),
    status: ""
  });
}

function socialComment_(user, data) {
  const postId = cleanText_(data.postId, 80);
  const content = cleanText_(data.content, 300);
  if (!postId) throw new Error("Post is required.");
  if (!content) throw new Error("Comment cannot be empty.");

  appendObject_(ensureSheet_("socialComments"), SHEETS.socialComments.headers, {
    commentId: "c_" + Utilities.getUuid(),
    postId: postId,
    userId: user.userId,
    content: content,
    createdAt: new Date().toISOString(),
    status: ""
  });
}

function socialReact_(user, data) {
  const postId = cleanText_(data.postId, 80);
  const type = cleanText_(data.type || "like", 30);
  const sheet = ensureSheet_("socialReactions");
  const reactions = readRows_("socialReactions").rows;
  const existing = reactions.find(function (row) {
    return row.object.postId === postId &&
      row.object.userId === user.userId &&
      row.object.type === type &&
      !isHidden_(row.object);
  });

  if (existing) {
    sheet.deleteRow(existing.rowNumber);
  } else {
    appendObject_(sheet, SHEETS.socialReactions.headers, {
      reactionId: "r_" + Utilities.getUuid(),
      postId: postId,
      userId: user.userId,
      type: type,
      createdAt: new Date().toISOString(),
      status: ""
    });
  }
}

function socialShare_(user, data) {
  const postId = cleanText_(data.postId, 80);
  const posts = readRows_("socialPosts").rows;
  const found = posts.find(function (row) {
    return row.object.postId === postId && !isHidden_(row.object);
  });
  if (!found) throw new Error("Post not found.");

  const author = getUserById_(found.object.userId) || { name: "Member" };
  appendObject_(ensureSheet_("socialPosts"), SHEETS.socialPosts.headers, {
    postId: "p_" + Utilities.getUuid(),
    userId: user.userId,
    content: cleanText_("Shared from " + author.name + ":\n" + found.object.content, 700),
    category: "update",
    mediaUrl: found.object.mediaUrl || "",
    createdAt: new Date().toISOString(),
    status: ""
  });
}

function socialFriendRequest_(user, data) {
  const targetUserId = cleanText_(data.targetUserId, 80);
  if (!targetUserId || targetUserId === user.userId) throw new Error("Invalid member.");
  if (!getUserById_(targetUserId)) throw new Error("Member not found.");

  const sheet = ensureSheet_("socialFriends");
  const rows = readRows_("socialFriends").rows;
  const now = new Date().toISOString();
  const existing = rows.find(function (row) {
    return samePair_(row.object, user.userId, targetUserId) && !isHidden_(row.object);
  });

  if (!existing) {
    appendObject_(sheet, SHEETS.socialFriends.headers, {
      friendId: "f_" + Utilities.getUuid(),
      requesterId: user.userId,
      addresseeId: targetUserId,
      status: "pending",
      createdAt: now,
      updatedAt: now
    });
    return;
  }

  if (existing.object.status === "pending" && existing.object.addresseeId === user.userId) {
    const headers = getHeaders_("socialFriends", sheet);
    setCellByHeader_(sheet, existing.rowNumber, headers, "status", "accepted");
    setCellByHeader_(sheet, existing.rowNumber, headers, "updatedAt", now);
  }
}

function socialFriendRespond_(user, data) {
  const targetUserId = cleanText_(data.targetUserId, 80);
  const decision = cleanText_(data.decision, 20);
  const sheet = ensureSheet_("socialFriends");
  const headers = getHeaders_("socialFriends", sheet);
  const rows = readRows_("socialFriends").rows;
  const found = rows.find(function (row) {
    return row.object.requesterId === targetUserId &&
      row.object.addresseeId === user.userId &&
      row.object.status === "pending" &&
      !isHidden_(row.object);
  });
  if (!found) throw new Error("Friend request not found.");

  setCellByHeader_(sheet, found.rowNumber, headers, "status", decision === "accept" ? "accepted" : "hidden");
  setCellByHeader_(sheet, found.rowNumber, headers, "updatedAt", new Date().toISOString());
}

function socialMessage_(user, data) {
  const targetUserId = cleanText_(data.targetUserId, 80);
  const content = cleanText_(data.content, 500);
  if (!targetUserId || !getUserById_(targetUserId)) throw new Error("Member not found.");
  if (!content) throw new Error("Message cannot be empty.");

  appendObject_(ensureSheet_("socialMessages"), SHEETS.socialMessages.headers, {
    messageId: "m_" + Utilities.getUuid(),
    fromUserId: user.userId,
    toUserId: targetUserId,
    content: content,
    createdAt: new Date().toISOString(),
    status: ""
  });
}

function socialProfileUpdate_(user, data) {
  const usersSheet = ensureSheet_("users");
  const headers = getHeaders_("users", usersSheet);
  const rows = readRows_("users").rows;
  const found = rows.find(function (row) {
    return row.object.userId === user.userId && !isHidden_(row.object);
  });

  if (!found) throw new Error("User not found.");

  setCellByHeader_(usersSheet, found.rowNumber, headers, "name", cleanText_(data.name || user.name, 80));
  setCellByHeader_(usersSheet, found.rowNumber, headers, "village", cleanText_(data.village, 80));
  setCellByHeader_(usersSheet, found.rowNumber, headers, "profession", cleanText_(data.profession, 80));
  setCellByHeader_(usersSheet, found.rowNumber, headers, "bio", cleanText_(data.bio, 300));

  return getUserById_(user.userId);
}

function socialResponse_(user, token) {
  return {
    ok: true,
    token: token,
    user: publicUser_(user),
    data: socialSnapshot_(user.userId)
  };
}

function socialSnapshot_(userId) {
  return {
    users: readRows_("users").rows
      .map(function (row) { return row.object; })
      .filter(function (user) { return !isHidden_(user); })
      .map(publicUser_),
    posts: readRows_("socialPosts").rows
      .map(function (row) { return row.object; })
      .filter(function (post) { return !isHidden_(post); }),
    comments: readRows_("socialComments").rows
      .map(function (row) { return row.object; })
      .filter(function (comment) { return !isHidden_(comment); }),
    reactions: readRows_("socialReactions").rows
      .map(function (row) { return row.object; })
      .filter(function (reaction) { return !isHidden_(reaction); }),
    friendships: readRows_("socialFriends").rows
      .map(function (row) { return row.object; })
      .filter(function (friendship) { return !isHidden_(friendship); }),
    messages: readRows_("socialMessages").rows
      .map(function (row) { return row.object; })
      .filter(function (message) {
        return !isHidden_(message) && (message.fromUserId === userId || message.toUserId === userId);
      })
  };
}

function publicUser_(user) {
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

function createSession_(userId) {
  const now = new Date().toISOString();
  const token = "s_" + Utilities.getUuid() + "_" + Utilities.getUuid();
  appendObject_(ensureSheet_("sessions"), SHEETS.sessions.headers, {
    sessionToken: token,
    userId: userId,
    createdAt: now,
    lastSeen: now,
    status: ""
  });
  return token;
}

function userFromSession_(token) {
  const sessionToken = cleanText_(token, 180);
  if (!sessionToken) return null;

  const sessions = readRows_("sessions").rows;
  const session = sessions.find(function (row) {
    return row.object.sessionToken === sessionToken && !isHidden_(row.object);
  });

  if (!session) return null;
  return getUserById_(session.object.userId);
}

function touchSession_(token) {
  const sheet = ensureSheet_("sessions");
  const headers = getHeaders_("sessions", sheet);
  const sessions = readRows_("sessions").rows;
  const session = sessions.find(function (row) {
    return row.object.sessionToken === token;
  });

  if (session) {
    setCellByHeader_(sheet, session.rowNumber, headers, "lastSeen", new Date().toISOString());
  }
}

function getUserById_(userId) {
  const users = readRows_("users").rows;
  const found = users.find(function (row) {
    return row.object.userId === userId && !isHidden_(row.object);
  });
  return found ? found.object : null;
}

function handleAdmin_(data, e) {
  if (!isAdminTokenValid_(data.token)) {
    return respond_({
      ok: false,
      error: "Invalid or missing admin token."
    }, e);
  }

  try {
    if (data.action === "admin_list") {
      return respond_({
        ok: true,
        data: listSheets_(data.sheets || Object.keys(SHEETS))
      }, e);
    }

    if (data.action === "admin_upsert") {
      upsertRow_(data.sheet, data.rowNumber, data.values || {});
      return respond_({ ok: true }, e);
    }

    if (data.action === "admin_hide") {
      hideRow_(data.sheet, data.rowNumber);
      return respond_({ ok: true }, e);
    }

    if (data.action === "admin_delete") {
      deleteRow_(data.sheet, data.rowNumber);
      return respond_({ ok: true }, e);
    }

    return respond_({
      ok: false,
      error: "Unknown admin action."
    }, e);
  } catch (error) {
    return respond_({
      ok: false,
      error: error.message
    }, e);
  }
}

function listSheets_(sheetKeys) {
  const result = {};

  sheetKeys.forEach(function (sheetKey) {
    if (!SHEETS[sheetKey]) return;
    result[sheetKey] = readRows_(sheetKey);
  });

  return result;
}

function readRows_(sheetKey) {
  const sheet = ensureSheet_(sheetKey);
  const headers = getHeaders_(sheetKey, sheet);
  const lastRow = sheet.getLastRow();
  const rows = [];

  if (lastRow >= 2) {
    const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();

    values.forEach(function (row, index) {
      const object = {};
      headers.forEach(function (header, columnIndex) {
        object[header] = row[columnIndex] || "";
      });

      rows.push({
        rowNumber: index + 2,
        object: object
      });
    });
  }

  return {
    headers: headers,
    rows: rows
  };
}

function upsertRow_(sheetKey, rowNumber, values) {
  const spec = getSheetSpec_(sheetKey);
  if (!spec.editable) throw new Error("This sheet is read only.");

  const sheet = ensureSheet_(sheetKey);
  const headers = getHeaders_(sheetKey, sheet);
  const rowValues = headers.map(function (header) {
    return values[header] || "";
  });

  if (rowNumber) {
    const row = Number(rowNumber);
    if (!row || row < 2 || row > sheet.getLastRow()) throw new Error("Invalid row number.");
    sheet.getRange(row, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function hideRow_(sheetKey, rowNumber) {
  const spec = getSheetSpec_(sheetKey);
  if (!spec.editable) throw new Error("This sheet is read only.");

  const sheet = ensureSheet_(sheetKey);
  const headers = getHeaders_(sheetKey, sheet);
  const statusColumn = ensureStatusColumn_(sheet, headers);
  const row = Number(rowNumber);

  if (!row || row < 2 || row > sheet.getLastRow()) throw new Error("Invalid row number.");
  sheet.getRange(row, statusColumn).setValue("hidden");
}

function deleteRow_(sheetKey, rowNumber) {
  const spec = getSheetSpec_(sheetKey);
  if (!spec.editable) throw new Error("This sheet is read only.");

  const sheet = ensureSheet_(sheetKey);
  const row = Number(rowNumber);

  if (!row || row < 2 || row > sheet.getLastRow()) throw new Error("Invalid row number.");
  sheet.deleteRow(row);
}

function ensureSheet_(sheetKey) {
  const spec = getSheetSpec_(sheetKey);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(spec.name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(spec.name);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(spec.headers);
  } else {
    const firstCell = sheet.getRange(1, 1).getDisplayValue();
    if (!firstCell) {
      sheet.getRange(1, 1, 1, spec.headers.length).setValues([spec.headers]);
    }
  }

  return sheet;
}

function getHeaders_(sheetKey, sheet) {
  const spec = getSheetSpec_(sheetKey);
  const width = Math.max(sheet.getLastColumn(), spec.headers.length);
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0]
    .map(function (header) {
      return String(header || "").trim();
    })
    .filter(Boolean);

  if (!headers.length) {
    sheet.getRange(1, 1, 1, spec.headers.length).setValues([spec.headers]);
    return spec.headers.slice();
  }

  return headers;
}

function appendObject_(sheet, headers, object) {
  sheet.appendRow(headers.map(function (header) {
    return object[header] || "";
  }));
}

function setCellByHeader_(sheet, rowNumber, headers, header, value) {
  const index = headers.indexOf(header);
  if (index === -1) return;
  sheet.getRange(rowNumber, index + 1).setValue(value);
}

function ensureStatusColumn_(sheet, headers) {
  const currentIndex = headers.indexOf("status");
  if (currentIndex !== -1) return currentIndex + 1;

  const nextColumn = headers.length + 1;
  sheet.getRange(1, nextColumn).setValue("status");
  return nextColumn;
}

function getSheetSpec_(sheetKey) {
  const spec = SHEETS[sheetKey];
  if (!spec) throw new Error("Unknown sheet: " + sheetKey);
  return spec;
}

function isAdminTokenValid_(token) {
  const savedToken = PropertiesService.getScriptProperties().getProperty(ADMIN_TOKEN_PROPERTY);
  return Boolean(savedToken) && String(token || "") === savedToken;
}

function isHidden_(object) {
  const status = String(object.status || "").toLowerCase();
  return status === "hidden" || status === "deleted";
}

function samePair_(object, a, b) {
  return (object.requesterId === a && object.addresseeId === b) ||
    (object.requesterId === b && object.addresseeId === a);
}

function cleanPhone_(value) {
  return String(value || "").replace(/[^\d]/g, "").slice(-10);
}

function cleanText_(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength || 500);
}

function parseBody_(e) {
  if (!e) return {};

  if (e.parameter && e.parameter.payload) {
    try {
      return JSON.parse(e.parameter.payload);
    } catch (error) {
      return {};
    }
  }

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return e.parameter || {};
    }
  }

  return e.parameter || {};
}

function respond_(object, e) {
  const callback = e && e.parameter && e.parameter.callback;
  const output = callback
    ? String(callback).replace(/[^\w.$]/g, "") + "(" + JSON.stringify(object) + ");"
    : JSON.stringify(object);

  return ContentService
    .createTextOutput(output)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
