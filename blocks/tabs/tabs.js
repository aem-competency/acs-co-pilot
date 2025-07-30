export default async function decorate(block) {
  // Create containers
  const tabsWrapper = document.createElement('div');
  tabsWrapper.className = 'tabs-wrapper';
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs-container';
  const contentContainer = document.createElement('div');
  contentContainer.className = 'content-container';
  // Process tabs
  [...block.children].forEach((tab, index) => {
    // Create tab button
    const tabButton = document.createElement('button');
    tabButton.className = 'tab-button';
    tabButton.setAttribute('data-index', index);
    // Add icon
    const img = tab.querySelector('img');
    if (img) {
      const iconImage = document.createElement('img');
      iconImage.className = 'tab-media';
      iconImage.src = img.src;
      tabButton.appendChild(iconImage);
    }
    // Add title
    const titleElement = document.createElement('span');
    titleElement.className = 'tab-title';
    titleElement.textContent = tab.children[0]?.textContent || '';
    tabButton.appendChild(titleElement);
    // Create content section
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabContent.setAttribute('data-index', index);
    tabContent.style.display = 'none';
    // Add video if present
    const videoLink = tab.querySelector('a');
    if (videoLink) {
      const video = document.createElement('video');
      video.src = videoLink.href;
      video.controls = false;
      video.loop = true;
      video.className = 'tab-video';
      video.muted = true;
      // Video event listeners
      video.addEventListener('play', () => {
        video.classList.add('video-start-animation');
        // CTA link reference removed
      });
      video.addEventListener('pause', () => video.classList.remove('video-start-animation'));
      video.addEventListener('ended', () => video.classList.remove('video-start-animation'));
      tabContent.appendChild(video);
    }
    // CTA link creation removed as requested
    // Tab interaction
    tabButton.addEventListener('click', () => {
      // Update active state
      tabsContainer.querySelectorAll('.tab-button').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
      // Update content visibility
      contentContainer.querySelectorAll('.tab-content').forEach((content, i) => {
        const isActive = i === index;
        content.style.display = isActive ? 'block' : 'none';
        // Handle video
        const video = content.querySelector('video');
        if (video) {
          if (isActive) {
            video.play();
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
    });
    // Hover effects
    tabButton.addEventListener('mouseover', () => {
      if (!tabButton.classList.contains('active')) {
        tabButton.classList.add('hovered');
      }
    });
    tabButton.addEventListener('mouseout', () => {
      tabButton.classList.remove('hovered');
    });
    // Add to containers
    tabsContainer.appendChild(tabButton);
    contentContainer.appendChild(tabContent);
  });
  // Build final structure
  block.innerHTML = '';
  tabsWrapper.appendChild(tabsContainer);
  block.appendChild(tabsWrapper);
  block.appendChild(contentContainer);
  // Activate first tab
  const firstTabButton = tabsContainer.querySelector('.tab-button');
  if (firstTabButton) {
    firstTabButton.click();
  }
}
