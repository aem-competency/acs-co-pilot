export default function decorate(block) {
  const rows = Array.from(block.children);

  if (rows.length === 0) {
    return;
  }

  const imageWrapper = block.querySelector('picture');

  if (!imageWrapper) {
    return;
  }

  // Position mapping for hotspot dots at the end of underlined text
  const positionMap = {
    'Proposal Deck – Acrobat Studio': { top: '17.5%', left: '19%' },
    'Discovery Assessment – ACS Co-Pilot': { top: '29%', left: '21.5%' },
    'Migration Estimation – ACS Migration F/W': { top: '36%', left: '21.5%' },
    'Health Check – CodeReview.AI': { top: '41%', left: '18.5%' },
    'Spikes / PoC – ACS Co-Pilot': { top: '19.5%', left: '39.5%' },
    'BRD – ACS Co-Pilot, Microsoft Studio': { top: '23.5%', left: '42.5%' },
    'Backlog Gen – ACS Co-Pilot': { top: '27.5%', left: '39.5%' },
    'Story / AC – ACS Co-Pilot': { top: '31.5%', left: '37.5%' },
    'Code Gen – ACS Co-Pilot': { top: '20%', left: '58.5%' },
    'Optimization– ACS Co-Pilot': { top: '24%', left: '59.5%' },
    'Enhancements – ACS Co-Pilot': { top: '28%', left: '60.5%' },
    'Bug Fixes– ACS Co-Pilot': { top: '32%', left: '57.5%' },
    'Audit – CodeReview.AI': { top: '40%', left: '57%' },
    'UI – ACS Co-Pilot': { top: '64%', left: '44%' },
    'TDD – ACS Co-Pilot': { top: '67.5%', left: '45%' },
    'Design Review': { top: '72%', left: '49.75%' },
    'Test Cases – ACS Co-Pilot': { top: '56.5%', left: '68.5%' },
    'Test Scripts – ACS Co-Pilot': { top: '60.5%', left: '68.5%' },
    'Extraction – ACS Migration F/W, EC': { top: '27.5%', left: '83.5%' },
    'Analysis – ACS Migration F/W, EC': { top: '31.5%', left: '82.5%' },
    'Migration – ACS Migration F/W, EC': { top: '35.5%', left: '83%' },
    'Content Val – ACS Migration F/W, EC': { top: '39.5%', left: '83.5%' },
    'Monitor – Site Optimizer': { top: '27%', left: '98.5%' },
    'Monitor – LLM Optimizer': { top: '31%', left: '99%' },
    'Bug Fixing – ACS Co-Pilot': { top: '39%', left: '99%' },
  };

  const container = document.createElement('div');
  container.className = 'image-hotspot-container';

  const imageSection = document.createElement('div');
  imageSection.className = 'image-hotspot-image';
  imageSection.appendChild(imageWrapper.cloneNode(true));

  // Extract hotspot data from authoring
  const hotspots = [];
  rows.forEach((row) => {
    const links = row.querySelectorAll('a');
    links.forEach((link) => {
      hotspots.push({
        text: link.textContent.trim(),
        url: link.href,
      });
    });
  });

  // Create overlay hotspots on the image
  hotspots.forEach((hotspot) => {
    const position = positionMap[hotspot.text];

    if (position) {
      const overlay = document.createElement('a');
      overlay.className = 'image-hotspot-overlay';
      overlay.href = hotspot.url;
      overlay.target = '_blank';
      overlay.rel = 'noopener noreferrer';
      overlay.setAttribute('aria-label', hotspot.text);
      overlay.style.top = position.top;
      overlay.style.left = position.left;

      imageSection.appendChild(overlay);
    }
  });

  container.appendChild(imageSection);

  block.innerHTML = '';
  block.appendChild(container);
}
