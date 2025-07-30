export default function decorate(block) {
  // Gather all slide data from the initial block content
  const slidesData = Array.from(block.querySelectorAll(':scope > div')).map((slide) => ({
    picture: slide.querySelector('picture'),
    heading: slide.querySelector(':scope > div:nth-child(2)').firstElementChild,
    subHeading: slide.querySelector(':scope > div:nth-child(2) > *:nth-child(3)'),
    paragraphs: Array.from(slide.querySelectorAll('p')),
    icons: Array.from(slide.querySelectorAll('span.icon')),
  }));

  // Clear the existing block content
  block.innerHTML = '';

  // Create a container for the carousel
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'carousel-container';

  // Create a wrapper for the slides
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'slides-wrapper';

  // Create the carousel cards based on gathered data
  slidesData.forEach((slideData) => {
    const card = document.createElement('div');
    card.className = 'team-carousel-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'team-carousel-card-image';
    if (slideData.picture) imageContainer.appendChild(slideData.picture);

    const contentContainer = document.createElement('div');
    contentContainer.className = 'team-carousel-card-content';

    if (slideData.heading) contentContainer.appendChild(slideData.heading);
    if (slideData.paragraphs[0]) contentContainer.appendChild(slideData.paragraphs[0]);
    if (slideData.subHeading) contentContainer.appendChild(slideData.subHeading);
    if (slideData.paragraphs[1]) contentContainer.appendChild(slideData.paragraphs[1]);
    if (slideData.paragraphs[2]) contentContainer.appendChild(slideData.paragraphs[2]);

    card.appendChild(imageContainer);
    card.appendChild(contentContainer);
    slidesWrapper.appendChild(card);
  });

  carouselContainer.appendChild(slidesWrapper);
  block.appendChild(carouselContainer);

  // Add carousel navigation
  const navContainer = document.createElement('div');
  navContainer.className = 'carousel-nav-container';

  // Carousel sliding to previous slide using the arrow button
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-nav prev';
  prevButton.innerHTML = '&larr;';
  prevButton.addEventListener('click', () => {
    // eslint-disable-next-line no-use-before-define
    moveSlide(-1);
  });

  // Carousel sliding to next slide using the arrow button
  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-nav next';
  nextButton.innerHTML = '&rarr;';
  nextButton.addEventListener('click', () => {
    // eslint-disable-next-line no-use-before-define
    moveSlide(1);
  });

  // Create slide indicators
  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.className = 'carousel-indicators';

  // Carousel sliding based on the image icons
  slidesData.forEach((slideData, index) => {
    const indicator = document.createElement('img');
    indicator.src = slideData.picture.lastElementChild.src;
    indicator.className = 'carousel-indicator';
    indicator.setAttribute('data-slide-to', index);
    indicator.addEventListener('click', () => {
      // eslint-disable-next-line no-use-before-define
      goToSlide(index);
    });
    indicatorsContainer.appendChild(indicator);
  });

  // Determines the movement of the carousel slides in forward for positive values and
  // backward for negative values
  function moveSlide(direction) {
    const newScroll = slidesWrapper.scrollLeft + direction * slidesWrapper.offsetWidth;
    slidesWrapper.scrollTo({ left: newScroll, behavior: 'smooth' });
    // eslint-disable-next-line no-use-before-define
    updateIndicators();
  }

  // Determines the carousel slide based on index
  function goToSlide(index) {
    slidesWrapper.scrollTo({ left: index * slidesWrapper.offsetWidth, behavior: 'smooth' });
    // eslint-disable-next-line no-use-before-define
    updateIndicators();
  }

  // Detemines the 4 image icons present in the navigation based on the current carousel slide
  function updateIndicators() {
    const activeIndex = Math.round(slidesWrapper.scrollLeft / slidesWrapper.offsetWidth)
      ? Math.round(slidesWrapper.scrollLeft / slidesWrapper.offsetWidth) : 0;
    const start = Math.max(0, Math.min(activeIndex - 2, slidesData.length - 4));
    const end = Math.min(slidesData.length, start + 4);

    indicatorsContainer.childNodes.forEach((indicator, index) => {
      indicator.style.display = (index >= start && index < end) ? 'inline-block' : 'none';
      indicator.classList.toggle('active', index === activeIndex);
    });
  }

  navContainer.appendChild(prevButton);
  navContainer.appendChild(indicatorsContainer);
  navContainer.appendChild(nextButton);
  carouselContainer.appendChild(navContainer);
  updateIndicators();

  // Auto slide functionality
  let autoSlideInterval;
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      if (Math.ceil(slidesWrapper.scrollLeft) + slidesWrapper.offsetWidth
            >= slidesWrapper.scrollWidth) {
        slidesWrapper.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        moveSlide(1);
      }
    }, 5000);
  }

  // Pause auto slide on hover
  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  // Initialize indicators display immediately
  startAutoSlide();

  carouselContainer.addEventListener('mouseenter', stopAutoSlide);
  carouselContainer.addEventListener('mouseleave', startAutoSlide);
  slidesWrapper.addEventListener('scroll', updateIndicators);
}
