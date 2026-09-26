(function () {
  "use strict";
  const config = window.siteConfig || {};
  const content = window.siteContent || {};
  const design = window.designConfig || {};
  Object.entries(design.colors || {}).forEach(([name, value]) => { if (/^#[0-9a-f]{3,8}$/i.test(value)) document.documentElement.style.setProperty(`--${name}`, value); });
  if (design.images?.hero) { const hero = document.querySelector(".hero-image"); if (hero) hero.style.backgroundImage = `url("${design.images.hero}")`; }
  if (design.images?.roadside) { const image = document.querySelector(".split-photo img"); if (image) image.src = design.images.roadside; }
  if (design.images?.equipment) { const image = document.querySelector(".equipment-image img"); if (image) image.src = design.images.equipment; }
  if (design.brandLogo) document.querySelectorAll(".logo").forEach((logo) => { let mark = logo.querySelector(".logo-mark"); if (!mark) { mark = document.createElement("span"); mark.className = "logo-mark"; mark.setAttribute("aria-hidden", "true"); logo.prepend(mark); } const image = document.createElement("img"); image.src = design.brandLogo; image.alt = ""; mark.replaceChildren(image); });
  const set = (selector, value, root = document) => { const node = root.querySelector(selector); if (node && typeof value === "string") node.textContent = value; };
  const setSection = (selector, section) => { const root = document.querySelector(selector); if (!root || !section) return; set(".eyebrow", section.eyebrow, root); set("h2", section.heading, root); set(".section-heading > p:not(.eyebrow)", section.description, root); };
  if (content.seo) { document.title = content.seo.title || document.title; const description = document.querySelector('meta[name="description"]'); if (description && content.seo.description) description.content = content.seo.description; }
  const setHref = (selector, value) => { document.querySelectorAll(selector).forEach((node) => { if (typeof value === "string" && /^(#|\/|https?:\/\/|tel:|mailto:)/i.test(value)) node.href = value; }); };
  document.querySelectorAll(".nav nav a").forEach((link, index) => { if (content.navigation?.[index]) link.textContent = content.navigation[index]; if (content.navigationLinks?.[index]) setHref(`.nav nav a:nth-child(${index + 1})`, content.navigationLinks[index]); });
  const actions = content.actions || {};
  set(".js-hero-call", actions.heroCall); set(".js-hero-form-title", actions.heroFormTitle); set(".js-hero-form-description", actions.heroFormDescription); set(".js-hero-form-submit", actions.heroFormSubmit); set(".js-roadside-call", actions.roadsideCall); set(".js-area-card-label", actions.areaCardLabel); set(".js-area-link", actions.areaLinkLabel); setHref(".js-area-link", actions.areaLink); set(".js-callback-submit", actions.callbackSubmit); set(".js-footer-callback", actions.footerCallback); setHref(".js-footer-callback", actions.footerCallbackLink); set(".js-quick-phone-label", actions.quickPhoneLabel); set(".js-quick-telegram", actions.quickTelegramLabel); set(".js-mobile-call", actions.mobileCall);
  if (content.hero) { set(".hero .eyebrow", content.hero.eyebrow); const title = document.querySelector(".hero h1"); if (title) { const accent = document.createElement("em"); accent.textContent = content.hero.accent || ""; title.replaceChildren(document.createTextNode(content.hero.heading || ""), document.createElement("br"), accent); } set(".hero-text", content.hero.description); }
  if (content.strip) { set(".trust-strip p", content.strip.line1); set(".trust-strip strong", content.strip.line2); }
  setSection("#services", content.services); setSection(".equipment", content.equipment); setSection(".process", content.process); setSection(".partners", content.partners); setSection("#area", content.area); setSection(".callback", content.callback); setSection(".faq", content.faq);
  const applyList = (selector, items) => { document.querySelectorAll(selector).forEach((card, index) => { const item = items?.[index]; if (!item) return; set("h3", item[0], card); set("p", item[1], card); }); };
  applyList(".service-card", content.services?.items); applyList(".story-step", content.process?.items);
  if (content.roadside) { set(".split-copy .eyebrow", content.roadside.eyebrow); set(".split-copy h2", content.roadside.heading); set(".split-copy > p:not(.eyebrow)", content.roadside.description); }
  if (content.callback) { set(".callback .eyebrow", content.callback.eyebrow); set(".callback h2", content.callback.heading); set(".callback-grid > div > p:not(.eyebrow)", content.callback.description); }
  document.querySelectorAll(".faq details").forEach((item, index) => { const pair = content.faq?.items?.[index]; if (pair) { set("summary", pair[0], item); set("p", pair[1], item); } });
  document.querySelectorAll(".partner-card").forEach((card, index) => { const item = content.partners?.items?.[index]; if (!item) return; const image = card.querySelector("img"); if (image) { image.src = item.logo; image.alt = item.name; } set("p", item.name, card); });
  document.querySelectorAll(".js-company").forEach((item) => { const text = item.querySelector(".logo-text"); if (text) text.textContent = config.companyName || "COMPANY_NAME"; else item.textContent = config.companyName || "COMPANY_NAME"; });
  document.querySelectorAll(".js-company-inline").forEach((item) => { item.textContent = config.companyName || "COMPANY_NAME"; });
  const cleanTel = String(config.phone || "PHONE_NUMBER").replace(/[^+\d]/g, ""); const phoneHref = /^tel:/i.test(config.phoneHref || "") ? config.phoneHref : `tel:${cleanTel || "PHONE_NUMBER"}`;
  document.querySelectorAll(".js-phone").forEach((item) => { item.href = phoneHref; const number = item.querySelector("b"); if (number) number.textContent = config.phone || "PHONE_NUMBER"; else if (item.textContent.includes("PHONE_NUMBER")) item.textContent = config.phone || "PHONE_NUMBER"; });
  const secondaryPhone = String(config.phoneSecondary || "").trim();
  document.querySelectorAll(".js-phone-secondary").forEach((item) => { if (!secondaryPhone) { item.hidden = true; return; } const secondaryHref = secondaryPhone.replace(/[^+\d]/g, ""); item.href = `tel:${secondaryHref}`; item.textContent = secondaryPhone; });
  document.querySelectorAll(".js-telegram").forEach((item) => { item.href = config.telegramUrl || "https://t.me/TELEGRAM_USERNAME"; });
  document.querySelectorAll(".js-viber").forEach((item) => { item.href = config.viberUrl || "viber://chat?number=VIBER_NUMBER"; });
  document.querySelectorAll(".js-working-hours").forEach((item) => { item.textContent = config.workingHours || "Цілодобово, 24/7"; });
  document.querySelectorAll(".js-service-area").forEach((item) => { item.textContent = config.serviceArea || "Кропивницький та Кіровоградська область"; });
  document.querySelectorAll(".js-business-owner").forEach((item) => { item.textContent = config.businessOwner || config.companyName || "ФОП"; });
  document.querySelectorAll(".js-tax-info").forEach((item) => { item.textContent = config.taxInfo || ""; item.hidden = !config.taxInfo; });
  document.querySelectorAll(".js-address").forEach((item) => { item.textContent = config.address || ""; item.hidden = !config.address; });
  document.querySelectorAll(".js-footer-note").forEach((item) => { item.textContent = config.footerNote || ""; item.hidden = !config.footerNote; });
  document.querySelectorAll(".js-footer-year").forEach((item) => { item.textContent = new Date().getFullYear(); });
  const map = document.querySelector(".js-map"); const mapLabel = document.querySelector(".js-map-label");
  if (map && config.mapEmbedUrl) map.src = config.mapEmbedUrl;
  if (mapLabel && config.mapLabel) mapLabel.textContent = config.mapLabel;
  const schema = document.querySelector("#structured-data");
  if (schema) { try { const data = JSON.parse(schema.textContent); data.name = config.companyName || data.name; data.telephone = config.phone || data.telephone; data.address = config.address || data.address; data.url = config.siteUrl || data.url; data.sameAs = [config.telegramUrl || data.sameAs[0]]; data.openingHours = config.workingHours?.includes("24") ? "Mo-Su 00:00-23:59" : data.openingHours; schema.textContent = JSON.stringify(data); } catch {} }
  const pushEvent = (event) => { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event }); };
  document.querySelectorAll("[data-track]").forEach((item) => item.addEventListener("click", () => pushEvent(item.dataset.track)));
  if (config.gtmId && /^GTM-[A-Z0-9]+$/i.test(config.gtmId)) { const tag = document.createElement("script"); tag.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`; tag.async = true; document.head.append(tag); }
  document.querySelectorAll(".lead-form").forEach((form) => {
    const startedAt = Date.now(); const message = form.querySelector(".form-message"); const button = form.querySelector("button"); const initialButtonHtml = button ? button.innerHTML : "";
    const phoneInput = form.elements.phone;
    const normalizePhone = (value) => { const digits = String(value || "").replace(/\D/g, ""); return /^380\d{9}$/.test(digits) ? `+${digits}` : ""; };
    phoneInput.addEventListener("blur", () => { const phone = normalizePhone(phoneInput.value); if (phone) phoneInput.value = phone; });
    form.addEventListener("focusin", () => pushEvent("callback_form_start"), { once: true });
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); message.textContent = ""; message.className = "form-message";
      const phone = normalizePhone(phoneInput.value);
      if (!phone) { phoneInput.setCustomValidity("Введіть номер у форматі +380XXXXXXXXX."); phoneInput.reportValidity(); return; }
      phoneInput.setCustomValidity(""); phoneInput.value = phone;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const payload = Object.fromEntries(new FormData(form)); payload.startedAt = startedAt; payload.page = window.location.pathname;
      button.disabled = true; button.textContent = "Надсилаємо…";
      try { const response = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); message.textContent = "Дякуємо! Ми отримали заявку та зв’яжемося з вами."; message.classList.add("success"); form.reset(); pushEvent("callback_form_submit"); }
      catch (error) { message.textContent = error.message || "Не вдалося надіслати заявку. Будь ласка, зателефонуйте нам."; message.classList.add("error"); }
      finally { button.disabled = false; button.innerHTML = initialButtonHtml; }
    });
  });
  const header = document.querySelector(".site-header"); let previousScroll = window.scrollY;
  const updateHeader = () => { const current = window.scrollY; header.classList.toggle("is-scrolled", current > 26); header.classList.remove("is-hidden"); previousScroll = current; };
  window.addEventListener("scroll", updateHeader, { passive: true }); updateHeader();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    const heroImage = document.querySelector(".hero-image"); const roadside = document.querySelector(".split-photo img"); const progress = document.querySelector(".scroll-progress i");
    let ticking = false;
    const animateScroll = () => { const y = window.scrollY; const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); if (heroImage) heroImage.style.setProperty("--hero-parallax", `${Math.min(y * .12, 70)}px`); if (roadside) { const rect = roadside.parentElement.getBoundingClientRect(); roadside.style.setProperty("--photo-parallax", `${Math.max(-36, Math.min(36, -rect.top * .075))}px`); } if (progress) progress.style.transform = `scaleX(${y / max})`; ticking = false; };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(animateScroll); } }, { passive: true }); animateScroll();
    const steps = document.querySelectorAll(".story-step"); if ("IntersectionObserver" in window) { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { steps.forEach((step) => step.classList.toggle("is-active", step === entry.target)); } }), { threshold: .55 }); steps.forEach((step) => observer.observe(step)); }
  }
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: .12 }); document.querySelectorAll(".reveal").forEach((item) => observer.observe(item)); }
  else document.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
})();
