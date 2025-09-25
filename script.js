
const menuOpenButton =document.querySelector("#menu-open-button");

const menuCloseButton =document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click",()=>{
 //toggle mobile menu visibility
    document.body.classList.toggle("show-mobile-menu");
})


menuCloseButton.addEventListener("click",()=>menuOpenButton.click());

//Initialize Swiper
const swiper = new Swiper('.swiper', {
  loop: true,
  centeredSlides: true,     // center active slide
  slidesPerView: "auto",    // auto width, based on CSS
  spaceBetween: 30,         // gap between slides
  grabCursor:true,

  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },

  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

// lightbox functionality

// Lightbox functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('#lightbox .close');

document.querySelectorAll('.gallery-image').forEach(img => {
  img.addEventListener('click', () => {
    lightbox.style.display = 'flex';
    lightboxImg.src = img.src;
  });
});

closeBtn.addEventListener('click', () => {
  lightbox.style.display = 'none';
});

lightbox.addEventListener('click', (e) => {
  if (e.target !== lightboxImg) {
    lightbox.style.display = 'none';
  }
});




// =========================
// Authentication (Front-end only)
// =========================
(function () {
  // Elements
  const openLoginBtn = document.getElementById('open-login');
  const openSignupBtn = document.getElementById('open-signup');
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');
  const logoutBtn = document.getElementById('logout-btn');
  const userInfo = document.getElementById('user-info');
  const welcomeUser = document.getElementById('welcome-user');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToLogin = document.getElementById('switch-to-login');

  // Helper: read/write users from localStorage
  const USERS_KEY = 'coffee_users';
  const CURRENT_KEY = 'coffee_current_user';

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function setUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function setCurrentUser(user) {
    if (user) localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_KEY);
  }

  function getCurrentUser() {
    try {
      const val = localStorage.getItem(CURRENT_KEY);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }

  // Modal controls
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Attach close handlers for [data-close-modal]
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      closeModal(loginModal);
      closeModal(signupModal);
    });
  });

  // Open buttons
  openLoginBtn && openLoginBtn.addEventListener('click', () => openModal(loginModal));
  openSignupBtn && openSignupBtn.addEventListener('click', () => openModal(signupModal));

  // Switch links
  switchToSignup && switchToSignup.addEventListener('click', () => {
    closeModal(loginModal);
    openModal(signupModal);
  });
  switchToLogin && switchToLogin.addEventListener('click', () => {
    closeModal(signupModal);
    openModal(loginModal);
  });

  // UI state update
  function updateAuthUI() {
    const user = getCurrentUser();
    const loginItem = openLoginBtn?.closest('li');
    const signupItem = openSignupBtn?.closest('li');
    const logoutItem = document.getElementById('logout-item');
    if (user) {
      if (loginItem) loginItem.style.display = 'none';
      if (signupItem) signupItem.style.display = 'none';
      if (userInfo) userInfo.style.display = '';
      if (logoutItem) logoutItem.style.display = '';
      if (welcomeUser) welcomeUser.textContent = `Hi, ${user.name.split(' ')[0]}`;
    } else {
      if (loginItem) loginItem.style.display = '';
      if (signupItem) signupItem.style.display = '';
      if (userInfo) userInfo.style.display = 'none';
      const logoutItemEl = document.getElementById('logout-item');
      if (logoutItemEl) logoutItemEl.style.display = 'none';
      if (welcomeUser) welcomeUser.textContent = '';
    }
  }

  function goHome() {
    // Redirect/scroll to home section
    if (location.hash !== '#home') location.hash = '#home';
    const home = document.getElementById('home');
    if (home) home.scrollIntoView({ behavior: 'smooth' });
  }

  // Handle Signup
  signupForm && signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) return;
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      alert('An account with this email already exists. Please login.');
      closeModal(signupModal);
      openModal(loginModal);
      return;
    }
    const newUser = { name, email, password };
    users.push(newUser);
    setUsers(users);
    setCurrentUser({ name, email });
    updateAuthUI();
    closeModal(signupModal);
    goHome();
  });

  // Handle Login
  loginForm && loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      alert('Invalid email or password.');
      return;
    }
    setCurrentUser({ name: found.name, email: found.email });
    updateAuthUI();
    closeModal(loginModal);
    goHome();
  });

  // Logout
  logoutBtn && logoutBtn.addEventListener('click', () => {
    setCurrentUser(null);
    updateAuthUI();
    goHome();
  });

  // Init on page load
  updateAuthUI();
})();
