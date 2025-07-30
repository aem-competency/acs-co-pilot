export default function decorate(block) {
  // Initially hide the block to prevent flickering during load
  block.style.opacity = '0';
  // Get the heading element inside the block
  const logoTitle = block.querySelector(':scope > div > div').firstElementChild;
  // Extract all logo images from <picture> elements
  const logoImages = [...block.querySelectorAll('picture')].map((picture) => ({
    src: picture.querySelector('img').src, // Get image source
    alt: picture.querySelector('img').alt || 'Logo', // Set alt text or default to 'Logo'
  }));
  // Create container for the carousel
  const logoContainer = document.createElement('div');
  logoContainer.className = 'logo-container';
  const logoSlides = document.createElement('div');
  logoSlides.className = 'logo-slideshow';
  // Create all logo cards
  const allLogos = [];
  // Create original logos
  logoImages.forEach(({ src, alt }) => {
    const logoCard = document.createElement('div');
    logoCard.className = 'logo-card';
    const logoImage = new Image();
    logoImage.src = src;
    logoImage.alt = alt;
    logoImage.loading = 'eager';
    logoImage.decoding = 'async';
    logoCard.appendChild(logoImage);
    allLogos.push(logoCard);
  });
  // Create duplicates for seamless scrolling
  logoImages.forEach(({ src, alt }) => {
    const logoCard = document.createElement('div');
    logoCard.className = 'logo-card';
    const logoImage = new Image();
    logoImage.src = src;
    logoImage.alt = alt;
    logoImage.loading = 'eager';
    logoImage.decoding = 'async';
    logoCard.appendChild(logoImage);
    allLogos.push(logoCard);
  });
  // Add all cards to the slideshow
  logoSlides.append(...allLogos);
  logoContainer.appendChild(logoSlides);
  // Create content container
  const logoContent = document.createElement('div');
  logoContent.className = 'logo-content';
  logoContent.append(logoTitle, logoContainer);
  // Replace block content
  block.replaceChildren(logoContent);
  // Animation variables
  let animationId;
  let position = 0;
  const speed = 0.5; // Pixels per frame
  // Function to animate the logo slideshow
  function animateLogos() {
    // Calculate when to reset position for seamless loop
    const firstSetWidth = logoImages.reduce((width, _, index) => {
      const card = allLogos[index];
      return width
      + card.offsetWidth
      + parseInt(getComputedStyle(card).marginLeft, 10)
      + parseInt(getComputedStyle(card).marginRight, 10);
    }, 0);
    // Move the slideshow
    position += speed;
    if (position >= firstSetWidth) {
      position = 0;
    }
    logoSlides.style.transform = `translateX(-${position}px)`;
    animationId = requestAnimationFrame(animateLogos);
  }
  // Preload all images before starting animation
  const allImagesElements = [...logoSlides.querySelectorAll('img')];
  let loadedCount = 0;
  function startAnimation() {
    // Show the block with a fade-in effect
    block.style.transition = 'opacity 0.5s ease-in';
    block.style.opacity = '1';
    // Start the animation
    animationId = requestAnimationFrame(animateLogos);
    // Pause animation on hover
    logoContainer.addEventListener('mouseenter', () => {
      cancelAnimationFrame(animationId);
    });
    logoContainer.addEventListener('mouseleave', () => {
      animationId = requestAnimationFrame(animateLogos);
    });
  }
  function checkAllImagesLoaded() {
    loadedCount += 1;
    if (loadedCount === allImagesElements.length) {
      // All images loaded, start animation
      startAnimation();
    }
  }
  // Check if images are already loaded
  allImagesElements.forEach((img) => {
    if (img.complete) {
      checkAllImagesLoaded();
    } else {
      img.onload = checkAllImagesLoaded;
      img.onerror = checkAllImagesLoaded; // Count errors too
    }
  });
  // Fallback in case some images fail to load
  setTimeout(() => {
    if (block.style.opacity === '0') {
      startAnimation();
    }
  }, 2000);
  // Add click event to title
  logoTitle.addEventListener('click', () => {
    logoTitle.classList.toggle('clicked');
  });
}
