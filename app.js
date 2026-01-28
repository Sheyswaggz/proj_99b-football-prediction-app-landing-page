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

    // Touch events for mobile swipe
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;

    this.track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, { passive: true });
  }

  handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateCarousel();
    this.resetAutoPlay();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
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

    // Update dots
    if (this.dots) {
      this.dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentIndex);
      });
    }

    // Update buttons state
    this.slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index !== this.currentIndex);
    });
  }

  startAutoPlay() {
    if (!this.isAutoPlay) return;
    
    this.autoPlayInterval = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, this.autoPlayDelay);
  }

  pauseAutoPlay() {
    this.isPaused = true;
  }

  resumeAutoPlay() {
    this.isPaused = false;
  }

  resetAutoPlay() {
    if (!this.isAutoPlay) return;
    
    clearInterval(this.autoPlayInterval);
    this.startAutoPlay();
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
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      phone: {
        pattern: /^[\d\s\-\+\(\)]+$/,
        message: 'Please enter a valid phone number'
      },
      required: {
        pattern: /.+/,
        message: 'This field is required'
      },
      minLength: {
        validate: (value, min) => value.length >= min,
        message: (min) => `Minimum ${min} characters required`
      },
      maxLength: {
        validate: (value, max) => value.length <= max,
        message: (max) => `Maximum ${max} characters allowed`
      }
    };

    this.init();
  }

  init() {
    if (!this.form) return;

    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    // Real-time validation on blur
    this.fields.forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearError(field));
    });

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  setupAccessibility() {
    this.fields.forEach(field => {
      const fieldId = field.id || `field-${Math.random().toString(36).substr(2, 9)}`;
      field.id = fieldId;
      
      const errorId = `${fieldId}-error`;
      field.setAttribute('aria-describedby', errorId);
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const validationType = field.getAttribute('data-validate');
    const isRequired = field.hasAttribute('required');

    // Check if field is empty and required
    if (isRequired && !value) {
      this.showError(field, 'This field is required');
      return false;
    }

    // Skip validation if field is empty and not required
    if (!value && !isRequired) {
      this.clearError(field);
      return true;
    }

    // Validate based on type
    const rule = this.validationRules[validationType];
    if (!rule) {
      return true;
    }

    // Pattern-based validation
    if (rule.pattern && !rule.pattern.test(value)) {
      this.showError(field, rule.message);
      return false;
    }

    // Custom validation functions
    if (rule.validate) {
      const param = field.getAttribute(`data-${validationType}`);
      if (!rule.validate(value, param)) {
        const message = typeof rule.message === 'function' 
          ? rule.message(param) 
          : rule.message;
        this.showError(field, message);
        return false;
      }
    }

    this.clearError(field);
    return true;
  }

  showError(field, message) {
    this.clearError(field);

    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');

    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.id = `${field.id}-error`;
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');

    field.parentElement.appendChild(errorElement);
  }

  clearError(field) {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');

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

  async handleSubmit(e) {
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
      this.submitButton.textContent = 'Sending...';
    }

    try {
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());

      // Simulate API call (replace with actual endpoint)
      await this.submitFormData(data);

      this.showSuccess();
      this.form.reset();
    } catch (error) {
      this.showSubmitError(error.message);
    } finally {
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Submit';
      }
    }
  }

  async submitFormData(data) {
    // Replace with actual API endpoint
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Form data:', data);
        resolve({ success: true });
      }, 1000);
    });
  }

  showSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.textContent = 'Thank you! Your message has been sent successfully.';
    successMessage.setAttribute('role', 'status');
    
    this.form.insertAdjacentElement('beforebegin', successMessage);

    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  }

  showSubmitError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'form-error';
    errorMessage.textContent = `Error: ${message}. Please try again.`;
    errorMessage.setAttribute('role', 'alert');
    
    this.form.insertAdjacentElement('beforebegin', errorMessage);

    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  }
}

// ============================================
// LAZY LOADING
// ============================================

class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src], img[data-srcset]');
    this.observerOptions = {
      rootMargin: '50px 0px',
      threshold: 0.01
    };

    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      this.loadAllImages();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.observerOptions
    );

    this.images.forEach(image => {
      this.observer.observe(image);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(image) {
    const src = image.getAttribute('data-src');
    const srcset = image.getAttribute('data-srcset');

    if (src) {
      image.src = src;
      image.removeAttribute('data-src');
    }

    if (srcset) {
      image.srcset = srcset;
      image.removeAttribute('data-srcset');
    }

    image.classList.add('loaded');

    image.addEventListener('load', () => {
      image.classList.add('fade-in');
    }, { once: true });

    image.addEventListener('error', () => {
      console.error(`Failed to load image: ${src || srcset}`);
      image.classList.add('error');
    }, { once: true });
  }

  loadAllImages() {
    this.images.forEach(image => this.loadImage(image));
  }
}

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================

class HeaderScroll {
  constructor() {
    this.header = document.querySelector('.header, header');
    this.scrollThreshold = 100;
    this.lastScrollTop = 0;

    this.init();
  }

  init() {
    if (!this.header) return;

    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add/remove scrolled class
    if (scrollTop > this.scrollThreshold) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }

    // Hide/show header on scroll
    if (scrollTop > this.lastScrollTop && scrollTop > this.scrollThreshold) {
      this.header.classList.add('hidden');
    } else {
      this.header.classList.remove('hidden');
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
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
    // Open modal triggers
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-trigger');
        this.openModal(modalId);
      });
    });

    // Close buttons
    this.modals.forEach(modal => {
      const closeButtons = modal.querySelectorAll('[data-modal-close]');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => this.closeModal());
      });

      // Close on overlay click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });
  }

  openModal(modalId) {
    const modal = document.querySelector(`[data-modal="${modalId}"]`);
    if (!modal) return;

    this.activeModal = modal;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) {
      setTimeout(() => focusable.focus(), 100);
    }
  }

  closeModal() {
    if (!this.activeModal) return;

    this.activeModal.classList.remove('active');
    document.body.style.overflow = '';
    this.activeModal = null;
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
      const carousels = document.querySelectorAll('.carousel');
      carousels.forEach(carousel => {
        this.components.push(new Carousel(carousel));
      });

      // Initialize form validation
      const forms = document.querySelectorAll('form[data-validate-form]');
      forms.forEach(form => {
        this.components.push(new FormValidator(form));
      });

      // Initialize lazy loading
      this.components.push(new LazyLoader());

      // Initialize header scroll behavior
      this.components.push(new HeaderScroll());

      // Initialize modal handler
      this.components.push(new ModalHandler());

      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing application:', error);
    }
  }

  destroy() {
    this.components.forEach(component => {
      if (component.destroy && typeof component.destroy === 'function') {
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
    debounce,
    throttle,
    isInViewport,
    animateCounter
  };
}