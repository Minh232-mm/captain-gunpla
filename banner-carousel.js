(() => {
  'use strict';

  const SUPABASE_URL = 'https://cskfurtcvqomyvitcfua.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6vkQOLH_JEQq_oPhz9aN8Q_6qLj8RYa';

  const root = document.getElementById('homeBanner');
  if (!root || !window.supabase?.createClient) return;

  const slides = [...root.querySelectorAll('.home-banner-slide')];
  const dots = [...root.querySelectorAll('.home-banner-dots button')];
  const previous = document.getElementById('homeBannerPrev');
  const next = document.getElementById('homeBannerNext');
  let activeIndex = 0;
  let timer = null;
  let touchStartX = null;

  const fallbackBanners = [
    'assets/anhdautrang.jpg',
    'assets/anhdautrang2.png',
    'assets/anhdautrang3.png'
  ];

  function show(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
      slide.setAttribute('aria-hidden', String(i !== activeIndex));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function restart() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => show(activeIndex + 1), 5000);
  }

  function setImages(urls) {
    const usable = urls.filter(Boolean).slice(0, 3);
    slides.forEach((slide, i) => {
      const img = slide.querySelector('img');
      const url = usable[i] || fallbackBanners[i];
      img.src = url;
      img.alt = `Banner CAPTAIN GUNPLA ${i + 1}`;
    });
    show(0);
    restart();
  }

  previous?.addEventListener('click', () => { show(activeIndex - 1); restart(); });
  next?.addEventListener('click', () => { show(activeIndex + 1); restart(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart(); }));

  root.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
  root.addEventListener('mouseleave', restart);
  root.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  root.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) > 45) {
      show(activeIndex + (delta < 0 ? 1 : -1));
      restart();
    }
  }, { passive: true });

  async function load() {
    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await client
        .from('homepage_banners')
        .select('slot,image_url,is_active')
        .eq('is_active', true)
        .order('slot', { ascending: true });
      if (error) throw error;
      const urls = [1, 2, 3].map(slot => {
        const row = (data || []).find(item => Number(item.slot) === slot);
        return row?.image_url || '';
      });
      setImages(urls);
    } catch (error) {
      console.warn('CAPTAIN GUNPLA: Không tải được banner từ Supabase, dùng ảnh mặc định.', error);
      setImages(fallbackBanners);
    }
  }

  setImages(fallbackBanners);
  load();
})();
