// Optimized Lazy Loading for Images
const imageObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        
        if (src) {
          // Create a new image to preload
          const tempImg = new Image();
          
          tempImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
          };
          
          tempImg.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            // Fallback to placeholder or default image
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect fill="%23f0f0f0" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="24"%3EImage unavailable%3C/text%3E%3C/svg%3E';
            img.classList.add('error');
          };
          
          tempImg.src = src;
          observer.unobserve(img);
        }
      }
    });
  },
  {
    rootMargin: '50px 0px',
    threshold: 0.01
  }
);

// Observe all images with data-src attribute
document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => imageObserver.observe(img));
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll <= 0) {
    navbar.classList.remove('scroll-up', 'scroll-down');
    return;
  }
  
  if (currentScroll > lastScroll && currentScroll > 100) {
    // Scrolling down
    navbar.classList.remove('scroll-up');
    navbar.classList.add('scroll-down');
  } else if (currentScroll < lastScroll) {
    // Scrolling up
    navbar.classList.remove('scroll-down');
    navbar.classList.add('scroll-up');
  }
  
  lastScroll = currentScroll;
});

// Animate on Scroll
const animateObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        animateObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }
);

// Observe elements with animation classes
const observeAnimations = () => {
  const animatedElements = document.querySelectorAll(
    '.fade-in, .slide-up, .slide-left, .slide-right, .scale-in, .feature-card, .testimonial-card, .pricing-card'
  );
  animatedElements.forEach(el => animateObserver.observe(el));
};

// Initialize animations after DOM is loaded
document.addEventListener('DOMContentLoaded', observeAnimations);

// Form Validation and Submission
const forms = document.querySelectorAll('form');

forms.forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Simulate API call (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success feedback
      submitBtn.textContent = 'Success!';
      submitBtn.classList.add('success');
      form.reset();
      
      // Show success message
      showNotification('Thank you! We\'ll be in touch soon.', 'success');
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('success');
      }, 3000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      submitBtn.textContent = 'Error - Try Again';
      submitBtn.classList.add('error');
      
      showNotification('Something went wrong. Please try again.', 'error');
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('error');
      }, 3000);
    }
  });
});

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mobileMenu.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
  
  // Close menu when clicking on a link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
}

// Counter Animation for Statistics
const animateCounter = (element, target, duration = 2000) => {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
};

// Observe and animate counters
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.dataset.target);
        animateCounter(counter, target);
        counterObserver.unobserve(counter);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.counter').forEach(counter => {
  counterObserver.observe(counter);
});

// Performance Optimization: Debounce Function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized Resize Handler
const handleResize = debounce(() => {
  // Re-calculate any layout-dependent features
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}, 250);

window.addEventListener('resize', handleResize);
handleResize(); // Initial call

// Preload Critical Images
const preloadImages = (urls) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Add to cart or CTA button interactions
document.querySelectorAll('.cta-button, .btn-primary').forEach(button => {
  button.addEventListener('click', function(e) {
    // Create ripple effect
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  
  if (question) {
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  }
});

// Back to Top Button
const backToTopBtn = document.querySelector('.back-to-top');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Landing page initialized successfully');
  
  // Add loaded class to body for CSS transitions
  document.body.classList.add('loaded');
});

// Service Worker Registration for PWA (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}