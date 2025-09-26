// === Minimal Comments (frontend-only) ===
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const LS_COM = 'coffee_comments_min'; // { [id]: [{text,time}] }
  const read = () => { try{return JSON.parse(localStorage.getItem(LS_COM))||{};}catch{return{}} };
  const write = (v) => localStorage.setItem(LS_COM, JSON.stringify(v));
  const slug = (s)=> (s||'item').toLowerCase().replace(/[^a-z0-9]+/g,'-');

  // Minimal CSS once
  if (!document.getElementById('inline-comment-style')){
    const css = document.createElement('style');
    css.id = 'inline-comment-style';
    css.textContent = '.comment-min{margin-top:8px;margin-left:8px;padding:6px 10px;border-radius:8px;border:1px solid #eee;background:#fff;color:#242525} .comments-min{display:none;margin-top:8px;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:8px} .comments-min.open{display:block} .comments-min ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px} .comments-min li{background:#fff;border:1px solid #eee;border-radius:6px;padding:6px} .comments-min .row{display:flex;gap:6px;margin-top:6px} .comments-min input{flex:1;padding:6px 8px;border:1px solid #ccc;border-radius:6px} .comments-min button{padding:6px 10px;border-radius:6px;background:#3b141c;color:#fff}';
    document.head.appendChild(css);
  }

  const state = read();

  // Enhance each menu item
  $$('.menu-item').forEach(item=>{
    // Skip if already has one
    if (item.querySelector('.comment-min')) return;
    const name = item.querySelector('.menu-details .name')?.textContent?.trim()||'Item';
    const id = slug(name);

    // Button
    const btn = document.createElement('button');
    btn.className = 'comment-min';
    const cnt = (state[id]?.length||0);
    btn.innerHTML = '<i class="fa-regular fa-comment"></i> <span class="cmc">'+cnt+'</span>';

    // Box
    const box = document.createElement('div');
    box.className = 'comments-min';
    box.innerHTML = '<ul class="lst"></ul><div class="row"><input type="text" class="inp" placeholder="Write a comment..."/><button type="button" class="send">Post</button></div>';

    // Seed existing
    const lst = box.querySelector('.lst');
    (state[id]||[]).forEach(c=>{
      const li = document.createElement('li');
      li.innerHTML = '<strong>Guest</strong> <small>'+new Date(c.time||Date.now()).toLocaleString()+'</small><br>'+c.text;
      lst.appendChild(li);
    });

    // Events
    btn.addEventListener('click', ()=>{ box.classList.toggle('open'); });
    box.querySelector('.send').addEventListener('click', ()=>{
      const inp = box.querySelector('.inp');
      const text = inp.value.trim();
      if (!text) return;
      const st = read();
      st[id] = st[id]||[];
      const entry = { text, time: Date.now() };
      st[id].push(entry);
      write(st);
      const li = document.createElement('li');
      li.innerHTML = '<strong>Guest</strong> <small>'+new Date(entry.time).toLocaleString()+'</small><br>'+entry.text;
      lst.appendChild(li);
      inp.value = '';
      btn.querySelector('.cmc').textContent = String(st[id].length);
    });

    // Mount after any existing action buttons to keep grouping
    item.appendChild(btn);
    item.appendChild(box);
  });
})();

// === Mobile Menu Toggle ===
(() => {
  const menuOpenButton = document.querySelector('#menu-open-button');
  const menuCloseButton = document.querySelector('#menu-close-button');
  if (menuOpenButton) {
    menuOpenButton.addEventListener('click', () => {
      document.body.classList.toggle('show-mobile-menu');
    });
  }
  if (menuCloseButton && menuOpenButton) {
    menuCloseButton.addEventListener('click', () => menuOpenButton.click());
  }
})();

// === Initialize Swiper (if present) ===
(() => {
  if (typeof Swiper !== 'undefined' && document.querySelector('.swiper')) {
    new Swiper('.swiper', {
      loop: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      spaceBetween: 30,
      grabCursor: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    });
  }
})();

