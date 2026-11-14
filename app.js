
(() => {
  'use strict';

  // ==========================================
  // CAPTAIN GUNPLA - MAIN APP
  // ==========================================

  let products = Array.isArray(window.CAPTAIN_PRODUCTS)
    ? [...window.CAPTAIN_PRODUCTS]
    : [];

  const fallbackProducts = [...products];

 const catalogClient =
  window.CAPTAIN_SUPABASE_CLIENT ||
  window.supabase?.createClient(
    'https://cskfurtcvqomyvitcfua.supabase.co',
    'sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa'
  );

window.CAPTAIN_SUPABASE_CLIENT = catalogClient;

  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));

  const escapeHTML = value =>
    String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));

  const money = value =>
    typeof value === 'number' && Number.isFinite(value)
      ? new Intl.NumberFormat('vi-VN').format(value) + '₫'
      : 'GIÁ LIÊN HỆ';


  // ==========================================
  // GIỎ HÀNG - LƯU CỤC BỘ TRÊN THIẾT BỊ
  // ==========================================
  const CART_STORAGE_KEY = 'captainGunplaCartV1';
  let cartItems = [];

  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    cartItems = Array.isArray(savedCart) ? savedCart.filter(item =>
      item && typeof item.id === 'string' && Number.isInteger(item.qty) && item.qty > 0
    ) : [];
  } catch (_) { cartItems = []; }

  function saveCart() {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)); }
    catch (error) { console.warn('Không thể lưu giỏ hàng trên thiết bị.', error); }
    renderCart();
  }

  function cartQuantity() {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  }

  function renderCart() {
    const count = $('#cartCount');
    const list = $('#cartItems');
    if (!count || !list) return;

    count.textContent = cartQuantity();
    count.hidden = cartQuantity() === 0;

    if (!cartItems.length) {
      list.innerHTML = '<div class="cart-empty"><span>▣</span><strong>GIỎ HÀNG ĐANG TRỐNG</strong><p>Hãy chọn sản phẩm bạn yêu thích tại gian hàng.</p></div>';
    } else {
      list.innerHTML = cartItems.map(item => `
        <article class="cart-item" data-cart-id="${escapeHTML(item.id)}">
          <img src="${escapeHTML(item.image || 'assets/anhsanpham1.jpg')}" alt="${escapeHTML(item.name)}">
          <div class="cart-item-info">
            <strong>${escapeHTML(item.name)}</strong>
            <span>${item.price == null ? 'Liên hệ' : money(item.price)}</span>
            <div class="cart-item-controls">
              <button type="button" data-cart-action="decrease" aria-label="Giảm">−</button>
              <b>${item.qty}</b>
              <button type="button" data-cart-action="increase" aria-label="Tăng">+</button>
              <button type="button" data-cart-action="remove" class="cart-remove">XÓA</button>
            </div>
          </div>
        </article>`).join('');
    }

    const total = cartItems.reduce((sum, item) =>
      sum + (typeof item.price === 'number' ? item.price * item.qty : 0), 0);
    $('#cartTotal').textContent = money(total);
  }

  function addToCart(product, quantity) {
    if (!product) return;
    const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
    const existing = cartItems.find(item => item.id === String(product.id));
    const stock = Number(product.stock);
    const max = Number.isFinite(stock) && stock > 0 ? stock : 99;
    const nextQty = Math.min(max, (existing?.qty || 0) + qty);

    if (existing) {
      existing.qty = nextQty;
      existing.name = product.name;
      existing.price = typeof product.price === 'number' ? product.price : null;
      existing.image = imgPath(product);
    } else {
      cartItems.push({
        id: String(product.id), name: product.name,
        price: typeof product.price === 'number' ? product.price : null,
        image: imgPath(product), qty: Math.min(qty, max)
      });
    }
    saveCart();
    closeProduct();
    openCart();
  }

  function openCart() {
    $('#cartOverlay').classList.add('open');
    $('#cartOverlay').setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    $('#cartClose').focus();
  }

  function closeCart() {
    $('#cartOverlay').classList.remove('open');
    $('#cartOverlay').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
    $('#cartToggle').focus();
  }


  // ==========================================
  // CHECKOUT - TẠO ĐƠN HÀNG TRÊN SUPABASE
  // ==========================================
  const checkoutOverlay = $('#checkoutOverlay');
  const checkoutForm = $('#checkoutForm');
  const checkoutStatus = $('#checkoutStatus');
  const checkoutSuccess = $('#checkoutSuccess');
  const checkoutTotal = $('#checkoutTotal');
  const checkoutSubmit = checkoutForm?.querySelector('[type="submit"]');

  function openCheckout() {
    if (!cartItems.length) {
      alert('Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước.');
      return;
    }
    if (!catalogClient) {
      alert('Chưa kết nối được Supabase. Vui lòng tải lại trang và thử lại.');
      return;
    }
    const total = cartItems.reduce((sum, item) =>
      sum + (typeof item.price === 'number' ? item.price * item.qty : 0), 0);
    checkoutTotal.textContent = money(total);
    checkoutStatus.textContent = '';
    checkoutStatus.className = 'checkout-status';
    checkoutSuccess.hidden = true;
    checkoutSuccess.innerHTML = '';
    checkoutForm.hidden = false;
    checkoutOverlay.classList.add('open');
    checkoutOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    checkoutForm.querySelector('[name="customer_name"]')?.focus();
  }

  function closeCheckout() {
    checkoutOverlay.classList.remove('open');
    checkoutOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
    $('#cartCheckout')?.focus();
  }

  $('#cartCheckout')?.addEventListener('click', openCheckout);
  $('#checkoutClose')?.addEventListener('click', closeCheckout);
  $('#checkoutShade')?.addEventListener('click', closeCheckout);

  checkoutForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!cartItems.length || !catalogClient) return;

    const formData = new FormData(checkoutForm);
    const payload = {
      p_customer_name: String(formData.get('customer_name') || '').trim(),
      p_customer_phone: String(formData.get('customer_phone') || '').trim(),
      p_customer_address: String(formData.get('customer_address') || '').trim(),
      p_customer_note: String(formData.get('customer_note') || '').trim(),
      p_items: cartItems.map(item => ({
        product_id: String(item.id),
        quantity: item.qty
      }))
    };

    if (checkoutSubmit) {
      checkoutSubmit.disabled = true;
      checkoutSubmit.textContent = 'ĐANG GỬI ĐƠN...';
    }
    checkoutStatus.textContent = 'Đang kiểm tra sản phẩm và gửi đơn hàng...';
    checkoutStatus.className = 'checkout-status is-loading';

    try {
      const { data, error } = await catalogClient.rpc('create_captain_order', payload);
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      if (!result?.order_code) throw new Error('Supabase chưa trả về mã đơn hàng. Vui lòng kiểm tra mục Đơn hàng trong Admin.');

      cartItems = [];
      saveCart();
      checkoutForm.reset();
      checkoutForm.hidden = true;
      checkoutStatus.textContent = '';
      checkoutSuccess.hidden = false;
      checkoutSuccess.innerHTML = `
        <div class="checkout-success-icon">✓</div>
        <h3>ĐẶT HÀNG THÀNH CÔNG</h3>
        <p>Mã đơn hàng của bạn:</p>
        <strong class="checkout-order-code">${escapeHTML(result.order_code)}</strong>
        <p>CAPTAIN GUNPLA sẽ liên hệ để xác nhận đơn hàng.</p>
        <button type="button" class="btn btn-primary" id="checkoutDone">HOÀN TẤT</button>`;
      $('#checkoutDone')?.addEventListener('click', () => {
        closeCheckout();
        closeCart();
      });
    } catch (error) {
      console.error('[CAPTAIN GUNPLA] Checkout error:', error);
      checkoutStatus.textContent = error?.message || 'Không gửi được đơn hàng. Vui lòng thử lại.';
      checkoutStatus.className = 'checkout-status is-error';
    } finally {
      if (checkoutSubmit) {
        checkoutSubmit.disabled = false;
        checkoutSubmit.textContent = 'GỬI ĐƠN HÀNG';
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && checkoutOverlay?.classList.contains('open')) closeCheckout();
  });

  $('#cartToggle').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartShade').addEventListener('click', closeCart);
  $('#cartContinue').addEventListener('click', closeCart);
  $('#cartClear').addEventListener('click', () => { cartItems = []; saveCart(); });

  $('#cartItems').addEventListener('click', event => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    const row = button.closest('[data-cart-id]');
    const item = cartItems.find(entry => entry.id === row?.dataset.cartId);
    if (!item) return;
    const action = button.dataset.cartAction;
    if (action === 'increase') item.qty = Math.min(99, item.qty + 1);
    if (action === 'decrease') item.qty -= 1;
    if (action === 'remove' || item.qty <= 0) cartItems = cartItems.filter(entry => entry.id !== item.id);
    saveCart();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('#cartOverlay')?.classList.contains('open')) closeCart();
  });

  const categoryNames = {
    gunpla: 'GUNPLA / MODEL KIT',
    secondhand: 'SECOND HAND',
    custom: 'CUSTOM / PROJECT',
    tools: 'TOOLS / EQUIPMENT',
    accessories: 'ACCESSORY / DETAIL'
  };

  let category = 'all';
  let search = '';
  let activeProduct = null;
  let imageIndex = 0;
  let previousFocus = null;

  const grid = $('#productGrid');

  function imgPath(product, index = 0) {
    return (product.images || [])[index] || 'assets/anhsanpham1.jpg';
  }

  // ==========================================
  // SẢN PHẨM
  // ==========================================

  function render() {
    let items = products.filter(p =>
      p.available !== false &&
      (category === 'all' || p.category === category) &&
      `${p.name} ${p.grade || ''} ${p.description || ''} ${categoryNames[p.category] || ''}`
        .toLocaleLowerCase('vi')
        .includes(search)
    );

    const sort = $('#sortSelect').value;

    if (sort === 'az') {
      items.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    if (sort === 'price-asc') {
      items.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    }

    if (sort === 'price-desc') {
      items.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }

    grid.innerHTML = items.map((p, i) => `
      <article class="product-card">

        <button
          type="button"
          class="product-cover"
          data-product="${escapeHTML(p.id)}"
          aria-label="Xem chi tiết ${escapeHTML(p.name)}">

          <img
            src="${escapeHTML(imgPath(p))}"
            alt="${escapeHTML(p.name)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='assets/anhsanpham1.jpg'">

          <span class="cover-index">
            CG / ${String(i + 1).padStart(3, '0')}
          </span>

          ${p.badge ? `
            <span class="badge-product">
              ${escapeHTML(p.badge)}
            </span>
          ` : ''}

        </button>

        <div class="product-meta">

          <p class="product-grade">
            ${escapeHTML(p.grade || categoryNames[p.category] || '')}
          </p>

          <h3 class="product-name">
            ${escapeHTML(p.name)}
          </h3>

          <div class="product-price-row">

            <div class="product-price">
              ${money(p.price)}
              ${p.oldPrice ? `<small>${money(p.oldPrice)}</small>` : ''}
            </div>

            <button
              type="button"
              class="view-btn"
              data-product="${escapeHTML(p.id)}"
              aria-label="Xem ${escapeHTML(p.name)}">
              ↗︎
            </button>

          </div>
        </div>
      </article>
    `).join('');

    $('#productCount').textContent = `${items.length} SẢN PHẨM`;
    $('#emptyState').hidden = items.length > 0;
  }

  grid.addEventListener('click', event => {
    const btn = event.target.closest('[data-product]');
    if (btn) openProduct(btn.dataset.product);
  });

  $$('.category').forEach(btn => {
    btn.addEventListener('click', () => {
      category = btn.dataset.category;

      $$('.category').forEach(b =>
        b.classList.toggle('active', b === btn)
      );

      render();
    });
  });

  $('#sortSelect').addEventListener('change', render);

  $('#searchToggle').addEventListener('click', () => {
    const panel = $('#searchPanel');
    panel.hidden = !panel.hidden;

    if (!panel.hidden) {
      panel.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      $('#searchInput').focus();
    } else {
      search = '';
      $('#searchInput').value = '';
      render();
    }
  });

  $('#searchInput').addEventListener('input', event => {
    search = event.target.value.trim().toLocaleLowerCase('vi');
    render();
  });

  $('#clearSearch').addEventListener('click', () => {
    $('#searchInput').value = '';
    search = '';
    render();
    $('#searchInput').focus();
  });

  // ==========================================
  // POPUP CHI TIẾT SẢN PHẨM
  // ==========================================

  function renderModalImage() {
    if (!activeProduct) return;

    const images = activeProduct.images?.length
      ? activeProduct.images
      : ['assets/anhsanpham1.jpg'];

    $('#modalImage').src = images[imageIndex];
    $('#modalImage').alt = `${activeProduct.name} — ảnh ${imageIndex + 1}`;

    $('#modalThumbs').innerHTML = images.map((path, i) => `
      <button
        type="button"
        class="${i === imageIndex ? 'active' : ''}"
        data-image-index="${i}"
        aria-label="Xem ảnh ${i + 1}"
        aria-pressed="${i === imageIndex}">

        <img src="${escapeHTML(path)}" alt="">

      </button>
    `).join('');

    $('#modalThumbs')
      .querySelector('.active')
      ?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      });
  }

  function moveImage(delta) {
    if (!activeProduct) return;

    const length = activeProduct.images?.length || 1;

    imageIndex = (imageIndex + delta + length) % length;

    renderModalImage();
  }

  function openProduct(id) {
    activeProduct = products.find(p => p.id === id);

    if (!activeProduct) return;

    imageIndex = 0;
    previousFocus = document.activeElement;

    $('#modalTitle').textContent = activeProduct.name;

    $('#modalGrade').textContent =
      activeProduct.grade ||
      categoryNames[activeProduct.category] ||
      '';

    $('#modalPrice').textContent = money(activeProduct.price);

    $('#modalDescription').textContent =
      activeProduct.description || '';

    $('#modalQty').value = 1;

    renderModalImage();

    $('#productModal').classList.add('open');

    $('#productModal').setAttribute('aria-hidden', 'false');

    document.body.classList.add('modal-open');

    $('.modal-close').focus();
  }

  function closeProduct() {
    if (!$('#productModal').classList.contains('open')) return;

    $('#productModal').classList.remove('open');

    $('#productModal').setAttribute('aria-hidden', 'true');

    document.body.classList.remove('modal-open');

    previousFocus?.focus();

    activeProduct = null;
  }

  $$('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeProduct);
  });

  $('#imagePrev').addEventListener('click', () => moveImage(-1));
  $('#imageNext').addEventListener('click', () => moveImage(1));

  $('#modalThumbs').addEventListener('click', event => {
    const btn = event.target.closest('[data-image-index]');

    if (btn) {
      imageIndex = Number(btn.dataset.imageIndex);
      renderModalImage();
    }
  });

  // Vuốt ảnh trên điện thoại.

  let photoTouchX = null;

  const photoPane = $('.modal-main-image');

  photoPane.addEventListener('touchstart', e => {
    photoTouchX = e.changedTouches[0]?.clientX ?? null;
  }, { passive: true });

  photoPane.addEventListener('touchend', e => {
    if (photoTouchX === null) return;

    const delta =
      (e.changedTouches[0]?.clientX ?? photoTouchX) - photoTouchX;

    photoTouchX = null;

    if (Math.abs(delta) > 50) {
      moveImage(delta < 0 ? 1 : -1);
    }
  }, { passive: true });

  const setQty = delta => {
    $('#modalQty').value = Math.max(
      1,
      Math.min(
        99,
        (parseInt($('#modalQty').value, 10) || 1) + delta
      )
    );
  };

  $('#qtyMinus').addEventListener('click', () => setQty(-1));
  $('#qtyPlus').addEventListener('click', () => setQty(1));

  document.addEventListener('keydown', event => {
    if (!$('#productModal').classList.contains('open')) return;

    if (event.key === 'Escape') closeProduct();

    if (
      event.key === 'ArrowRight' &&
      !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
    ) {
      moveImage(1);
    }

    if (
      event.key === 'ArrowLeft' &&
      !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
    ) {
      moveImage(-1);
    }

    if (event.key === 'Tab') {
      const elements = $$('.modal-dialog button, .modal-dialog input')
        .filter(el => !el.disabled);

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  $('#modalOrder').addEventListener('click', () => {
    if (!activeProduct) return;
    const qty = Math.max(1, Math.min(99, parseInt($('#modalQty').value, 10) || 1));
    addToCart(activeProduct, qty);
  });

  // ==========================================
  // MENU MOBILE
  // ==========================================

  $('#menuBtn').addEventListener('click', () => {
    const opened = $('#mainNav').classList.toggle('show');

    $('#menuBtn').setAttribute('aria-expanded', String(opened));
  });

  $$('#mainNav a').forEach(a => {
    a.addEventListener('click', () => {
      $('#mainNav').classList.remove('show');

      $('#menuBtn').setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      $('#mainNav').classList.remove('show');

      $('#menuBtn').setAttribute('aria-expanded', 'false');
    }
  }, { passive: true });

  // ==========================================
  // GALLERY THÀNH PHẨM
  // ==========================================

  const gallery = $('#galleryTrack');

  const scrollGallery = direction => {
    gallery.scrollBy({
      left:
        direction *
        (gallery.querySelector('.gallery-item')?.getBoundingClientRect().width || 300) +
        direction * 20,
      behavior: 'smooth'
    });
  };

  $('#galleryPrev').addEventListener('click', () => scrollGallery(-1));
  $('#galleryNext').addEventListener('click', () => scrollGallery(1));

  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let dragged = false;

  gallery.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    isDown = true;
    dragged = false;
    startX = event.clientX;
    startScroll = gallery.scrollLeft;

    gallery.classList.add('dragging');
  });

  window.addEventListener('pointerup', () => {
    isDown = false;
    gallery.classList.remove('dragging');
  });

  gallery.addEventListener('pointermove', event => {
    if (!isDown) return;

    const delta = event.clientX - startX;

    if (Math.abs(delta) > 7) {
      dragged = true;
      gallery.scrollLeft = startScroll - delta;
    }
  });

  gallery.addEventListener('click', event => {
    if (dragged) {
      event.preventDefault();
      dragged = false;
    }
  }, true);

  // ==========================================
  // POPUP CHI TIẾT THÀNH PHẨM
  // ==========================================

  async function loadShowcaseFromSupabase() {
    if (!catalogClient || !gallery) return;

    try {
      const { data, error } = await catalogClient
        .from('showcase_projects')
        .select('id,title,subtitle,description,image_urls,sort_order,is_visible')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Giữ gallery mặc định nếu chưa có dữ liệu Supabase.
      if (!Array.isArray(data) || !data.length) return;

      const projects = data.filter(project =>
        Array.isArray(project.image_urls) &&
        project.image_urls.length > 0
      );

      if (!projects.length) return;

      // Tạo cửa sổ xem ảnh.
      const viewer = document.createElement('div');

      viewer.id = 'showcaseViewer';

      viewer.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10050;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.92);
      `;

      viewer.innerHTML = `
        <div class="showcase-box">

          <button class="showcase-close" type="button">×</button>

          <div class="showcase-photo">
            <button id="showcasePrev" type="button">←</button>
            <img id="showcaseMainImage" alt="">
            <button id="showcaseNext" type="button">→</button>
          </div>

          <div class="showcase-info">
            <h2 id="showcaseTitle"></h2>
            <p id="showcaseSubtitle"></p>
            <p id="showcaseDescription"></p>
            <div id="showcaseThumbs"></div>
            <small id="showcaseCounter"></small>
          </div>

        </div>
      `;

      const style = document.createElement('style');

      style.textContent = `
        #showcaseViewer .showcase-box {
          position:relative;
          width:min(100%,1050px);
          max-height:92vh;
          overflow:auto;
          display:grid;
          grid-template-columns:1.3fr .7fr;
          background:#17191e;
          border:1px solid #505158;
          border-radius:20px;
          color:#fff;
        }

        .showcase-close {
          position:absolute;
          z-index:5;
          right:12px;
          top:12px;
          width:42px;
          height:42px;
          border-radius:50%;
          border:1px solid #666;
          background:#111;
          color:white;
          font-size:26px;
          cursor:pointer;
        }

        .showcase-photo {
          min-width:0;
          padding:25px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          background:#0c0d10;
        }

        .showcase-photo img {
          max-width:85%;
          width:auto;
          height:auto;
          max-height:65vh;
          object-fit:contain;
        }

        .showcase-photo button {
          flex-shrink:0;
          width:38px;
          height:38px;
          border:1px solid #555;
          background:#222;
          color:white;
          cursor:pointer;
        }

        .showcase-info {
          align-self:center;
          padding:35px;
        }

        .showcase-info h2 {
          font-size:28px;
          margin-bottom:15px;
        }

        .showcase-info p {
          color:#b7bac2;
          line-height:1.7;
        }

        #showcaseThumbs {
          display:flex;
          flex-wrap:wrap;
          gap:9px;
          margin-top:20px;
        }

        #showcaseThumbs button {
          width:65px;
          height:65px;
          padding:3px;
          border:1px solid #555;
          background:#111;
          cursor:pointer;
        }

        #showcaseThumbs button.active {
          border:2px solid #ed1b2f;
        }

        #showcaseThumbs img {
          width:100%;
          height:100%;
          object-fit:cover;
        }

        #showcaseCounter {
          display:block;
          margin-top:15px;
          color:#aaa;
        }

        .gallery-card-button {
          width:100%;
          height:100%;
          padding:0;
          border:0;
          border-radius:inherit;
          overflow:hidden;
          background:transparent;
          color:inherit;
          text-align:left;
          cursor:pointer;
        }

        .gallery-card-button img {
          display:block;
          width:100%;
        }

        @media(max-width:720px) {
          #showcaseViewer {
            padding:8px;
          }

          #showcaseViewer .showcase-box {
            grid-template-columns:1fr;
            max-height:96vh;
            border-radius:14px;
          }

          .showcase-photo {
            padding:12px;
          }

          .showcase-photo img {
            max-height:43vh;
          }

          .showcase-info {
            padding:20px;
          }

          .showcase-info h2 {
            font-size:23px;
          }
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(viewer);

      let currentProject = null;
      let currentImage = 0;

      function showImage() {
        if (!currentProject) return;

        const images = currentProject.image_urls.slice(0, 5);

        $('#showcaseMainImage').src = images[currentImage];

        $('#showcaseMainImage').alt = currentProject.title;

        $('#showcaseThumbs').innerHTML = images.map((url, index) => `
          <button
            type="button"
            class="${index === currentImage ? 'active' : ''}"
            data-showcase-image="${index}">

            <img src="${escapeHTML(url)}" alt="Ảnh ${index + 1}">

          </button>
        `).join('');

        $('#showcaseCounter').textContent =
          `${currentImage + 1} / ${images.length}`;

        $('#showcasePrev').hidden = images.length < 2;
        $('#showcaseNext').hidden = images.length < 2;
      }

      function openProject(project) {
        currentProject = project;
        currentImage = 0;

        $('#showcaseTitle').textContent = project.title || '';
        $('#showcaseSubtitle').textContent = project.subtitle || '';
        $('#showcaseDescription').textContent = project.description || '';

        showImage();

        viewer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }

      function closeProject() {
        viewer.style.display = 'none';
        document.body.style.overflow = '';
        currentProject = null;
      }

      function moveImage(direction) {
        if (!currentProject) return;

        const length = Math.min(
          currentProject.image_urls.length,
          5
        );

        currentImage = (currentImage + direction + length) % length;

        showImage();
      }

      viewer.addEventListener('click', event => {
        if (
          event.target === viewer ||
          event.target.closest('.showcase-close')
        ) {
          closeProject();
          return;
        }

        const thumb = event.target.closest('[data-showcase-image]');

        if (thumb) {
          currentImage = Number(thumb.dataset.showcaseImage);
          showImage();
        }
      });

      $('#showcasePrev').addEventListener('click', () => moveImage(-1));
      $('#showcaseNext').addEventListener('click', () => moveImage(1));

      document.addEventListener('keydown', event => {
        if (viewer.style.display !== 'flex') return;

        if (event.key === 'Escape') closeProject();
        if (event.key === 'ArrowLeft') moveImage(-1);
        if (event.key === 'ArrowRight') moveImage(1);
      });

      // Mỗi thành phẩm chỉ hiển thị MỘT thẻ.
      // Các ảnh còn lại chỉ xuất hiện khi bấm vào thẻ.

      gallery.innerHTML = projects.map(project => {
        const cover = project.image_urls[0];

        return `
          <figure class="gallery-item">

            <button
              type="button"
              class="gallery-card-button"
              data-showcase-id="${escapeHTML(project.id)}"
              aria-label="Xem thành phẩm ${escapeHTML(project.title)}">

              <img
                src="${escapeHTML(cover)}"
                alt="${escapeHTML(project.title)}"
                loading="lazy">

              <figcaption>

                <span>
                  ${escapeHTML(project.subtitle || 'CAPTAIN GUNPLA')}
                </span>

                <b>${escapeHTML(project.title)}</b>

              </figcaption>

            </button>

          </figure>
        `;
      }).join('');

      gallery.addEventListener('click', event => {
        const button = event.target.closest('[data-showcase-id]');

        if (!button) return;

        const project = projects.find(
          item => String(item.id) === button.dataset.showcaseId
        );

        if (project) openProject(project);
      });

    } catch (error) {
      console.warn(
        'CAPTAIN GUNPLA: Không tải được thành phẩm Supabase.',
        error
      );
    }
  }

  // ==========================================
  // SUPABASE - TẢI SẢN PHẨM
  // ==========================================

  async function loadCatalogFromSupabase() {
    if (!catalogClient) {
      render();
      return;
    }

    const { data, error } = await catalogClient
      .from('products')
      .select('id,name,category,grade,price,old_price,badge,images,description,available,stock')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn(
        'CAPTAIN GUNPLA: Không tải được catalog Supabase, dùng dữ liệu products.js dự phòng.',
        error
      );

      products = fallbackProducts;
      render();
      return;
    }

    products = (data || []).map(p => ({
      ...p,
      oldPrice: p.old_price
    }));

    render();
    renderCart();
  }

  // ==========================================
  // LIÊN HỆ QUA ZALO
  // ==========================================

  $('#contactForm').addEventListener('submit', async event => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const message =
      `CAPTAIN GUNPLA — YÊU CẦU TƯ VẤN\n` +
      `Họ tên: ${data.get('name')}\n` +
      `SĐT/Zalo: ${data.get('phone')}\n` +
      `Sản phẩm/Dịch vụ: ${data.get('product') || 'Chưa chọn'}\n` +
      `Chi tiết: ${data.get('message') || 'Không có'}`;

    window.open(
      'https://zalo.me/0395193831',
      '_blank',
      'noopener,noreferrer'
    );

    let copied = false;

    try {
      await navigator.clipboard.writeText(message);
      copied = true;
    } catch (error) {
      const copy = document.createElement('textarea');

      copy.value = message;
      copy.style.position = 'fixed';
      copy.style.left = '-9999px';

      document.body.append(copy);

      copy.select();

      copied = document.execCommand('copy');

      copy.remove();
    }

    $('#formStatus').textContent = copied
      ? 'Đã sao chép nội dung. Zalo sẽ mở ở tab mới — hãy dán và gửi tin nhắn.'
      : 'Zalo sẽ mở ở tab mới. Hãy sao chép thông tin trong form để gửi thủ công.';
  });

  // ==========================================
  // NÚT VỀ ĐẦU TRANG
  // ==========================================

  const back = $('#backTop');

  window.addEventListener('scroll', () => {
    back.classList.toggle('visible', window.scrollY > 550);
  }, { passive: true });

  back.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ==========================================
  // HIỆU ỨNG HIỆN NỘI DUNG
  // ==========================================

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.09 }
    );

    $$('[data-reveal]').forEach(el => observer.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => {
      el.classList.add('revealed');
    });
  }

  // ==========================================
  // KHỞI ĐỘNG
  // ==========================================

  renderCart();
  loadCatalogFromSupabase();
  loadShowcaseFromSupabase();

})();
