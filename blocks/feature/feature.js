export default async function decorate(block) {
  // Create containers for text, content, and media
  const textContainer = document.createElement('div');
  textContainer.className = 'text-container';

  const contentContainer = document.createElement('div');
  contentContainer.className = 'content-container';

  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'media-container';

  // Flags to check if content and media are present
  let hasMedia = false;
  let hasContent = false;

  function createVideoElement(videoSrc) {
    const videoElement = document.createElement('video');
    videoElement.src = videoSrc;
    videoElement.muted = true;
    videoElement.loop = true;
    videoElement.controls = false;
    videoElement.autoplay = true;
    videoElement.classList.add('video');
    return videoElement;
  }

  // Loop through each feature block child
  [...block.children].forEach((feature, index) => {
    // Create and set up the feature header
    const featureHeader = document.createElement('div');
    featureHeader.className = 'feature-header';
    featureHeader.innerHTML = feature.children[0]?.innerHTML || `Feature ${index + 1}`;
    featureHeader.setAttribute('data-index', index);

    // Create and set up the feature description
    const featureDescription = document.createElement('div');
    featureDescription.className = 'feature-description';
    featureDescription.setAttribute('data-index', index);
    featureDescription.style.display = 'none';

    // Create and set up the feature media
    const featureMedia = document.createElement('div');
    featureMedia.className = 'feature-media';
    const pic = feature.querySelector('picture');
    if (pic) {
      featureMedia.append(pic);
      hasMedia = true;
    }
    featureMedia.setAttribute('data-index', index);

    // Create and set up  video container
    const videoHref = feature.querySelector('a')?.getAttribute('href') || '';
    if (videoHref) {
      const videoContainer = document.createElement('div');
      videoContainer.classList.add('video-container');
      const videoElement = createVideoElement(videoHref);
      videoContainer.appendChild(videoElement);
      featureDescription.appendChild(videoContainer);
      hasContent = true;
    }

    // Append the feature header to the text container
    textContainer.appendChild(featureHeader);

    // Append media or content based on conditions
    if ((block.classList.contains('media-right') || block.classList.contains('media-left')) && pic) {
      mediaContainer.appendChild(featureMedia);
    } else if (videoHref) {
      contentContainer.appendChild(featureDescription);
    }
  });

  // Clear the original block content and append new containers
  block.innerHTML = '';
  block.appendChild(textContainer);
  if (hasContent) {
    block.appendChild(contentContainer);
  }
  if (hasMedia) {
    block.appendChild(mediaContainer);
  }

  // Set the first feature as active
  const firstFeatureHeader = textContainer.querySelector('.feature-header');
  const firstFeatureDescription = contentContainer.querySelector('.feature-description');
  const firstFeatureMedia = mediaContainer.querySelector('.feature-media');
  if (firstFeatureHeader && firstFeatureDescription) {
    firstFeatureHeader.classList.add('active');
    firstFeatureDescription.style.display = 'block';
  } else if (firstFeatureHeader && firstFeatureMedia) {
    firstFeatureHeader.classList.add('active');
    firstFeatureMedia.style.display = 'block';
  }
}
