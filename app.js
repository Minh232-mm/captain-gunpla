(() => {
  'use strict';
  let products = Array.isArray(window.CAPTAIN_PRODUCTS) ? [...window.CAPTAIN_PRODUCTS] : [];
  const fallbackProducts = [...products];
  const catalogClient = window.supabase?.createClient(
    'https://cskfurtcvqomyvitcfua.supabase.co',
    'sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa'
  );
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const money = value => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('vi-VN').format(value) + '₫' : 'GIÁ LIÊN HỆ';
  const categoryNames = {gunpla:'GUNPLA / MODEL KIT',secondhand:'SECOND HAND',custom:'CUSTOM / PROJECT',tools:'TOOLS / EQUIPMENT',accessories:'ACCESSORY / DETAIL'};
  let category = 'all'; let search = ''; let activeProduct = null; let imageIndex = 0; let previousFocus = null;
  const grid = $('#productGrid');
  function imgPath(product,index=0){ return (product.images || [])[index] || 'assets/anhsanpham1.jpg'; }
  function render(){
    let items = products.filter(p => p.available !== false && (category === 'all' || p.category === category) && `${p.name} ${p.grade || ''} ${p.description || ''} ${categoryNames[p.category] || ''}`.toLocaleLowerCase('vi').includes(search));
    const sort = $('#sortSelect').value;
    if(sort === 'az') items.sort((a,b) => a.name.localeCompare(b.name,'vi'));
    if(sort === 'price-asc') items.sort((a,b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if(sort === 'price-desc') items.sort((a,b) => (b.price ?? -1) - (a.price ?? -1));
    grid.innerHTML = items.map((p,i) => `<article class="product-card"><button type="button" class="product-cover" data-product="${escapeHTML(p.id)}" aria-label="Xem chi tiết ${escapeHTML(p.name)}"><img src="${escapeHTML(imgPath(p))}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/anhsanpham1.jpg'"><span class="cover-index">CG / ${String(i+1).padStart(3,'0')}</span>${p.badge ? `<span class="badge-product">${escapeHTML(p.badge)}</span>` : ''}</button><div class="product-meta"><p class="product-grade">${escapeHTML(p.grade || categoryNames[p.category] || '')}</p><h3 class="product-name">${escapeHTML(p.name)}</h3><div class="product-price-row"><div class="product-price">${money(p.price)}${p.oldPrice ? `<small>${money(p.oldPrice)}</small>` : ''}</div><button type="button" class="view-btn" data-product="${escapeHTML(p.id)}" aria-label="Xem ${escapeHTML(p.name)}">↗︎</button></div></div></article>`).join('');
    $('#productCount').textContent = `${items.length} SẢN PHẨM`;
    $('#emptyState').hidden = items.length > 0;
  }
  grid.addEventListener('click',event => {const btn=event.target.closest('[data-product]'); if(btn)openProduct(btn.dataset.product);});
  $$('.category').forEach(btn => btn.addEventListener('click',()=>{category=btn.dataset.category;$$('.category').forEach(b=>b.classList.toggle('active',b===btn));render();}));
  $('#sortSelect').addEventListener('change',render);
  $('#searchToggle').addEventListener('click',()=>{const panel=$('#searchPanel');panel.hidden=!panel.hidden;if(!panel.hidden){panel.scrollIntoView({behavior:'smooth',block:'center'});$('#searchInput').focus();}else{search='';$('#searchInput').value='';render();}});
  $('#searchInput').addEventListener('input',event=>{search=event.target.value.trim().toLocaleLowerCase('vi');render();});
  $('#clearSearch').addEventListener('click',()=>{$('#searchInput').value='';search='';render();$('#searchInput').focus();});
  function renderModalImage(){if(!activeProduct)return;const images=activeProduct.images?.length ? activeProduct.images : ['assets/anhsanpham1.jpg'];$('#modalImage').src=images[imageIndex];$('#modalImage').alt=`${activeProduct.name} — ảnh ${imageIndex+1}`;$('#modalThumbs').innerHTML=images.map((path,i)=>`<button type="button" class="${i===imageIndex?'active':''}" data-image-index="${i}" aria-label="Xem ảnh ${i+1}" aria-pressed="${i===imageIndex}"><img src="${escapeHTML(path)}" alt=""></button>`).join('');$('#modalThumbs').querySelector('.active')?.scrollIntoView({block:'nearest',inline:'nearest'});}
  function moveImage(delta){if(!activeProduct)return;const length=activeProduct.images?.length || 1;imageIndex=(imageIndex+delta+length)%length;renderModalImage();}
  function openProduct(id){activeProduct=products.find(p=>p.id===id);if(!activeProduct)return;imageIndex=0;previousFocus=document.activeElement;$('#modalTitle').textContent=activeProduct.name;$('#modalGrade').textContent=activeProduct.grade||categoryNames[activeProduct.category]||'';$('#modalPrice').textContent=money(activeProduct.price);$('#modalDescription').textContent=activeProduct.description||'';$('#modalQty').value=1;renderModalImage();$('#productModal').classList.add('open');$('#productModal').setAttribute('aria-hidden','false');document.body.classList.add('modal-open');$('.modal-close').focus();}
  function closeProduct(){if(!$('#productModal').classList.contains('open'))return;$('#productModal').classList.remove('open');$('#productModal').setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');previousFocus?.focus();activeProduct=null;}
  $$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeProduct));
  $('#imagePrev').addEventListener('click',()=>moveImage(-1));$('#imageNext').addEventListener('click',()=>moveImage(1));$('#modalThumbs').addEventListener('click',e=>{const btn=e.target.closest('[data-image-index]');if(btn){imageIndex=Number(btn.dataset.imageIndex);renderModalImage();}});
  // Vuốt ngang ảnh chi tiết sản phẩm trên điện thoại.
  let photoTouchX = null;
  const photoPane = $('.modal-main-image');
  photoPane.addEventListener('touchstart', e => {photoTouchX = e.changedTouches[0]?.clientX ?? null;}, {passive:true});
  photoPane.addEventListener('touchend', e => {if(photoTouchX === null)return;const delta=(e.changedTouches[0]?.clientX ?? photoTouchX)-photoTouchX;photoTouchX=null;if(Math.abs(delta)>50)moveImage(delta<0?1:-1);}, {passive:true});
  const setQty = delta =>{$('#modalQty').value=Math.max(1,Math.min(99,(parseInt($('#modalQty').value,10)||1)+delta));};
  $('#qtyMinus').addEventListener('click',()=>setQty(-1));$('#qtyPlus').addEventListener('click',()=>setQty(1));
  document.addEventListener('keydown',e=>{if(!$('#productModal').classList.contains('open'))return;if(e.key==='Escape')closeProduct();if(e.key==='ArrowRight' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName))moveImage(1);if(e.key==='ArrowLeft' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName))moveImage(-1);if(e.key==='Tab'){const elements=$$('.modal-dialog button, .modal-dialog input').filter(el=>!el.disabled);const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  $('#modalOrder').addEventListener('click',()=>{if(!activeProduct)return;const qty=Math.max(1,Math.min(99,parseInt($('#modalQty').value,10)||1));$('#orderProduct').value=`${activeProduct.name} — số lượng: ${qty}`;closeProduct();$('#contact').scrollIntoView({behavior:'smooth'});$('#orderProduct').focus({preventScroll:true});});
  $('#menuBtn').addEventListener('click',()=>{const opened=$('#mainNav').classList.toggle('show');$('#menuBtn').setAttribute('aria-expanded',String(opened));});
  $$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{$('#mainNav').classList.remove('show');$('#menuBtn').setAttribute('aria-expanded','false');}));
  window.addEventListener('resize',()=>{if(window.innerWidth>980){$('#mainNav').classList.remove('show');$('#menuBtn').setAttribute('aria-expanded','false');}}, {passive:true});
  const gallery=$('#galleryTrack');
  const scrollGallery=direction=>gallery.scrollBy({left:direction*(gallery.querySelector('.gallery-item')?.getBoundingClientRect().width || 300)+direction*20,behavior:'smooth'});
  $('#galleryPrev').addEventListener('click',()=>scrollGallery(-1));$('#galleryNext').addEventListener('click',()=>scrollGallery(1));
  let isDown=false,startX=0,startScroll=0,dragged=false;
  gallery.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;isDown=true;dragged=false;startX=e.clientX;startScroll=gallery.scrollLeft;gallery.classList.add('dragging');});
  window.addEventListener('pointerup',()=>{isDown=false;gallery.classList.remove('dragging');});
  gallery.addEventListener('pointermove',e=>{if(!isDown)return;const delta=e.clientX-startX;if(Math.abs(delta)>7){dragged=true;gallery.scrollLeft=startScroll-delta;}});
  gallery.addEventListener('click',e=>{if(dragged){e.preventDefault();dragged=false;}},true);
  const back=$('#backTop');window.addEventListener('scroll',()=>back.classList.toggle('visible',window.scrollY>550),{passive:true});back.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.09});$$('[data-reveal]').forEach(el=>observer.observe(el));}else{$$('[data-reveal]').forEach(el=>el.classList.add('revealed'));}
  $('#contactForm').addEventListener('submit', async event=>{event.preventDefault();const data=new FormData(event.currentTarget);const message=`CAPTAIN GUNPLA — YÊU CẦU TƯ VẤN\nHọ tên: ${data.get('name')}\nSĐT/Zalo: ${data.get('phone')}\nSản phẩm/Dịch vụ: ${data.get('product')||'Chưa chọn'}\nChi tiết: ${data.get('message')||'Không có'}`;window.open('https://zalo.me/0395193831','_blank','noopener,noreferrer');let copied=false;try{await navigator.clipboard.writeText(message);copied=true;}catch(error){const copy=document.createElement('textarea');copy.value=message;copy.style.position='fixed';copy.style.left='-9999px';document.body.append(copy);copy.select();copied=document.execCommand('copy');copy.remove();}$('#formStatus').textContent=copied?'Đã sao chép nội dung. Zalo sẽ mở ở tab mới — hãy dán và gửi tin nhắn.':'Zalo sẽ mở ở tab mới. Hãy sao chép thông tin trong form để gửi thủ công.';});
  async function loadCatalogFromSupabase(){
    if(!catalogClient){ render(); return; }
    const {data,error}=await catalogClient.from('products')
      .select('id,name,category,grade,price,old_price,badge,images,description,available,stock')
      .eq('available',true).order('sort_order',{ascending:true});
    if(error){
      console.warn('CAPTAIN GUNPLA: Không tải được catalog Supabase, dùng dữ liệu products.js dự phòng.',error);
      products=fallbackProducts; render(); return;
    }
    products=(data||[]).map(p=>({...p,oldPrice:p.old_price}));
    render();
  }
  loadCatalogFromSupabase();
})();
