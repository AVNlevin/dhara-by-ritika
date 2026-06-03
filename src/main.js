import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  loadCustomPortfolioItems();
  initMobileNav();
  initHeaderScroll();
  initActiveNavOnScroll();
  initPortfolioFilter();
  initPortfolioLightbox();
  initProcessTabs();
  initFaqAccordion();
  initBookingForm();
  initHeroVideoLoop();
  initScrollReveal();
});

/* ==========================================================================
   1. MOBILE NAVIGATION TOGGLE
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const bookingBtn = document.querySelector('.nav-booking-btn');

  if (!toggleBtn || !navMenu) return;

  const toggleMenu = () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
  };

  const closeMenu = () => {
    toggleBtn.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  toggleBtn.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  if (bookingBtn) {
    bookingBtn.addEventListener('click', closeMenu);
  }
}

/* ==========================================================================
   2. STICKY HEADER EFFECTS
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let isScrolled = false;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    if (scrolled !== isScrolled) {
      isScrolled = scrolled;
      header.classList.toggle('header-scrolled', isScrolled);
    }
  }, { passive: true });
}

/* ==========================================================================
   3. ACTIVE NAVIGATION LINK HIGHLIGHTING
   ========================================================================== */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   4. PORTFOLIO FILTER SYSTEM
   ========================================================================== */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (!filterBtns.length || !portfolioItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        // Custom cross-fade filter animation
        if (filterValue === 'all' || filterValue === itemCategory) {
          item.style.display = 'block';
          // Use setTimeout to allow browser to register display change before animating opacity
          setTimeout(() => {
            item.classList.add('show');
          }, 50);
        } else {
          item.classList.remove('show');
          // Wait for fade transition to finish before hiding display
          setTimeout(() => {
            if (!item.classList.contains('show')) {
              item.style.display = 'none';
            }
          }, 400);
        }
      });
    });
  });
}

/* ==========================================================================
   5. BESPOKE CUSTOM PROCESS TIMELINE TABS
   ========================================================================== */
function initProcessTabs() {
  const tabBtns = document.querySelectorAll('.process-tab-btn');
  const stepContents = document.querySelectorAll('.process-step-content');

  if (!tabBtns.length || !stepContents.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active classes
      tabBtns.forEach(b => b.classList.remove('active'));
      stepContents.forEach(c => {
        c.classList.remove('active');
        // Hide immediately to allow layout flow recalculations
        setTimeout(() => {
          if (!c.classList.contains('active')) {
            c.style.display = 'none';
          }
        }, 300);
      });

      // Add active classes
      btn.classList.add('active');
      const stepNum = btn.getAttribute('data-step');
      const targetContent = document.querySelector(`.process-step-content[data-content="${stepNum}"]`);

      if (targetContent) {
        targetContent.style.display = 'block';
        setTimeout(() => {
          targetContent.classList.add('active');
        }, 50);
      }
    });
  });
}

/* ==========================================================================
   6. FAQ ACCORDION TRANSITIONS
   ========================================================================== */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  if (!faqQuestions.length) return;

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      const answer = question.nextElementSibling;

      // Close other accordion panels
      faqQuestions.forEach(q => {
        if (q !== question && q.getAttribute('aria-expanded') === 'true') {
          q.setAttribute('aria-expanded', 'false');
          q.nextElementSibling.style.maxHeight = '0';
        }
      });

      // Toggle current panel
      question.setAttribute('aria-expanded', !isExpanded);
      if (!isExpanded) {
        // Expand to dynamic content scrollHeight
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      } else {
        // Collapse
        answer.style.maxHeight = '0';
      }
    });
  });
}

