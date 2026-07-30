/**
 * Md Labib Al Dween Portfolio — Interactive Scroll Animation Engine & UI Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const FRAME_COUNT = 126;
  const IMAGE_DIR = 'image_sequence';
  
  // DOM Elements - Preloader & Canvas
  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas.getContext('2d');
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');

  // DOM Elements - Mobile Sidebar
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // DOM Elements - Projects
  const projectsContainer = document.getElementById('projects-container');

  // DOM Elements - Skills
  const skillsContainer = document.getElementById('skills-container');

  // State
  const images = [];
  let loadedImageCount = 0;
  let currentFrameIndex = 0;
  let animFrameId = null;

  // =========================================================
  // Canvas Animation Engine
  // =========================================================

  function padFrameNum(num) {
    return String(num).padStart(3, '0');
  }

  function preloadFrameImages() {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const frameName = `ezgif-frame-${padFrameNum(i)}.jpg`;
      img.src = `${IMAGE_DIR}/${frameName}`;

      img.onload = () => {
        loadedImageCount++;
        const progress = Math.floor((loadedImageCount / FRAME_COUNT) * 100);
        
        if (loaderBar) loaderBar.style.width = `${progress}%`;
        if (loaderText) loaderText.textContent = `Loading - Md Labib Al Dween ${progress}%`;

        if (loadedImageCount === FRAME_COUNT) {
          onAllImagesPreloaded();
        }
      };

      img.onerror = () => {
        console.warn(`Failed to load image frame: ${frameName}`);
        loadedImageCount++;
        const progress = Math.floor((loadedImageCount / FRAME_COUNT) * 100);
        if (loaderBar) loaderBar.style.width = `${progress}%`;
        if (loaderText) loaderText.textContent = `Loading - Md Labib Al Dween ${progress}%`;
        if (loadedImageCount === FRAME_COUNT) {
          onAllImagesPreloaded();
        }
      };

      images.push(img);
    }
  }

  function onAllImagesPreloaded() {
    setTimeout(() => {
      if (preloader) preloader.classList.add('fade-out');
      resizeCanvas();
      renderFrame(0);
      initScrollEngine();
    }, 400);
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(currentFrameIndex);
  }

  function renderFrame(index) {
    if (!ctx || !images[index] || !images[index].complete) return;

    const img = images[index];
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawHeight = canvasHeight;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  function initScrollEngine() {
    function updateFrameOnScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      
      const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
      const targetFrame = Math.min(
        FRAME_COUNT - 1,
        Math.floor(scrollFraction * FRAME_COUNT)
      );

      if (targetFrame !== currentFrameIndex) {
        currentFrameIndex = targetFrame;
        renderFrame(currentFrameIndex);
      }

      animFrameId = null;
    }

    window.addEventListener('scroll', () => {
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(updateFrameOnScroll);
      }
    }, { passive: true });

    window.addEventListener('resize', resizeCanvas);
  }

  // =========================================================
  // Dynamic Projects Content
  // =========================================================

  async function loadProjects() {
    if (!projectsContainer) return;
    
    try {
      const response = await fetch('projects.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const projects = await response.json();
      
      renderProjects(projects);
    } catch (error) {
      console.error("Could not load projects:", error);
      projectsContainer.innerHTML = `<p class="error-text">Failed to load projects. Please try again later.</p>`;
    }
  }

  function renderProjects(projects) {
    if (!projects || projects.length === 0) {
      projectsContainer.innerHTML = `<p>No projects found.</p>`;
      return;
    }

    const html = projects.map(proj => `
      <article class="project-card">
        <div class="project-card-top">
          <span class="project-cat">${proj.category || 'FULL STACK APP'}</span>
          <h3 class="project-title">${proj.name}</h3>
        </div>
        <p class="project-desc">${proj.description}</p>
        <div class="project-tags">
          ${(proj.tags || []).map(tag => `<span class="project-tag">${tag}</span>`).join('')}
        </div>
        <div class="project-actions">
          ${proj.githubLink && proj.githubLink !== '#' ? `
            <a href="${proj.githubLink}" target="_blank" rel="noopener" class="project-btn github-btn">
              <i class="fa-brands fa-github"></i> VIEW GITHUB CODE
            </a>` : ''}
          ${proj.liveLink && proj.liveLink !== '#' ? `
            <a href="${proj.liveLink}" target="_blank" rel="noopener" class="project-btn live-btn">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> LIVE DEMO
            </a>` : ''}
        </div>
      </article>
    `).join('');

    projectsContainer.innerHTML = html;
  }

  // =========================================================
  // Dynamic Skills Content
  // =========================================================

  async function loadSkills() {
    if (!skillsContainer) return;

    try {
      const response = await fetch('skills.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const skills = await response.json();
      renderSkills(skills);
    } catch (error) {
      console.error("Could not load skills:", error);
    }
  }

  function renderSkills(skills) {
    if (!skills || skills.length === 0) return;

    const html = skills.map(skill => `
      <div class="skill-card">
        <div class="skill-icon"><i class="${skill.icon}"></i></div>
        <h3 class="skill-title">${skill.title}</h3>
        <ul class="skill-list">
          ${skill.items.map(item => `
            <li><span>${item.label}:</span> ${item.text}</li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    skillsContainer.innerHTML = html;
  }

  // =========================================================
  // Mobile Sidebar Toggle
  // =========================================================

  function openSidebar() {
    if (sidebarMenu) sidebarMenu.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebarMenu) sidebarMenu.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  sidebarLinks.forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  // Initialization Calls
  preloadFrameImages();
  loadProjects();
  loadSkills();
});
