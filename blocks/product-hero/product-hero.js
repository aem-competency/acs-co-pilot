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
    // Check if paragraph contains both "Download" and "Full Demo" links
    const downloadLink = paragraph.querySelector('a[title="Download"]');
    const fullDemoLink = paragraph.querySelector('a[title="Full Demo"]');
    
    if (downloadLink && fullDemoLink) {
      // Add button class to both links
      downloadLink.classList.add('button');
      fullDemoLink.classList.add('button');
      
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

// Main function to decorate the block by adding styling and embedding video
export default function decorate(block) {
  // Style the subtitle paragraph
  styleSubtitleParagraph(block);
  // Add button container and button classes
  addButtonContainerAndClasses(block);
  // Handle video embedding
  handleVideoEmbedding(block);
}