/* ==========================================================================
   7. CONSULTATION BOOKING FORM SUBMISSION
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('consultation-form');
  const statusDiv = document.getElementById('form-status');

  if (!form || !statusDiv) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-booking-btn');
    const originalBtnText = submitBtn.textContent;
    
    // UI Visual Loading State
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Atelier Request...';
    statusDiv.className = 'form-status';
    statusDiv.textContent = '';

    // Collect data
    const formData = new FormData(form);
    const clientName = formData.get('name');
    const clientEmail = formData.get('email');
    const clientPhone = formData.get('phone');
    const clientMessage = formData.get('message');

    // Create inquiry record
    const newInquiry = {
      id: `inquiry_${Date.now()}`,
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      message: clientMessage,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    // Save to localStorage
    try {
      const savedInquiries = localStorage.getItem('dhara_consultation_messages');
      let inquiries = [];
      if (savedInquiries) {
        inquiries = JSON.parse(savedInquiries);
      }
      inquiries.unshift(newInquiry);
      localStorage.setItem('dhara_consultation_messages', JSON.stringify(inquiries));
    } catch (err) {
      console.error('Error saving inquiry:', err);
    }

    // Simulate async network request feedback
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      statusDiv.className = 'form-status success';
      statusDiv.innerHTML = `✨ <strong>Thank you, ${clientName}!</strong> Your private consultation request has been sent to our atelier. Dhara by Ritika will contact you within 24 hours to confirm your appointment date.`;
      
      // Reset form on success
      form.reset();
    }, 1500);
  });
}

/* ==========================================================================
   8. HERO VIDEO LOOP WITH 8s PAUSE
   ========================================================================== */
function initHeroVideoLoop() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  video.addEventListener('ended', () => {
    // Wait for 8 seconds before restarting the video
    setTimeout(() => {
      video.play().catch(err => {
        console.log('Video autoplay play error: ', err);
      });
    }, 8000);
  });
}

/* ==========================================================================
   9. SCROLL REVEAL (SEAMLESS SECTION TRANSITIONS)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-section');
  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    observer.observe(element);
  });
}

/* ==========================================================================
   10. PORTFOLIO LIGHTBOX MODAL (PREMIUM ZOOM & NAVIGATION)
   ========================================================================== */
function initPortfolioLightbox() {
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!lightbox || !lightboxImg || !portfolioItems.length) return;

  let visibleItems = [];
  let currentIndex = 0;

  // Open Lightbox
  portfolioItems.forEach(item => {
    const wrapper = item.querySelector('.portfolio-image-wrapper');
    if (!wrapper) return;

    wrapper.style.cursor = 'zoom-in'; // Visual zoom cue

    wrapper.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get all currently visible portfolio items based on filter category
      visibleItems = Array.from(portfolioItems).filter(el => {
        return window.getComputedStyle(el).display !== 'none';
      });

      currentIndex = visibleItems.indexOf(item);
      if (currentIndex === -1) currentIndex = 0;

      updateLightbox(visibleItems[currentIndex]);
      
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    });
  });

  const updateLightbox = (item) => {
    if (!item) return;
    const img = item.querySelector('.portfolio-img');
    const title = item.querySelector('.hover-content h3');
    const tag = item.querySelector('.hover-content .item-tag');
    const desc = item.querySelector('.hover-content p');

    // Premium transitions: slight scaling & fade
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.97)';

    setTimeout(() => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxTitle.textContent = title ? title.textContent : '';
      lightboxTag.textContent = tag ? tag.textContent : '';
      lightboxDesc.textContent = desc ? desc.textContent : '';
      
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 150);
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    
    // Clear image src after closing transition to prevent visual flash next time
    setTimeout(() => {
      lightboxImg.src = '';
    }, 400);
  };

  const showNext = () => {
    if (visibleItems.length <= 1) return;
    currentIndex = (currentIndex + 1) % visibleItems.length;
    updateLightbox(visibleItems[currentIndex]);
  };

  const showPrev = () => {
    if (visibleItems.length <= 1) return;
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightbox(visibleItems[currentIndex]);
  };

  // Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  // Close by clicking backdrop overlay
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Premium Keyboard Shortcuts (Esc, Left, Right Arrow Keys)
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    }
  });
}

/* ==========================================================================
   11. DYNAMIC LOCAL STORAGE PORTFOLIO LOADER
   ========================================================================== */
function loadCustomPortfolioItems() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const saved = localStorage.getItem('dhara_custom_portfolio');
  if (!saved) return;

  try {
    const items = JSON.parse(saved);
    items.forEach(item => {
      const colItem = document.createElement('div');
      colItem.className = 'portfolio-item show';
      colItem.setAttribute('data-category', item.category);
      colItem.id = `item-${item.id}`;
      colItem.innerHTML = `
        <div class="portfolio-image-wrapper">
          <img src="${item.image}" alt="${item.title}" class="portfolio-img" loading="lazy">
          <div class="portfolio-hover">
            <div class="hover-content">
              <h3>${item.title}</h3>
              <span class="item-tag">${item.tag}</span>
              <p>${item.description}</p>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(colItem);
    });
  } catch (e) {
    console.error('Error parsing custom portfolio items:', e);
  }
}
