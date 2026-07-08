(function () {
  "use strict";

  const config = window.GRAM_KAPOORPUR_CONFIG || {};
  const appState = {
    lang: localStorage.getItem("gramKapoorpurLang") || "hi",
    directoryFilter: "all",
    data: {
      notices: [],
      events: [],
      directory: [],
      gallery: []
    }
  };

  const fallbackData = {
    notices: [
      {
        title_hi: "ग्राम सभा बैठक",
        title_en: "Gram Sabha Meeting",
        body_hi: "अगली ग्राम सभा बैठक पंचायत भवन में होगी। कृपया समय से पहुंचें।",
        body_en: "The next Gram Sabha meeting will be held at the Panchayat Bhawan. Please arrive on time.",
        date: "2026-07-12",
        type_hi: "बैठक",
        type_en: "Meeting",
        important: "yes"
      },
      {
        title_hi: "स्वास्थ्य जांच शिविर",
        title_en: "Health Check-up Camp",
        body_hi: "प्राथमिक स्वास्थ्य टीम बुजुर्गों और बच्चों की सामान्य जांच करेगी।",
        body_en: "The primary health team will conduct basic check-ups for elders and children.",
        date: "2026-07-18",
        type_hi: "स्वास्थ्य",
        type_en: "Health",
        important: "no"
      }
    ],
    events: [
      {
        title_hi: "स्वच्छता अभियान",
        title_en: "Cleanliness Drive",
        date: "2026-07-21",
        time: "08:00",
        place_hi: "मुख्य सड़क",
        place_en: "Main Road",
        details_hi: "सभी परिवारों से एक सदस्य भाग लेने का अनुरोध है।",
        details_en: "One member from each family is requested to participate."
      },
      {
        title_hi: "स्कूल प्रवेश सहायता",
        title_en: "School Admission Help",
        date: "2026-07-25",
        time: "10:00",
        place_hi: "प्राथमिक विद्यालय",
        place_en: "Primary School",
        details_hi: "नए प्रवेश और दस्तावेज से जुड़ी सहायता उपलब्ध रहेगी।",
        details_en: "Help will be available for new admissions and documents."
      }
    ],
    directory: [
      {
        name_hi: "ग्राम पंचायत कार्यालय",
        name_en: "Gram Panchayat Office",
        role_hi: "पंचायत कार्य और प्रमाण पत्र जानकारी",
        role_en: "Panchayat work and certificate information",
        phone: "",
        category: "panchayat"
      },
      {
        name_hi: "स्वास्थ्य सहायता",
        name_en: "Health Help",
        role_hi: "स्वास्थ्य शिविर और टीकाकरण जानकारी",
        role_en: "Health camp and vaccination information",
        phone: "",
        category: "health"
      },
      {
        name_hi: "प्राथमिक विद्यालय",
        name_en: "Primary School",
        role_hi: "प्रवेश और स्कूल सूचना",
        role_en: "Admission and school information",
        phone: "",
        category: "education"
      },
      {
        name_hi: "आपातकालीन सेवा",
        name_en: "Emergency Service",
        role_hi: "तुरंत सहायता के लिए सरकारी हेल्पलाइन",
        role_en: "Government helpline for urgent help",
        phone: "112",
        category: "emergency"
      }
    ],
    gallery: [
      {
        title_hi: "कपूरपुर की सुबह",
        title_en: "Morning in Kapoorpur",
        image: "assets/kapoorpur-hero.jpg",
        caption_hi: "गांव की साफ और शांत सुबह।",
        caption_en: "A clean and calm village morning."
      }
    ]
  };

  const translations = {
    hi: {
      skipLink: "मुख्य सामग्री पर जाएं",
      siteName: "ग्राम कपूरपुर",
      siteTagline: "अपना गांव, अपनी जानकारी",
      navNotices: "सूचनाएं",
      navSocial: "सोशल",
      navServices: "सेवाएं",
      navEvents: "कार्यक्रम",
      navDirectory: "संपर्क",
      navContact: "सुझाव",
      heroEyebrow: "कपूरपुर ग्राम समुदाय",
      heroTitle: "ग्राम कपूरपुर",
      heroCopy: "सूचना, कार्यक्रम, जरूरी संपर्क और जनसेवा जानकारी अब एक जगह।",
      heroPrimary: "आज की सूचना देखें",
      heroSocial: "गांव सोशल खोलें",
      heroSecondary: "जरूरी नंबर",
      quickOneLabel: "सूचनाएं",
      quickTwoLabel: "कार्यक्रम",
      quickThreeLabel: "जरूरी संपर्क",
      loadingData: "जानकारी लोड हो रही है...",
      dataReady: "जानकारी अपडेट हो गई है",
      dataFallback: "अभी नमूना जानकारी दिख रही है",
      updateLink: "गलती दिखे तो बताएं",
      villageEyebrow: "गांव की जानकारी",
      villageTitle: "कपूरपुर के लिए सरल डिजिटल सूचना केंद्र",
      villageCopy: "यह पेज गांव के लोगों को ताजा सूचना, सरकारी सेवा की जानकारी, पंचायत संपर्क और कार्यक्रम जल्दी देखने में मदद करता है।",
      infoOneTitle: "मोबाइल पर आसान",
      infoOneBody: "कम डेटा में खुलने वाला साफ और बड़ा अक्षर वाला डिजाइन।",
      infoTwoTitle: "शीट से अपडेट",
      infoTwoBody: "सूचना Google Sheet से बदली जा सकती है, वेबसाइट को बार-बार edit करने की जरूरत नहीं।",
      infoThreeTitle: "Hindi first",
      infoThreeBody: "डिफॉल्ट भाषा हिंदी है, और जरूरत पर English भी उपलब्ध है।",
      noticesEyebrow: "नई जानकारी",
      noticesTitle: "ग्राम सूचनाएं",
      searchLabel: "खोजें",
      noticeSearchPlaceholder: "सूचना खोजें",
      servicesEyebrow: "जनसेवा",
      servicesTitle: "काम की जानकारी",
      eventsEyebrow: "गांव का कैलेंडर",
      eventsTitle: "आगामी कार्यक्रम",
      eventsCopy: "सभा, स्वास्थ्य शिविर, स्वच्छता अभियान और स्कूल से जुड़ी तारीखें यहां दिखेंगी।",
      directoryEyebrow: "जरूरी नंबर",
      directoryTitle: "ग्राम संपर्क सूची",
      galleryEyebrow: "फोटो",
      galleryTitle: "कपूरपुर की झलक",
      contactEyebrow: "सुझाव और सुधार",
      contactTitle: "गांव की जानकारी भेजें",
      contactCopy: "अगर कोई सूचना, नंबर या तारीख गलत है, तो यहां संदेश भेजें।",
      formName: "नाम",
      formPhone: "मोबाइल नंबर",
      formTopic: "विषय",
      topicNotice: "सूचना",
      topicContact: "संपर्क नंबर",
      topicCorrection: "सुधार",
      topicOther: "अन्य",
      formMessage: "संदेश",
      formSubmit: "भेजें",
      formNeedsSetup: "संदेश भेजने के लिए पहले Google Sheet formEndpoint जोड़ें।",
      formSending: "संदेश भेजा जा रहा है...",
      formSent: "संदेश भेज दिया गया।",
      formFailed: "संदेश नहीं भेजा गया। कृपया बाद में कोशिश करें।",
      privacyEyebrow: "नीति",
      privacyTitle: "Privacy और उपयोग",
      privacyBodyOne: "यह वेबसाइट गांव की सार्वजनिक जानकारी दिखाने के लिए बनाई गई है। संपर्क फॉर्म से भेजी गई जानकारी सिर्फ सुधार और जवाब देने के लिए इस्तेमाल होगी।",
      privacyBodyTwo: "AdSense चालू होने पर Google cookies या similar technology का उपयोग कर सकता है। आप अपने browser settings से cookies नियंत्रित कर सकते हैं।",
      footerLine: "समुदाय के लिए हल्की और साफ वेबसाइट",
      footerPrivacy: "Privacy",
      footerSocial: "Social",
      footerContact: "Contact",
      footerTop: "ऊपर जाएं",
      all: "सभी",
      panchayat: "पंचायत",
      health: "स्वास्थ्य",
      education: "शिक्षा",
      emergency: "आपातकाल",
      other: "अन्य",
      noPhone: "नंबर अपडेट करें",
      call: "कॉल करें",
      important: "जरूरी",
      noNotices: "अभी कोई सूचना नहीं मिली।",
      noEvents: "अभी कोई कार्यक्रम नहीं मिला।",
      noDirectory: "इस श्रेणी में कोई संपर्क नहीं मिला।",
      noGallery: "अभी फोटो उपलब्ध नहीं है।",
      dateLabel: "तारीख",
      placeLabel: "स्थान"
    },
    en: {
      skipLink: "Skip to main content",
      siteName: "Gram Kapoorpur",
      siteTagline: "Our village, our information",
      navNotices: "Notices",
      navSocial: "Social",
      navServices: "Services",
      navEvents: "Events",
      navDirectory: "Contacts",
      navContact: "Feedback",
      heroEyebrow: "Kapoorpur village community",
      heroTitle: "Gram Kapoorpur",
      heroCopy: "Notices, events, important contacts and public service information in one place.",
      heroPrimary: "See today's notices",
      heroSocial: "Open village social",
      heroSecondary: "Important numbers",
      quickOneLabel: "Notices",
      quickTwoLabel: "Events",
      quickThreeLabel: "Contacts",
      loadingData: "Loading information...",
      dataReady: "Information has been updated",
      dataFallback: "Sample information is showing for now",
      updateLink: "Report a correction",
      villageEyebrow: "Village information",
      villageTitle: "A simple digital information center for Kapoorpur",
      villageCopy: "This page helps villagers quickly see recent notices, public service information, Panchayat contacts and events.",
      infoOneTitle: "Easy on mobile",
      infoOneBody: "Clean large text and a low-data layout for slower connections.",
      infoTwoTitle: "Updated from Sheets",
      infoTwoBody: "Notices can be changed from Google Sheets without editing the website every time.",
      infoThreeTitle: "Hindi first",
      infoThreeBody: "Hindi is the default language, with English available when needed.",
      noticesEyebrow: "Latest information",
      noticesTitle: "Village Notices",
      searchLabel: "Search",
      noticeSearchPlaceholder: "Search notices",
      servicesEyebrow: "Public services",
      servicesTitle: "Useful Information",
      eventsEyebrow: "Village calendar",
      eventsTitle: "Upcoming Events",
      eventsCopy: "Meetings, health camps, cleanliness drives and school dates will appear here.",
      directoryEyebrow: "Important numbers",
      directoryTitle: "Village Contact List",
      galleryEyebrow: "Photos",
      galleryTitle: "A Glimpse of Kapoorpur",
      contactEyebrow: "Feedback and corrections",
      contactTitle: "Send village information",
      contactCopy: "If a notice, number or date is wrong, send a message here.",
      formName: "Name",
      formPhone: "Mobile number",
      formTopic: "Topic",
      topicNotice: "Notice",
      topicContact: "Contact number",
      topicCorrection: "Correction",
      topicOther: "Other",
      formMessage: "Message",
      formSubmit: "Send",
      formNeedsSetup: "Add the Google Sheet formEndpoint before messages can be sent.",
      formSending: "Sending message...",
      formSent: "Message sent.",
      formFailed: "Message was not sent. Please try again later.",
      privacyEyebrow: "Policy",
      privacyTitle: "Privacy and Use",
      privacyBodyOne: "This website is made to show public village information. Details sent through the contact form will only be used for corrections and replies.",
      privacyBodyTwo: "When AdSense is enabled, Google may use cookies or similar technology. You can control cookies from your browser settings.",
      footerLine: "A light and clean website for the community",
      footerPrivacy: "Privacy",
      footerSocial: "Social",
      footerContact: "Contact",
      footerTop: "Back to top",
      all: "All",
      panchayat: "Panchayat",
      health: "Health",
      education: "Education",
      emergency: "Emergency",
      other: "Other",
      noPhone: "Update number",
      call: "Call",
      important: "Important",
      noNotices: "No notices found yet.",
      noEvents: "No events found yet.",
      noDirectory: "No contacts found in this category.",
      noGallery: "No photos available yet.",
      dateLabel: "Date",
      placeLabel: "Place"
    }
  };

  const services = [
    {
      title_hi: "आय, जाति, निवास प्रमाण पत्र",
      title_en: "Income, Caste, Residence Certificates",
      body_hi: "ऑनलाइन आवेदन के लिए आधार, फोटो और जरूरी दस्तावेज तैयार रखें।",
      body_en: "Keep Aadhaar, photo and required documents ready for online applications."
    },
    {
      title_hi: "राशन और परिवार ID",
      title_en: "Ration and Family ID",
      body_hi: "नाम जोड़ने, सुधार और स्थिति देखने के लिए पंचायत या जनसेवा केंद्र से संपर्क करें।",
      body_en: "Contact the Panchayat or public service center for additions, corrections and status checks."
    },
    {
      title_hi: "किसान सहायता",
      title_en: "Farmer Support",
      body_hi: "PM-Kisan, फसल बीमा और कृषि सलाह की जानकारी यहां अपडेट की जा सकती है।",
      body_en: "PM-Kisan, crop insurance and agriculture advisory details can be updated here."
    },
    {
      title_hi: "स्वास्थ्य और टीकाकरण",
      title_en: "Health and Vaccination",
      body_hi: "शिविर, टीकाकरण और आशा कार्यकर्ता से जुड़ी सूचना ग्राम सूचना में देखें।",
      body_en: "Check village notices for camps, vaccination and ASHA worker updates."
    }
  ];

  const t = (key) => (translations[appState.lang] && translations[appState.lang][key]) || key;

  function init() {
    document.documentElement.lang = appState.lang;
    bindEvents();
    applyTranslations();
    setupContactLinks();
    setupAds();
    loadAllData();
  }

  function bindEvents() {
    document.querySelectorAll("[data-lang-switch]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.langSwitch));
    });

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.getElementById("noticeSearch").addEventListener("input", renderNotices);
    document.getElementById("contactForm").addEventListener("submit", handleContactSubmit);
  }

  function setLanguage(lang) {
    appState.lang = lang === "en" ? "en" : "hi";
    localStorage.setItem("gramKapoorpurLang", appState.lang);
    document.documentElement.lang = appState.lang;
    applyTranslations();
    renderAll();
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });

    document.querySelectorAll("[data-lang-switch]").forEach((button) => {
      button.classList.toggle("active", button.dataset.langSwitch === appState.lang);
    });
  }

  async function loadAllData() {
    const sources = config.sheetSources || {};
    const keys = ["notices", "events", "directory", "gallery"];
    let loadedFromSource = false;

    await Promise.all(keys.map(async (key) => {
      const source = sources[key];
      const rows = await loadCsv(source);
      if (rows.length) {
        appState.data[key] = rows;
        loadedFromSource = true;
      } else {
        appState.data[key] = fallbackData[key];
      }
    }));

    setStatus(loadedFromSource ? t("dataReady") : t("dataFallback"));
    renderAll();
  }

  async function loadCsv(source) {
    if (!source) return [];

    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) return [];
      const text = await response.text();
      return csvToObjects(text).filter((row) => !isHidden(row));
    } catch (error) {
      return [];
    }
  }

  function csvToObjects(text) {
    const rows = parseCsv(text.replace(/^\uFEFF/, ""));
    if (rows.length < 2) return [];
    const headers = rows.shift().map((header) => header.trim());
    return rows
      .filter((row) => row.some((value) => String(value || "").trim()))
      .map((row) => headers.reduce((record, header, index) => {
        record[header] = String(row[index] || "").trim();
        return record;
      }, {}));
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"' && quoted && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(value);
        value = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(value);
        rows.push(row);
        row = [];
        value = "";
      } else {
        value += char;
      }
    }

    if (value || row.length) {
      row.push(value);
      rows.push(row);
    }

    return rows;
  }

  function isHidden(row) {
    return String(row.status || "").toLowerCase() === "hidden";
  }

  function renderAll() {
    renderCounts();
    renderNotices();
    renderServices();
    renderEvents();
    renderDirectoryFilters();
    renderDirectory();
    renderGallery();
    setupContactLinks();
  }

  function renderCounts() {
    document.getElementById("noticeCount").textContent = appState.data.notices.length;
    document.getElementById("eventCount").textContent = appState.data.events.length;
    document.getElementById("directoryCount").textContent = appState.data.directory.length;
  }

  function renderNotices() {
    const query = document.getElementById("noticeSearch").value.trim().toLowerCase();
    const notices = appState.data.notices
      .slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .filter((notice) => {
        const haystack = [
          pick(notice, "title"),
          pick(notice, "body"),
          pick(notice, "type"),
          notice.date
        ].join(" ").toLowerCase();
        return haystack.includes(query);
      });

    const list = document.getElementById("noticeList");
    list.innerHTML = notices.length ? notices.map((notice) => {
      const important = String(notice.important || "").toLowerCase() === "yes";
      return `
        <article class="notice-card${important ? " important" : ""}">
          <div class="card-meta">
            <span>${escapeHtml(pick(notice, "type") || t("other"))}</span>
            <time datetime="${escapeAttr(notice.date || "")}">${formatDate(notice.date)}</time>
          </div>
          <h3>${escapeHtml(pick(notice, "title"))}</h3>
          <p>${escapeHtml(pick(notice, "body"))}</p>
          ${important ? `<strong class="pill">${t("important")}</strong>` : ""}
        </article>
      `;
    }).join("") : emptyState(t("noNotices"));
  }

  function renderServices() {
    document.getElementById("serviceList").innerHTML = services.map((service) => `
      <article class="service-card">
        <h3>${escapeHtml(pick(service, "title"))}</h3>
        <p>${escapeHtml(pick(service, "body"))}</p>
      </article>
    `).join("");
  }

  function renderEvents() {
    const events = appState.data.events
      .slice()
      .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));

    document.getElementById("eventList").innerHTML = events.length ? events.map((event) => `
      <article class="event-item">
        <time datetime="${escapeAttr(event.date || "")}">
          <span>${formatMonth(event.date)}</span>
          <strong>${formatDay(event.date)}</strong>
        </time>
        <div>
          <h3>${escapeHtml(pick(event, "title"))}</h3>
          <p>${escapeHtml(pick(event, "details"))}</p>
          <small>${t("placeLabel")}: ${escapeHtml(pick(event, "place") || "-")} ${event.time ? ` | ${escapeHtml(event.time)}` : ""}</small>
        </div>
      </article>
    `).join("") : emptyState(t("noEvents"));
  }

  function renderDirectoryFilters() {
    const categories = ["all", "panchayat", "health", "education", "emergency", "other"];
    document.getElementById("directoryFilters").innerHTML = categories.map((category) => `
      <button type="button" class="${appState.directoryFilter === category ? "active" : ""}" data-filter="${category}">
        ${t(category)}
      </button>
    `).join("");

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        appState.directoryFilter = button.dataset.filter;
        renderDirectoryFilters();
        renderDirectory();
      });
    });
  }

  function renderDirectory() {
    const contacts = appState.data.directory.filter((contact) => {
      return appState.directoryFilter === "all" || (contact.category || "other") === appState.directoryFilter;
    });

    document.getElementById("directoryList").innerHTML = contacts.length ? contacts.map((contact) => {
      const phone = String(contact.phone || "").trim();
      const phoneDigits = phone.replace(/[^\d+]/g, "");
      return `
        <article class="directory-card">
          <span class="category">${t(contact.category || "other")}</span>
          <h3>${escapeHtml(pick(contact, "name"))}</h3>
          <p>${escapeHtml(pick(contact, "role"))}</p>
          ${phone ? `<a class="call-link" href="tel:${escapeAttr(phoneDigits)}">${t("call")}: ${escapeHtml(phone)}</a>` : `<span class="muted">${t("noPhone")}</span>`}
        </article>
      `;
    }).join("") : emptyState(t("noDirectory"));
  }

  function renderGallery() {
    const gallery = appState.data.gallery;
    document.getElementById("galleryList").innerHTML = gallery.length ? gallery.map((item) => {
      const image = safeImageUrl(item.image) || "assets/kapoorpur-hero.jpg";
      return `
        <figure class="gallery-card">
          <img src="${escapeAttr(image)}" alt="${escapeAttr(pick(item, "title"))}" loading="lazy">
          <figcaption>
            <strong>${escapeHtml(pick(item, "title"))}</strong>
            <span>${escapeHtml(pick(item, "caption"))}</span>
          </figcaption>
        </figure>
      `;
    }).join("") : emptyState(t("noGallery"));
  }

  async function handleContactSubmit(event) {
    event.preventDefault();
    const note = document.getElementById("formNote");
    const endpoint = String(config.formEndpoint || "").trim();

    if (!endpoint) {
      note.textContent = t("formNeedsSetup");
      note.className = "form-note warning";
      return;
    }

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.lang = appState.lang;
    payload.page = window.location.href;
    payload.createdAt = new Date().toISOString();

    note.textContent = t("formSending");
    note.className = "form-note";

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(payload)
      });
      form.reset();
      note.textContent = t("formSent");
      note.className = "form-note success";
    } catch (error) {
      note.textContent = t("formFailed");
      note.className = "form-note warning";
    }
  }

  function setupContactLinks() {
    const phone = String(config.contactPhone || "").trim();
    const email = String(config.contactEmail || "").trim();
    const phoneLink = document.getElementById("contactPhone");
    const emailLink = document.getElementById("contactEmail");

    if (phone) {
      phoneLink.hidden = false;
      phoneLink.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
      phoneLink.textContent = phone;
    }

    if (email) {
      emailLink.hidden = false;
      emailLink.href = `mailto:${email}`;
      emailLink.textContent = email;
    }
  }

  function setupAds() {
    const client = String(config.adsenseClient || "").trim();
    const slots = config.adSlots || {};
    const containers = document.querySelectorAll("[data-ad-container]");

    if (!client) {
      containers.forEach((container) => { container.hidden = true; });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    document.head.appendChild(script);

    containers.forEach((container) => {
      const slotName = container.dataset.adContainer;
      const slot = String(slots[slotName] || "").trim();
      if (!slot) return;

      container.hidden = false;
      container.innerHTML = `
        <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="${escapeAttr(client)}"
          data-ad-slot="${escapeAttr(slot)}"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      `;

      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    });
  }

  function pick(record, base) {
    return record[`${base}_${appState.lang}`] || record[`${base}_hi`] || record[base] || "";
  }

  function formatDate(value) {
    const date = parseDate(value);
    if (!date) return value || "";
    return new Intl.DateTimeFormat(appState.lang === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function formatMonth(value) {
    const date = parseDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat(appState.lang === "hi" ? "hi-IN" : "en-IN", {
      month: "short"
    }).format(date);
  }

  function formatDay(value) {
    const date = parseDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat(appState.lang === "hi" ? "hi-IN" : "en-IN", {
      day: "2-digit"
    }).format(date);
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function safeImageUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    if (url.startsWith("assets/") || url.startsWith("data/")) return url;
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol) ? url : "";
    } catch (error) {
      return "";
    }
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

  function emptyState(message) {
    return `<p class="empty-state">${escapeHtml(message)}</p>`;
  }

  function setStatus(message) {
    document.getElementById("dataStatus").textContent = message;
  }

  init();
}());