// === Lightbox functionality ===
(() => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('#lightbox .close');
  const images = document.querySelectorAll('.gallery-image');
  if (!lightbox || !lightboxImg || images.length === 0) return;

  images.forEach(img => {
    img.addEventListener('click', () => {
      lightbox.style.display = 'flex';
      lightboxImg.src = img.src;
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => { lightbox.style.display = 'none'; });
  }
  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) lightbox.style.display = 'none';
  });
})();

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

  // Storage keys
  const USERS_KEY = 'coffee_users';
  const CURRENT_KEY = 'coffee_current_user';

  // Helpers
  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  };
  const setUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const setCurrentUser = (user) => {
    if (user) localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_KEY);
  };
  const getCurrentUser = () => {
    try { const v = localStorage.getItem(CURRENT_KEY); return v ? JSON.parse(v) : null; }
    catch { return null; }
  };

  // Modal controls
  const openModal = (modal) => { if (modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); } };
  const closeModal = (modal) => { if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); } };

  // Close handlers (backdrops and close buttons)
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      closeModal(loginModal);
      closeModal(signupModal);
      const cartModal = document.getElementById('cart-modal');
      cartModal && closeModal(cartModal);
    });
  });

  // Open buttons
  openLoginBtn && openLoginBtn.addEventListener('click', () => openModal(loginModal));
  openSignupBtn && openSignupBtn.addEventListener('click', () => openModal(signupModal));

  // Switch links
  switchToSignup && switchToSignup.addEventListener('click', () => { closeModal(loginModal); openModal(signupModal); });
  switchToLogin && switchToLogin.addEventListener('click', () => { closeModal(signupModal); openModal(loginModal); });

  // Navbar state
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
    if (location.hash !== '#home') location.hash = '#home';
    const home = document.getElementById('home');
    if (home) home.scrollIntoView({ behavior: 'smooth' });
  }

  // Signup
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
    users.push({ name, email, password });
    setUsers(users);
    setCurrentUser({ name, email });
    updateAuthUI();
    closeModal(signupModal);
    goHome();
  });

  // Login
  loginForm && loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) { alert('Invalid email or password.'); return; }
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

  // Init
  updateAuthUI();
})();

