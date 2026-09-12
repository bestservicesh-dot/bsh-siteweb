/* --------------------------------------------------------------------------
   BSH (Best Services and House) - MAIN JAVASCRIPT
   -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Nav Toggle
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }

  // Close mobile nav when clicking a link
  const links = document.querySelectorAll(".nav-links a");
  links.forEach(link => {
    link.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
      }
    });
  });

  // Global variables to store data
  let allRealisations = [];

  // Cache buster pour forcer le navigateur à charger la toute dernière version des JSON sans cache
  const cacheBuster = `?v=${Date.now()}`;

  // --- HORLOGE NUMÉRIQUE DU BÉNIN (GMT+1) ---
  const clockEl = document.getElementById('beninClock');
  if (clockEl) {
    setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const beninTime = new Date(utc + (3600000 * 1)); // UTC+1 (Heure du Bénin)
      
      const hours = String(beninTime.getHours()).padStart(2, '0');
      const minutes = String(beninTime.getMinutes()).padStart(2, '0');
      const seconds = String(beninTime.getSeconds()).padStart(2, '0');
      
      clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
  }

  // --- CAROUSEL FADE AUTOMATIQUE ---
  const slides = document.querySelectorAll('.carousel-slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000); // Changer toutes les 5 secondes
  }

  // ---------------------------------------------------------
  // 1. CHARGEMENT DES INFOS GENERALES, LOGO & RESEAUX
  // ---------------------------------------------------------
  fetch('/data/general.json' + cacheBuster)
    .then(res => {
      if (!res.ok) throw new Error("Fichier non trouvé");
      return res.json();
    })
    .then(data => {
      // --- LIAISON CLASSIQUE (PAR CLASSES & IDS) ---
      if (data.phone) {
        document.querySelectorAll('.phone-text').forEach(el => el.textContent = data.phone);
        document.querySelectorAll('.phone-link').forEach(el => el.href = `tel:${data.phone.replace(/[^0-9+]/g, '')}`);
      }
      if (data.email) {
        document.querySelectorAll('.email-text').forEach(el => el.textContent = data.email);
        document.querySelectorAll('.email-link').forEach(el => el.href = `mailto:${data.email}`);
      }
      if (data.address) {
        document.querySelectorAll('.address-text').forEach(el => el.textContent = data.address);
      }
      if (data.whatsapp) {
        document.querySelectorAll('.whatsapp-link').forEach(el => el.href = data.whatsapp);
      }
      if (data.rccm) {
        document.querySelectorAll('.legal-rccm').forEach(el => el.textContent = data.rccm);
      }
      if (data.ifu) {
        document.querySelectorAll('.legal-ifu').forEach(el => el.textContent = data.ifu);
      }

      // Slogan et campagne
      if (data.slogan) {
        const sloganEl = document.getElementById('hero-slogan');
        if (sloganEl) sloganEl.textContent = data.slogan;
      }
      if (data.campaign_title) {
        const campTitleEl = document.getElementById('campaign-title');
        if (campTitleEl) campTitleEl.textContent = data.campaign_title;
      }
      if (data.campaign_desc) {
        const campDescEl = document.getElementById('campaign-desc');
        if (campDescEl) campDescEl.textContent = data.campaign_desc;
      }

      // Mettre à jour les réseaux sociaux classique
      if (data.facebook_url) {
        document.querySelectorAll('.facebook-link').forEach(el => {
          el.href = data.facebook_url;
          el.style.display = 'inline-flex';
        });
      }
      if (data.linkedin_url) {
        document.querySelectorAll('.linkedin-link').forEach(el => {
          el.href = data.linkedin_url;
          el.style.display = 'inline-flex';
        });
      }
      if (data.instagram_url) {
        document.querySelectorAll('.instagram-link').forEach(el => {
          el.href = data.instagram_url;
          el.style.display = 'inline-flex';
        });
      }
      if (data.tiktok_url) {
        document.querySelectorAll('.tiktok-link').forEach(el => {
          el.href = data.tiktok_url;
          el.style.display = 'inline-flex';
        });
      }

      // --- INJECTION AUTOMATIQUE DES RÉSEAUX SOCIAUX ---
      if (!document.querySelector('.social-links')) {
        const footerBrand = document.querySelector('.footer-brand, .footer-about');
        if (footerBrand) {
          const socialDiv = document.createElement('div');
          socialDiv.className = 'social-links';
          socialDiv.style.cssText = 'margin-top: 20px; display: flex; gap: 10px;';
          
          if (data.facebook_url) {
            socialDiv.innerHTML += `<a href="${data.facebook_url}" class="facebook-link" target="_blank" rel="noopener" title="Facebook" style="font-weight: bold; font-family: sans-serif;">f</a>`;
          }
          if (data.linkedin_url) {
            socialDiv.innerHTML += `<a href="${data.linkedin_url}" class="linkedin-link" target="_blank" rel="noopener" title="LinkedIn" style="font-weight: bold; font-family: sans-serif;">in</a>`;
          }
          if (data.instagram_url) {
            socialDiv.innerHTML += `<a href="${data.instagram_url}" class="instagram-link" target="_blank" rel="noopener" title="Instagram" style="font-weight: bold; font-family: sans-serif;">ig</a>`;
          }
          if (data.tiktok_url) {
            socialDiv.innerHTML += `<a href="${data.tiktok_url}" class="tiktok-link" target="_blank" rel="noopener" title="TikTok" style="font-weight: bold; font-family: sans-serif;">tk</a>`;
          }
          
          footerBrand.appendChild(socialDiv);
        }
      }

      // --- LIAISON DU LOGO BSH ---
      if (data.logo_url) {
        document.querySelectorAll('.logo-container, .logo').forEach(el => {
          if (el.tagName === 'A') {
            el.innerHTML = `<img src="${data.logo_url}" alt="BSH Logo" style="max-height: 45px; width: auto; object-fit: contain;">`;
          } else if (el.tagName === 'IMG') {
            el.src = data.logo_url;
          } else {
            el.innerHTML = `<img src="${data.logo_url}" alt="BSH Logo" style="max-height: 45px; width: auto; object-fit: contain;">`;
          }
        });
      }

      // --- LIAISON UNIVERSELLE PAR ATTRIBUT [data-field] ---
      document.querySelectorAll('[data-field]').forEach(el => {
        const fieldName = el.getAttribute('data-field');
        
        if (fieldName === 'phone' && data.phone) {
          if (el.tagName === 'A') el.href = `tel:${data.phone.replace(/[^0-9+]/g, '')}`;
          el.textContent = data.phone;
        }
        else if (fieldName === 'email' && data.email) {
          if (el.tagName === 'A') el.href = `mailto:${data.email}`;
          el.textContent = data.email;
        }
        else if (fieldName === 'whatsapp-link' && data.whatsapp) {
          el.href = data.whatsapp;
        }
        else if (fieldName === 'facebook-link' && data.facebook_url) {
          el.href = data.facebook_url;
          el.style.display = 'inline-flex';
        }
        else if (fieldName === 'linkedin-link' && data.linkedin_url) {
          el.href = data.linkedin_url;
          el.style.display = 'inline-flex';
        }
        else if (fieldName === 'instagram-link' && data.instagram_url) {
          el.href = data.instagram_url;
          el.style.display = 'inline-flex';
        }
        else if (fieldName === 'tiktok-link' && data.tiktok_url) {
          el.href = data.tiktok_url;
          el.style.display = 'inline-flex';
        }
        else if (fieldName === 'logo' && data.logo_url) {
          if (el.tagName === 'IMG') {
            el.src = data.logo_url;
          } else {
            el.innerHTML = `<img src="${data.logo_url}" alt="Logo" style="max-height: 45px; width: auto; object-fit: contain;">`;
          }
        }
      });

      // Mettre à jour la section À propos de l'accueil
      if (data.about_title) {
        const aboutTitleEl = document.getElementById('about-title');
        if (aboutTitleEl) aboutTitleEl.textContent = data.about_title;
      }
      if (data.about_text_1) {
        const aboutText1El = document.getElementById('about-text-1');
        if (aboutText1El) aboutText1El.textContent = data.about_text_1;
      }
      if (data.about_text_2) {
        const aboutText2El = document.getElementById('about-text-2');
        if (aboutText2El) aboutText2El.textContent = data.about_text_2;
      }

      // Atouts À Propos
      if (data.about_features && data.about_features.length > 0) {
        const featuresContainer = document.getElementById('about-features-container');
        if (featuresContainer) {
          featuresContainer.innerHTML = '';
          data.about_features.forEach(feat => {
            const item = typeof feat === 'string' ? feat : (feat.feature || '');
            featuresContainer.innerHTML += `
              <div class="about-feature">
                <span>✓</span> ${item}
              </div>
            `;
          });
        }
      }

      // Mettre à jour les Statistiques
      if (data.stats && data.stats.length > 0) {
        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
          statsGrid.innerHTML = '';
          data.stats.forEach(stat => {
            statsGrid.innerHTML += `
              <div class="stat-card">
                <h3>${stat.value}</h3>
                <p>${stat.label}</p>
              </div>
            `;
          });
        }
      }
    })
    .catch(err => console.warn("Attention : Fallback données générales.", err));

  // ---------------------------------------------------------
  // 2. CHARGEMENT DES SERVICES PAR PÔLES D'EXPERTISE (COMPATIBILITÉ DOUBLE)
  // ---------------------------------------------------------
  fetch('/data/services.json' + cacheBuster)
    .then(res => res.json())
    .then(data => {
      let btpList = [];
      let digitalList = [];
      let multiList = [];

      // A. Si le fichier est au NOUVEAU format (découpé par Pôles)
      if (data.btp_services) {
        btpList = data.btp_services;
        digitalList = data.digital_services || [];
        multiList = data.multi_services || [];
      } 
      // B. Si le fichier est à l'ANCIEN format (découpé par primary/secondary)
      else {
        if (data.primary_services) {
          data.primary_services.forEach(srv => {
            if (srv.id === 'entretien-nettoyage') {
              multiList.push(srv);
            } else {
              btpList.push(srv);
            }
          });
        }
        if (data.secondary_services) {
          data.secondary_services.forEach(srv => {
            if (srv.id === 'creation-site-web' || srv.id === 'conception-graphique' || srv.id === 'enquetes-digitales') {
              digitalList.push(srv);
            } else {
              multiList.push(srv);
            }
          });
        }
      }

      // Rendu du Pôle BTP
      const btpContainer = document.getElementById('btp-services-container');
      if (btpContainer) {
        btpContainer.innerHTML = '';
        btpList.forEach(srv => {
          btpContainer.innerHTML += `
            <div class="service-card" id="service-${srv.id}">
              <div class="service-icon">${srv.icon || '🏗️'}</div>
              <h3>${srv.title}</h3>
              <p>${srv.description}</p>
              <div style="font-weight: 700; color: var(--accent); margin-bottom: 15px; font-size: 0.95rem;">${srv.price || 'Sur devis personnalisé'}</div>
              <a href="/service-details.html?id=${srv.id}" class="service-link">En savoir plus →</a>
            </div>
          `;
        });
      }

      // Rendu du Pôle Digital
      const digitalContainer = document.getElementById('digital-services-container');
      if (digitalContainer) {
        digitalContainer.innerHTML = '';
        digitalList.forEach(srv => {
          digitalContainer.innerHTML += `
            <div class="service-card" id="service-${srv.id}">
              <div class="service-icon">${srv.icon || '💻'}</div>
              <h3>${srv.title}</h3>
              <p>${srv.description}</p>
              <div style="font-weight: 700; color: var(--accent); margin-bottom: 15px; font-size: 0.95rem;">${srv.price || 'Sur devis'}</div>
              <a href="/service-details.html?id=${srv.id}" class="service-link">En savoir plus →</a>
            </div>
          `;
        });
      }

      // Rendu du Pôle Services & Divers
      const multiContainer = document.getElementById('multi-services-container');
      if (multiContainer) {
        multiContainer.innerHTML = '';
        multiList.forEach(srv => {
          multiContainer.innerHTML += `
            <div class="service-card" id="service-${srv.id}">
              <div class="service-icon">${srv.icon || '🌟'}</div>
              <h3>${srv.title}</h3>
              <p>${srv.description}</p>
              <div style="font-weight: 700; color: var(--accent); margin-bottom: 15px; font-size: 0.95rem;">${srv.price || 'Sur devis'}</div>
              <a href="/service-details.html?id=${srv.id}" class="service-link">En savoir plus →</a>
            </div>
          `;
        });
      }
    })
    .catch(err => console.warn("Attention : Erreur de chargement des pôles d'expertise.", err));

  // ---------------------------------------------------------
  // 3. CHARGEMENT DES REALISATIONS (PORTFOLIO MULTI-PHOTOS DYNAMIQUE) (CORRIGÉ !)
  // ---------------------------------------------------------
  const defaultRealisations = [
    "villa-cotonou",
    "auditorium-natitingou",
    "piscine-natitingou",
    "geomembrane-cotonou",
    "pavage-ouagadougou",
    "siteweb-calavi"
  ];

  fetch('https://api.github.com/repos/bestservicesh-dot/bsh-siteweb/contents/data/realisations')
    .then(res => {
      if (!res.ok) throw new Error("API GitHub indisponible.");
      return res.json();
    })
    .then(files => {
      const jsonFiles = files.filter(f => f.name.endsWith('.json'));
      return Promise.all(jsonFiles.map(f => 
        fetch('/' + f.path + cacheBuster).then(res => res.json())
      ));
    })
    .catch(err => {
      console.warn("Utilisation de la liste de réalisations par défaut (fallback).", err);
      return Promise.all(defaultRealisations.map(id => 
        fetch(`/data/realisations/${id}.json${cacheBuster}`).then(res => res.json())
      ));
    })
    .then(projects => {
      allRealisations = projects;
      renderPortfolio('all');
    });

  function renderPortfolio(categoryFilter) {
    const portfolioContainer = document.getElementById('portfolio-container');
    if (!portfolioContainer) return;

    portfolioContainer.innerHTML = '';
    
    const filteredItems = categoryFilter === 'all' 
      ? allRealisations 
      : allRealisations.filter(item => item.category.toLowerCase() === categoryFilter.toLowerCase());

    if (filteredItems.length === 0) {
      portfolioContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">Aucune réalisation dans cette catégorie.</p>`;
      return;
    }

    filteredItems.forEach(proj => {
      portfolioContainer.innerHTML += `
        <div class="portfolio-card">
          <div class="portfolio-img-wrapper">
            <img src="${proj.main_image}" alt="${proj.title}">
            <span class="portfolio-category-badge">${proj.category}</span>
          </div>
          <div class="portfolio-info">
            <h4>${proj.title}</h4>
            <p>📍 ${proj.city}</p>
          </div>
        </div>
      `;
    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');
      renderPortfolio(filterValue);
    });
  });

  // ---------------------------------------------------------
  // 4. CHARGEMENT DES TEMOIGNAGES
  // ---------------------------------------------------------
  fetch('/data/temoignages.json' + cacheBuster)
    .then(res => res.json())
    .then(data => {
      const testTitle = document.getElementById('testimonials-title');
      const testSubtitle = document.getElementById('testimonials-subtitle');
      if (testTitle && data.title) testTitle.textContent = data.title;
      if (testSubtitle && data.subtitle) testSubtitle.textContent = data.subtitle;

      const testimonialsContainer = document.getElementById('testimonials-container');
      if (testimonialsContainer && data.items) {
        testimonialsContainer.innerHTML = '';
        data.items.forEach(t => {
          let starsHTML = '';
          for (let i = 0; i < 5; i++) {
            starsHTML += i < t.rating ? '★' : '☆';
          }

          const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

          testimonialsContainer.innerHTML += `
            <div class="testimonial-card">
              <div class="stars">${starsHTML}</div>
              <p class="testimonial-text">"${t.comment}"</p>
              <div class="testimonial-user">
                <div class="user-avatar">${initials}</div>
                <div class="user-info">
                  <h5>${t.name}</h5>
                  <p>${t.role} — ${t.city}</p>
                </div>
              </div>
            </div>
          `;
        });
      }
    })
    .catch(err => console.warn("Attention : Fallback témoignages.", err));

  // ---------------------------------------------------------
  // 5. CHARGEMENT DE LA FAQ (AVEC ANIMATION ACCORDEON)
  // ---------------------------------------------------------
  fetch('/data/faq.json' + cacheBuster)
    .then(res => res.json())
    .then(data => {
      const faqTitle = document.getElementById('faq-title');
      const faqSubtitle = document.getElementById('faq-subtitle');
      if (faqTitle && data.title) faqTitle.textContent = data.title;
      if (faqSubtitle && data.subtitle) faqSubtitle.textContent = data.subtitle;

      const faqContainer = document.getElementById('faq-container');
      if (faqContainer && data.items) {
        faqContainer.innerHTML = '';
        data.items.forEach((item, index) => {
          faqContainer.innerHTML += `
            <div class="faq-item">
              <button class="faq-question">
                ${item.question}
                <span>+</span>
              </button>
              <div class="faq-answer">
                <p>${item.answer}</p>
              </div>
            </div>
          `;
        });

        attachFaqListeners();
      }
    })
    .catch(err => {
      console.warn("Attention : FAQ fallback.", err);
      attachFaqListeners();
    });

  function attachFaqListeners() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
      question.removeEventListener('click', toggleFaq);
      question.addEventListener('click', toggleFaq);
    });
  }

  function toggleFaq(e) {
    const item = e.currentTarget.parentElement;
    const isActive = item.classList.contains('active');
    
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    
    if (!isActive) {
      item.classList.add('active');
    }
  }

  // ---------------------------------------------------------
  // 6. CHARGEMENT DES COMMUNIQUES & AVIS (NEW!)
  // ---------------------------------------------------------
  fetch('/data/communiques.json' + cacheBuster)
    .then(res => res.json())
    .then(data => {
      const commTitle = document.getElementById('comm-main-title');
      const commSubtitle = document.getElementById('comm-main-subtitle');
      if (commTitle && data.title) commTitle.textContent = data.title;
      if (commSubtitle && data.subtitle) commSubtitle.textContent = data.subtitle;

      const commContainer = document.getElementById('comm-container');
      if (commContainer && data.items) {
        commContainer.innerHTML = '';
        data.items.forEach(item => {
          let actionBtn = '';
          if (item.link) {
            actionBtn = `<a href="${item.link}" class="btn btn-outline" style="padding: 6px 15px; font-size: 0.85rem; margin-top: 10px; display: inline-block;">${item.link_text || 'En savoir plus'} →</a>`;
          }
          commContainer.innerHTML += `
            <div class="comm-card">
              <div class="comm-date">${item.date}</div>
              <h3>${item.title}</h3>
              <p class="comm-content">${item.content}</p>
              ${actionBtn}
            </div>
          `;
        });
      }
    })
    .catch(err => console.warn("Attention : Fallback communiqués.", err));
});

/* ═══════════════════════════════════════════════════════════════════════════
   MODERNISATION BSH 2026 — Animations + Performance + UX
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── 1. Skip-to-content link (accessibilité + SEO) ── */
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Aller au contenu principal';
  document.body.prepend(skipLink);

  /* Ajouter l'id main-content au premier section si absent */
  const firstSection = document.querySelector('main, section, .hero-section, #accueil');
  if (firstSection && !firstSection.id) firstSection.id = 'main-content';
  else if (firstSection) { const el = firstSection; el.setAttribute('tabindex', '-1'); }

  /* ── 2. Intersection Observer — Animations au scroll ── */
  const observerOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        scrollObserver.unobserve(e.target);
      }
    });
  }, observerOpts);

  /* Appliquer les classes d'animation aux éléments */
  function addAnimations() {
    const rules = [
      { sel: '.section-header',   cls: 'fade-in',       delay: 0   },
      { sel: '.service-card',     cls: 'fade-in',       delay: 80  },
      { sel: '.stat-item',        cls: 'scale-in',      delay: 60  },
      { sel: '.realisation-card', cls: 'fade-in',       delay: 80  },
      { sel: '.about-img',        cls: 'fade-in-left',  delay: 0   },
      { sel: '.about-content',    cls: 'fade-in-right', delay: 0   },
      { sel: '.temoignage-card',  cls: 'fade-in',       delay: 80  },
      { sel: '.blog-card',        cls: 'fade-in',       delay: 80  },
      { sel: '.comm-card',        cls: 'fade-in',       delay: 60  },
    ];
    rules.forEach(({ sel, cls, delay }) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (!el.classList.contains(cls)) {
          el.classList.add(cls);
          el.style.transitionDelay = (i * delay) + 'ms';
          scrollObserver.observe(el);
        }
      });
    });
  }

  /* ── 3. Compteur animé pour les statistiques ── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || el.textContent.replace(/[^\d.]/g, ''));
    const suffix = el.dataset.suffix || el.textContent.replace(/[\d.]/g, '');
    const duration = 1800;
    const step = 16;
    const steps = duration / step;
    let current = 0;
    el.classList.add('counting');
    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
    }, step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const numEl = e.target.querySelector('.stat-number, [data-counter]');
        if (numEl && !numEl.dataset.animated) {
          numEl.dataset.animated = '1';
          const val = numEl.textContent.trim();
          const num = parseFloat(val.replace(/[^\d.]/g, ''));
          const sfx = val.replace(/[\d.]/g, '').trim();
          numEl.dataset.target = num;
          numEl.dataset.suffix = sfx;
          animateCounter(numEl);
        }
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-item, .metric-card').forEach(el => counterObserver.observe(el));

  /* ── 4. Image lazy blur-up ── */
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.onload = () => img.classList.add('loaded');
        } else {
          img.addEventListener('load', () => img.classList.add('loaded'));
          if (img.complete) img.classList.add('loaded');
        }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.classList.add('img-lazy');
    imgObserver.observe(img);
  });

  /* ── 5. Breadcrumb automatique dans les pages de service ── */
  function injectBreadcrumb() {
    const path = window.location.pathname;
    if (!path.includes('/services/')) return;
    const h1 = document.querySelector('h1');
    if (!h1 || document.querySelector('.breadcrumb')) return;
    const pageName = h1.textContent.replace(/[^\w\s\u00C0-\u024F&-]/gu, '').trim();
    const bc = document.createElement('nav');
    bc.setAttribute('aria-label', 'Fil d\'Ariane');
    bc.innerHTML = `<ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a href="/" itemprop="item"><span itemprop="name">Accueil</span></a>
        <meta itemprop="position" content="1">
      </li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a href="/services/" itemprop="item"><span itemprop="name">Nos Services</span></a>
        <meta itemprop="position" content="2">
      </li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span itemprop="name" aria-current="page">${pageName}</span>
        <meta itemprop="position" content="3">
      </li>
    </ol>`;
    h1.parentNode.insertBefore(bc, h1);
  }

  /* ── 6. Table of contents auto pour les articles de blog ── */
  function autoTOC() {
    if (!window.location.pathname.includes('/blog/')) return;
    const headings = document.querySelectorAll('.blog-content h2, .article-content h2');
    if (headings.length < 3) return;
    const toc = document.createElement('nav');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'Table des matières');
    toc.innerHTML = '<h3>📋 Sommaire</h3><ol></ol>';
    const ol = toc.querySelector('ol');
    headings.forEach((h, i) => {
      const id = 'section-' + (i+1);
      h.id = id;
      const li = document.createElement('li');
      li.innerHTML = `<a href="#${id}">${h.textContent}</a>`;
      ol.appendChild(li);
    });
    const firstH2 = document.querySelector('.blog-content h2, .article-content h2');
    if (firstH2) firstH2.parentNode.insertBefore(toc, firstH2);
  }

  /* ── 7. Aria-current page dans la nav ── */
  function setAriaCurrent() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const aPath = href.split('#')[0].replace(/\/$/, '') || '/';
      if (aPath === path || (path === '/' && aPath === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ── 8. Amélioration formulaire devis : labels flottants ── */
  document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(input => {
    const label = input.previousElementSibling;
    if (!label || label.tagName !== 'LABEL') return;
    input.addEventListener('focus', () => label.classList.add('active'));
    input.addEventListener('blur',  () => { if (!input.value) label.classList.remove('active'); });
    if (input.value) label.classList.add('active');
  });

  /* ── 9. Smooth anchor scroll pour tous les liens internes ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ── 10. Méta title dynamique selon section visible ── */
  const originalTitle = document.title;
  const sectionTitles = {
    'accueil':    'BSH Bénin | Construction BTP',
    'services':   'Nos Services BTP | BSH Bénin',
    'diagnostic': 'Diagnostic Bâtiment | BSH Bénin',
    'realisations': 'Nos Réalisations | BSH Bénin',
    'a-propos':   'À Propos de BSH | BTP Bénin',
    'contact':    'Contactez BSH | Devis Gratuit',
  };
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        if (sectionTitles[id]) document.title = sectionTitles[id];
        else document.title = originalTitle;
      }
    });
  }, { threshold: 0.4 });
  Object.keys(sectionTitles).forEach(id => {
    const el = document.getElementById(id);
    if (el) titleObserver.observe(el);
  });

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    addAnimations();
    injectBreadcrumb();
    autoTOC();
    setAriaCurrent();
  });
  // Fallback si DOMContentLoaded déjà passé
  if (document.readyState !== 'loading') {
    addAnimations();
    injectBreadcrumb();
    autoTOC();
    setAriaCurrent();
  }

})();
