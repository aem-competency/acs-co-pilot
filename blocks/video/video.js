const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Helper function to create URL query parameters
function createEmbed(_url, params) {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
}

// Function to extract filename from a URL
function getFileName(url) {
  return url.pathname.split('/').pop() || 'Video';
}

// Function to generate YouTube embed HTML
function embedYoutube(url, autoplay, background) {
  const usp = new URLSearchParams(url.search);
  const vid = usp.get('v') || url.pathname.split('/')[1] || '';
  const fileName = getFileName(url);
  const suffixParams = background || autoplay ? {
    autoplay: autoplay ? '1' : '0',
    mute: background ? '1' : '0',
    controls: background ? '0' : '1',
    disablekb: background ? '1' : '0',
    loop: background ? '1' : '0',
    playsinline: background ? '1' : '0',
  } : {};
  return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com/embed/${vid}?rel=0&v=${vid}&${createEmbed(url, suffixParams)}"
      title="${fileName}"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope;"
      allowfullscreen loading="lazy"></iframe>
    </div>`;
}

// Function to generate Vimeo embed HTML
function embedVimeo(url, autoplay, background) {
  const video = url.pathname.split('/')[1];
  const fileName = getFileName(url);
  const suffixParams = background || autoplay ? {
    autoplay: autoplay ? '1' : '0',
    background: background ? '1' : '0',
  } : {};
  return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}?${createEmbed(url, suffixParams)}"
      title="${fileName}"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
    </div>`;
}

// Function to create and configure a video element for self-hosted videos
function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.src = source;
  video.type = `video/${source.split('.').pop()}`;
  video.controls = !background;
  video.title = getFileName(new URL(source));
  if (autoplay) video.autoplay = true;
  if (background) {
    video.loop = true;
    video.playsInline = true;
    video.muted = true;
    video.addEventListener('canplay', () => {
      if (autoplay) video.play();
    });
  }
  return video;
}

// Function to load the appropriate video embed type
function loadVideoEmbed(block, link, autoplay, background) {
  if (block.dataset.embedLoaded === 'true') return;
  const url = new URL(link);
  let embedHTML;
  // Determine video platform and create embed accordingly
  if (link.includes('youtube') || link.includes('youtu.be')) {
    embedHTML = embedYoutube(url, autoplay, background);
  } else if (link.includes('vimeo')) {
    embedHTML = embedVimeo(url, autoplay, background);
  } else {
    const videoEl = getVideoElement(link, autoplay, background);
    block.append(videoEl);
    videoEl.addEventListener('canplay', () => {
      block.dataset.embedLoaded = 'true';
    });
    return;
  }
  // Append the embed HTML to the block
  const embedWrapper = document.createElement('div');
  embedWrapper.innerHTML = embedHTML;
  block.append(embedWrapper);
  embedWrapper.querySelector('iframe').addEventListener('load', () => {
    block.dataset.embedLoaded = 'true';
  });
}

// Main function to decorate the video block
export default function decorate(block) {
  // Extract and remove the heading (if any)
  const heading = block.querySelector(':scope > div > div').firstElementChild;
  if (heading) heading.remove();
  // Extract the placeholder image and video link
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a')?.href;
  if (!link) return;
  // Clear block content and reset embed state
  block.textContent = '';
  block.dataset.embedLoaded = 'false';
  if (heading) block.append(heading);
  const autoplay = block.classList.contains('autoplay');
  // Handle video placeholder with play button
  if (placeholder) {
    block.classList.add('placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.append(placeholder);
    if (!autoplay) {
      wrapper.innerHTML += '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>';
      wrapper.addEventListener('click', () => {
        wrapper.remove();
        loadVideoEmbed(block, link, true, false);
      });
    }
    block.append(wrapper);
  }
  // Load video when block enters viewport
  if (!placeholder || autoplay) {
    new IntersectionObserver((entries, observer) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadVideoEmbed(block, link, autoplay && !prefersReducedMotion.matches, autoplay);
      }
    }).observe(block);
  }
}