// === Minimal Cart (frontend-only) with prices ===
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const LS_CART = 'coffee_cart_min';
  const read = () => { try{return JSON.parse(localStorage.getItem(LS_CART))||{};}catch{return{}} };
  const write = (v) => localStorage.setItem(LS_CART, JSON.stringify(v));

  // Per-item prices by slug
  const PRICE_MAP = {
    'hot-beverages': 3.50,
    'cold-beverages': 4.20,
    'refreshment': 3.80,
    'special-combos': 7.50,
    'dessert': 5.00,
    'burger-french-fries': 6.90,
  };

  // Slugify utility
  const slugify = (s) => (s || 'item')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Inject Cart button after Contact link (once)
  const contactLi = document.querySelector('.nav-menu a.nav-link[href="#contact"]')?.closest('li');
  if (contactLi && !document.getElementById('open-cart')){
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = '<button id="open-cart" class="nav-link auth-btn" aria-label="Open cart"><i class="fa-solid fa-cart-shopping"></i> <span id="cart-count" class="badge">0</span></button>';
    contactLi.after(li);
  }

  // Inject Cart modal (once)
  if (!document.getElementById('cart-modal')){
    const wrap = document.createElement('div');
    wrap.innerHTML = '<div class="modal" id="cart-modal" aria-hidden="true"><div class="modal-dialog"><div class="modal-header"><h3>Your Cart</h3><button class="modal-close" data-close-modal>&times;</button></div><div class="modal-body"><ul id="cart-items" class="cart-items"></ul><div class="cart-footer"><div class="cart-total">Total: $<span id="cart-total">0.00</span></div><div class="cart-actions"><button id="clear-cart" class="button contact-now" type="button">Clear</button><button id="continue-process" class="button order-now" type="button">Continue Process</button></div></div></div></div><div class="modal-backdrop" data-close-modal></div></div>';
    document.body.appendChild(wrap.firstElementChild);
  }

  // Add Add-to-Cart buttons under each menu item (with real prices)
  $$('.menu-item').forEach(item=>{
    if (item.querySelector('.add-cart')) return;
    const name = item.querySelector('.menu-details .name')?.textContent?.trim() || 'Coffee';
    const id = slugify(name);
    const price = PRICE_MAP[id] ?? 4.00;

    const btn = document.createElement('button');
    btn.className = 'add-cart';
    btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart - $' + price.toFixed(2);
    btn.addEventListener('click', ()=>{
      const cart = read();
      cart[id] = cart[id] || { name, qty: 0, price };
      cart[id].qty += 1;
      write(cart);
      updateBadge();
    });
    item.appendChild(btn);
  });

  function updateBadge(){
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const cart = read();
    const count = Object.values(cart).reduce((n, it)=>n+(it.qty||0),0);
    badge.textContent = String(count);
  }

  function renderCart(){
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if(!list||!totalEl) return;
    const cart = read();
    list.innerHTML = '';
    let total = 0;
    Object.entries(cart).forEach(([id,it])=>{
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = '<div class="info"><strong>'+it.name+'</strong><span>$'+(it.price||0).toFixed(2)+'</span></div>'+
                     '<div class="qty-controls" data-id="'+id+'">'+
                     '<button class="dec button contact-now" type="button">-</button>'+
                     '<span class="qty">'+it.qty+'</span>'+
                     '<button class="inc button order-now" type="button">+</button>'+
                     '<button class="remove auth-btn" type="button">Remove</button>'+
                     '</div>';
      list.appendChild(li);
      total += (it.price||0) * (it.qty||0);
    });
    totalEl.textContent = total.toFixed(2);
    updateBadge();
  }

  const openModal = (m)=>{ m.classList.add('open'); m.setAttribute('aria-hidden','false'); };
  const closeModal = (m)=>{ m.classList.remove('open'); m.setAttribute('aria-hidden','true'); };

  document.addEventListener('click', (e)=>{
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.id==='open-cart' || t.closest('#open-cart')){
      e.preventDefault();
      renderCart();
      const modal = document.getElementById('cart-modal');
      if (modal) openModal(modal);
    }
    if (t.matches('[data-close-modal]')){
      const modal = t.closest('.modal');
      if (modal) closeModal(modal);
    }
    const qc = t.closest('.qty-controls');
    if (qc){
      const id = qc.getAttribute('data-id');
      const cart = read();
      if (!cart[id]) return;
      if (t.classList.contains('inc')) cart[id].qty += 1;
      if (t.classList.contains('dec')) cart[id].qty = Math.max(1, cart[id].qty - 1);
      if (t.classList.contains('remove')) delete cart[id];
      write(cart);
      renderCart();
    }
    if (t.id==='clear-cart'){
      write({});
      renderCart();
    }
    if (t.id==='continue-process'){
      const cart = read();
      const evt = new CustomEvent('cart:checkout', { detail: { cart } });
      window.dispatchEvent(evt);
      const modal = document.getElementById('cart-modal');
      if (modal) closeModal(modal);
    }
  });

  // Minimal inline styling (badge + cart list)
  if (!document.getElementById('inline-cart-style')){
    const css = document.createElement('style');
    css.id = 'inline-cart-style';
    css.textContent = '.badge{display:inline-flex;min-width:18px;height:18px;font-size:12px;padding:0 6px;border-radius:999px;background:#f44336;color:#fff;margin-left:6px;align-items:center;justify-content:center;} .cart-items{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;} .cart-item{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #eee;border-radius:8px;padding:10px;background:#fff;} .qty-controls{display:flex;align-items:center;gap:8px;}';
    document.head.appendChild(css);
  }

  updateBadge();
})();

