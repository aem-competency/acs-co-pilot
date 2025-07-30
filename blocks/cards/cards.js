export default function decorate(block) {
  // Extract card data from the block
  const cardData = Array.from(block.querySelectorAll(':scope > div')).map((card) => ({
    cardImage: card.querySelector('picture source')?.srcset || card.querySelector('img')?.src || '',
    cardHeading: card.querySelector('p')?.textContent || '',
    cardDescription: card.querySelector('p:nth-of-type(2)')?.textContent || '',
    cardLink: card.querySelector('a')?.href || '#', // Retrieve link from block data
    cardText: card.querySelector('a')?.textContent || '', // Retrieve text from link
  }));

  // Create the main container
  const container = document.createElement('div');
  container.className = 'cards-container';

  // Create the main carousel wrapper
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'cards-carousel';

  // Create the cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'cards-cards';

  // Populate the cards
  cardData.forEach(({
    cardImage,
    cardHeading,
    cardDescription,
    cardLink,
    cardText,
  }) => {
    const card = document.createElement('div');
    card.className = 'cards-card';

    const image = document.createElement('img');
    image.src = cardImage;
    image.alt = cardText;
    image.className = 'card-image'; // Apply CSS class instead of inline styles
    image.style.cursor = 'pointer';
    image.addEventListener('click', () => {
      window.location.href = cardLink;
    });

    const heading = document.createElement('h3');
    heading.textContent = cardHeading;

    const description = document.createElement('p');
    description.textContent = cardDescription;

    card.appendChild(image);
    card.appendChild(heading);
    card.appendChild(description);
    cardsContainer.appendChild(card);
  });

  // Create previous button dynamically
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-prev';
  prevButton.setAttribute('aria-label', 'Previous');

  const prevImg = document.createElement('img');
  prevImg.src = '/icons/left-arrow.svg';
  prevImg.alt = 'Previous';
  prevImg.className = 'carousel-prev-icon'; // Apply CSS class
  prevButton.appendChild(prevImg);

  // Create next button dynamically
  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-next';
  nextButton.setAttribute('aria-label', 'Next');

  const nextImg = document.createElement('img');
  nextImg.src = '/icons/right-arrow.svg';
  nextImg.alt = 'Next';
  nextImg.className = 'carousel-next-icon'; // Apply CSS class
  nextButton.appendChild(nextImg);

  // Append elements to the carousel wrapper
  carouselWrapper.appendChild(prevButton);
  carouselWrapper.appendChild(cardsContainer);
  carouselWrapper.appendChild(nextButton);

  // Append carousel wrapper to the main container
  container.appendChild(carouselWrapper);

  // Set the final HTML structure inside the block
  block.innerHTML = '';
  block.appendChild(container);

  // Select all cards
  const cards = block.querySelectorAll('.cards-card');
  let currentIndex = 0;
  const totalCards = cards.length;

  /**
   * Updates the visibility of cards in the carousel
   */
  function updateCards() {
    cards.forEach((card) => {
      card.style.display = 'none';
    });

    for (let i = 0; i < 3; i += 1) {
      const index = (currentIndex + i) % totalCards;
      cards[index].style.display = 'block';
    }
  }

  /**
   * Moves the carousel to the previous set of cards
   */
  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCards();
    prevButton.blur(); // Remove focus after click
  });

  /**
   * Moves the carousel to the next set of cards
   */
  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalCards;
    updateCards();
    nextButton.blur(); // Remove focus after click
  });

  // Initialize carousel display
  updateCards();
}
