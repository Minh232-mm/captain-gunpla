(() => {
'use strict';

const SUPABASE_URL = 'https://cskfurtcvqomyvitcfua.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa';

const $ = s => document.querySelector(s);
const identity = $('#adminIdentity');
const loginPanel = $('#loginPanel');
const dashboard = $('#dashboard');
const loginStatus = $('#loginStatus');
const form = $('#editForm');
const list = $('#productList');
const saveState = $('#saveState');

function showFatal(message) {
  identity.textContent = 'Không thể khởi tạo Admin';
  loginPanel.hidden = false;
  dashboard.hidden = true;
  loginStatus.textContent = message;
}

function withTimeout(promise, label, ms = 12000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(label + ' quá thời gian chờ ' + Math.round(ms / 1000) + ' giây.')), ms);
    })
  ]).finally(() => clearTimeout(timer));
}

// Không để trang bị kẹt mãi ở "Đang kiểm tra phiên đăng nhập".
if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  showFatal('Không tải được thư viện Supabase. Hãy kiểm tra kết nối mạng hoặc CDN rồi tải lại trang.');
  return;
}

let db;
try {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
  showFatal('Không khởi tạo được Supabase: ' + (error.message || error));
  return;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => n == null ? 'Liên hệ' : new Intl.NumberFormat('vi-VN').format(n) + '₫';

let products = [], reviews = [], currentId = null, currentImages = [];
let showcaseItems = [], currentShowcaseId = null, currentShowcaseImages = [];

function status(msg, bad = false) {
  if (!saveState) return;
  saveState.textContent = msg;
  saveState.style.color = bad ? '#ff7b86' : '#8ce0ae';
}

function showLogin(msg = '') {
  loginPanel.hidden = false;
  dashboard.hidden = true;
  identity.textContent = 'Chưa đăng nhập Admin';
  loginStatus.textContent = msg;
}

async function isAdmin(user) {
  if (!user) return false;
  const result = await withTimeout(
    db.rpc('is_captain_admin'),
    'Kiểm tra quyền Admin',
    12000
  );
  if (result.error) throw result.error;
  return result.data === true;
}

async function boot() {
  identity.textContent = 'Đang kiểm tra phiên đăng nhập...';
  try {
    const sessionResult = await withTimeout(
      db.auth.getSession(),
      'Đọc phiên đăng nhập Supabase',
      12000
    );
    if (sessionResult.error) throw sessionResult.error;

    const session = sessionResult.data?.session;
    if (!session) {
      showLogin('Vui lòng đăng nhập bằng tài khoản đã được cấp quyền Admin.');
      return;
    }

    identity.textContent = 'Đang xác minh quyền Admin...';
    let allowed;
    try {
      allowed = await isAdmin(session.user);
    } catch (error) {
      showLogin('Không xác minh được quyền Admin: ' + (error.message || error) +
        ' Hãy kiểm tra SQL migration, hàm is_captain_admin và kết nối Supabase.');
      return;
    }

    if (!allowed) {
      await db.auth.signOut();
      showLogin('Tài khoản này chưa được cấp quyền Admin. Kiểm tra email trong public.admin_users.');
      return;
    }

    identity.textContent = 'ADMIN: ' + (session.user.email || '');
    $('#logoutBtn').hidden = false;
    loginPanel.hidden = true;
    dashboard.hidden = false;

    await loadProducts();
    await loadReviews();
    await loadShowcase();
    await loadOrders();
  } catch (error) {
    console.error('[CAPTAIN ADMIN] Boot error:', error);
    showLogin('Không thể hoàn tất khởi tạo: ' + (error.message || error) +
      ' Hãy kiểm tra mạng và trạng thái Supabase rồi tải lại trang.');
  }
}

async function loadProducts() {
  status('Đang tải dữ liệu...');
  try {
    const result = await withTimeout(
      db.from('products').select('*').order('sort_order', {ascending:true}).order('name'),
      'Tải danh sách sản phẩm',
      15000
    );
    if (result.error) throw result.error;
    products = result.data || [];
    drawList();
    updateStats();
    if (currentId && products.some(p => p.id === currentId)) selectProduct(currentId);
    else if (products[0]) selectProduct(products[0].id);
    else clearForm();
    status('Đã đồng bộ với Supabase.');
  } catch (error) {
    console.error('[CAPTAIN ADMIN] Products error:', error);
    status('Không tải được sản phẩm: ' + (error.message || error), true);
  }
}

function updateStats() {
  $('#statTotal').textContent = products.length;
  $('#statVisible').textContent = products.filter(p => p.available).length;
  $('#statHidden').textContent = products.filter(p => !p.available).length;
  $('#statReviews').textContent = reviews.length;
}

function drawList() {
  const q = $('#productSearch').value.trim().toLocaleLowerCase('vi');
  list.innerHTML = '';
  products.filter(p => `${p.name} ${p.id}`.toLocaleLowerCase('vi').includes(q)).forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'product-option' + (p.id === currentId ? ' active' : '');
    b.innerHTML = `<span>${esc(p.name)}<small>${esc(p.category)} · Kho: ${p.stock ?? 0}</small></span><strong>${money(p.price)}</strong>`;
    b.addEventListener('click', () => selectProduct(p.id));
    list.append(b);
  });
}

