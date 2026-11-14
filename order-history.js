(() => {
  'use strict';
  const SUPABASE_URL = 'https://cskfurtcvqomyvitcfua.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa';
  const client =   window.CAPTAIN_SUPABASE_CLIENT ||   window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);  window.CAPTAIN_SUPABASE_CLIENT = client;
  const $ = s => document.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + '₫';

  const style = document.createElement('style');
  style.textContent = `
    .order-history-trigger{border:1px solid var(--red,#d10a1c);background:transparent;color:#fff;padding:10px 12px;border-radius:9px;font:700 11px var(--tech,Arial);cursor:pointer;white-space:nowrap}
    .order-history-trigger:hover{background:var(--red,#d10a1c)}
    #cgOrderHistory{position:fixed;inset:0;z-index:12000;display:none;align-items:center;justify-content:center;padding:16px;background:#000c}
    #cgOrderHistory.open{display:flex}
    .cg-oh-panel{width:min(720px,100%);max-height:90vh;overflow:auto;background:#11141b;border:1px solid #393d48;border-radius:18px;padding:22px;color:#f4f5f7;box-shadow:0 24px 80px #0009}
    .cg-oh-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}
    .cg-oh-head h2{   font-family: "Be Vietnam Pro", Arial, sans-serif;   font-size: 25px;   font-weight: 800;   line-height: 1.3;   letter-spacing: 0;   margin: 4px 0; }
    .cg-oh-close{width:38px;height:38px;border:1px solid #454955;border-radius:10px;background:#1c2029;color:white;font-size:24px;cursor:pointer}
    .cg-oh-form{display:flex;gap:9px;margin:14px 0}
    .cg-oh-form input{flex:1;min-width:0;background:#090b10;border:1px solid #3d424e;border-radius:9px;padding:13px;color:#fff}
    .cg-oh-form button{border:0;border-radius:9px;background:#d10a1c;color:#fff;font-weight:800;padding:0 16px;cursor:pointer}
    .cg-oh-note{font-size:12px;line-height:1.6;color:#aeb4c0}
    .cg-oh-result{border:1px solid #343945;border-radius:12px;padding:14px;margin-top:12px;background:#171b24}
    .cg-oh-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .cg-oh-items{font-size:13px;color:#c7ccd5;line-height:1.7;margin:10px 0}
    .cg-oh-status{display:inline-block;border-radius:99px;padding:5px 9px;background:#292f3b;color:#fff;font-size:11px;font-weight:800}
    .cg-oh-status.confirmed,.cg-oh-status.completed{background:#173b2b;color:#9ce5b8}
    .cg-oh-status.cancelled{background:#482027;color:#ffadb5}
    .cg-oh-error{color:#ff929c;font-size:13px}
    .cg-oh-empty{padding:18px;text-align:center;color:#aeb4c0;border:1px dashed #454955;border-radius:12px}
    .cg-oh-account-link{width:100%;border:0;background:transparent;color:#fff;text-align:left;padding:8px 0;cursor:pointer;font:700 12px var(--tech,Arial)}
    @media(max-width:600px){.cg-oh-panel{padding:16px;border-radius:14px}.cg-oh-form{flex-direction:column}.cg-oh-form button{min-height:44px}.order-history-trigger{font-size:10px;padding:9px 8px}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'cgOrderHistory';
  overlay.innerHTML = `
    <section class="cg-oh-panel" role="dialog" aria-modal="true" aria-labelledby="cgOhTitle">
      <div class="cg-oh-head"><div><p class="eyebrow">CAPTAIN GUNPLA / ORDER TRACKING</p><h2 id="cgOhTitle">ĐƠN HÀNG CỦA BẠN</h2></div><button class="cg-oh-close" type="button" aria-label="Đóng">×</button></div>
      <p class="cg-oh-note" id="cgOhIntro">Nhập số điện thoại đã dùng khi đặt hàng để tra cứu. Không cần đăng nhập, OTP hoặc nhớ mã đơn.</p>
      <form class="cg-oh-form" id="cgOhLookup"><input id="cgOhPhone" type="tel" inputmode="tel" autocomplete="tel" minlength="8" maxlength="30" placeholder="Số điện thoại đặt hàng" required><button type="submit" id="cgOhSubmit">TRA CỨU</button></form>
      <div id="cgOhMessage" role="status" aria-live="polite"></div><div id="cgOhResults"></div>
    </section>`;
  document.body.appendChild(overlay);

  const actions = $('.head-actions');
  if (actions) {
    const trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'order-history-trigger';
    trigger.textContent = 'TRA CỨU ĐƠN'; trigger.id = 'cgOrderHistoryTrigger';
    const cart = $('#cartToggle');
    if (cart) cart.insertAdjacentElement('afterend', trigger); else actions.prepend(trigger);
    trigger.addEventListener('click', openLookup);
  }

  const userMenu = $('#headerUserMenu');
  if (userMenu) {
    const accountLink = document.createElement('button');
    accountLink.type = 'button'; accountLink.className = 'cg-oh-account-link';
    accountLink.textContent = 'ĐƠN HÀNG CỦA TÔI';
    accountLink.addEventListener('click', openMyOrders);
    const signOut = $('#headerSignOut');
    if (signOut) userMenu.insertBefore(accountLink, signOut); else userMenu.append(accountLink);
  }

  function openLookup() {
    $('#cgOhIntro').textContent = 'Nhập số điện thoại đã dùng khi đặt hàng để tra cứu. Không cần đăng nhập, OTP hoặc nhớ mã đơn.';
    $('#cgOhLookup').hidden = false; $('#cgOhPhone').value = '';
    $('#cgOhResults').innerHTML = ''; $('#cgOhMessage').textContent = '';
    overlay.classList.add('open'); $('#cgOhPhone').focus();
  }

  async function openMyOrders() {
    if (userMenu) userMenu.hidden = true;
    $('#cgOhIntro').textContent = 'Các đơn hàng được đặt khi bạn đăng nhập vào tài khoản này.';
    $('#cgOhLookup').hidden = true; $('#cgOhResults').innerHTML = '';
    $('#cgOhMessage').textContent = 'Đang tải đơn hàng...'; overlay.classList.add('open');
    try {
      const {data,error} = await client.rpc('get_my_captain_orders');
      if (error) throw error;
      renderOrders(data || []); $('#cgOhMessage').textContent = '';
    } catch(error) {
      $('#cgOhMessage').innerHTML = `<p class="cg-oh-error">Không tải được đơn hàng: ${esc(error.message || error)}</p>`;
    }
  }

  function renderOrders(orders) {
    const host = $('#cgOhResults');
    if (!orders.length) { host.innerHTML = '<div class="cg-oh-empty">Chưa tìm thấy đơn hàng phù hợp.</div>'; return; }
    host.innerHTML = orders.map(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      return `<article class="cg-oh-result"><div class="cg-oh-row"><strong>${esc(order.order_code)}</strong><span class="cg-oh-status ${esc(order.status)}">${esc(order.status_label || order.status)}</span></div>
      <p class="cg-oh-note">${new Date(order.created_at).toLocaleString('vi-VN')}</p>
      <div class="cg-oh-items">${items.map(item => `${esc(item.product_name)} × ${Number(item.quantity)}`).join('<br>')}</div>
      <div class="cg-oh-row"><span class="cg-oh-note">Tổng đơn hàng</span><strong>${money(order.subtotal)}</strong></div></article>`;
    }).join('');
  }

  $('#cgOhLookup').addEventListener('submit', async event => {
    event.preventDefault();
    const phone = $('#cgOhPhone').value.trim(), button = $('#cgOhSubmit');
    button.disabled = true; button.textContent = 'ĐANG TRA CỨU...';
    $('#cgOhMessage').textContent = ''; $('#cgOhResults').innerHTML = '';
    try {
      const {data,error} = await client.rpc('lookup_captain_orders_by_phone', {p_phone:phone});
      if (error) throw error;
      renderOrders(data || []);
      if (!data?.length) $('#cgOhMessage').textContent = 'Không tìm thấy đơn hàng với số điện thoại này.';
    } catch(error) {
      $('#cgOhMessage').innerHTML = `<p class="cg-oh-error">Tra cứu thất bại: ${esc(error.message || error)}</p>`;
    } finally { button.disabled = false; button.textContent = 'TRA CỨU'; }
  });

  function close(){overlay.classList.remove('open');}
  overlay.querySelector('.cg-oh-close').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))close();});
})();