// === Order Flow: Use cart at checkout and submit order ===
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const LS_CART = 'coffee_cart_min';
  const LS_ORDERS = 'coffee_orders';
  const readCart = () => { try{return JSON.parse(localStorage.getItem(LS_CART))||{};}catch{return{}} };
  const writeCart = (v) => localStorage.setItem(LS_CART, JSON.stringify(v));
  const readOrders = () => { try{return JSON.parse(localStorage.getItem(LS_ORDERS))||[];}catch{return[]} };
  const writeOrders = (v) => localStorage.setItem(LS_ORDERS, JSON.stringify(v));

  function scrollToOrder(){
    if (location.hash !== '#order') location.hash = '#order';
    const el = document.getElementById('order');
    if (el) el.scrollIntoView({behavior:'smooth'});
  }

  function ensureSummaryUI(){
    const form = document.querySelector('.order-form');
    if (!form) return null;
    let summary = form.querySelector('.order-summary');
    if (!summary){
      summary = document.createElement('div');
      summary.className = 'order-summary';
      summary.style.margin = '10px 0';
      summary.innerHTML = '<h4>Order Summary</h4><ul class="order-summary-list"></ul><div class="order-summary-total">Total: $<span class="v">0.00</span></div>';
      const submitBtn = form.querySelector('button[type="submit"]') || form.lastElementChild;
      form.insertBefore(summary, submitBtn);
    }
    let hidden = form.querySelector('input[name="cart_json"]');
    if (!hidden){
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'cart_json';
      form.appendChild(hidden);
    }
    return { form, summary, hidden };
  }

  function renderSummary(cart){
    const ui = ensureSummaryUI();
    if (!ui) return;
    const list = ui.summary.querySelector('.order-summary-list');
    list.innerHTML = '';
    let total = 0;
    Object.values(cart).forEach(it => {
      const li = document.createElement('li');
      const price = Number(it.price||0);
      const qty = Number(it.qty||0);
      li.textContent = `${it.name} x ${qty} - $${(price*qty).toFixed(2)}`;
      list.appendChild(li);
      total += price * qty;
    });
    ui.summary.querySelector('.order-summary-total .v').textContent = total.toFixed(2);
    ui.hidden.value = JSON.stringify(cart);
  }

  window.addEventListener('cart:checkout', (e)=>{
    const cart = e.detail?.cart || readCart();
    renderSummary(cart);
    scrollToOrder();
  });

  const form = document.querySelector('.order-form');
  if (form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const cart = (()=>{ try{return JSON.parse(form.querySelector('input[name="cart_json"]').value)||{};}catch{return{}} })();
      const items = Object.values(cart);
      if (items.length === 0){
        alert('Your cart is empty. Please add items before submitting the order.');
        return;
      }
      const order = {
        name: form.querySelector('#customer-name')?.value?.trim()||'',
        email: form.querySelector('#customer-email')?.value?.trim()||'',
        phone: form.querySelector('#customer-phone')?.value?.trim()||'',
        itemSelected: form.querySelector('#order-item')?.value||'',
        quantitySelected: Number(form.querySelector('#quantity')?.value||1),
        orderType: form.querySelector('#order-type')?.value||'pickup',
        notes: form.querySelector('#notes')?.value||'',
        cart: items,
        total: items.reduce((s,it)=> s + (Number(it.price||0)*Number(it.qty||0)), 0),
        createdAt: new Date().toISOString()
      };
      const orders = readOrders();
      orders.push(order);
      writeOrders(orders);

      // Clear cart and update badge
      writeCart({});
      const badge = document.getElementById('cart-count');
      if (badge) badge.textContent = '0';

      // Confirmation
      alert('Thank you! Your order has been placed. A confirmation has been recorded locally.');
      form.reset();
      // Keep summary but set it to zero
      renderSummary({});
    });
  }
})();