function clearForm() {
  currentId = null;
  currentImages = [];
  form.reset();
  form.elements.stock.value = 0;
  form.elements.sort_order.value = products.length + 1;
  $('#editorTitle').textContent = 'THÊM SẢN PHẨM';
  $('#imagePreview').innerHTML = '';
  $('#deleteProductBtn').disabled = true;
  drawList();
}

function selectProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentId = id;
  currentImages = [...(p.images || [])];
  for (const n of ['id','name','category','grade','badge','price','old_price','stock','sort_order','description']) {
    form.elements[n].value = p[n] ?? '';
  }
  form.elements.available.checked = !!p.available;
  $('#editorTitle').textContent = 'CHỈNH SỬA / ' + p.name;
  $('#deleteProductBtn').disabled = false;
  drawList();
  renderImages();
}

function renderImages() {
  $('#imagePreview').innerHTML = currentImages.map((url, i) =>
    `<div class="image-tile"><img src="${esc(url)}" alt=""><button type="button" data-remove-image="${i}" aria-label="Xóa ảnh">×</button></div>`
  ).join('');
}

async function uploadImages(files) {
  for (const file of files) {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Chỉ nhận JPG, PNG hoặc WEBP.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Mỗi ảnh tối đa 10MB.');
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const {error} = await db.storage.from('product-images').upload(path, file, {upsert:false, contentType:file.type});
    if (error) throw error;
    const {data} = db.storage.from('product-images').getPublicUrl(path);
    currentImages.push(data.publicUrl);
  }
  renderImages();
}

$('#imageFiles').addEventListener('change', async e => {
  try {
    status('Đang tải ảnh...');
    await uploadImages([...e.target.files]);
    status('Đã tải ảnh. Nhấn LƯU SẢN PHẨM để lưu.');
  } catch (error) {
    status('Tải ảnh lỗi: ' + (error.message || error), true);
  }
  e.target.value = '';
});

$('#imagePreview').addEventListener('click', e => {
  const b = e.target.closest('[data-remove-image]');
  if (!b) return;
  currentImages.splice(Number(b.dataset.removeImage), 1);
  renderImages();
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const d = new FormData(form);
  const id = String(d.get('id') || '').trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return status('Mã sản phẩm chỉ dùng chữ, số, _ hoặc -.', true);
  if (products.some(p => p.id === id && p.id !== currentId)) return status('Mã sản phẩm đã tồn tại.', true);

  const row = {
    id, name:String(d.get('name')).trim(), category:d.get('category'),
    grade:String(d.get('grade') || ''),
    price:d.get('price') === '' ? null : Number(d.get('price')),
    old_price:d.get('old_price') === '' ? null : Number(d.get('old_price')),
    badge:String(d.get('badge') || ''), images:currentImages,
    description:String(d.get('description') || ''),
    available:form.elements.available.checked,
    stock:Math.max(0, Number(d.get('stock') || 0)),
    sort_order:Number(d.get('sort_order') || 0),
    updated_at:new Date().toISOString()
  };

  status('Đang lưu...');
  try {
    const {error} = await db.from('products').upsert(row, {onConflict:'id'});
    if (error) throw error;
    currentId = id;
    await loadProducts();
    selectProduct(id);
    status('Đã lưu sản phẩm lên website.');
  } catch (error) {
    status('Không lưu được: ' + (error.message || error), true);
  }
});

$('#addBtn').addEventListener('click', clearForm);
$('#newProductBtn').addEventListener('click', clearForm);

