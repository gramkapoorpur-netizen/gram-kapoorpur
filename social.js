(function () {
  "use strict";

  const config = window.GRAM_KAPOORPUR_CONFIG || {};
  const endpoint = String(config.socialEndpoint || config.formEndpoint || "").trim();
  const demoKey = "gramKapoorpurSocialDemo";
  const sessionKey = "gramKapoorpurSocialSession";
  const langKey = "gramKapoorpurSocialLang";
  const state = {
    endpoint,
    mode: endpoint ? "shared" : "demo",
    lang: localStorage.getItem(langKey) || "hi",
    token: localStorage.getItem(sessionKey) || "",
    user: null,
    data: null,
    activeView: "feed",
    chatUserId: "",
    pendingPostMedia: null,
    pendingAvatar: null,
    avatarRemove: false
  };

  const mediaDbName = "gramKapoorpurMediaDb";
  const mediaStoreName = "media";
  const mediaFallbackKey = "gramKapoorpurMediaFallback";
  const maxImageBytes = 12 * 1024 * 1024;
  const maxAvatarBytes = 8 * 1024 * 1024;
  const maxVideoBytes = 50 * 1024 * 1024;

  const seedData = {
    users: [
      {
        userId: "u_manoj",
        name: "Manoj Singh Sikarwar",
        phone: "9000000000",
        passwordHash: "",
        recoveryHash: "",
        village: "Kapoorpur",
        profession: "Admin",
        bio: "Gram Kapoorpur digital parivar me aapka swagat hai.",
        avatarUrl: "",
        avatarLocalId: "",
        avatarType: "",
        avatarName: "",
        createdAt: new Date().toISOString(),
        status: ""
      },
      {
        userId: "u_sita",
        name: "Sita Devi",
        phone: "",
        passwordHash: "",
        recoveryHash: "",
        village: "Kapoorpur",
        profession: "Self help group",
        bio: "",
        avatarUrl: "",
        avatarLocalId: "",
        avatarType: "",
        avatarName: "",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: ""
      },
      {
        userId: "u_ravi",
        name: "Ravi Kumar",
        phone: "",
        passwordHash: "",
        recoveryHash: "",
        village: "Kapoorpur",
        profession: "Student",
        bio: "",
        avatarUrl: "",
        avatarLocalId: "",
        avatarType: "",
        avatarName: "",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        status: ""
      }
    ],
    posts: [
      {
        postId: "p_welcome",
        userId: "u_manoj",
        content: "Namaste Kapoorpur! Ye gaon ki apni social chaupal hai. Yahan post, comment, dosti, message aur manoranjan sab ek jagah hai.",
        category: "update",
        mediaUrl: "",
        mediaType: "",
        mediaName: "",
        mediaLocalId: "",
        createdAt: new Date().toISOString(),
        status: ""
      },
      {
        postId: "p_fun",
        userId: "u_sita",
        content: "Aaj ka sawal: Kapoorpur me bachcho ke liye kaunsi new activity honi chahiye?",
        category: "fun",
        mediaUrl: "",
        mediaType: "",
        mediaName: "",
        mediaLocalId: "",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: ""
      }
    ],
    comments: [
      {
        commentId: "c_1",
        postId: "p_welcome",
        userId: "u_sita",
        content: "Bahut achha prayas.",
        createdAt: new Date().toISOString(),
        status: ""
      }
    ],
    reactions: [],
    friendships: [],
    messages: []
  };

  const questions = {
    hi: [
      "कपूरपुर की सबसे प्यारी जगह कौन सी है?",
      "गांव में बच्चों के लिए कौन सी activity होनी चाहिए?",
      "कौन सी सुविधा सबसे पहले improve होनी चाहिए?",
      "गांव की कौन सी पुरानी याद आपको सबसे ज्यादा पसंद है?"
    ],
    en: [
      "Which place in Kapoorpur do you like the most?",
      "Which activity should be started for children in the village?",
      "Which facility should be improved first?",
      "Which old village memory do you like the most?"
    ]
  };

  const copy = {
    hi: {
      live: "Live",
      logout: "Logout",
      brandSmall: "गांव की अपनी सोशल चौपाल",
      searchPlaceholder: "लोग, पोस्ट, गांव की बात खोजें",
      authEyebrow: "Kapoorpur Social",
      heroTitle: "ग्राम कपूरपुर का अपना सोशल नेटवर्क",
      heroBody: "लॉगिन करें, पोस्ट डालें, दोस्त बनाएं, संदेश भेजें, फोटो लिंक शेयर करें और गांव की चौपाल में मनोरंजन करें।",
      login: "लॉगिन",
      register: "नया खाता",
      forgot: "पासवर्ड भूल गए",
      phone: "मोबाइल नंबर",
      password: "Password",
      loginButton: "Login करें",
      forgotPassword: "Password भूल गए?",
      fullName: "पूरा नाम",
      recoveryPin: "Recovery PIN",
      recoveryPinPlaceholder: "4 अंक याद रखें",
      area: "मोहल्ला / पुरवा",
      profession: "काम / पहचान",
      professionPlaceholder: "किसान, विद्यार्थी, शिक्षक...",
      createAccount: "Account बनाएं",
      newPassword: "New password",
      resetPassword: "Password reset करें",
      goLogin: "Login पर जाएं",
      feed: "फीड",
      friends: "दोस्त",
      messages: "संदेश",
      notifications: "सूचनाएं",
      members: "सदस्य",
      fun: "मनोरंजन",
      profile: "प्रोफाइल",
      composerHint: "गांव में कुछ अच्छा शेयर करें",
      composerPlaceholder: "क्या सोच रहे हैं? शुभकामना, मदद, फोटो लिंक या गांव की याद लिखें...",
      uploadMedia: "Photo/video upload",
      removeMedia: "Remove",
      mediaReady: "Media ready",
      mediaLoading: "Media loading...",
      mediaUnsupported: "यह file support नहीं है। Photo या video चुनें।",
      mediaTooLarge: "File बहुत बड़ी है। छोटी photo या video चुनें।",
      mediaLocalOnly: "File इस device पर save हुई है।",
      post: "पोस्ट करें",
      friendsEyebrow: "दोस्त",
      friendsTitle: "दोस्त और requests",
      suggestions: "सुझाव",
      suggestionsTitle: "नए दोस्त जोड़ें",
      messagesTitle: "गांव संदेश",
      notificationsTitle: "सूचनाएं",
      membersTitle: "गांव के सदस्य",
      memberSearch: "नाम खोजें",
      entertainment: "मनोरंजन",
      entertainmentTitle: "मनोरंजन चौपाल",
      todayQuestion: "आज का सवाल",
      postOnThis: "इस पर पोस्ट करें",
      memory: "गांव की याद",
      memoryText: "पुरानी याद या बचपन की बात शेयर करें।",
      writeMemory: "याद लिखें",
      wish: "शुभकामना",
      wishText: "त्योहार, जन्मदिन या सफलता की बधाई दें।",
      postWish: "बधाई पोस्ट करें",
      riddle: "पहेली",
      riddleText: "ऐसी कौन सी चीज है जो बांटने से बढ़ती है?",
      seeAnswer: "उत्तर देखें",
      riddleAnswer: "खुशी और ज्ञान।",
      profileTitle: "अपनी प्रोफाइल",
      profilePhoto: "Profile photo upload",
      removePhoto: "Remove photo",
      name: "नाम",
      bio: "Bio",
      saveProfile: "Profile save करें",
      chaupalToday: "आज की चौपाल",
      postAnswer: "जवाब पोस्ट करें",
      friendRequests: "Friend requests",
      newMembers: "नए सदस्य",
      emptyChat: "किसी सदस्य को चुनकर message भेजें।",
      emptyFeed: "अभी कोई post नहीं है। पहली post आप करें।",
      postMediaAlt: "Post media",
      like: "पसंद",
      comment: "कमेंट",
      share: "शेयर",
      commentPlaceholder: "Comment लिखें...",
      send: "भेजें",
      requestArrived: "Friend request आई है",
      accept: "स्वीकार करें",
      delete: "हटाएं",
      emptyRequests: "कोई pending friend request नहीं है।",
      emptyFriends: "अभी friends नहीं हैं।",
      emptySuggestions: "नए suggestions नहीं हैं।",
      emptyMembers: "कोई member नहीं मिला।",
      you: "आप",
      friend: "दोस्त",
      requestSent: "Request sent",
      addFriend: "दोस्त बनाएं",
      message: "संदेश",
      sendMessage: "Message भेजें",
      emptyConversations: "Message के लिए पहले members से connect करें।",
      emptyMessages: "अभी message नहीं है।",
      messagePlaceholder: "Message लिखें...",
      emptyNotifications: "अभी कोई notification नहीं है।",
      noRequests: "No requests",
      categoryUpdate: "Update",
      categoryPhoto: "Photo",
      categoryVideo: "Video",
      categoryFestival: "Festival",
      categoryHelp: "Help",
      categoryFun: "Fun",
      loginProgress: "Login हो रहा है...",
      loginFailed: "Login नहीं हुआ।",
      invalidPhone: "सही mobile number लिखें।",
      registerProgress: "Account बन रहा है...",
      registerFailed: "Account नहीं बना।",
      resetProgress: "Password reset हो रहा है...",
      resetFailed: "Password reset नहीं हुआ।",
      resetDone: "Password reset हो गया। अब login करें।",
      welcome: "Welcome, ",
      postFailed: "Post save नहीं हुआ।",
      postAdded: "Post added",
      postNeedsContent: "Post के लिए text, photo, video या URL जोड़ें।",
      likeFailed: "Like save नहीं हुआ।",
      shareFailed: "Share नहीं हुआ।",
      postShared: "Post shared",
      commentFailed: "Comment save नहीं हुआ।",
      profileFailed: "Profile save नहीं हुई।",
      profileSaved: "Profile saved",
      photoReady: "Profile photo ready",
      avatarAlt: "Profile photo",
      videoAlt: "Post video",
      requestFailed: "Request नहीं भेजी गई।",
      requestSentToast: "Friend request sent",
      requestUpdateFailed: "Request update नहीं हुई।",
      messageFailed: "Message नहीं भेजा गया।",
      loggedOut: "Logout हो गया",
      friendRequestNote: "Friend request",
      newCommentNote: "New comment",
      newLikeNote: "New like",
      newMessageNote: "New message",
      likedYourPost: "ने आपकी post like की।",
      sentRequest: "ने request भेजी है।",
      memberFallback: "Kapoorpur Member"
    },
    en: {
      live: "Live",
      logout: "Logout",
      brandSmall: "The village social network",
      searchPlaceholder: "Search people, posts, village updates",
      authEyebrow: "Kapoorpur Social",
      heroTitle: "Gram Kapoorpur's own social network",
      heroBody: "Log in, create posts, add friends, send messages, share photo links, and enjoy the village community feed.",
      login: "Login",
      register: "Register",
      forgot: "Forgot",
      phone: "Mobile number",
      password: "Password",
      loginButton: "Login",
      forgotPassword: "Forgot password?",
      fullName: "Full name",
      recoveryPin: "Recovery PIN",
      recoveryPinPlaceholder: "Remember 4 digits",
      area: "Area / hamlet",
      profession: "Work / identity",
      professionPlaceholder: "Farmer, student, teacher...",
      createAccount: "Create account",
      newPassword: "New password",
      resetPassword: "Reset password",
      goLogin: "Go to login",
      feed: "Feed",
      friends: "Friends",
      messages: "Messages",
      notifications: "Notifications",
      members: "Members",
      fun: "Fun",
      profile: "Profile",
      composerHint: "Share something good with the village",
      composerPlaceholder: "What are you thinking? Share wishes, help, a photo link, or a village memory...",
      uploadMedia: "Photo/video upload",
      removeMedia: "Remove",
      mediaReady: "Media ready",
      mediaLoading: "Media loading...",
      mediaUnsupported: "This file is not supported. Choose a photo or video.",
      mediaTooLarge: "The file is too large. Choose a smaller photo or video.",
      mediaLocalOnly: "File saved on this device.",
      post: "Post",
      friendsEyebrow: "Friends",
      friendsTitle: "Friends and requests",
      suggestions: "Suggestions",
      suggestionsTitle: "Add new friends",
      messagesTitle: "Village messages",
      notificationsTitle: "Notifications",
      membersTitle: "Village members",
      memberSearch: "Search by name",
      entertainment: "Entertainment",
      entertainmentTitle: "Fun community corner",
      todayQuestion: "Question of the day",
      postOnThis: "Post on this",
      memory: "Village memory",
      memoryText: "Share an old memory or childhood story.",
      writeMemory: "Write memory",
      wish: "Greeting",
      wishText: "Send festival, birthday, or success wishes.",
      postWish: "Post greeting",
      riddle: "Riddle",
      riddleText: "What grows when it is shared?",
      seeAnswer: "See answer",
      riddleAnswer: "Happiness and knowledge.",
      profileTitle: "Your profile",
      profilePhoto: "Profile photo upload",
      removePhoto: "Remove photo",
      name: "Name",
      bio: "Bio",
      saveProfile: "Save profile",
      chaupalToday: "Today's community question",
      postAnswer: "Post answer",
      friendRequests: "Friend requests",
      newMembers: "New members",
      emptyChat: "Choose a member to send a message.",
      emptyFeed: "No posts yet. Create the first post.",
      postMediaAlt: "Post media",
      like: "Like",
      comment: "Comment",
      share: "Share",
      commentPlaceholder: "Write a comment...",
      send: "Send",
      requestArrived: "Friend request received",
      accept: "Accept",
      delete: "Delete",
      emptyRequests: "No pending friend requests.",
      emptyFriends: "No friends yet.",
      emptySuggestions: "No new suggestions.",
      emptyMembers: "No member found.",
      you: "You",
      friend: "Friend",
      requestSent: "Request sent",
      addFriend: "Add friend",
      message: "Message",
      sendMessage: "Send a message",
      emptyConversations: "Connect with members to start messaging.",
      emptyMessages: "No messages yet.",
      messagePlaceholder: "Write a message...",
      emptyNotifications: "No notifications yet.",
      noRequests: "No requests",
      categoryUpdate: "Update",
      categoryPhoto: "Photo",
      categoryVideo: "Video",
      categoryFestival: "Festival",
      categoryHelp: "Help",
      categoryFun: "Fun",
      loginProgress: "Logging in...",
      loginFailed: "Login failed.",
      invalidPhone: "Enter a valid mobile number.",
      registerProgress: "Creating account...",
      registerFailed: "Account was not created.",
      resetProgress: "Resetting password...",
      resetFailed: "Password was not reset.",
      resetDone: "Password reset. Please log in.",
      welcome: "Welcome, ",
      postFailed: "Post was not saved.",
      postAdded: "Post added",
      postNeedsContent: "Add text, a photo, a video, or a URL before posting.",
      likeFailed: "Like was not saved.",
      shareFailed: "Share failed.",
      postShared: "Post shared",
      commentFailed: "Comment was not saved.",
      profileFailed: "Profile was not saved.",
      profileSaved: "Profile saved",
      photoReady: "Profile photo ready",
      avatarAlt: "Profile photo",
      videoAlt: "Post video",
      requestFailed: "Request was not sent.",
      requestSentToast: "Friend request sent",
      requestUpdateFailed: "Request was not updated.",
      messageFailed: "Message was not sent.",
      loggedOut: "Logged out",
      friendRequestNote: "Friend request",
      newCommentNote: "New comment",
      newLikeNote: "New like",
      newMessageNote: "New message",
      likedYourPost: "liked your post.",
      sentRequest: "sent you a request.",
      memberFallback: "Kapoorpur Member"
    }
  };

  const $ = (selector) => document.querySelector(selector);

  function tr(key) {
    const selected = copy[state.lang] || copy.hi;
    return selected[key] || copy.hi[key] || key;
  }

  function setText(selector, key) {
    const node = $(selector);
    if (node) node.textContent = tr(key);
  }

  function setAllText(selector, key) {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = tr(key);
    });
  }

  function setPlaceholder(selector, key) {
    const node = $(selector);
    if (node) node.placeholder = tr(key);
  }

  function setFieldLabel(formSelector, fieldName, key) {
    const input = document.querySelector(`${formSelector} [name="${fieldName}"]`);
    const label = input ? input.closest("label") : null;
    const span = label ? label.querySelector("span") : null;
    if (span) span.textContent = tr(key);
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    $("#languageSelect").value = state.lang;

    setText(".brand small", "brandSmall");
    setText("#logoutButton", "logout");
    setPlaceholder("#globalSearch", "searchPlaceholder");
    setText(".auth-copy .eyebrow", "authEyebrow");
    setText(".auth-copy h1", "heroTitle");
    setText(".auth-copy p:not(.eyebrow)", "heroBody");
    ["feed", "friends", "messages", "notifications", "profile"].forEach((key, index) => {
      const node = document.querySelectorAll(".feature-list span")[index];
      if (node) node.textContent = tr(key);
    });

    setAllText("[data-auth-tab='login']", "login");
    setAllText("[data-auth-tab='register']", "register");
    setAllText("[data-auth-tab='recover']", "forgot");
    setText("#loginForm label:nth-of-type(1) span", "phone");
    setText("#loginForm label:nth-of-type(2) span", "password");
    setText("#loginForm button[type='submit']", "loginButton");
    setText("#loginForm .link-button", "forgotPassword");
    setText("#registerForm label:nth-of-type(1) span", "fullName");
    setText("#registerForm label:nth-of-type(2) span", "phone");
    setText("#registerForm label:nth-of-type(3) span", "password");
    setText("#registerForm label:nth-of-type(4) span", "recoveryPin");
    setPlaceholder("#registerForm [name='recoveryPin']", "recoveryPinPlaceholder");
    setText("#registerForm label:nth-of-type(5) span", "area");
    setText("#registerForm label:nth-of-type(6) span", "profession");
    setPlaceholder("#registerForm [name='profession']", "professionPlaceholder");
    setText("#registerForm button[type='submit']", "createAccount");
    setText("#recoverForm label:nth-of-type(1) span", "phone");
    setText("#recoverForm label:nth-of-type(2) span", "recoveryPin");
    setText("#recoverForm label:nth-of-type(3) span", "newPassword");
    setText("#recoverForm button[type='submit']", "resetPassword");
    setText("#recoverForm .link-button", "goLogin");

    setAllText("[data-view='feed']", "feed");
    setAllText("[data-view='friends']", "friends");
    setAllText("[data-view='messages']", "messages");
    setAllText("[data-view='notifications']", "notifications");
    setAllText("[data-view='members']", "members");
    setAllText("[data-view='entertainment']", "fun");
    setAllText("[data-view='profile']", "profile");
    setText(".composer-head span", "composerHint");
    setPlaceholder("#postForm textarea", "composerPlaceholder");
    setText("#postMediaLabel", "uploadMedia");
    setText("#clearPostMedia", "removeMedia");
    setText("#postForm button[type='submit']", "post");
    document.querySelectorAll("#postForm option").forEach((option) => {
      option.textContent = categoryLabel(option.value);
    });

    setText("#friendsView .eyebrow", "friendsEyebrow");
    setText("#friendsView h1", "friendsTitle");
    setText("#friendsView .section-head.compact .eyebrow", "suggestions");
    setText("#friendsView .section-head.compact h2", "suggestionsTitle");
    setText("#messagesView h1", "messagesTitle");
    setText("#notificationsView h1", "notificationsTitle");
    setText("#membersView h1", "membersTitle");
    setPlaceholder("#memberSearch", "memberSearch");
    setText("#entertainmentView .eyebrow", "entertainment");
    setText("#entertainmentView h1", "entertainmentTitle");
    setText("#entertainmentView .fun-card:nth-child(1) span", "todayQuestion");
    setText("#entertainmentView .fun-card:nth-child(1) button", "postOnThis");
    setText("#entertainmentView .fun-card:nth-child(2) span", "memory");
    setText("#entertainmentView .fun-card:nth-child(2) h2", "memoryText");
    setText("#entertainmentView .fun-card:nth-child(2) button", "writeMemory");
    setText("#entertainmentView .fun-card:nth-child(3) span", "wish");
    setText("#entertainmentView .fun-card:nth-child(3) h2", "wishText");
    setText("#entertainmentView .fun-card:nth-child(3) button", "postWish");
    setText("#entertainmentView .fun-card:nth-child(4) span", "riddle");
    setText("#riddleText", "riddleText");
    setText("#answerButton", "seeAnswer");
    setText("#riddleAnswer", "riddleAnswer");
    setText("#profileView h1", "profileTitle");
    setText("#profilePhotoLabel", "profilePhoto");
    setText("#clearProfilePhoto", "removePhoto");
    setFieldLabel("#profileForm", "name", "name");
    setFieldLabel("#profileForm", "village", "area");
    setFieldLabel("#profileForm", "profession", "profession");
    setFieldLabel("#profileForm", "bio", "bio");
    setText("#profileForm button[type='submit']", "saveProfile");
    setText(".right-rail .side-panel:nth-child(1) h2", "chaupalToday");
    setText(".right-rail .side-panel:nth-child(1) button", "postAnswer");
    setText(".right-rail .side-panel:nth-child(2) h2", "friendRequests");
    setText(".right-rail .side-panel:nth-child(3) h2", "newMembers");
    setText("#chatPanel .empty-state", "emptyChat");
  }

  function init() {
    const badge = $("#modeBadge");
    if (state.mode === "shared") {
      badge.textContent = tr("live");
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }

    $("#languageSelect").value = state.lang;
    applyLanguage();
    bindEvents();
    loadSession();
  }

  function bindEvents() {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
      button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
    });

    $("#loginForm").addEventListener("submit", handleLogin);
    $("#registerForm").addEventListener("submit", handleRegister);
    $("#recoverForm").addEventListener("submit", handleRecover);
    $("#languageSelect").addEventListener("change", (event) => {
      state.lang = event.currentTarget.value === "en" ? "en" : "hi";
      localStorage.setItem(langKey, state.lang);
      applyLanguage();
      if (state.data) {
        hydrateUser();
        renderAll();
        showView(state.activeView);
      }
    });
    $("#logoutButton").addEventListener("click", logout);
    $("#postForm").addEventListener("submit", handlePost);
    $("#postMediaFile").addEventListener("change", handlePostMediaSelect);
    $("#clearPostMedia").addEventListener("click", clearPostMedia);
    $("#profileForm").addEventListener("submit", handleProfile);
    $("#profilePhotoInput").addEventListener("change", handleProfilePhotoSelect);
    $("#clearProfilePhoto").addEventListener("click", clearProfilePhoto);
    $("#memberSearch").addEventListener("input", renderMembers);
    $("#globalSearch").addEventListener("input", () => {
      renderFeed();
      renderMembers();
    });
    $("#answerButton").addEventListener("click", () => {
      $("#riddleAnswer").hidden = !$("#riddleAnswer").hidden;
    });

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => showView(button.dataset.view));
    });

    document.querySelectorAll("[data-fun-post]").forEach((button) => {
      button.addEventListener("click", () => startFunPost(button.dataset.funPost));
    });

    document.addEventListener("click", (event) => {
      const conversation = event.target.closest("[data-conversation]");
      if (conversation) {
        openChat(conversation.dataset.conversation);
      }
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
    state.data = normalizeData(result.data);
    showApp();
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const phone = cleanPhone(form.phone.value);
    const passwordHash = await hashPassword(phone, form.password.value);
    setAuthNote(tr("loginProgress"));

    const result = await request({ action: "social_login", phone, passwordHash });
    if (!result.ok) {
      setAuthNote(result.error || tr("loginFailed"), true);
      return;
    }

    completeLogin(result);
  }

  async function handleRegister(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const phone = cleanPhone(form.phone.value);
    const passwordHash = await hashPassword(phone, form.password.value);
    const recoveryHash = await hashRecovery(phone, form.recoveryPin.value);

    if (phone.length < 10) {
      setAuthNote(tr("invalidPhone"), true);
      return;
    }

    setAuthNote(tr("registerProgress"));
    const result = await request({
      action: "social_register",
      name: form.name.value.trim(),
      phone,
      passwordHash,
      recoveryHash,
      village: form.village.value.trim() || "Kapoorpur",
      profession: form.profession.value.trim()
    });

    if (!result.ok) {
      setAuthNote(result.error || tr("registerFailed"), true);
      return;
    }

    completeLogin(result);
  }

  async function handleRecover(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const phone = cleanPhone(form.phone.value);
    const recoveryHash = await hashRecovery(phone, form.recoveryPin.value);
    const passwordHash = await hashPassword(phone, form.password.value);
    setAuthNote(tr("resetProgress"));

    const result = await request({
      action: "social_reset_password",
      phone,
      recoveryHash,
      passwordHash
    });

    if (!result.ok) {
      setAuthNote(result.error || tr("resetFailed"), true);
      return;
    }

    form.reset();
    switchAuthTab("login");
    setAuthNote(tr("resetDone"));
  }

  function completeLogin(result) {
    state.token = result.token;
    state.user = result.user;
    state.data = normalizeData(result.data);
    localStorage.setItem(sessionKey, state.token);
    showApp();
    toast(tr("welcome") + state.user.name);
  }

  async function handlePostMediaSelect(event) {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    if (!file) return;
    const pending = await prepareMediaFile(file, "post");
    if (!pending) {
      event.currentTarget.value = "";
      return;
    }
    revokePending(state.pendingPostMedia);
    state.pendingPostMedia = pending;
    const category = $("#postForm").elements.category;
    if (pending.type.startsWith("image/")) category.value = "photo";
    if (pending.type.startsWith("video/")) category.value = "video";
    renderMediaPreview("#postMediaPreview", pending, tr("mediaReady"));
    $("#clearPostMedia").hidden = false;
  }

  async function handleProfilePhotoSelect(event) {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    if (!file) return;
    const pending = await prepareMediaFile(file, "avatar");
    if (!pending) {
      event.currentTarget.value = "";
      return;
    }
    revokePending(state.pendingAvatar);
    state.pendingAvatar = pending;
    state.avatarRemove = false;
    renderProfilePreview(pending);
    $("#clearProfilePhoto").hidden = false;
    toast(tr("photoReady"));
  }

  function clearPostMedia() {
    revokePending(state.pendingPostMedia);
    state.pendingPostMedia = null;
    $("#postMediaFile").value = "";
    $("#postMediaPreview").hidden = true;
    $("#postMediaPreview").innerHTML = "";
    $("#clearPostMedia").hidden = true;
  }

  function clearProfilePhoto() {
    revokePending(state.pendingAvatar);
    state.pendingAvatar = null;
    state.avatarRemove = true;
    $("#profilePhotoInput").value = "";
    setAvatarNode($("#profilePhotoPreview"), { name: state.user ? state.user.name : "K" });
    $("#clearProfilePhoto").hidden = true;
  }

  async function prepareMediaFile(file, kind) {
    const isImage = /^image\//.test(file.type);
    const isVideo = /^video\//.test(file.type);
    if ((kind === "avatar" && !isImage) || (kind === "post" && !isImage && !isVideo)) {
      toast(tr("mediaUnsupported"));
      return null;
    }
    if (isImage && file.size > (kind === "avatar" ? maxAvatarBytes : maxImageBytes)) {
      toast(tr("mediaTooLarge"));
      return null;
    }
    if (isVideo && file.size > maxVideoBytes) {
      toast(tr("mediaTooLarge"));
      return null;
    }

    if (isImage) {
      return compressImage(file, kind === "avatar" ? 520 : 1400, kind === "avatar" ? 0.82 : 0.86);
    }

    return {
      blob: file,
      type: file.type || "video/mp4",
      name: file.name || "video",
      size: file.size,
      previewUrl: URL.createObjectURL(file)
    };
  }

  async function compressImage(file, maxSide, quality) {
    const imageUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(imageUrl);
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
      const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
      const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) throw new Error("Image compression failed");
      return {
        blob,
        type: "image/jpeg",
        name: (file.name || "photo").replace(/\.[^.]+$/, "") + ".jpg",
        size: blob.size,
        previewUrl: URL.createObjectURL(blob)
      };
    } catch (error) {
      toast(tr("mediaUnsupported"));
      return null;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  }

  function renderMediaPreview(selector, pending, label) {
    const node = $(selector);
    if (!node || !pending) return;
    const media = pending.type.startsWith("video/")
      ? `<video src="${escapeAttr(pending.previewUrl)}" controls preload="metadata"></video>`
      : `<img src="${escapeAttr(pending.previewUrl)}" alt="${escapeAttr(label)}">`;
    node.innerHTML = `${media}<small>${escapeHtml(label)} | ${escapeHtml(formatBytes(pending.size))}</small>`;
    node.hidden = false;
  }

  function renderProfilePreview(pending) {
    const node = $("#profilePhotoPreview");
    if (!node || !pending) return;
    node.classList.add("has-photo");
    node.innerHTML = `<img src="${escapeAttr(pending.previewUrl)}" alt="${escapeAttr(tr("avatarAlt"))}">`;
  }

  async function handlePost(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const content = form.content.value.trim();
    const mediaUrl = form.mediaUrl.value.trim();
    const pending = state.pendingPostMedia;
    if (!content && !mediaUrl && !pending) {
      toast(tr("postNeedsContent"));
      return;
    }

    let storedMedia = {};
    try {
      storedMedia = pending ? await storePendingMedia(pending) : {};
    } catch (error) {
      toast(tr("postFailed"));
      return;
    }

    const result = await request({
      action: "social_post",
      token: state.token,
      content,
      category: form.category.value,
      mediaUrl,
      mediaType: storedMedia.mediaType || "",
      mediaName: storedMedia.mediaName || "",
      mediaLocalId: storedMedia.mediaLocalId || ""
    });

    if (!result.ok) {
      toast(result.error || tr("postFailed"));
      return;
    }

    form.reset();
    clearPostMedia();
    updateSnapshot(result);
    toast(tr("postAdded"));
  }

  async function handleReaction(postId) {
    const result = await request({
      action: "social_react",
      token: state.token,
      postId,
      type: "like"
    });
    if (!result.ok) return toast(result.error || tr("likeFailed"));
    updateSnapshot(result);
  }

  async function handleShare(postId) {
    const result = await request({
      action: "social_share",
      token: state.token,
      postId
    });
    if (!result.ok) return toast(result.error || tr("shareFailed"));
    updateSnapshot(result);
    showView("feed");
    toast(tr("postShared"));
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
    if (!result.ok) return toast(result.error || tr("commentFailed"));
    input.value = "";
    updateSnapshot(result);
  }

  async function handleProfile(event) {
    event.preventDefault();
    const form = event.currentTarget;
    let storedAvatar = {};
    try {
      storedAvatar = state.pendingAvatar ? await storePendingMedia(state.pendingAvatar) : {};
    } catch (error) {
      toast(tr("profileFailed"));
      return;
    }
    const result = await request({
      action: "social_profile_update",
      token: state.token,
      name: form.name.value.trim(),
      village: form.village.value.trim(),
      profession: form.profession.value.trim(),
      bio: form.bio.value.trim(),
      avatarRemove: state.avatarRemove ? "yes" : "",
      avatarLocalId: storedAvatar.mediaLocalId || "",
      avatarType: storedAvatar.mediaType || "",
      avatarName: storedAvatar.mediaName || ""
    });
    if (!result.ok) return toast(result.error || tr("profileFailed"));
    state.user = result.user;
    state.pendingAvatar = null;
    state.avatarRemove = false;
    updateSnapshot(result);
    toast(tr("profileSaved"));
  }

  async function handleFriendRequest(userId) {
    const result = await request({
      action: "social_friend_request",
      token: state.token,
      targetUserId: userId
    });
    if (!result.ok) return toast(result.error || tr("requestFailed"));
    updateSnapshot(result);
    toast(tr("requestSentToast"));
  }

  async function handleFriendRespond(userId, decision) {
    const result = await request({
      action: "social_friend_respond",
      token: state.token,
      targetUserId: userId,
      decision
    });
    if (!result.ok) return toast(result.error || tr("requestUpdateFailed"));
    updateSnapshot(result);
  }

  async function handleMessage(event, userId) {
    event.preventDefault();
    const input = event.currentTarget.elements.message;
    const content = input.value.trim();
    if (!content) return;

    const result = await request({
      action: "social_message",
      token: state.token,
      targetUserId: userId,
      content
    });
    if (!result.ok) return toast(result.error || tr("messageFailed"));
    input.value = "";
    updateSnapshot(result);
    openChat(userId);
  }

  async function request(payload) {
    return state.mode === "shared" ? sharedRequest(payload) : demoRequest(payload);
  }

  function sharedRequest(payload) {
    return new Promise((resolve) => {
      let url;
      try {
        url = new URL(state.endpoint);
      } catch (error) {
        resolve({ ok: false, error: state.lang === "en" ? "Apps Script URL is not valid." : "Apps Script URL valid नहीं है।" });
        return;
      }

      const callbackName = "gramSocialCallback_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        cleanup();
        resolve({ ok: false, error: state.lang === "en" ? "Shared backend did not respond. Check the Apps Script URL." : "Shared backend response नहीं आया। Apps Script URL check करें।" });
      }, 12000);

      window[callbackName] = (result) => {
        cleanup();
        resolve(result || { ok: false, error: state.lang === "en" ? "Empty response." : "Response खाली है।" });
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
        resolve({ ok: false, error: state.lang === "en" ? "Apps Script URL did not load." : "Apps Script URL load नहीं हुआ।" });
      };
      document.body.appendChild(script);
    });
  }

  async function demoRequest(payload) {
    await tinyDelay();
    const data = normalizeData(getDemoData());
    const now = new Date().toISOString();

    if (payload.action === "social_register") {
      if (data.users.some((user) => cleanPhone(user.phone) === payload.phone && !isHidden(user))) {
        return fail(state.lang === "en" ? "This mobile number already has an account." : "इस मोबाइल नंबर से account पहले से है।");
      }
      const user = {
        userId: "u_" + Date.now(),
        name: payload.name,
        phone: payload.phone,
        passwordHash: payload.passwordHash,
        recoveryHash: payload.recoveryHash,
        village: payload.village || "Kapoorpur",
        profession: payload.profession || "",
        bio: "",
        avatarUrl: "",
        avatarLocalId: "",
        avatarType: "",
        avatarName: "",
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
      if (!user) return fail(state.lang === "en" ? "Mobile number or password is wrong." : "Mobile number या password गलत है।");
      user.lastLogin = now;
      saveDemoData(data);
      return loginResponse(user, "demo_" + user.userId, data);
    }

    if (payload.action === "social_reset_password") {
      const user = data.users.find((item) => cleanPhone(item.phone) === payload.phone && item.recoveryHash === payload.recoveryHash && !isHidden(item));
      if (!user) return fail(state.lang === "en" ? "Mobile number or recovery PIN is wrong." : "Mobile number या recovery PIN गलत है।");
      user.passwordHash = payload.passwordHash;
      saveDemoData(data);
      return { ok: true };
    }

    const user = userFromToken(payload.token, data);
    if (!user) return fail(state.lang === "en" ? "Session expired. Please log in." : "Session खत्म हो गया। Login करें।");

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
        mediaType: payload.mediaType || "",
        mediaName: payload.mediaName || "",
        mediaLocalId: payload.mediaLocalId || "",
        createdAt: now,
        status: ""
      });
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    if (payload.action === "social_share") {
      const original = data.posts.find((post) => post.postId === payload.postId && !isHidden(post));
      if (!original) return fail(state.lang === "en" ? "Post was not found." : "Post नहीं मिला।");
      const author = data.users.find((item) => item.userId === original.userId) || { name: "Member" };
      data.posts.push({
        postId: "p_" + Date.now(),
        userId: user.userId,
        content: `${state.lang === "en" ? "Shared from" : "इनसे शेयर किया"} ${author.name}:\n${original.content}`.slice(0, 700),
        category: "update",
        mediaUrl: original.mediaUrl || "",
        mediaType: original.mediaType || "",
        mediaName: original.mediaName || "",
        mediaLocalId: original.mediaLocalId || "",
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
      if (payload.avatarRemove) {
        user.avatarUrl = "";
        user.avatarLocalId = "";
        user.avatarType = "";
        user.avatarName = "";
      } else if (payload.avatarLocalId) {
        user.avatarUrl = "";
        user.avatarLocalId = payload.avatarLocalId;
        user.avatarType = payload.avatarType || "";
        user.avatarName = payload.avatarName || "";
      }
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    if (payload.action === "social_friend_request") {
      updateFriendship(data, user.userId, payload.targetUserId, "request");
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    if (payload.action === "social_friend_respond") {
      updateFriendship(data, user.userId, payload.targetUserId, payload.decision);
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    if (payload.action === "social_message") {
      data.messages.push({
        messageId: "m_" + Date.now(),
        fromUserId: user.userId,
        toUserId: payload.targetUserId,
        content: payload.content.slice(0, 500),
        createdAt: now,
        status: ""
      });
      saveDemoData(data);
      return loginResponse(user, payload.token, data);
    }

    return fail(state.lang === "en" ? "Unknown action." : "Unknown action.");
  }

  function updateFriendship(data, currentUserId, targetUserId, action) {
    if (!targetUserId || targetUserId === currentUserId) return;
    const now = new Date().toISOString();
    const existing = data.friendships.find((item) => {
      return samePair(item, currentUserId, targetUserId) && !isHidden(item);
    });

    if (action === "request") {
      if (!existing) {
        data.friendships.push({
          friendId: "f_" + Date.now(),
          requesterId: currentUserId,
          addresseeId: targetUserId,
          status: "pending",
          createdAt: now,
          updatedAt: now
        });
      } else if (existing.status === "pending" && existing.addresseeId === currentUserId) {
        existing.status = "accepted";
        existing.updatedAt = now;
      }
      return;
    }

    if (!existing || existing.status !== "pending" || existing.addresseeId !== currentUserId) return;
    existing.status = action === "accept" ? "accepted" : "hidden";
    existing.updatedAt = now;
  }

  function showAuth() {
    $("#authScreen").hidden = false;
    $("#appShell").hidden = true;
    $("#logoutButton").hidden = true;
    $("#topSearchWrap").hidden = true;
  }

  function showApp() {
    $("#authScreen").hidden = true;
    $("#appShell").hidden = false;
    $("#logoutButton").hidden = false;
    $("#topSearchWrap").hidden = false;
    hydrateUser();
    renderAll();
    showView(state.activeView);
  }

  function hydrateUser() {
    const initial = initials(state.user.name);
    setAvatarNode($("#sideAvatar"), state.user);
    setAvatarNode($("#composerAvatar"), state.user);
    setAvatarNode($("#profilePhotoPreview"), state.user);
    $("#clearProfilePhoto").hidden = !hasAvatar(state.user);
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
    const questionList = questions[state.lang] || questions.hi;
    $("#dailyQuestion").textContent = questionList[new Date().getDate() % questionList.length];
    $("#sideQuestion").textContent = questionList[(new Date().getDate() + 1) % questionList.length];
    applyLanguage();
    renderFeed();
    renderFriends();
    renderMembers();
    renderConversations();
    renderNotifications();
    renderNewMembers();
    renderSideRequests();
  }

  function renderFeed() {
    const query = $("#globalSearch").value.trim().toLowerCase();
    const posts = activeItems(state.data.posts)
      .filter((post) => {
        const author = findUser(post.userId);
        return [post.content, post.category, author.name].join(" ").toLowerCase().includes(query);
      })
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    $("#feedList").innerHTML = posts.length ? posts.map(renderPost).join("") : `<p class="empty-state">${escapeHtml(tr("emptyFeed"))}</p>`;

    document.querySelectorAll("[data-like]").forEach((button) => {
      button.addEventListener("click", () => handleReaction(button.dataset.like));
    });
    document.querySelectorAll("[data-share]").forEach((button) => {
      button.addEventListener("click", () => handleShare(button.dataset.share));
    });
    document.querySelectorAll("[data-focus-comment]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById("comment_" + button.dataset.focusComment);
        if (input) input.focus();
      });
    });
    document.querySelectorAll("[data-comment-form]").forEach((form) => {
      form.addEventListener("submit", (event) => handleComment(event, form.dataset.commentForm));
    });
    hydrateLocalMedia();
  }

  function renderPost(post) {
    const user = findUser(post.userId);
    const reactions = activeItems(state.data.reactions).filter((item) => item.postId === post.postId);
    const comments = activeItems(state.data.comments).filter((item) => item.postId === post.postId);
    const liked = reactions.some((item) => item.userId === state.user.userId && item.type === "like");
    const media = renderPostMedia(post);

    return `
      <article class="post-card">
        <div class="post-head">
          ${avatarMarkup(user)}
          <div>
            <h3>${escapeHtml(user.name)}</h3>
            <small>${timeAgo(post.createdAt)} | ${escapeHtml(categoryLabel(post.category))}</small>
          </div>
        </div>
        <div class="post-body">
          ${escapeHtml(post.content)}
          ${media}
        </div>
        <div class="post-actions">
          <button type="button" class="${liked ? "active" : ""}" data-like="${escapeAttr(post.postId)}">${escapeHtml(tr("like"))} ${reactions.length}</button>
          <button type="button" data-focus-comment="${escapeAttr(post.postId)}">${escapeHtml(tr("comment"))} ${comments.length}</button>
          <button type="button" data-share="${escapeAttr(post.postId)}">${escapeHtml(tr("share"))}</button>
        </div>
        <div class="comments">
          ${comments.map(renderComment).join("")}
          <form class="comment-form" data-comment-form="${escapeAttr(post.postId)}">
            <input id="comment_${escapeAttr(post.postId)}" name="comment" type="text" maxlength="300" placeholder="${escapeAttr(tr("commentPlaceholder"))}">
            <button type="submit">${escapeHtml(tr("send"))}</button>
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

  function renderFriends() {
    const requests = incomingRequests();
    $("#friendRequests").innerHTML = requests.length ? requests.map((item) => {
      const user = findUser(item.requesterId);
      return `
        <article class="mini-card">
          <strong>${escapeHtml(user.name)}</strong>
          <p class="muted">${escapeHtml(tr("requestArrived"))}</p>
          <div class="member-card-actions">
            <button class="primary-button" data-friend-accept="${escapeAttr(user.userId)}">${escapeHtml(tr("accept"))}</button>
            <button class="ghost-button" data-friend-reject="${escapeAttr(user.userId)}">${escapeHtml(tr("delete"))}</button>
          </div>
        </article>
      `;
    }).join("") : `<p class="empty-state">${escapeHtml(tr("emptyRequests"))}</p>`;

    const friends = friendUsers();
    $("#friendsGrid").innerHTML = friends.length ? friends.map((user) => renderUserCard(user)).join("") : `<p class="empty-state">${escapeHtml(tr("emptyFriends"))}</p>`;

    const suggestions = activeItems(state.data.users)
      .filter((user) => user.userId !== state.user.userId && friendStatus(user.userId) === "none")
      .slice(0, 8);
    $("#suggestionGrid").innerHTML = suggestions.length ? suggestions.map((user) => renderUserCard(user)).join("") : `<p class="empty-state">${escapeHtml(tr("emptySuggestions"))}</p>`;
    bindMemberButtons();
    hydrateLocalMedia();
  }

  function renderMembers() {
    const query = ($("#memberSearch").value || $("#globalSearch").value).trim().toLowerCase();
    const users = activeItems(state.data.users)
      .filter((user) => {
        return [user.name, user.village, user.profession].join(" ").toLowerCase().includes(query);
      })
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

    $("#memberGrid").innerHTML = users.length ? users.map((user) => renderUserCard(user)).join("") : `<p class="empty-state">${escapeHtml(tr("emptyMembers"))}</p>`;
    bindMemberButtons();
    hydrateLocalMedia();
  }

  function renderUserCard(user) {
    const status = friendStatus(user.userId);
    const isSelf = user.userId === state.user.userId;
    let action = "";
    if (isSelf) {
      action = `<span class="status-pill">${escapeHtml(tr("you"))}</span>`;
    } else if (status === "friend") {
      action = `<button class="primary-button" data-open-chat="${escapeAttr(user.userId)}">${escapeHtml(tr("message"))}</button><span class="status-pill">${escapeHtml(tr("friend"))}</span>`;
    } else if (status === "sent") {
      action = `<span class="status-pill">${escapeHtml(tr("requestSent"))}</span>`;
    } else if (status === "received") {
      action = `<button class="primary-button" data-friend-accept="${escapeAttr(user.userId)}">${escapeHtml(tr("accept"))}</button><button class="ghost-button" data-friend-reject="${escapeAttr(user.userId)}">${escapeHtml(tr("delete"))}</button>`;
    } else {
      action = `<button class="primary-button" data-friend-request="${escapeAttr(user.userId)}">${escapeHtml(tr("addFriend"))}</button><button class="ghost-button" data-open-chat="${escapeAttr(user.userId)}">${escapeHtml(tr("message"))}</button>`;
    }

    return `
      <article class="member-card">
        ${avatarMarkup(user)}
        <div>
          <h2>${escapeHtml(user.name)}</h2>
          <p>${escapeHtml([user.profession, user.village].filter(Boolean).join(" | ") || "Kapoorpur")}</p>
          ${user.bio ? `<p>${escapeHtml(user.bio)}</p>` : ""}
          <div class="member-card-actions">${action}</div>
        </div>
      </article>
    `;
  }

  function bindMemberButtons() {
    document.querySelectorAll("[data-friend-request]").forEach((button) => {
      button.addEventListener("click", () => handleFriendRequest(button.dataset.friendRequest));
    });
    document.querySelectorAll("[data-friend-accept]").forEach((button) => {
      button.addEventListener("click", () => handleFriendRespond(button.dataset.friendAccept, "accept"));
    });
    document.querySelectorAll("[data-friend-reject]").forEach((button) => {
      button.addEventListener("click", () => handleFriendRespond(button.dataset.friendReject, "reject"));
    });
    document.querySelectorAll("[data-open-chat]").forEach((button) => {
      button.addEventListener("click", () => {
        showView("messages");
        openChat(button.dataset.openChat);
      });
    });
  }

  function renderConversations() {
    const ids = conversationUserIds();
    $("#conversationList").innerHTML = ids.length ? ids.map((id) => {
      const user = findUser(id);
      const latest = messagesWith(id).slice(-1)[0];
      return `
        <button type="button" class="conversation-item ${state.chatUserId === id ? "active" : ""}" data-conversation="${escapeAttr(id)}">
          ${avatarMarkup(user)}
          <div>
            <strong>${escapeHtml(user.name)}</strong>
            <p class="muted">${escapeHtml(latest ? latest.content : tr("sendMessage"))}</p>
          </div>
        </button>
      `;
    }).join("") : `<p class="empty-state">${escapeHtml(tr("emptyConversations"))}</p>`;

    document.querySelectorAll("[data-conversation]").forEach((button) => {
      button.addEventListener("click", () => openChat(button.dataset.conversation));
    });

    if (state.chatUserId) openChat(state.chatUserId, true);
    hydrateLocalMedia();
  }

  function openChat(userId, skipRenderList) {
    state.chatUserId = userId;
    const user = findUser(userId);
    const messages = messagesWith(userId);
    $("#chatPanel").innerHTML = `
      <div class="chat-head">${escapeHtml(user.name)}</div>
      <div class="chat-messages" id="chatMessages">
        ${messages.length ? messages.map((message) => `
          <div class="message-bubble ${message.fromUserId === state.user.userId ? "mine" : ""}">
            ${escapeHtml(message.content)}
            <small>${timeAgo(message.createdAt)}</small>
          </div>
        `).join("") : `<p class="empty-state">${escapeHtml(tr("emptyMessages"))}</p>`}
      </div>
      <form class="message-form" id="messageForm">
        <input name="message" type="text" maxlength="500" placeholder="${escapeAttr(tr("messagePlaceholder"))}" autocomplete="off">
        <button type="submit">${escapeHtml(tr("send"))}</button>
      </form>
    `;
    $("#messageForm").addEventListener("submit", (event) => handleMessage(event, userId));
    const list = $("#chatMessages");
    if (list) list.scrollTop = list.scrollHeight;
    if (!skipRenderList) renderConversations();
  }

  function renderNotifications() {
    const notes = notifications();
    $("#notificationList").innerHTML = notes.length ? notes.map((note) => `
      <article class="mini-card">
        <strong>${escapeHtml(note.title)}</strong>
        <p class="muted">${escapeHtml(note.body)}</p>
        <small class="muted">${timeAgo(note.createdAt)}</small>
      </article>
    `).join("") : `<p class="empty-state">${escapeHtml(tr("emptyNotifications"))}</p>`;
  }

  function renderNewMembers() {
    const members = activeItems(state.data.users)
      .slice()
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, 5);
    $("#newMembers").innerHTML = members.map((user) => `<span>${escapeHtml(user.name)}</span>`).join("");
  }

  function renderSideRequests() {
    const requests = incomingRequests().slice(0, 4);
    $("#sideRequests").innerHTML = requests.length ? requests.map((item) => {
      const user = findUser(item.requesterId);
      return `<span>${escapeHtml(user.name)}</span>`;
    }).join("") : `<span>${escapeHtml(tr("noRequests"))}</span>`;
  }

  function showView(view) {
    state.activeView = view;
    ["feed", "friends", "messages", "notifications", "members", "entertainment", "profile"].forEach((name) => {
      $("#" + name + "View").hidden = name !== view;
    });
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === view);
    });
    if (view === "messages") renderConversations();
  }

  function switchAuthTab(tab) {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.authTab === tab);
    });
    $("#loginForm").hidden = tab !== "login";
    $("#registerForm").hidden = tab !== "register";
    $("#recoverForm").hidden = tab !== "recover";
    setAuthNote("");
  }

  function startFunPost(type) {
    showView("feed");
    const textarea = $("#postForm textarea");
    const text = {
      question: state.lang === "en" ? `Question of the day: ${$("#dailyQuestion").textContent}\nMy answer: ` : `आज का सवाल: ${$("#dailyQuestion").textContent}\nमेरा जवाब: `,
      memory: state.lang === "en" ? "My favorite village memory: " : "गांव की मेरी प्यारी याद: ",
      wish: state.lang === "en" ? "Best wishes to the Kapoorpur family: " : "कपूरपुर परिवार को शुभकामनाएं: ",
      chaupal: state.lang === "en" ? `Community question: ${$("#sideQuestion").textContent}\nMy suggestion: ` : `चौपाल सवाल: ${$("#sideQuestion").textContent}\nमेरा सुझाव: `
    }[type] || "";
    textarea.value = text;
    textarea.focus();
  }

  function updateSnapshot(result) {
    state.user = result.user || state.user;
    state.data = normalizeData(result.data || state.data);
    hydrateUser();
    renderAll();
  }

  function logout() {
    localStorage.removeItem(sessionKey);
    state.token = "";
    state.user = null;
    state.chatUserId = "";
    showAuth();
    toast(tr("loggedOut"));
  }

  function incomingRequests() {
    return activeItems(state.data.friendships).filter((item) => item.status === "pending" && item.addresseeId === state.user.userId);
  }

  function friendUsers() {
    return activeItems(state.data.users).filter((user) => friendStatus(user.userId) === "friend");
  }

  function friendStatus(userId) {
    if (!state.user || userId === state.user.userId) return "self";
    const relation = activeItems(state.data.friendships).find((item) => samePair(item, state.user.userId, userId));
    if (!relation) return "none";
    if (relation.status === "accepted") return "friend";
    if (relation.status === "pending" && relation.requesterId === state.user.userId) return "sent";
    if (relation.status === "pending" && relation.addresseeId === state.user.userId) return "received";
    return "none";
  }

  function samePair(item, a, b) {
    return (item.requesterId === a && item.addresseeId === b) || (item.requesterId === b && item.addresseeId === a);
  }

  function conversationUserIds() {
    const ids = new Set();
    friendUsers().forEach((user) => ids.add(user.userId));
    activeItems(state.data.messages).forEach((message) => {
      if (message.fromUserId === state.user.userId) ids.add(message.toUserId);
      if (message.toUserId === state.user.userId) ids.add(message.fromUserId);
    });
    if (!ids.size) {
      activeItems(state.data.users)
        .filter((user) => user.userId !== state.user.userId)
        .slice(0, 8)
        .forEach((user) => ids.add(user.userId));
    }
    return Array.from(ids);
  }

  function messagesWith(userId) {
    return activeItems(state.data.messages)
      .filter((message) => {
        return (message.fromUserId === state.user.userId && message.toUserId === userId) ||
          (message.fromUserId === userId && message.toUserId === state.user.userId);
      })
      .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  }

  function notifications() {
    const myPosts = activeItems(state.data.posts).filter((post) => post.userId === state.user.userId).map((post) => post.postId);
    const notes = [];

    incomingRequests().forEach((item) => {
      const user = findUser(item.requesterId);
      notes.push({ title: tr("friendRequestNote"), body: `${user.name} ${tr("sentRequest")}`, createdAt: item.createdAt || item.updatedAt });
    });

    activeItems(state.data.comments).forEach((comment) => {
      if (myPosts.includes(comment.postId) && comment.userId !== state.user.userId) {
        const user = findUser(comment.userId);
        notes.push({ title: tr("newCommentNote"), body: `${user.name}: ${comment.content}`, createdAt: comment.createdAt });
      }
    });

    activeItems(state.data.reactions).forEach((reaction) => {
      const post = state.data.posts.find((item) => item.postId === reaction.postId);
      if (post && post.userId === state.user.userId && reaction.userId !== state.user.userId) {
        const user = findUser(reaction.userId);
        notes.push({ title: tr("newLikeNote"), body: `${user.name} ${tr("likedYourPost")}`, createdAt: reaction.createdAt });
      }
    });

    activeItems(state.data.messages).forEach((message) => {
      if (message.toUserId === state.user.userId) {
        const user = findUser(message.fromUserId);
        notes.push({ title: tr("newMessageNote"), body: `${user.name}: ${message.content}`, createdAt: message.createdAt });
      }
    });

    return notes.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, 30);
  }

  function getDemoData() {
    const saved = localStorage.getItem(demoKey);
    if (!saved) {
      localStorage.setItem(demoKey, JSON.stringify(seedData));
      return clone(seedData);
    }
    try {
      return normalizeData(JSON.parse(saved));
    } catch (error) {
      localStorage.setItem(demoKey, JSON.stringify(seedData));
      return clone(seedData);
    }
  }

  function saveDemoData(data) {
    localStorage.setItem(demoKey, JSON.stringify(normalizeData(data)));
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
      data: publicSnapshot(data, user.userId)
    };
  }

  function publicSnapshot(data, userId) {
    return {
      users: activeItems(data.users).map(publicUser),
      posts: activeItems(data.posts),
      comments: activeItems(data.comments),
      reactions: activeItems(data.reactions),
      friendships: activeItems(data.friendships),
      messages: activeItems(data.messages).filter((message) => message.fromUserId === userId || message.toUserId === userId)
    };
  }

  function publicUser(user) {
    return {
      userId: user.userId,
      name: user.name,
      village: user.village,
      profession: user.profession,
      bio: user.bio,
      avatarUrl: user.avatarUrl || "",
      avatarLocalId: user.avatarLocalId || "",
      avatarType: user.avatarType || "",
      avatarName: user.avatarName || "",
      createdAt: user.createdAt,
      status: user.status
    };
  }

  function findUser(userId) {
    return activeItems(state.data.users).find((user) => user.userId === userId) || { userId, name: tr("memberFallback") };
  }

  function normalizeData(data) {
    const clean = data || {};
    return {
      users: Array.isArray(clean.users) ? clean.users : [],
      posts: Array.isArray(clean.posts) ? clean.posts : [],
      comments: Array.isArray(clean.comments) ? clean.comments : [],
      reactions: Array.isArray(clean.reactions) ? clean.reactions : [],
      friendships: Array.isArray(clean.friendships) ? clean.friendships : [],
      messages: Array.isArray(clean.messages) ? clean.messages : []
    };
  }

  function activeItems(items) {
    return (items || []).filter((item) => !isHidden(item));
  }

  function isHidden(item) {
    return ["hidden", "deleted"].includes(String(item.status || "").toLowerCase());
  }

  function avatarMarkup(user) {
    const remote = safeMedia(user.avatarUrl);
    const localId = user.avatarLocalId || "";
    if (remote) {
      return `<div class="avatar has-photo"><img src="${escapeAttr(remote)}" alt="${escapeAttr(tr("avatarAlt"))}" loading="lazy"></div>`;
    }
    if (localId) {
      return `<div class="avatar has-photo" data-avatar-local-id="${escapeAttr(localId)}">${escapeHtml(initials(user.name))}</div>`;
    }
    return `<div class="avatar">${escapeHtml(initials(user.name))}</div>`;
  }

  function setAvatarNode(node, user) {
    if (!node) return;
    const remote = safeMedia(user.avatarUrl);
    const localId = user.avatarLocalId || "";
    node.removeAttribute("data-avatar-local-id");
    node.classList.toggle("has-photo", Boolean(remote || localId));
    if (remote) {
      node.innerHTML = `<img src="${escapeAttr(remote)}" alt="${escapeAttr(tr("avatarAlt"))}">`;
      return;
    }
    if (localId) {
      node.dataset.avatarLocalId = localId;
      node.textContent = initials(user.name);
      hydrateLocalMedia();
      return;
    }
    node.textContent = initials(user.name);
  }

  function hasAvatar(user) {
    return Boolean(user && (safeMedia(user.avatarUrl) || user.avatarLocalId));
  }

  function renderPostMedia(post) {
    const localId = post.mediaLocalId || "";
    const remote = safeMedia(post.mediaUrl);
    const type = post.mediaType || inferMediaType(remote);
    if (localId) {
      return `<div class="post-media loading" data-media-local-id="${escapeAttr(localId)}" data-media-type="${escapeAttr(type)}">${escapeHtml(tr("mediaLoading"))}</div>`;
    }
    if (!remote) return "";
    if (isVideoType(type, remote)) {
      return `<div class="post-media"><video src="${escapeAttr(remote)}" controls preload="metadata">${escapeHtml(tr("videoAlt"))}</video></div>`;
    }
    return `<a class="post-media" href="${escapeAttr(remote)}" target="_blank" rel="noopener"><img src="${escapeAttr(remote)}" alt="${escapeAttr(tr("postMediaAlt"))}" loading="lazy"></a>`;
  }

  async function storePendingMedia(pending) {
    if (!pending || !pending.blob) return {};
    const id = "media_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    await putMediaRecord({
      id,
      blob: pending.blob,
      type: pending.type,
      name: pending.name,
      size: pending.size,
      ownerId: state.user ? state.user.userId : "",
      createdAt: new Date().toISOString()
    });
    return {
      mediaLocalId: id,
      mediaType: pending.type,
      mediaName: pending.name
    };
  }

  function hydrateLocalMedia() {
    document.querySelectorAll("[data-media-local-id]").forEach(async (node) => {
      if (node.dataset.hydrated === "yes") return;
      const record = await getMediaRecord(node.dataset.mediaLocalId);
      if (!record || (!record.blob && !record.dataUrl)) return;
      node.dataset.hydrated = "yes";
      node.classList.remove("loading");
      const url = record.dataUrl || URL.createObjectURL(record.blob);
      if (isVideoType(record.type, record.name)) {
        node.innerHTML = `<video src="${escapeAttr(url)}" controls preload="metadata">${escapeHtml(tr("videoAlt"))}</video>`;
      } else {
        node.innerHTML = `<img src="${escapeAttr(url)}" alt="${escapeAttr(tr("postMediaAlt"))}" loading="lazy">`;
      }
    });

    document.querySelectorAll("[data-avatar-local-id]").forEach(async (node) => {
      if (node.dataset.avatarHydrated === "yes") return;
      const record = await getMediaRecord(node.dataset.avatarLocalId);
      if (!record || (!record.blob && !record.dataUrl)) return;
      node.dataset.avatarHydrated = "yes";
      node.classList.add("has-photo");
      const url = record.dataUrl || URL.createObjectURL(record.blob);
      node.innerHTML = `<img src="${escapeAttr(url)}" alt="${escapeAttr(tr("avatarAlt"))}" loading="lazy">`;
    });
  }

  function openMediaDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not available"));
        return;
      }
      const request = indexedDB.open(mediaDbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(mediaStoreName)) {
          db.createObjectStore(mediaStoreName, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Media database error"));
    });
  }

  async function putMediaRecord(record) {
    if (!window.indexedDB) return putMediaRecordFallback(record);
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(mediaStoreName, "readwrite");
      tx.objectStore(mediaStoreName).put(record);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error || new Error("Media save failed"));
      };
    });
  }

  async function getMediaRecord(id) {
    if (!id) return null;
    try {
      if (!window.indexedDB) return getMediaRecordFallback(id);
      const db = await openMediaDb();
      return await new Promise((resolve) => {
        const tx = db.transaction(mediaStoreName, "readonly");
        const request = tx.objectStore(mediaStoreName).get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
        tx.oncomplete = () => db.close();
      });
    } catch (error) {
      return getMediaRecordFallback(id);
    }
  }

  async function putMediaRecordFallback(record) {
    const dataUrl = await blobToDataUrl(record.blob);
    const saved = readFallbackMedia();
    saved[record.id] = {
      id: record.id,
      type: record.type,
      name: record.name,
      size: record.size,
      ownerId: record.ownerId,
      createdAt: record.createdAt,
      dataUrl
    };
    localStorage.setItem(mediaFallbackKey, JSON.stringify(saved));
  }

  function getMediaRecordFallback(id) {
    return readFallbackMedia()[id] || null;
  }

  function readFallbackMedia() {
    try {
      const value = JSON.parse(localStorage.getItem(mediaFallbackKey) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (error) {
      return {};
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Media read failed"));
      reader.readAsDataURL(blob);
    });
  }

  function revokePending(pending) {
    if (pending && pending.previewUrl) URL.revokeObjectURL(pending.previewUrl);
  }

  function inferMediaType(value) {
    const lower = String(value || "").toLowerCase();
    if (/\.(mp4|webm|ogg|mov)(\?|#|$)/.test(lower)) return "video/mp4";
    if (/\.(jpg|jpeg|png|gif|webp)(\?|#|$)/.test(lower)) return "image/jpeg";
    return "";
  }

  function isVideoType(type, value) {
    return /^video\//.test(String(type || "")) || /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(value || ""));
  }

  function formatBytes(value) {
    const size = Number(value || 0);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function categoryLabel(value) {
    return {
      update: tr("categoryUpdate"),
      photo: tr("categoryPhoto"),
      video: tr("categoryVideo"),
      festival: tr("categoryFestival"),
      help: tr("categoryHelp"),
      fun: tr("categoryFun")
    }[value] || tr("categoryUpdate");
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
    return hashValue(`${phone}:${password}:gram-kapoorpur-social-v2`);
  }

  async function hashRecovery(phone, pin) {
    return hashValue(`${phone}:${pin}:gram-kapoorpur-recovery-v1`);
  }

  async function hashValue(text) {
    if (!window.crypto || !window.crypto.subtle) {
      return btoa(unescape(encodeURIComponent(text)));
    }
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function initials(name) {
    return String(name || "K").trim().split(/\s+/).map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "K";
  }

  function timeAgo(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return state.lang === "en" ? "Just now" : "अभी";
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
