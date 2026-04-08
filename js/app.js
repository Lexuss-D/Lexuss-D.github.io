(function () {
  const CONFIG_PATH = "data/site.json";
  const STORAGE_KEY = "homepage-language";

  const app = document.getElementById("app");
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  const html = document.documentElement;

  let activeLang = localStorage.getItem(STORAGE_KEY) || "ja";

  function textFor(value, lang = activeLang) {
    if (value == null) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    return value[lang] || value.ja || value.en || "";
  }

  function clearNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function createLocalizedText(tagName, value, className) {
    const node = document.createElement(tagName);
    if (className) {
      node.className = className;
    }
    node.textContent = textFor(value);
    return node;
  }

  function createLink(url, label, className) {
    const link = document.createElement("a");
    link.href = url;
    link.textContent = label;
    if (className) {
      link.className = className;
    }
    if (/^https?:\/\//.test(url)) {
      link.target = "_blank";
      link.rel = "noreferrer noopener";
    }
    return link;
  }

  function createSectionHeading(section) {
    const wrapper = document.createElement("div");
    wrapper.className = "section-heading";

    const kicker = document.createElement("p");
    kicker.className = "section-kicker";
    kicker.textContent = section.kicker || "";

    const title = createLocalizedText("h2", section.title);

    wrapper.append(kicker, title);
    return wrapper;
  }

  function createList(items, ordered) {
    const list = document.createElement(ordered ? "ol" : "ul");
    list.className = ordered ? "publication-list" : "bullet-list";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = textFor(item);
      list.appendChild(li);
    });

    return list;
  }

  function createTimeline(items) {
    const list = document.createElement("ul");
    list.className = "timeline-list";

    items.forEach((item) => {
      const li = document.createElement("li");
      const date = document.createElement("span");
      date.className = "timeline-date";
      date.textContent = item.date || "";

      const content = document.createElement("div");
      content.append(document.createTextNode(textFor(item.content)));

      if (Array.isArray(item.links)) {
        item.links.forEach((linkData) => {
          content.append(document.createTextNode(" "));
          content.appendChild(createLink(linkData.url, linkData.label));
        });
      }

      li.append(date, content);
      list.appendChild(li);
    });

    return list;
  }

  function createPublicationGroups(groups) {
    const fragment = document.createDocumentFragment();

    groups.forEach((group) => {
      const wrapper = document.createElement("div");
      wrapper.className = "publication-group";

      const title = createLocalizedText("h3", group.title);
      const list = document.createElement("ol");
      list.className = "publication-list";

      group.items.forEach((item) => {
        const li = document.createElement("li");
        li.append(document.createTextNode(item.text));

        if (Array.isArray(item.links)) {
          item.links.forEach((linkData) => {
            li.append(document.createTextNode(" "));
            li.appendChild(createLink(linkData.url, linkData.label));
          });
        }

        list.appendChild(li);
      });

      wrapper.append(title, list);
      fragment.appendChild(wrapper);
    });

    return fragment;
  }

  function createLinkGrid(items) {
    const grid = document.createElement("div");
    grid.className = "link-grid";

    items.forEach((item) => {
      const card = createLink(item.url, item.title, "link-card");
      const title = document.createElement("strong");
      title.textContent = item.title;
      const body = document.createElement("span");
      body.textContent = textFor(item.body);
      card.textContent = "";
      card.append(title, body);
      grid.appendChild(card);
    });

    return grid;
  }

  function createCard(card) {
    const article = document.createElement("article");
    article.className = "panel";
    if (card.accent) {
      article.classList.add("accent-panel");
    }

    article.appendChild(createLocalizedText("h3", card.title));

    if (card.body) {
      article.appendChild(createLocalizedText("p", card.body));
    }

    if (Array.isArray(card.list)) {
      article.appendChild(createList(card.list, false));
    }

    if (Array.isArray(card.timeline)) {
      article.appendChild(createTimeline(card.timeline));
    }

    return article;
  }

  function createCardsSection(section) {
    const grid = document.createElement("div");
    grid.className = "panel-grid";
    if (section.wide) {
      grid.classList.add("panel-grid-wide");
    }

    section.cards.forEach((card) => {
      grid.appendChild(createCard(card));
    });

    return grid;
  }

  function renderHeader(config) {
    clearNode(header);

    const brandBlock = document.createElement("div");
    brandBlock.className = "brand-block";

    const brand = document.createElement("a");
    brand.className = "brand";
    brand.href = "#top";
    brand.textContent = textFor(config.profile.name, "en");

    const subtitle = createLocalizedText("p", config.profile.subtitle, "brand-subtitle");
    brandBlock.append(brand, subtitle);

    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Primary");
    config.navigation.forEach((item) => {
      const link = createLink(`#${item.id}`, textFor(item.label));
      nav.appendChild(link);
    });

    const langSwitch = document.createElement("div");
    langSwitch.className = "lang-switch";
    langSwitch.setAttribute("role", "group");
    langSwitch.setAttribute("aria-label", "Language switcher");

    ["ja", "en"].forEach((lang) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lang-button";
      button.dataset.langToggle = lang;
      button.textContent = lang.toUpperCase();
      button.addEventListener("click", () => {
        activeLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        renderPage(config);
      });
      langSwitch.appendChild(button);
    });

    header.append(brandBlock, nav, langSwitch);
  }

  function createHero(config) {
    const hero = document.createElement("section");
    hero.className = "hero";
    hero.id = "top";

    const copy = document.createElement("div");
    copy.className = "hero-copy";

    copy.appendChild(createLocalizedText("p", config.profile.eyebrow, "eyebrow"));

    const title = document.createElement("h1");
    const nameMain = document.createElement("span");
    nameMain.className = "hero-name-main";
    nameMain.textContent = textFor(config.profile.name, "en");
    const nameSub = document.createElement("span");
    nameSub.className = "hero-name-sub";
    nameSub.textContent = textFor(config.profile.name, "ja");
    title.append(nameMain, nameSub);
    copy.appendChild(title);

    copy.appendChild(createLocalizedText("p", config.profile.description, "hero-description"));

    const heroTags = document.createElement("div");
    heroTags.className = "hero-tags";
    config.profile.heroTags.forEach((tag) => {
      const node = document.createElement("span");
      node.textContent = tag;
      heroTags.appendChild(node);
    });
    copy.appendChild(heroTags);

    const actions = document.createElement("div");
    actions.className = "hero-actions";
    config.profile.heroLinks.forEach((item) => {
      let node;
      if (item.kind === "email") {
        node = createLink(`mailto:${item.value}`, textFor(item.label), "button button-primary");
      } else if (item.url) {
        node = createLink(item.url, textFor(item.label), item.kind === "cv" ? "button button-secondary" : "button button-secondary");
      } else {
        node = document.createElement("span");
        node.className = "button button-disabled";
        node.setAttribute("aria-disabled", "true");
        node.textContent = textFor(item.label);
      }
      actions.appendChild(node);
    });
    copy.appendChild(actions);

    const aside = document.createElement("aside");
    aside.className = "hero-aside";

    const portraitCard = document.createElement("div");
    portraitCard.className = "portrait-card";
    if (config.profile.image.path) {
      const img = document.createElement("img");
      img.className = "portrait-image";
      img.src = config.profile.image.path;
      img.alt = textFor(config.profile.image.alt);
      portraitCard.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "portrait-placeholder";
      placeholder.textContent = config.profile.image.placeholder || "";
      portraitCard.appendChild(placeholder);
    }
    portraitCard.appendChild(createLocalizedText("p", config.profile.image.caption, "portrait-caption"));

    const contactCard = document.createElement("div");
    contactCard.className = "contact-card";
    contactCard.appendChild(createLocalizedText("h2", { ja: "連絡先", en: "Contact" }));

    const dl = document.createElement("dl");
    [
      { term: "Email", value: config.profile.contact.email, href: `mailto:${config.profile.contact.email}` },
      { term: "X", value: config.profile.contact.x.label, href: config.profile.contact.x.url },
      { term: "Speaker Deck", value: config.profile.contact.speakerDeck.label, href: config.profile.contact.speakerDeck.url }
    ].forEach((entry) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = entry.term;
      const dd = document.createElement("dd");
      dd.appendChild(createLink(entry.href, entry.value));
      row.append(dt, dd);
      dl.appendChild(row);
    });

    contactCard.appendChild(dl);
    aside.append(portraitCard, contactCard);

    hero.append(copy, aside);
    return hero;
  }

  function createSection(section) {
    const wrapper = document.createElement("section");
    wrapper.className = "content-section";
    wrapper.id = section.id;
    wrapper.appendChild(createSectionHeading(section));

    if (section.type === "cards") {
      wrapper.appendChild(createCardsSection(section));
    } else if (section.type === "groups") {
      wrapper.appendChild(createPublicationGroups(section.groups));
    } else if (section.type === "timeline") {
      const panel = document.createElement("article");
      panel.className = "panel";
      panel.appendChild(createTimeline(section.items));
      wrapper.appendChild(panel);
    } else if (section.type === "links") {
      wrapper.appendChild(createLinkGrid(section.items));
    }

    return wrapper;
  }

  function renderFooter(config) {
    clearNode(footer);
    const p = createLocalizedText("p", config.footer);
    footer.appendChild(p);
  }

  function updateMeta(config) {
    document.title = config.meta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", textFor(config.meta.description));
    }
    html.lang = activeLang;
  }

  function updateLanguageButtons() {
    header.querySelectorAll("[data-lang-toggle]").forEach((button) => {
      const isActive = button.dataset.langToggle === activeLang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function renderPage(config) {
    updateMeta(config);
    renderHeader(config);
    updateLanguageButtons();
    clearNode(app);
    app.appendChild(createHero(config));
    config.sections.forEach((section) => {
      app.appendChild(createSection(section));
    });
    renderFooter(config);
  }

  function renderError(message) {
    clearNode(app);
    const shell = document.createElement("section");
    shell.className = "loading-shell";
    const card = document.createElement("div");
    card.className = "loading-card loading-card-error";
    card.textContent = message;
    shell.appendChild(card);
    app.appendChild(shell);
  }

  fetch(CONFIG_PATH)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${CONFIG_PATH}`);
      }
      return response.json();
    })
    .then((config) => {
      renderPage(config);
    })
    .catch((error) => {
      renderError(`Could not load homepage config: ${error.message}`);
    });
})();