$('#deleteProductBtn').addEventListener('click', async () => {
  if (!currentId || !confirm('Xóa sản phẩm này khỏi cửa hàng?')) return;
  try {
    const {error} = await db.from('products').delete().eq('id', currentId);
    if (error) throw error;
    currentId = null;
    await loadProducts();
    status('Đã xóa sản phẩm.');
  } catch (error) {
    status('Không xóa được: ' + (error.message || error), true);
  }
});

$('#productSearch').addEventListener('input', drawList);


// ===== QUẢN LÝ THÀNH PHẨM =====
function showcaseStatus(message, bad = false) {
  const el = $('#showcaseSaveState');
  el.textContent = message;
  el.style.color = bad ? '#ff7b86' : '#8ce0ae';
}
function resetShowcaseForm() {
  currentShowcaseId = null;
  currentShowcaseImages = [];
  $('#showcaseForm').reset();
  $('#showcaseForm').elements.sort_order.value = showcaseItems.length + 1;
  $('#showcaseEditorTitle').textContent = 'THÊM THÀNH PHẨM';
  $('#showcaseImagePreview').innerHTML = '';
  $('#deleteShowcaseBtn').disabled = true;
  drawShowcaseList();
}
function drawShowcaseList() {
  const host = $('#showcaseList');
  host.innerHTML = '';
  showcaseItems.forEach(item => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'showcase-admin-option' + (item.id === currentShowcaseId ? ' active' : '');
    const cover = item.image_urls?.[0] || '';
    b.innerHTML = `${cover ? `<img src="${esc(cover)}" alt="">` : ''}<span><strong>${esc(item.title)}</strong><small>${item.is_visible ? 'Đang hiển thị' : 'Đang ẩn'} · ${(item.image_urls || []).length} ảnh</small></span>`;
    b.addEventListener('click', () => selectShowcase(item.id));
    host.append(b);
  });
  if (!showcaseItems.length) host.innerHTML = '<p class="muted">Chưa có thành phẩm nào.</p>';
}
function renderShowcaseImages() {
  $('#showcaseImagePreview').innerHTML = currentShowcaseImages.map((url, i) =>
    `<div class="showcase-preview-tile"><img src="${esc(url)}" alt="Ảnh thành phẩm ${i+1}"><button type="button" data-remove-showcase-image="${i}" aria-label="Xóa ảnh">×</button></div>`
  ).join('');
}
function selectShowcase(id) {
  const item = showcaseItems.find(x => x.id === id);
  if (!item) return;
  currentShowcaseId = id;
  currentShowcaseImages = [...(item.image_urls || [])];
  const f = $('#showcaseForm');
  f.elements.title.value = item.title || '';
  f.elements.subtitle.value = item.subtitle || '';
  f.elements.description.value = item.description || '';
  f.elements.sort_order.value = item.sort_order ?? 0;
  f.elements.is_visible.checked = !!item.is_visible;
  $('#showcaseEditorTitle').textContent = 'CHỈNH SỬA / ' + item.title;
  $('#deleteShowcaseBtn').disabled = false;
  drawShowcaseList();
  renderShowcaseImages();
}
async function loadShowcase() {
  try {
    const { data, error } = await withTimeout(
      db.from('showcase_projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      'Tải danh sách thành phẩm', 15000
    );
    if (error) throw error;
    showcaseItems = data || [];
    drawShowcaseList();
    if (currentShowcaseId && showcaseItems.some(x => x.id === currentShowcaseId)) selectShowcase(currentShowcaseId);
    else if (showcaseItems.length) selectShowcase(showcaseItems[0].id);
    else resetShowcaseForm();
    showcaseStatus('Đã đồng bộ thành phẩm với Supabase.');
  } catch (error) {
    console.error('[CAPTAIN ADMIN] Showcase error:', error);
    showcaseStatus('Không tải được thành phẩm: ' + (error.message || error) + '. Hãy kiểm tra SQL và quyền truy cập.', true);
  }
}
async function uploadShowcaseImages(files) {
  if (currentShowcaseImages.length + files.length > 5) throw new Error('Mỗi thành phẩm chỉ được tối đa 5 ảnh.');
  for (const file of files) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Chỉ nhận JPG, PNG hoặc WEBP.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Mỗi ảnh tối đa 10MB.');
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `showcase/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from('showcase-images').upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    const { data } = db.storage.from('showcase-images').getPublicUrl(path);
    currentShowcaseImages.push(data.publicUrl);
  }
  renderShowcaseImages();
}
$('#addShowcaseBtn').addEventListener('click', resetShowcaseForm);
$('#resetShowcaseBtn').addEventListener('click', resetShowcaseForm);
$('#showcaseFiles').addEventListener('change', async e => {
  try {
    showcaseStatus('Đang tải ảnh lên Supabase...');
    await uploadShowcaseImages([...e.target.files]);
    showcaseStatus('Đã tải ảnh. Nhấn LƯU THÀNH PHẨM để hoàn tất.');
  } catch (error) {
    showcaseStatus('Tải ảnh lỗi: ' + (error.message || error), true);
  }
  e.target.value = '';
});
$('#showcaseImagePreview').addEventListener('click', e => {
  const b = e.target.closest('[data-remove-showcase-image]');
  if (!b) return;
  currentShowcaseImages.splice(Number(b.dataset.removeShowcaseImage), 1);
  renderShowcaseImages();
});
$('#showcaseForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.currentTarget;
  const d = new FormData(f);
  if (!currentShowcaseImages.length) return showcaseStatus('Bạn cần tải lên ít nhất 1 ảnh.', true);
  const row = {
    title: String(d.get('title') || '').trim(),
    subtitle: String(d.get('subtitle') || '').trim(),
    description: String(d.get('description') || '').trim(),
    image_urls: currentShowcaseImages,
    sort_order: Number(d.get('sort_order') || 0),
    is_visible: f.elements.is_visible.checked,
    updated_at: new Date().toISOString()
  };
  if (!row.title) return showcaseStatus('Vui lòng nhập tên thành phẩm.', true);
  showcaseStatus('Đang lưu thành phẩm...');
  try {
    let query = db.from('showcase_projects');
    const result = currentShowcaseId
      ? await query.update(row).eq('id', currentShowcaseId)
      : await query.insert(row).select('id').single();
    if (result.error) throw result.error;
    if (!currentShowcaseId) currentShowcaseId = result.data.id;
    await loadShowcase();
    showcaseStatus('Đã lưu thành phẩm. Trang chủ sẽ cập nhật khi tải lại.');
  } catch (error) {
    console.error('[CAPTAIN ADMIN] Save showcase error:', error);
    showcaseStatus('Không lưu được thành phẩm: ' + (error.message || error), true);
  }
});
$('#deleteShowcaseBtn').addEventListener('click', async () => {
  if (!currentShowcaseId || !confirm('Xóa thành phẩm này khỏi website?')) return;
  try {
    const { error } = await db.from('showcase_projects').delete().eq('id', currentShowcaseId);
    if (error) throw error;
    currentShowcaseId = null;
    await loadShowcase();
    showcaseStatus('Đã xóa thành phẩm.');
  } catch (error) {
    showcaseStatus('Không xóa được: ' + (error.message || error), true);
  }
});

document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('active', x === b));
  $('#productsTab').hidden = b.dataset.tab !== 'products';
  $('#reviewsTab').hidden = b.dataset.tab !== 'reviews';
  $('#showcaseTab').hidden = b.dataset.tab !== 'showcase';
  $('#ordersTab').hidden = b.dataset.tab !== 'orders';
  if (b.dataset.tab === 'orders') loadOrders();
}));


const orderStatuses = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

async function loadOrders() {
  const host = $('#orderAdminList');
  if (!host) return;
  host.innerHTML = '<p>Đang tải đơn hàng...</p>';
  try {
    const {data, error} = await db.from('orders')
      .select('id,order_code,customer_name,customer_phone,customer_address,customer_note,status,subtotal,created_at,order_items(id,product_id,product_name,product_image,unit_price,quantity,line_total)')
      .order('created_at', {ascending:false}).limit(100);
    if (error) throw error;
    const rows = data || [];
    if (!rows.length) { host.innerHTML = '<p>Chưa có đơn hàng nào.</p>'; return; }
    host.innerHTML = rows.map(order => `
      <article class="order-admin-card" data-order-id="${esc(order.id)}">
        <div class="order-admin-head">
          <div><strong>${esc(order.order_code)}</strong><small>${new Date(order.created_at).toLocaleString('vi-VN')}</small></div>
          <strong>${money(Number(order.subtotal))}</strong>
        </div>
        <div class="order-admin-customer"><b>${esc(order.customer_name)}</b> · ${esc(order.customer_phone)}<br>${esc(order.customer_address)}</div>
        ${order.customer_note ? `<p class="muted">Ghi chú: ${esc(order.customer_note)}</p>` : ''}
        <div class="order-admin-items">${(order.order_items || []).map(item => `<div class="order-admin-item">${item.product_image ? `<img src="${esc(item.product_image)}" alt="">` : ''}<span>${esc(item.product_name)} × ${Number(item.quantity)}</span><b>${money(Number(item.line_total))}</b></div>`).join('')}</div>
        <label class="order-status-label">TRẠNG THÁI
          <select data-order-status>
            ${Object.entries(orderStatuses).map(([value,label]) => `<option value="${value}" ${order.status===value?'selected':''}>${label}</option>`).join('')}
          </select>
        </label>
        <span class="order-save-state" role="status"></span>
      </article>`).join('');
  } catch (error) {
    host.innerHTML = `<p class="error">Không tải được đơn hàng: ${esc(error.message || error)}</p>`;
  }
}

$('#orderAdminList')?.addEventListener('change', async event => {
  const select = event.target.closest('[data-order-status]');
  if (!select) return;
  const card = select.closest('[data-order-id]');
  const state = card.querySelector('.order-save-state');
  select.disabled = true;
  state.textContent = 'Đang cập nhật...';
  try {
    const {data, error} = await db.rpc('set_captain_order_status', {
      p_order_id: card.dataset.orderId,
      p_status: select.value
    });
    if (error) throw error;
    state.textContent = data?.message || 'Đã cập nhật trạng thái và đồng bộ tồn kho.';
    await loadOrders();
    await loadProducts();
  } catch (error) {
    state.textContent = 'Lỗi: ' + (error.message || error);
    await loadOrders();
  } finally { select.disabled = false; }
});
$('#refreshOrdersBtn')?.addEventListener('click', loadOrders);

async function loadReviews() {
  try {
    const {data,error} = await db.from('shop_reviews')
      .select('user_id,display_name,rating,comment,created_at,image_urls')
      .order('created_at', {ascending:false}).limit(100);
    if (error) throw error;
    reviews = data || [];
    updateStats();
    $('#reviewAdminList').innerHTML = reviews.map((r,i) =>
      `<article class="review-admin-card"><div><strong>${esc(r.display_name)}</strong> · <span class="gold">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div><p>${esc(r.comment)}</p><div class="review-images">${(r.image_urls || []).map(u => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Ảnh đánh giá"></a>`).join('')}</div><small>${new Date(r.created_at).toLocaleString('vi-VN')}</small><button class="danger" type="button" data-delete-review="${i}">XÓA ĐÁNH GIÁ</button></article>`
    ).join('') || '<p>Chưa có đánh giá.</p>';
  } catch (error) {
    console.error('[CAPTAIN ADMIN] Reviews error:', error);
    $('#reviewAdminList').textContent = 'Không tải được đánh giá: ' + (error.message || error);
  }
}

async function deleteReviewImages(urls) {
  const paths = (urls || []).map(url => {
    const marker = '/storage/v1/object/public/review-images/';
    const i = url.indexOf(marker);
    return i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null;
  }).filter(Boolean);
  if (paths.length) await db.storage.from('review-images').remove(paths);
}

$('#reviewAdminList').addEventListener('click', async e => {
  const b = e.target.closest('[data-delete-review]');
  if (!b) return;
  const r = reviews[Number(b.dataset.deleteReview)];
  if (!r || !confirm('Xóa đánh giá này?')) return;
  const {error} = await db.from('shop_reviews').delete().eq('user_id', r.user_id);
  if (error) { alert('Không xóa được đánh giá: ' + error.message); return; }
  await deleteReviewImages(r.image_urls || []);
  await loadReviews();
});

$('#refreshReviewsBtn').addEventListener('click', loadReviews);

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const d = new FormData(e.currentTarget);
  loginStatus.textContent = 'Đang đăng nhập...';
  try {
    const {error} = await withTimeout(
      db.auth.signInWithPassword({email:d.get('email'), password:d.get('password')}),
      'Đăng nhập Supabase',
      15000
    );
    if (error) throw error;
    await boot();
  } catch (error) {
    loginStatus.textContent = 'Đăng nhập thất bại: ' + (error.message || error);
  }
});

$('#logoutBtn').addEventListener('click', async () => {
  try {
    const {error} = await db.auth.signOut();
    if (error) throw error;
    showLogin('Đã đăng xuất.');
    $('#logoutBtn').hidden = true;
  } catch (error) {
    loginStatus.textContent = 'Đăng xuất thất bại: ' + (error.message || error);
  }
});

db.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session) showLogin();
});

boot();
})();
