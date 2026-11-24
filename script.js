const WA_NUMBER = '916238664107';
const MAP_URL = 'https://maps.app.goo.gl/wzNQoZFeZnJxPyCf7';
const PHOTO_COUNT = 34; // images/p1.jpg ... (missing ones are skipped automatically)

const $ = s => document.querySelector(s);
document.getElementById('yr').textContent = new Date().getFullYear();

// Nav
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));
$('#burger').onclick = () => $('#nav-links').classList.toggle('open');
document.querySelectorAll('#nav-links a').forEach(a => a.onclick = () => $('#nav-links').classList.remove('open'));

// Gallery
const masonry = $('#masonry');
for (let i = 1; i <= PHOTO_COUNT; i++) {
  const fig = document.createElement('figure');
  const img = new Image();
  img.loading = 'lazy';
  img.alt = 'Rose Cottage Munnar photo ' + i;
  img.src = `images/p${i}.jpg`;
  img.onerror = () => fig.remove();
  fig.appendChild(img);
  fig.onclick = () => {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `<img src="${img.src}" alt="">`;
    lb.onclick = () => lb.remove();
    document.body.appendChild(lb);
  };
  masonry.appendChild(fig);
}

// Reveal
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Booking modal
const modal = $('#booking-modal');
const dateIn = $('#bk-date');
dateIn.min = new Date().toISOString().split('T')[0];
const openModal = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); };
const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };
document.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', openModal));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
addEventListener('keydown', e => e.key === 'Escape' && closeModal());

document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
  const inp = document.getElementById(b.dataset.step);
  const v = (+inp.value || 0) + (+b.dataset.d);
  inp.value = Math.min(+inp.max, Math.max(+inp.min, v));
});

// "No food" is exclusive
const foodBoxes = [...document.querySelectorAll('input[name=food]')];
foodBoxes.forEach(cb => cb.onchange = () => {
  if (cb.checked && cb.value === 'None') foodBoxes.forEach(o => o !== cb && (o.checked = false));
  if (cb.checked && cb.value !== 'None') $('#food-none').checked = false;
});

$('#booking-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#bk-name').value.trim();
  const date = dateIn.value;
  const nights = +$('#bk-nights').value || 1;
  const adults = +$('#bk-adults').value || 1;
  const kids = +$('#bk-kids').value || 0;
  const food = foodBoxes.filter(c => c.checked).map(c => c.value);
  const notes = $('#bk-notes').value.trim();

  if (!food.length) {
    document.querySelector('.chips').classList.add('err');
    setTimeout(() => document.querySelector('.chips').classList.remove('err'), 1500);
    return;
  }

  const fmt = d => new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const out = new Date(date + 'T00:00'); out.setDate(out.getDate() + nights);
  const checkout = out.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const msg =
`Hello Rose Cottage Munnar! 🌹
I'd like to enquire about booking a stay.

👤 Name: ${name}
📅 Check-in: ${fmt(date)}
📅 Check-out: ${checkout}
🌙 Nights: ${nights}
👥 Guests: ${adults} adult(s)${kids ? `, ${kids} child(ren)` : ''}
🍽️ Food: ${food.includes('None') ? 'Not required' : food.join(' & ')}${notes ? `\n📝 Notes: ${notes}` : ''}

Please share availability and pricing. Thank you!`;

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  closeModal();
});
