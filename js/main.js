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

      // Mettre à jour le Logo BSH classique
      if (data.logo_url) {
        document.querySelectorAll('.logo-container').forEach(el => {
          el.innerHTML = `<img src="${data.logo_url}" alt="BSH Logo" style="max-height: 45px; width: auto; object-fit: contain;">`;
        });
      }

      // --- LIAISON UNIVERSELLE PAR ATTRIBUT [data-field] ---
      // (Pour garantir la compatibilité absolue avec tous vos fichiers HTML d'origine !)
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

      // Mettre à jour l'en-tête Hero
      if (data.hero_title) {
        const heroTitleEl = document.getElementById('hero-title');
        if (heroTitleEl) {
          if (data.hero_title.includes("rêve")) {
            heroTitleEl.innerHTML = data.hero_title.replace("rêve", "<span>rêve</span>");
          } else {
            heroTitleEl.textContent = data.hero_title;
          }
        }
      }
      if (data.hero_subtitle) {
        const heroSubtitleEl = document.getElementById('hero-subtitle');
        if (heroSubtitleEl) heroSubtitleEl.textContent = data.hero_subtitle;
      }

      // Mettre à jour la section À propos
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
    .catch(err => console.warn("Attention : Données générales chargées depuis la fallback HTML.", err));

  // ---------------------------------------------------------
  // 2. CHARGEMENT DES SERVICES
  // ---------------------------------------------------------
  fetch('/data/services.json' + cacheBuster)
    .then(res => res.json())
    .then(data => {
      // Services Principaux (BTP)
      const primaryTitle = document.getElementById('primary-services-title');
      const primarySubtitle = document.getElementById('primary-services-subtitle');
      if (primaryTitle && data.primary_title) primaryTitle.textContent = data.primary_title;
      if (primarySubtitle && data.primary_subtitle) primarySubtitle.textContent = data.primary_subtitle;

      const primaryContainer = document.getElementById('primary-services-container');
      if (primaryContainer && data.primary_services) {
        primaryContainer.innerHTML = '';
        data.primary_services.forEach(srv => {
          primaryContainer.innerHTML += `
            <div class="service-card" id="service-${srv.id}">
              <div class="service-icon">${srv.icon || '🏗️'}</div>
              <h3>${srv.title}</h3>
              <p>${srv.description}</p>
              <a href="${srv.link || '#'}" class="service-link">En savoir plus →</a>
            </div>
          `;
        });
      }

      // Services Secondaires
      const secondaryTitle = document.getElementById('secondary-services-title');
      const secondarySubtitle = document.getElementById('secondary-services-subtitle');
      if (secondaryTitle && data.secondary_title) secondaryTitle.textContent = data.secondary_title;
      if (secondarySubtitle && data.secondary_subtitle) secondarySubtitle.textContent = data.secondary_subtitle;

      const secondaryContainer = document.getElementById('secondary-services-container');
      if (secondaryContainer && data.secondary_services) {
        secondaryContainer.innerHTML = '';
        data.secondary_services.forEach(srv => {
          secondaryContainer.innerHTML += `
            <div class="service-card" id="service-${srv.id}">
              <div class="service-icon">${srv.icon || '🌟'}</div>
              <h3>${srv.title}</h3>
              <p>${srv.description}</p>
              <a href="${srv.link || '#'}" class="service-link">En savoir plus →</a>
            </div>
          `;
        });
      }
    })
    .catch(err => console.warn("Attention : Services chargés depuis le fallback HTML.", err));

  // ---------------------------------------------------------
  // 3. CHARGEMENT DES REALISATIONS (PORTFOLIO)
  // ---------------------------------------------------------
  fetch('/data/realisations.json' + cacheBuster)
    .then(res => res.json())
    .then(data => {
      const portTitle = document.getElementById('portfolio-title');
      const portSubtitle = document.getElementById('portfolio-subtitle');
      if (portTitle && data.title) portTitle.textContent = data.title;
      if (portSubtitle && data.subtitle) portSubtitle.textContent = data.subtitle;

      if (data.items) {
        allRealisations = data.items;
        renderPortfolio('all');
      }
    })
    .catch(err => console.warn("Attention : Réalisations chargées depuis le fallback HTML.", err));

  // Fonction de rendu du portfolio
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
            <img src="${proj.image}" alt="${proj.title}">
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

  // Gestion des filtres du Portfolio
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Activer le bouton cliqué
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filtrer les projets
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
    .catch(err => console.warn("Attention : Témoignages chargés depuis le fallback HTML.", err));

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
      console.warn("Attention : FAQ chargée depuis le fallback HTML.", err);
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
});
