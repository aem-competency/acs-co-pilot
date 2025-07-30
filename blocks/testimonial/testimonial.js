export default function decorate(block) {
  // Style the block wrapper
  block.style.display = 'flex';
  block.style.flexDirection = 'column';
  block.style.alignItems = 'center';
  block.style.width = '100%';
  block.style.margin = '0 auto';

  // Extract data from each row's 2nd column
  const testimonialsData = [...block.children].map((row) => {
    const col2 = row.querySelector(':scope > div:nth-child(2)');
    if (!col2) return null;

    // Try to extract author and designation from various elements
    const headings = col2.querySelectorAll('h1, h2, h3, h4, h5, strong, b');
    const paragraphs = [...col2.querySelectorAll('p')];
    // picture element for avatar
    const picture = row.querySelector('picture');

    // First try to get author from headings
    const testimonialAuthor = headings[0]?.textContent.trim() || '';

    // Try multiple approaches to find designation
    let testimonialDesignation = '';

    // Approach 1: Check if there's a second heading
    if (headings.length > 1) {
      testimonialDesignation = headings[1]?.textContent.trim() || '';
    }

    // Approach 2: If no designation found, look for a paragraph that might contain it
    if (!testimonialDesignation && paragraphs.length > 1) {
      // Check if any paragraph contains common designation indicators
      const match = paragraphs.find((p) => {
        const text = p.textContent.trim();
        return text !== testimonialAuthor
         && (text.includes('at ')
        || text.includes('from ')
        || text.includes(',')
        || text.length < 50);
      });

      if (match) {
        testimonialDesignation = match.textContent.trim();
      }
    }
    const smallText = col2.querySelector('small, em, i');
    if (!testimonialDesignation && smallText) {
      testimonialDesignation = smallText.textContent.trim();
    }
    const testimonialParagraphs = paragraphs.filter((p) => {
      const text = p.textContent.trim();
      return (
        text !== testimonialAuthor
    && text !== testimonialDesignation
    && text.length > 50
      );
    });

    const testimonialText = testimonialParagraphs.map((p) => p.innerHTML.trim()).join(' ');
    return {
      testimonialAuthor,
      testimonialDesignation,
      testimonialText,
      picture,
    };
  }).filter(Boolean);
  const createTestimonialHTML = (items) => items.map((test) => `
    <div class="testimonial-card">
      <div class="testimonial-content">
        <p class="quote">${test.testimonialText.replace(/&quot;/g, '')}</p>
        <div class="testimonial-author">
          ${test.picture?.outerHTML || ''}
          <div class="author-info">
            <p class="author-name">${test.testimonialAuthor}</p>
            <p class="author-role">${test.testimonialDesignation}</p>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  const containerDiv = document.createElement('div');
  containerDiv.className = 'testimonial-container';
  containerDiv.style.width = '100%';
  containerDiv.style.maxWidth = '1200px';
  containerDiv.style.margin = '0 auto';
  containerDiv.style.display = 'flex';
  containerDiv.style.justifyContent = 'center';

  containerDiv.innerHTML = `
    <div class="testimonial-wrapper">
      <div class="testimonial-scroll">
        <div class="testimonial-content-wrapper">
          ${createTestimonialHTML(testimonialsData)}
          ${createTestimonialHTML(testimonialsData)}
        </div>
      </div>
    </div>
  `;
  block.innerHTML = '';
  block.appendChild(containerDiv);

  const testimonialWrapper = document.querySelector('.testimonial-wrapper');
  testimonialWrapper.addEventListener('mouseenter', () => {
    document.querySelectorAll('.testimonial-content-wrapper').forEach((el) => {
      el.style.animationPlayState = 'paused';
    });
  });
  testimonialWrapper.addEventListener('mouseleave', () => {
    document.querySelectorAll('.testimonial-content-wrapper').forEach((el) => {
      el.style.animationPlayState = 'running';
    });
  });
}
