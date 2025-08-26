export default function decorate(block) {
  // Extract card data from the block
  const cardData = Array.from(block.querySelectorAll(':scope > div')).map((card) => {
    const titleElement = card.querySelector('h2');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    // Get all paragraph elements that contain strong tags (bullet points)
    const bulletPoints = Array.from(card.querySelectorAll('p')).map((p) => {
      const strongElement = p.querySelector('strong');
      return strongElement ? strongElement.textContent.trim() : p.textContent.trim();
    }).filter(text => text !== ''); // Remove empty strings
    
    return {
      title,
      bulletPoints
    };
  });

  // Create the main container
  const container = document.createElement('div');
  container.className = 'value-container';

  // Populate the cards
  cardData.forEach(({ title, bulletPoints }) => {
    if (title && bulletPoints.length > 0) {
      const card = document.createElement('div');
      card.className = 'value-card';

      // Create title
      const heading = document.createElement('h3');
      heading.textContent = title;
      card.appendChild(heading);

      // Create bullet points list
      const list = document.createElement('ul');
      bulletPoints.forEach((point) => {
        const listItem = document.createElement('li');
        listItem.textContent = point;
        list.appendChild(listItem);
      });
      card.appendChild(list);

      container.appendChild(card);
    }
  });

  // Set the final HTML structure inside the block
  block.innerHTML = '';
  block.appendChild(container);
}
