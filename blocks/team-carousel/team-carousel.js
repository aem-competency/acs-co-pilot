export default function decorate(block) {
  // Gather all slide data from the initial block content
  const slidesData = Array.from(block.querySelectorAll(':scope > div')).map((slide) => {
    const secondDiv = slide.querySelector(':scope > div:nth-child(2)');
    const allParagraphs = Array.from(secondDiv.querySelectorAll('p'));
    
    // Get the experience value from the last paragraph
    const experienceValue = allParagraphs.length > 0 
      ? allParagraphs[allParagraphs.length - 1].textContent.trim() 
      : '20+ Years';
    
    return {
      picture: slide.querySelector('picture'),
      heading: secondDiv.firstElementChild,
      subHeading: secondDiv.querySelector(':scope > *:nth-child(3)'),
      experienceValue,
      paragraphs: allParagraphs,
      icons: Array.from(slide.querySelectorAll('span.icon')),
    };
  });

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

    // Create hardcoded experience card with briefcase icon
    const experienceContainer = document.createElement('div');
    experienceContainer.className = 'experience-cards-container';

    const experienceCard = document.createElement('div');
    experienceCard.className = 'experience-card';

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'experience-icon';
    iconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase w-4 h-4 text-blue-600" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>';

    const textWrapper = document.createElement('div');
    textWrapper.className = 'experience-text';

    const labelEl = document.createElement('div');
    labelEl.className = 'experience-label';
    labelEl.textContent = 'Experience';

    const valueEl = document.createElement('div');
    valueEl.className = 'experience-value';
    valueEl.textContent = slideData.experienceValue;

    textWrapper.appendChild(labelEl);
    textWrapper.appendChild(valueEl);

    experienceCard.appendChild(iconWrapper);
    experienceCard.appendChild(textWrapper);

    experienceContainer.appendChild(experienceCard);
    imageContainer.appendChild(experienceContainer);

    const contentContainer = document.createElement('div');
    contentContainer.className = 'team-carousel-card-content';

    if (slideData.heading) contentContainer.appendChild(slideData.heading);
    if (slideData.paragraphs[0]) contentContainer.appendChild(slideData.paragraphs[0]);
    if (slideData.subHeading) contentContainer.appendChild(slideData.subHeading);
    if (slideData.paragraphs[1]) contentContainer.appendChild(slideData.paragraphs[1]);

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
