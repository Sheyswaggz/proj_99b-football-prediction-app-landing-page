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
    this.setupAccessibility();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    this.fields.forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', debounce(() => {
        if (field.classList.contains('error')) {
          this.validateField(field);
        }
      }, 500));
    });
  }

  setupAccessibility() {
    this.fields.forEach(field => {
      const errorId = `${field.id || field.name}-error`;
      field.setAttribute('aria-describedby', errorId);
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    const isValid = this.validateForm();

    if (isValid) {
      this.submitForm();
    } else {
      const firstError = this.form.querySelector('.error');
      if (firstError) {
        firstError.focus();
      }
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

  validateField(field) {
    const value = field.value.trim();
    const validationType = field.getAttribute('data-validate');
    const isRequired = field.hasAttribute('required');
    const minLength = field.getAttribute('minlength');
    const maxLength = field.getAttribute('maxlength');

    // Clear previous errors
    this.clearError(field);

    // Check required
    if (isRequired && !value) {
      this.showError(field, 'This field is required');
      return false;
    }

    // Skip other validations if field is empty and not required
    if (!value && !isRequired) {
      return true;
    }

    // Check min length
    if (minLength && value.length < parseInt(minLength, 10)) {
      this.showError(field, `Minimum ${minLength} characters required`);
      return false;
    }

    // Check max length
    if (maxLength && value.length > parseInt(maxLength, 10)) {
      this.showError(field, `Maximum ${maxLength} characters allowed`);
      return false;
    }

    // Check validation type
    if (validationType && this.validationRules[validationType]) {
      if (!this.validationRules[validationType].test(value)) {
        this.showError(field, this.getErrorMessage(validationType));
        return false;
      }
    }

    // Custom validation
    const customValidator = field.getAttribute('data-validator');
    if (customValidator && typeof window[customValidator] === 'function') {
      const customResult = window[customValidator](value);
      if (customResult !== true) {
        this.showError(field, customResult);
        return false;
      }
    }

    this.showSuccess(field);
    return true;
  }

  showError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    field.setAttribute('aria-invalid', 'true');

    const errorElement = this.getErrorElement(field);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  showSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
    field.setAttribute('aria-invalid', 'false');

    const errorElement = this.getErrorElement(field);
    errorElement.style.display = 'none';
  }

  clearError(field) {
    field.classList.remove('error', 'success');
    field.removeAttribute('aria-invalid');

    const errorElement = this.getErrorElement(field);
    errorElement.style.display = 'none';
  }

  getErrorElement(field) {
    const errorId = `${field.id || field.name}-error`;
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorElement);
    }

    return errorElement;
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

  async submitForm() {
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Submitting...';
    }

    try {
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());

      // Simulate API call
      await this.sendFormData(data);

      this.showSuccessMessage();
      this.form.reset();
      this.fields.forEach(field => this.clearError(field));
    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage('An error occurred. Please try again.');
    } finally {
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Submit';
      }
    }
  }

  async sendFormData(data) {
    // Replace with actual API endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form data:', data);
        resolve();
      }, 1000);
    });
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'form-message success';
    message.textContent = 'Form submitted successfully!';
    message.setAttribute('role', 'status');
    
    this.form.insertBefore(message, this.form.firstChild);
    
    setTimeout(() => message.remove(), 5000);
  }

  showErrorMessage(text) {
    const message = document.createElement('div');
    message.className = 'form-message error';
    message.textContent = text;
    message.setAttribute('role', 'alert');
    
    this.form.insertBefore(message, this.form.firstChild);
    
    setTimeout(() => message.remove(), 5000);
  }
}

// ============================================
// LAZY LOADING
// ============================================

class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src], img[data-srcset]');
    this.iframes = document.querySelectorAll('iframe[data-src]');
    
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

    this.images.forEach(img => this.observer.observe(img));
    this.iframes.forEach(iframe => this.observer.observe(iframe));
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
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

  loadAllImages() {
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

    // Add scrolled class
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
// BACK TO TOP BUTTON
// ============================================

class BackToTop {
  constructor() {
    this.button = document.querySelector('.back-to-top');
    this.showThreshold = 300;

    this.init();
  }

  init() {
    if (!this.button) return;

    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
    this.button.addEventListener('click', () => this.scrollToTop());
  }

  handleScroll() {
    if (window.pageYOffset > this.showThreshold) {
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================

class App {
  constructor() {
    this.components = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      console.warn('App already initialized');
      return;
    }

    try {
      // Initialize core components
      this.components.push(new MobileNavigation());
      this.components.push(new SmoothScroll());
      this.components.push(new ScrollAnimations());
      this.components.push(new StatisticsCounter());
      this.components.push(new LazyLoader());
      this.components.push(new HeaderScroll());
      this.components.push(new BackToTop());

      // Initialize carousels
      document.querySelectorAll('.carousel').forEach(carousel => {
        this.components.push(new Carousel(carousel));
      });

      // Initialize forms
      document.querySelectorAll('form[data-validate-form]').forEach(form => {
        this.components.push(new FormValidator(form));
      });

      this.isInitialized = true;
      console.log('App initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
    }
  }

  destroy() {
    this.components.forEach(component => {
      if (typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components = [];
    this.isInitialized = false;
  }
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================

const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

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
    BackToTop,
    debounce,
    throttle,
    isInViewport,
    animateCounter
  };
}