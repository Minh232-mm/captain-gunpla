(() => {
  'use strict';
  const original = JSON.parse(JSON.stringify(window.CAPTAIN_PRODUCTS || []));
  const storageKey = 'captain-gunpla-editor-v3';
  let items;
  try {items = JSON.parse(localStorage.getItem(storageKey)) || original;}catch(e){items = original;}
  if(!Array.isArray(items))items=original;
  let current = items[0]?.id || null;
  const form = document.getElementById('editForm');
  const list = document.getElementById('productList');
  const status = document.getElementById('editorStatus');
  const save = () => localStorage.setItem(storageKey,JSON.stringify(items));
  const selected = () => items.find(p=>p.id===current);
  function drawList(){list.replaceChildren();items.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='product-option'+(p.id===current?' active':'');const name=document.createElement('span');name.textContent=p.name;const price=document.createElement('small');price.textContent=p.price == null?'Liên hệ':new Intl.NumberFormat('vi-VN').format(p.price)+'₫';b.append(name,price);b.addEventListener('click',()=>{current=p.id;load();});list.append(b);});}
  function load(){drawList();const p=selected();if(!p){form.reset();return;}for(const name of ['id','category','name','grade','badge','description'])form.elements[name].value=p[name]??'';for(const name of ['price','oldPrice'])form.elements[name].value=p[name] == null?'':p[name];form.elements.images.value=(p.images||[]).join('\n');form.elements.available.checked=p.available !== false;document.getElementById('editorTitle').textContent='CHỈNH SỬA / '+p.name;}
  function valueNumber(v){return v.trim()===''?null:Number(v);}
  form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const id=String(data.get('id')||'').trim();if(!id || items.some(p=>p.id===id&&p.id!==current)){status.textContent='Mã sản phẩm đã tồn tại!';return;}const p={id,name:String(data.get('name')||'').trim(),category:data.get('category'),grade:String(data.get('grade')||''),price:valueNumber(String(data.get('price')||'')),oldPrice:valueNumber(String(data.get('oldPrice')||'')),badge:String(data.get('badge')||''),images:String(data.get('images')||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean),description:String(data.get('description')||''),available:form.elements.available.checked};const index=items.findIndex(item=>item.id===current);if(index>=0)items[index]=p;else items.push(p);current=id;save();load();status.textContent='Đã lưu bản chỉnh sửa trên trình duyệt. Nhấn XUẤT FILE PRODUCTS.JS để cập nhật lên web.';});
  document.getElementById('addBtn').addEventListener('click',()=>{const id='product-'+Date.now().toString(36);items.push({id,name:'SẢN PHẨM MỚI',category:'gunpla',grade:'',price:null,oldPrice:null,badge:'NEW',images:['assets/anhsanpham1.jpg'],description:'',available:true});current=id;save();load();form.elements.name.focus();});
  document.getElementById('deleteBtn').addEventListener('click',()=>{if(!current||!confirm('Xóa sản phẩm này khỏi danh sách chỉnh sửa?'))return;items=items.filter(p=>p.id!==current);current=items[0]?.id||null;save();load();status.textContent='Đã xóa khỏi bản chỉnh sửa. Hãy xuất lại file products.js.';});
  document.getElementById('resetBtn').addEventListener('click',()=>{if(!confirm('Khôi phục toàn bộ dữ liệu từ products.js? Các chỉnh sửa chưa xuất sẽ mất.'))return;items=JSON.parse(JSON.stringify(original));current=items[0]?.id||null;save();load();status.textContent='Đã khôi phục dữ liệu gốc.';});
  document.getElementById('exportBtn').addEventListener('click',()=>{const content='/* CAPTAIN GUNPLA — Dữ liệu sản phẩm, tạo từ Product Editor. */\nwindow.CAPTAIN_PRODUCTS = '+JSON.stringify(items,null,2)+';\n';const blob=new Blob([content],{type:'text/javascript;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='products.js';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Đã xuất file products.js. Hãy thay file cũ trên hosting rồi tải lại trang để thấy thay đổi.';});
  load();
})();
