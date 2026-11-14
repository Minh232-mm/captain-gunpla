(() => {
'use strict';
const SUPABASE_URL = 'https://cskfurtcvqomyvitcfua.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => n == null ? 'Liên hệ' : new Intl.NumberFormat('vi-VN').format(n)+'₫';
let products = [], reviews = [], currentId = null, currentImages = [];
const loginPanel=$('#loginPanel'), dashboard=$('#dashboard'), loginStatus=$('#loginStatus');
const form=$('#editForm'), list=$('#productList'), saveState=$('#saveState');

function status(msg, bad=false){ saveState.textContent=msg; saveState.style.color=bad?'#ff7b86':'#8ce0ae'; }
function showLogin(msg=''){ loginPanel.hidden=false;dashboard.hidden=true;$('#adminIdentity').textContent='Chưa đăng nhập Admin';loginStatus.textContent=msg; }
async function isAdmin(user){
  if(!user) return false;
  const {data,error}=await db.rpc('is_captain_admin');
  return !error && data===true;
}
async function boot(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){showLogin();return;}
  const ok=await isAdmin(session.user);
  if(!ok){await db.auth.signOut();showLogin('Tài khoản này chưa được cấp quyền Admin.');return;}
  $('#adminIdentity').textContent='ADMIN: '+(session.user.email||'');
  $('#logoutBtn').hidden=false;loginPanel.hidden=true;dashboard.hidden=false;
  await loadProducts(); await loadReviews();
}
async function loadProducts(){
  status('Đang tải dữ liệu...');
  const {data,error}=await db.from('products').select('*').order('sort_order',{ascending:true}).order('name');
  if(error){status('Không tải được sản phẩm: '+error.message,true);return;}
  products=data||[]; drawList(); updateStats(); if(currentId) selectProduct(currentId); else if(products[0]) selectProduct(products[0].id); else clearForm();
  status('Đã đồng bộ với Supabase.');
}
function updateStats(){
  $('#statTotal').textContent=products.length;
  $('#statVisible').textContent=products.filter(p=>p.available).length;
  $('#statHidden').textContent=products.filter(p=>!p.available).length;
  $('#statReviews').textContent=reviews.length;
}
function drawList(){
  const q=$('#productSearch').value.trim().toLocaleLowerCase('vi');
  list.innerHTML='';
  products.filter(p=>`${p.name} ${p.id}`.toLocaleLowerCase('vi').includes(q)).forEach(p=>{
    const b=document.createElement('button');b.type='button';b.className='product-option'+(p.id===currentId?' active':'');
    b.innerHTML=`<span>${esc(p.name)}<small>${esc(p.category)} · Kho: ${p.stock??0}</small></span><strong>${money(p.price)}</strong>`;
    b.addEventListener('click',()=>selectProduct(p.id));list.append(b);
  });
}
function clearForm(){
  currentId=null;currentImages=[];form.reset();form.elements.stock.value=0;form.elements.sort_order.value=products.length+1;
  $('#editorTitle').textContent='THÊM SẢN PHẨM';$('#imagePreview').innerHTML='';$('#deleteProductBtn').disabled=true;drawList();
}
function selectProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;currentId=id;currentImages=[...(p.images||[])];
  for(const n of ['id','name','category','grade','badge','price','old_price','stock','sort_order','description']) form.elements[n].value=p[n]??'';
  form.elements.available.checked=!!p.available;
  $('#editorTitle').textContent='CHỈNH SỬA / '+p.name;$('#deleteProductBtn').disabled=false;
  drawList();renderImages();
}
function renderImages(){
  $('#imagePreview').innerHTML=currentImages.map((url,i)=>`<div class="image-tile"><img src="${esc(url)}" alt=""><button type="button" data-remove-image="${i}" aria-label="Xóa ảnh">×</button></div>`).join('');
}
async function uploadImages(files){
  for(const file of files){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Chỉ nhận JPG, PNG hoặc WEBP.');
    if(file.size>10*1024*1024) throw new Error('Mỗi ảnh tối đa 10MB.');
    const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    const path=`${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const {error}=await db.storage.from('product-images').upload(path,file,{upsert:false,contentType:file.type});
    if(error) throw error;
    const {data}=db.storage.from('product-images').getPublicUrl(path);
    currentImages.push(data.publicUrl);
  }
  renderImages();
}
$('#imageFiles').addEventListener('change',async e=>{
  try{status('Đang tải ảnh...');await uploadImages([...e.target.files]);status('Đã tải ảnh. Nhấn LƯU SẢN PHẨM để lưu.');}
  catch(err){status('Tải ảnh lỗi: '+err.message,true);}
  e.target.value='';
});
$('#imagePreview').addEventListener('click',e=>{
  const b=e.target.closest('[data-remove-image]');if(!b)return;
  currentImages.splice(Number(b.dataset.removeImage),1);renderImages();
});
form.addEventListener('submit',async e=>{
  e.preventDefault();
  const d=new FormData(form), id=String(d.get('id')||'').trim();
  if(!/^[a-zA-Z0-9_-]+$/.test(id)){status('Mã sản phẩm chỉ dùng chữ, số, _ hoặc -.',true);return;}
  if(products.some(p=>p.id===id&&p.id!==currentId)){status('Mã sản phẩm đã tồn tại.',true);return;}
  const row={id,name:String(d.get('name')).trim(),category:d.get('category'),grade:String(d.get('grade')||''),price:d.get('price')===''?null:Number(d.get('price')),old_price:d.get('old_price')===''?null:Number(d.get('old_price')),badge:String(d.get('badge')||''),images:currentImages,description:String(d.get('description')||''),available:form.elements.available.checked,stock:Math.max(0,Number(d.get('stock')||0)),sort_order:Number(d.get('sort_order')||0),updated_at:new Date().toISOString()};
  status('Đang lưu...');
  const {error}=await db.from('products').upsert(row,{onConflict:'id'});
  if(error){status('Không lưu được: '+error.message,true);return;}
  currentId=id;await loadProducts();selectProduct(id);status('Đã lưu sản phẩm lên website.');
});
$('#addBtn').addEventListener('click',clearForm);
$('#newProductBtn').addEventListener('click',clearForm);
$('#deleteProductBtn').addEventListener('click',async()=>{
  if(!currentId||!confirm('Xóa sản phẩm này khỏi cửa hàng?'))return;
  const {error}=await db.from('products').delete().eq('id',currentId);
  if(error){status('Không xóa được: '+error.message,true);return;}
  currentId=null;await loadProducts();status('Đã xóa sản phẩm.');
});
$('#productSearch').addEventListener('input',drawList);
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));
  $('#productsTab').hidden=b.dataset.tab!=='products';$('#reviewsTab').hidden=b.dataset.tab!=='reviews';
}));
async function loadReviews(){
  const {data,error}=await db.from('shop_reviews').select('user_id,display_name,rating,comment,created_at,image_urls').order('created_at',{ascending:false}).limit(100);
  if(error){$('#reviewAdminList').textContent='Không tải được đánh giá: '+error.message;return;}
  reviews=data||[];updateStats();
  $('#reviewAdminList').innerHTML=reviews.map((r,i)=>`<article class="review-admin-card"><div><strong>${esc(r.display_name)}</strong> · <span class="gold">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div><p>${esc(r.comment)}</p><div class="review-images">${(r.image_urls||[]).map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Ảnh đánh giá"></a>`).join('')}</div><small>${new Date(r.created_at).toLocaleString('vi-VN')}</small><button class="danger" type="button" data-delete-review="${i}">XÓA ĐÁNH GIÁ</button></article>`).join('')||'<p>Chưa có đánh giá.</p>';
}
async function deleteReviewImages(urls){
  const paths=(urls||[]).map(url=>{
    const marker='/storage/v1/object/public/review-images/';
    const i=url.indexOf(marker);return i>=0?decodeURIComponent(url.slice(i+marker.length)):null;
  }).filter(Boolean);
  if(paths.length) await db.storage.from('review-images').remove(paths);
}
$('#reviewAdminList').addEventListener('click',async e=>{
  const b=e.target.closest('[data-delete-review]');if(!b)return;
  const r=reviews[Number(b.dataset.deleteReview)];if(!r||!confirm('Xóa đánh giá này?'))return;
  const {error}=await db.from('shop_reviews').delete().eq('user_id',r.user_id);
  if(error){alert('Không xóa được đánh giá: '+error.message);return;}
  await deleteReviewImages(r.image_urls||[]);await loadReviews();
});
$('#refreshReviewsBtn').addEventListener('click',loadReviews);
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();const d=new FormData(e.currentTarget);
  const {error}=await db.auth.signInWithPassword({email:d.get('email'),password:d.get('password')});
  if(error){loginStatus.textContent='Đăng nhập thất bại: '+error.message;return;}
  await boot();
});
$('#logoutBtn').addEventListener('click',async()=>{await db.auth.signOut();showLogin('Đã đăng xuất.');$('#logoutBtn').hidden=true;});
db.auth.onAuthStateChange((_event,session)=>{if(!session)showLogin();});
boot();
})();
