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
