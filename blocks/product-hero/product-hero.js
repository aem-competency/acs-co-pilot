// Function to create and configure a video element
function createVideoElement(videoSrc) {
  const videoElement = document.createElement('video');
  videoElement.src = videoSrc;
  videoElement.controls = false;
  videoElement.muted = true;
  videoElement.autoplay = true;
  videoElement.loop = true;
  videoElement.classList.add('video');
  return videoElement;
}

// Function to handle video embedding inside the given block
function handleVideoEmbedding(block) {
  const videoContainer = block.querySelector('.button-container');
  if (!videoContainer) return;

  const videoAnchor = videoContainer.querySelector(':scope > p > a');
  if (!videoAnchor || block.querySelector('picture')) return;

  const videoUrl = videoAnchor.getAttribute('href');
  if (!videoUrl) return;

  const videoElement = createVideoElement(videoUrl);

  videoContainer.innerHTML = '';
  videoContainer.appendChild(videoElement);
}

// Function to add a class to the subtitle paragraph
function styleSubtitleParagraph(block) {
  // Find all paragraphs in the block
  const paragraphs = block.querySelectorAll('p');
  // Loop through paragraphs to find the one with "Deliver more with less" text
  paragraphs.forEach((paragraph) => {
    if (paragraph.textContent.trim() === 'Deliver more with less') {
      // Add a class to the paragraph
      paragraph.classList.add('hero-subtitle');
      // Set inline styles with !important to override any other styles
      paragraph.style.cssText = 'font-size: 28px; font-weight: 500; margin-top: 10px; margin-bottom: 20px;';
    }
  });
}

// Function to add button container and button classes
function addButtonContainerAndClasses(block) {
  // Find all paragraphs in the block
  const paragraphs = block.querySelectorAll('p');

  paragraphs.forEach((paragraph) => {
    // Check if paragraph contains links with title attributes
    const links = paragraph.querySelectorAll('a[title]');

    if (links.length >= 2) {
      // Add button class to all links with title attributes
      links.forEach((link) => {
        link.classList.add('button');
      });

      // Create button container div
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');

      // Insert the button container before the paragraph
      paragraph.parentNode.insertBefore(buttonContainer, paragraph);

      // Move the paragraph inside the button container
      buttonContainer.appendChild(paragraph);
    }
  });
}

// Adds the hardcoded patent innovation badge for the centre variation only
function addPatentBadge(block) {
  if (!block.classList.contains('centre')) return;

  const badge = document.createElement('div');
  badge.classList.add('patent-badge');
  badge.innerHTML = `
    <div class="patent-badge-body">
      <span class="patent-badge-count">2</span>
      <div class="patent-badge-info">
        <div class="patent-badge-title-row">
          <span class="patent-badge-title">Patents</span>
          <span class="patent-badge-star">&#9733;</span>
        </div>
        <span class="patent-badge-desc">Approved for Filing</span>
      </div>
    </div>
  `;
  // Append inside the background container so the badge is bounded by the video
  const bgContainer = block.querySelector(':scope > div > div:first-of-type');
  if (bgContainer) {
    bgContainer.appendChild(badge);
  } else {
    block.appendChild(badge);
  }
}

// Main function to decorate the block by adding styling and embedding video
export default function decorate(block) {
  // Style the subtitle paragraph
  styleSubtitleParagraph(block);
  // Add button container and button classes
  addButtonContainerAndClasses(block);
  // Handle video embedding
  handleVideoEmbedding(block);
  // Patent badge (centre variation, home page only)
  addPatentBadge(block);
}
