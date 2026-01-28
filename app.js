/**
 * Main Application JavaScript
 * Handles interactive features, animations, and user interactions
 * @version 1.0.0
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit function execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
const isInViewport = (element) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Animate number counter
 * @param {HTMLElement} element - Element containing the number
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in milliseconds
 */
const animateCounter = (element, target, duration = 2000) => {
  if (!element) return;
  
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
};

// ============================================
// MOBILE NAVIGATION
// ============================================

class MobileNavigation {
  constructor() {
    this.menuToggle = document.querySelector('.mobile-menu-toggle');
    this.mobileMenu = document.querySelector('.mobile-menu');
    this.menuOverlay = document.querySelector('.menu-overlay');
    this.body = document.body;
    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.menuToggle || !this.mobileMenu) {
      console.warn('Mobile navigation elements not found');
      return;
    }

    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    // Toggle menu on button click
    this.menuToggle.addEventListener('click', () => this.toggle());

    // Close menu on overlay click
    if (this.menuOverlay) {
      this.menuOverlay.addEventListener('click', () => this.close());
    }

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close menu on navigation link click
    const navLinks = this.mobileMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 768 && this.isOpen) {
        this.close();
      }
    }, 250));
  }

  setupAccessibility() {
    this.menuToggle.setAttribute('aria-expanded', 'false');
    this.menuToggle.setAttribute('aria-controls', 'mobile-menu');
    this.mobileMenu.setAttribute('id', 'mobile-menu');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.mobileMenu.classList.add('active');
    if (this.menuOverlay) this.menuOverlay.classList.add('active');
    this.body.style.overflow = 'hidden';
    this.menuToggle.classList.add('active');
    this.menuToggle.setAttribute('aria-expanded', 'true');

    // Focus first menu item
    const firstLink = this.mobileMenu.querySelector('a');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 300);
    }
  }

  close() {
    this.isOpen = false;
    this.mobileMenu.classList.remove('active');
    if (this.menuOverlay) this.menuOverlay.classList.remove('active');
    this.body.style.overflow = '';
    this.menuToggle.classList.remove('active');
    this.menuToggle.setAttribute('aria-expanded', 'false');
  }
}

// ============================================
// SMOOTH SCROLLING
// ============================================

class SmoothScroll {
  constructor() {
    this.links = document.querySelectorAll('a[href^="#"]');
    this.init();
  }

  init() {
    if (this.links.length === 0) return;

    this.links.forEach(link => {
      link.addEventListener('click', (e) => this.handleClick(e));
    });
  }

  handleClick(e) {
    const href = e.currentTarget.getAttribute('href');
    
    // Ignore empty hash or just '#'
    if (!href || href === '#') return;

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      e.preventDefault();
      this.scrollToElement(targetElement);
      
      // Update URL without jumping
      if (history.pushState) {
        history.pushState(null, null, href);
      }
    }
  }

  scrollToElement(element) {
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Set focus for accessibility
    element.setAttribute('tabindex', '-1');
    element.focus();
  }
}

// ============================================
// INTERSECTION OBSERVER ANIMATIONS
// ============================================

class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('[data-animate]');
    this.observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.animatedElements.forEach(el => el.classList.add('animated'));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.observerOptions
    );

    this.animatedElements.forEach(element => {
      this.observer.observe(element);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animationType = element.getAttribute('data-animate');
        const delay = element.getAttribute('data-delay') || 0;

        setTimeout(() => {
          element.classList.add('animated', `animate-${animationType}`);
        }, delay);

        // Unobserve after animation
        this.observer.unobserve(element);
      }
    });
  }
}

// ============================================
// STATISTICS COUNTER
// ============================================

class StatisticsCounter {
  constructor() {
    this.counters = document.querySelectorAll('[data-counter]');
    this.animated = new Set();
    this.init();
  }

  init() {
    if (this.counters.length === 0) return;

    if ('IntersectionObserver' in window) {
      this.setupObserver();
    } else {
      // Fallback: animate on load
      this.animateCounters();
    }
  }

  setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated.has(entry.target)) {
            this.animateCounter(entry.target);
            this.animated.add(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'), 10);
    const duration = parseInt(element.getAttribute('data-duration'), 10) || 2000;
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';

    if (isNaN(target)) return;

    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
        clearInterval(timer);
      } else {
        element.textContent = `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
      }
    }, 16);
  }

  animateCounters() {
    this.counters.forEach(counter => this.animateCounter(counter));
  }
}

// ============================================
// CAROUSEL / SLIDER
// ============================================

class Carousel {
  constructor(element) {
    this.carousel = element;
    this.track = element.querySelector('.carousel-track');
    this.slides = Array.from(element.querySelectorAll('.carousel-slide'));
    this.prevButton = element.querySelector('.carousel-prev');
    this.nextButton = element.querySelector('.carousel-next');
    this.dotsContainer = element.querySelector('.carousel-dots');
    
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    this.autoPlayDelay = parseInt(element.getAttribute('data-autoplay'), 10) || 5000;
    this.isAutoPlay = element.hasAttribute('data-autoplay');
    this.isPaused = false;

    this.init();
  }

  init() {
    if (!this.track || this.slides.length === 0) {
      console.warn('Carousel elements not found');
      return;
    }

    this.createDots();
    this.bindEvents();
    this.updateCarousel();

    if (this.isAutoPlay) {
      this.startAutoPlay();
    }
  }

  createDots() {
    if (!this.dotsContainer) return;

    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dotsContainer.appendChild(dot);
    });

    this.dots = Array.from(this.dotsContainer.querySelectorAll('.carousel-dot'));
  }

  bindEvents() {
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prev());
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.next());
    }

    // Keyboard navigation
    this.carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Pause on hover
    if (this.isAutoPlay) {
      this.carousel.addEventListener('mouseenter', () => this.pauseAutoPlay());
      this.carousel.addEventListener('mouseleave', () => this.resumeAutoPlay());
    }

    // Touch/swipe support
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.pauseAutoPlay();
    });

    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    this.track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
      }

      this.resumeAutoPlay();
    });
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.updateCarousel();
    this.resetAutoPlay();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateCarousel();
    this.resetAutoPlay();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateCarousel();
    this.resetAutoPlay();
  }

  updateCarousel() {
    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;

    // Update active states
    this.slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentIndex);
      slide.setAttribute('aria-hidden', index !== this.currentIndex);
    });

    if (this.dots) {
      this.dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentIndex);
        dot.setAttribute('aria-current', index === this.currentIndex);
      });
    }
  }

  startAutoPlay() {
    if (!this.isAutoPlay) return;
    this.autoPlayInterval = setInterval(() => this.next(), this.autoPlayDelay);
  }

  pauseAutoPlay() {
    this.isPaused = true;
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  resumeAutoPlay() {
    if (this.isAutoPlay && this.isPaused) {
      this.isPaused = false;
      this.startAutoPlay();
    }
  }

  resetAutoPlay() {
    if (this.isAutoPlay) {
      this.pauseAutoPlay();
      this.resumeAutoPlay();
    }
  }

  destroy() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }
}

// ============================================
// FORM VALIDATION
// ============================================

class FormValidator {
  constructor(form) {
    this.form = form;
    this.fields = Array.from(form.querySelectorAll('[data-validate]'));
    this.submitButton = form.querySelector('[type="submit"]');
    
    this.validationRules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\d\s\-\+\(\)]+$/,
      url: /^https?:\/\/.+/,
      number: /^\d+$/
    };

    this.init();
  }

  init() {
    if (!this.form) return;

    this.bindEvents();
  }

  bindEvents() {
    // Real-time validation
    this.fields.forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', debounce(() => {
        if (field.classList.contains('error')) {
          this.validateField(field);
        }
      }, 500));
    });

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field) {
    const value = field.value.trim();
    const validationType = field.getAttribute('data-validate');
    const isRequired = field.hasAttribute('required');
    const minLength = field.getAttribute('minlength');
    const maxLength = field.getAttribute('maxlength');

    // Clear previous errors
    this.clearError(field);

    // Required check
    if (isRequired && !value) {
      this.showError(field, 'This field is required');
      return false;
    }

    // Skip further validation if field is empty and not required
    if (!value && !isRequired) {
      return true;
    }

    // Length validation
    if (minLength && value.length < parseInt(minLength, 10)) {
      this.showError(field, `Minimum ${minLength} characters required`);
      return false;
    }

    if (maxLength && value.length > parseInt(maxLength, 10)) {
      this.showError(field, `Maximum ${maxLength} characters allowed`);
      return false;
    }

    // Type validation
    if (validationType && this.validationRules[validationType]) {
      if (!this.validationRules[validationType].test(value)) {
        this.showError(field, this.getErrorMessage(validationType));
        return false;
      }
    }

    // Custom validation
    const customValidator = field.getAttribute('data-validator');
    if (customValidator && typeof window[customValidator] === 'function') {
      const result = window[customValidator](value);
      if (result !== true) {
        this.showError(field, result);
        return false;
      }
    }

    this.showSuccess(field);
    return true;
  }

  getErrorMessage(type) {
    const messages = {
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      url: 'Please enter a valid URL',
      number: 'Please enter a valid number'
    };
    return messages[type] || 'Invalid input';
  }

  showError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    field.setAttribute('aria-invalid', 'true');

    let errorElement = field.parentElement.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.classList.add('error-message');
      errorElement.setAttribute('role', 'alert');
      field.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  showSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
    field.setAttribute('aria-invalid', 'false');
    this.clearError(field);
  }

  clearError(field) {
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  validateForm() {
    let isValid = true;
    this.fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      // Focus first error field
      const firstError = this.form.querySelector('.error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Disable submit button
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Submitting...';
    }

    // Get form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    // Submit form (customize this based on your needs)
    this.submitForm(data);
  }

  async submitForm(data) {
    try {
      // Example: Send to API endpoint
      const response = await fetch(this.form.action || '/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();
      this.handleSuccess(result);
    } catch (error) {
      this.handleError(error);
    } finally {
      // Re-enable submit button
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Submit';
      }
    }
  }

  handleSuccess(result) {
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.classList.add('form-success');
    successMessage.textContent = 'Form submitted successfully!';
    this.form.insertBefore(successMessage, this.form.firstChild);

    // Reset form
    this.form.reset();
    this.fields.forEach(field => {
      field.classList.remove('success', 'error');
    });

    // Remove success message after 5 seconds
    setTimeout(() => successMessage.remove(), 5000);
  }

  handleError(error) {
    console.error('Form submission error:', error);
    
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('form-error');
    errorMessage.textContent = 'An error occurred. Please try again.';
    this.form.insertBefore(errorMessage, this.form.firstChild);

    setTimeout(() => errorMessage.remove(), 5000);
  }
}

// ============================================
// LAZY LOADING
// ============================================

class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src], img[data-srcset]');
    this.iframes = document.querySelectorAll('iframe[data-src]');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.setupObserver();
    } else {
      // Fallback: load all immediately
      this.loadAll();
    }
  }

  setupObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.images.forEach(img => this.observer.observe(img));
    this.iframes.forEach(iframe => this.observer.observe(iframe));
  }

  loadElement(element) {
    if (element.tagName === 'IMG') {
      this.loadImage(element);
    } else if (element.tagName === 'IFRAME') {
      this.loadIframe(element);
    }
  }

  loadImage(img) {
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');

    if (srcset) {
      img.srcset = srcset;
    }
    if (src) {
      img.src = src;
    }

    img.addEventListener('load', () => {
      img.classList.add('loaded');
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
    });

    img.addEventListener('error', () => {
      console.error('Failed to load image:', src);
      img.classList.add('error');
    });
  }

  loadIframe(iframe) {
    const src = iframe.getAttribute('data-src');
    if (src) {
      iframe.src = src;
      iframe.removeAttribute('data-src');
    }
  }

  loadAll() {
    this.images.forEach(img => this.loadImage(img));
    this.iframes.forEach(iframe => this.loadIframe(iframe));
  }
}

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================

class HeaderScroll {
  constructor() {
    this.header = document.querySelector('header, .header');
    this.lastScroll = 0;
    this.scrollThreshold = 100;
    
    this.init();
  }

  init() {
    if (!this.header) return;

    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
  }

  handleScroll() {
    const currentScroll = window.pageYOffset;

    // Add scrolled class when past threshold
    if (currentScroll > this.scrollThreshold) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }

    // Hide/show header on scroll
    if (currentScroll > this.lastScroll && currentScroll > this.scrollThreshold) {
      this.header.classList.add('hidden');
    } else {
      this.header.classList.remove('hidden');
    }

    this.lastScroll = currentScroll;
  }
}

// ============================================
// MODAL HANDLER
// ============================================

class ModalHandler {
  constructor() {
    this.modals = document.querySelectorAll('[data-modal]');
    this.triggers = document.querySelectorAll('[data-modal-trigger]');
    this.activeModal = null;
    
    this.init();
  }

  init() {
    if (this.triggers.length === 0) return;

    this.bindEvents();
  }

  bindEvents() {
    // Trigger buttons
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-trigger');
        this.open(modalId);
      });
    });

    // Close buttons
    this.modals.forEach(modal => {
      const closeButtons = modal.querySelectorAll('[data-modal-close]');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });

      // Close on overlay click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });
  }

  open(modalId) {
    const modal = document.querySelector(`[data-modal="${modalId}"]`);
    if (!modal) return;

    this.activeModal = modal;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');

    // Focus first focusable element
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) {
      setTimeout(() => focusable.focus(), 100);
    }
  }

  close() {
    if (!this.activeModal) return;

    this.activeModal.classList.remove('active');
    this.activeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.activeModal = null;
  }
}

// ============================================
// ACCORDION
// ============================================

class Accordion {
  constructor(element) {
    this.accordion = element;
    this.items = Array.from(element.querySelectorAll('.accordion-item'));
    this.allowMultiple = element.hasAttribute('data-allow-multiple');
    
    this.init();
  }

  init() {
    if (this.items.length === 0) return;

    this.items.forEach((item, index) => {
      const trigger = item.querySelector('.accordion-trigger');
      const content = item.querySelector('.accordion-content');

      if (!trigger || !content) return;

      // Setup ARIA attributes
      const id = `accordion-${Date.now()}-${index}`;
      trigger.setAttribute('aria-controls', id);
      trigger.setAttribute('aria-expanded', 'false');
      content.setAttribute('id', id);

      trigger.addEventListener('click', () => this.toggle(item));
    });
  }

  toggle(item) {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');
    const isOpen = item.classList.contains('active');

    if (!this.allowMultiple) {
      this.closeAll();
    }

    if (isOpen) {
      this.close(item);
    } else {
      this.open(item);
    }
  }

  open(item) {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');

    item.classList.add('active');
    trigger.setAttribute('aria-expanded', 'true');
    content.style.maxHeight = content.scrollHeight + 'px';
  }

  close(item) {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');

    item.classList.remove('active');
    trigger.setAttribute('aria-expanded', 'false');
    content.style.maxHeight = '0';
  }

  closeAll() {
    this.items.forEach(item => this.close(item));
  }
}

// ============================================
// INITIALIZATION
// ============================================

class App {
  constructor() {
    this.components = [];
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Initialize mobile navigation
      this.components.push(new MobileNavigation());

      // Initialize smooth scrolling
      this.components.push(new SmoothScroll());

      // Initialize scroll animations
      this.components.push(new ScrollAnimations());

      // Initialize statistics counter
      this.components.push(new StatisticsCounter());

      // Initialize carousels
      document.querySelectorAll('.carousel').forEach(carousel => {
        this.components.push(new Carousel(carousel));
      });

      // Initialize forms
      document.querySelectorAll('form[data-validate-form]').forEach(form => {
        this.components.push(new FormValidator(form));
      });

      // Initialize lazy loading
      this.components.push(new LazyLoader());

      // Initialize header scroll behavior
      this.components.push(new HeaderScroll());

      // Initialize modals
      this.components.push(new ModalHandler());

      // Initialize accordions
      document.querySelectorAll('.accordion').forEach(accordion => {
        this.components.push(new Accordion(accordion));
      });

      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing application:', error);
    }
  }

  destroy() {
    this.components.forEach(component => {
      if (typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components = [];
  }
}

// ============================================
// START APPLICATION
// ============================================

const app = new App();
app.init();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    App,
    MobileNavigation,
    SmoothScroll,
    ScrollAnimations,
    StatisticsCounter,
    Carousel,
    FormValidator,
    LazyLoader,
    HeaderScroll,
    ModalHandler,
    Accordion,
    debounce,
    throttle,
    isInViewport,
    animateCounter
  };
}