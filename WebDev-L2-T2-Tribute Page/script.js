/**
 * TRIBUTE PAGE: ALAN TURING — INTERACTIVE SCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. SCROLL PROGRESS INDICATOR
  const scrollProgress = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      scrollProgress.style.width = `${progress}%`;
    }
  });

  // 2. DARK / LIGHT THEME TOGGLE
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');

  // Check saved theme in localStorage
  const savedTheme = localStorage.getItem('turing-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('turing-theme', isDark ? 'dark' : 'light');
  });

  // 3. QUOTE CAROUSEL DATA & LOGIC
  const quotes = [
    {
      text: '"Sometimes it is the people no one imagines anything of who do the things that no one can imagine."',
      author: '— Alan Turing (1954)'
    },
    {
      text: '"We can only see a short distance ahead, but we can see plenty there that needs to be done."',
      author: '— Alan Turing (Computing Machinery and Intelligence, 1950)'
    },
    {
      text: '"A computer would deserve to be called intelligent if it could deceive a human into believing that it was human."',
      author: '— Alan Turing'
    },
    {
      text: '"Turing\'s work was the foundation stone upon which the entire modern digital revolution was built."',
      author: '— Prof. Stephen Hawking'
    }
  ];

  let currentQuoteIndex = 0;
  const quoteDisplay = document.getElementById('quote-display');
  const prevBtn = document.getElementById('prev-quote');
  const nextBtn = document.getElementById('next-quote');
  const dotsContainer = document.getElementById('quote-dots');
  const dots = dotsContainer.querySelectorAll('.dot');

  function renderQuote(index) {
    quoteDisplay.style.opacity = '0';
    quoteDisplay.style.transform = 'translateY(10px)';

    setTimeout(() => {
      quoteDisplay.querySelector('.quote-text').textContent = quotes[index].text;
      quoteDisplay.querySelector('.quote-author').textContent = quotes[index].author;

      quoteDisplay.style.opacity = '1';
      quoteDisplay.style.transform = 'translateY(0)';
    }, 250);

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  prevBtn.addEventListener('click', () => {
    currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
    renderQuote(currentQuoteIndex);
  });

  nextBtn.addEventListener('click', () => {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    renderQuote(currentQuoteIndex);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentQuoteIndex = i;
      renderQuote(currentQuoteIndex);
    });
  });

  // Auto-advance quote carousel every 8 seconds
  let quoteAutoTimer = setInterval(() => {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    renderQuote(currentQuoteIndex);
  }, 8000);

  // Pause carousel on hover
  const quoteSection = document.getElementById('quote-section');
  quoteSection.addEventListener('mouseenter', () => clearInterval(quoteAutoTimer));
  quoteSection.addEventListener('mouseleave', () => {
    quoteAutoTimer = setInterval(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      renderQuote(currentQuoteIndex);
    }, 8000);
  });

  // 4. BACK TO TOP BUTTON
  const backToTopBtn = document.getElementById('back-to-top');
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 5. INTERSECTION OBSERVER FOR TIMELINE ANIMATIONS
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const timelineObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.timeline-item, .bio-paragraph-card, .legacy-card').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    timelineObserver.observe(item);
  });
});

