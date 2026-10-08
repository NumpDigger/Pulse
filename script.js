/* =========================================================
   RunSmart — скрипты
   Содержание:
   1. Вспомогательные функции     6. Каталог (вкладки, «Подробнее»)
   2. Данные каталога             7. Плавное появление отзывов
   3. Плавный скролл к каталогу   8. Карта (Leaflet + OpenStreetMap)
   4. Форма заявки                9. Кнопка «Наверх»
   5. Слайдер
   ========================================================= */

const $ = (selector) => document.querySelector(selector);


/* ---------- 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---------- */

/** Форматирует число в цену: 4500 -> «4 500 руб.» */
function formatPrice(n) {
  return n.toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' руб.';
}

/** Рисует часы (SVG). screen — содержимое экрана, tilted — повернуть. */
function watchSvg({ width = 0, label = 'POLAR', screen = '', tilted = false, cls = '' }) {
  const size = width ? `width="${width}"` : '';
  const rotate = tilted ? 'rotate(-14 100 140)' : '';
  return `
  <svg class="${cls}" ${size} viewBox="0 0 200 280" aria-hidden="true">
    <g transform="${rotate}">
      <rect x="62" y="2"   width="76" height="60" rx="8" fill="#1d1d1d"/>
      <rect x="62" y="218" width="76" height="60" rx="8" fill="#1d1d1d"/>
      <rect x="22" y="52"  width="156" height="176" rx="30" fill="#161616"/>
      <rect x="30" y="60"  width="140" height="160" rx="24" fill="none" stroke="#c4161c" stroke-width="3"/>
      <rect x="42" y="74"  width="116" height="130" rx="10" fill="#b8bcb6"/>
      <rect x="172" y="120" width="10" height="44" rx="3" fill="#c4161c"/>
      <text x="100" y="64" fill="#fff" font-size="9" font-weight="700" text-anchor="middle" font-family="Arial">POLAR</text>
      <g font-family="Arial Narrow, Arial" fill="#222" text-anchor="middle">${screen}</g>
      <text x="100" y="216" fill="#fff" font-size="8" text-anchor="middle" font-family="Arial">${label}</text>
    </g>
  </svg>`;
}


/* ---------- 2. ДАННЫЕ КАТАЛОГА ---------- */
/* Формат: [название, старая цена, цена со скидкой, короткое описание, [подробности]] */
const CATALOG = {
  fit: [
    ['Polar FT1', 4750, 4500, 'Для первых шагов в тренировках, основанных на сердечном ритме',
      ['Звуковое оповещение о нужном пульсе во время тренировки;', 'Графический индикатор целевых зон пульса;', 'Информация о расходе калорий за тренировку;', 'Данные по 10 тренировкам.']],
    ['Polar FT2', 5490, 5190, 'Простой пульсометр для регулярных занятий в зале',
      ['Три тренировочные зоны пульса;', 'Часы, будильник и секундомер;', 'Подсчёт калорий;', 'Водонепроницаемость 30 м.']],
    ['Polar FT4', 6690, 6350, 'Помогает следить за нагрузкой и результатами недели',
      ['Функция Energy Pointer — показывает, сжигаются жиры или тренируется сердце;', 'Недельная сводка тренировок;', 'Подсветка экрана;', 'Нагрудный датчик в комплекте.']],
    ['Polar FT7', 8490, 7990, 'Для тех, кто тренируется 3–4 раза в неделю',
      ['Тест физической формы OwnIndex;', 'Умный подсчёт калорий;', 'Подробный журнал тренировок;', 'Сменная батарея.']],
    ['Suunto M2', 6690, 6641, 'Надёжные часы для первых шагов в тренировках с пульсом',
      ['Контроль пульса по нагрудному датчику;', 'Звуковые сигналы при выходе из целевой зоны;', 'Подсчёт времени и калорий;', 'Водонепроницаемость 30 м.']],
    ['Suunto M3', 7390, 7021, 'Часы с памятью для анализа тренировок',
      ['Графический индикатор зон пульса;', 'Память на 10 тренировок;', 'Подсчёт расхода калорий;', 'Звуковое оповещение о нужном пульсе.']]
  ],
  run: [
    ['Polar RC3 GPS', 16990, 15990, 'GPS-часы для бега с контролем темпа, дистанции и пульса',
      ['Встроенный GPS: скорость, темп и дистанция;', 'Функция «Вернуться к старту»;', 'Пульсовые зоны и умные калории;', 'Датчик пульса в комплекте.']],
    ['Garmin Forerunner 15', 9990, 8990, 'Лёгкие GPS-часы для ежедневных пробежек',
      ['GPS-трекинг маршрута;', 'Интервальные тренировки;', 'Напоминание о необходимости двигаться;', 'До 8 часов работы с GPS.']],
    ['Polar M400', 12990, 11990, 'Часы для бега с GPS и учётом ежедневной активности',
      ['Трекер активности 24/7;', 'Синхронизация с приложением Polar Flow;', 'Умные уведомления;', 'Водонепроницаемость 30 м.']],
  ],
  tri: [
    ['Garmin Forerunner 910XT', 24990, 22990, 'Мультиспорт: плавание, велосипед и бег в одних часах',
      ['Режим триатлона с автопереключением;', 'Плавание в бассейне и открытой воде;', 'Подключение велодатчиков;', 'До 20 часов работы.']],
    ['Suunto Ambit3 Sport', 27900, 25900, 'Часы для триатлетов с GPS и датчиком пульса',
      ['Профили для трёх видов спорта;', 'GPS-навигация по маршруту;', 'Анализ плавания;', 'Водозащита 50 м.']],
    ['Polar V800', 32990, 29990, 'Флагман для серьёзной подготовки к стартам',
      ['Режим триатлона;', 'Анализ нагрузки и восстановления;', 'Барометрический высотомер;', 'Приложение Polar Flow.']],
  ]
};


/* ---------- 3. ПЛАВНЫЙ СКРОЛЛ К КАТАЛОГУ ---------- */
$('#toCatalog').addEventListener('click', (e) => {
  e.preventDefault();
  $('#catalog').scrollIntoView({ behavior: 'smooth' });
});


/* ---------- 4. ФОРМА ЗАЯВКИ ---------- */
const leadForm = $('#leadForm');
const formMsg  = $('#formMsg');

const validators = {
  name:  (v) => v.trim().length > 1,
  phone: (v) => v.replace(/\D/g, '').length >= 10,
  email: (v) => /^\S+@\S+\.\S+$/.test(v)
};

function showFormMessage(text, ok) {
  formMsg.style.color = ok ? '#8bdc8b' : '#ff8a80';
  formMsg.textContent = text;
}

leadForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let allValid = true;

  for (const field in validators) {
    const input = leadForm.elements[field];
    const bad = !validators[field](input.value);
    input.classList.toggle('is-bad', bad);
    if (bad) allValid = false;
  }

  if (allValid) {
    showFormMessage('Спасибо! Мы перезвоним вам в течение 10 минут.', true);
    // Здесь можно отправить данные на сервер: fetch('/api/lead', { method: 'POST', body: new FormData(leadForm) })
    leadForm.reset();
  } else {
    showFormMessage('Проверьте выделенные поля: имя, телефон (от 10 цифр), e-mail.', false);
  }
});


/* ---------- 5. СЛАЙДЕР ---------- */
const SCREEN_HR = `
  <text x="100" y="96" font-size="9">HEART RATE</text>
  <text x="100" y="140" font-size="40" font-weight="700">76</text>
  <text x="100" y="164" font-size="18" font-weight="700">5:30 <tspan font-size="9">MIN/KM</tspan></text>
  <text x="100" y="188" font-size="18" font-weight="700">8.60 <tspan font-size="9">KM</tspan></text>`;
const SCREEN_NAV = `
  <text x="100" y="92" font-size="8">BACK TO START</text>
  <path d="M80 140l40-40v24l20 0v32h-20v24z" fill="#222" transform="rotate(-20 100 140)"/>
  <text x="100" y="190" font-size="17" font-weight="700">3.4 <tspan font-size="9">KM</tspan></text>`;
const SCREEN_DIST = `
  <text x="100" y="110" font-size="10">DISTANCE</text>
  <text x="100" y="150" font-size="34" font-weight="700">12.4</text>
  <text x="100" y="178" font-size="10">KM  ·  1:08:21</text>`;
const LOGO = `<div class="watch-logo">POLAR<br><span>RC3 GPS</span></div>`;

/* Три слайда */
const slides = [
  watchSvg({ width: 220, label: 'RC3 GPS', screen: SCREEN_HR }) + LOGO,
  watchSvg({ width: 190, label: 'RC3 GPS', screen: SCREEN_NAV, tilted: true }) + LOGO,
  watchSvg({ width: 200, label: 'RC3 GPS', screen: SCREEN_DIST }) + watchSvg({ width: 140, label: 'RC3 GPS', screen: SCREEN_HR, tilted: true })
];

const stage = $('#sliderStage');
const dots  = $('#sliderDots');
let current = 0;
let switching = false;

dots.innerHTML = slides.map((_, i) => `<i data-i="${i}"></i>`).join('');

function showSlide(index) {
  if (switching) return;
  switching = true;
  stage.classList.add('is-fading');
  setTimeout(() => {
    current = (index + slides.length) % slides.length;     // по кругу
    stage.innerHTML = slides[current];
    [...dots.children].forEach((d, i) => d.classList.toggle('is-active', i === current));
    stage.classList.remove('is-fading');
    switching = false;
  }, 250);
}

stage.innerHTML = slides[0];
dots.children[0].classList.add('is-active');

$('#sliderPrev').addEventListener('click', () => showSlide(current - 1));
$('#sliderNext').addEventListener('click', () => showSlide(current + 1));
dots.addEventListener('click', (e) => { if (e.target.dataset.i) showSlide(+e.target.dataset.i); });

/* Свайп пальцем на смартфоне */
let touchX = null;
stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showSlide(current + (dx < 0 ? 1 : -1));
  touchX = null;
});


/* ---------- 6. КАТАЛОГ ---------- */
const productsBox = $('#products');

function priceBlock(p) {
  return `
    <div class="card__buy">
      <div><s>${formatPrice(p[1])}</s><b>${formatPrice(p[2])}</b></div>
      <button class="btn" data-action="buy" type="button">Купить</button>
    </div>`;
}

const CARD_SCREEN = `
  <text x="100" y="142" font-size="38" font-weight="700">127</text>
  <text x="100" y="170" font-size="14">♥</text>`;

function renderCatalog(category) {
  productsBox.innerHTML = CATALOG[category].map((p) => `
    <div class="card">
      <div class="card__face card__face--front">
        ${watchSvg({ label: p[0].split(' ').pop(), screen: CARD_SCREEN, cls: 'card__img' })}
        <h4>Пульсометр ${p[0]}</h4>
        <p>${p[3]}</p>
        <button class="card__link" data-action="open" type="button">ПОДРОБНЕЕ</button>
        ${priceBlock(p)}
      </div>
      <div class="card__face card__face--back">
        <ul>${p[4].map((t) => `<li>${t}</li>`).join('')}</ul>
        <button class="card__link" data-action="close" type="button">НАЗАД</button>
        ${priceBlock(p)}
      </div>
    </div>`).join('');
}

renderCatalog('fit');

/* Вкладки-фильтры */
$('#tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t === tab));
  renderCatalog(tab.dataset.cat);
});

/* Кнопки в карточках: «Подробнее», «Назад», «Купить» */
productsBox.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;
  const card = e.target.closest('.card');

  if (action === 'open')  card.classList.add('is-flipped');
  if (action === 'close') card.classList.remove('is-flipped');

  if (action === 'buy') {
    const name = card.querySelector('h4').textContent;
    $('#form').scrollIntoView({ behavior: 'smooth' });
    showFormMessage('Вы выбрали: ' + name + '. Оставьте контакты, и мы оформим заказ.', true);
  }
});


/* ---------- 7. ПЛАВНОЕ ПОЯВЛЕНИЕ ОТЗЫВОВ ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


/* ---------- 8. КАРТА (Leaflet + OpenStreetMap) ---------- */
/* Координаты офиса: Москва, Красная Пресня, 44с3 */
const OFFICE = [55.7627, 37.5716];

if (window.L) {
  const map = L.map('map', {
    center: OFFICE,
    zoom: 16,
    minZoom: 2,                         // можно отдалить до всего мира
    worldCopyJump: true,
    // На телефоне одним пальцем листаем страницу, двумя — двигаем и масштабируем карту
    dragging: !L.Browser.mobile,
    tap: false
  });

  /* Тайлы Esri World Street Map — не требуют ключа и работают даже при открытии файла с диска.
     Порядок координат в адресе: {z}/{y}/{x} (именно так, y перед x).

     Если сайт будет лежать на хостинге (https://...), можно вернуть тайлы OpenStreetMap:
       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19,
         attribution: '&copy; OpenStreetMap' })
     Они блокируют (403) запросы без Referer, поэтому с file:// не работают. */
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, OpenStreetMap contributors'
  }).addTo(map);

  const pin = L.divIcon({
    className: 'pin',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    html: `
      <svg width="30" height="42" viewBox="0 0 30 42"><path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 27 15 27s15-16 15-27C30 6.7 23.3 0 15 0z" fill="#b71c1c"/><circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>
      <div class="pin-label" style="position:absolute;left:34px;top:4px">Красная Пресня<br>ул. 44 строение 3</div>`
  });

  L.marker(OFFICE, { icon: pin, title: 'RunSmart' }).addTo(map);
}


/* ---------- 9. КНОПКА «НАВЕРХ» ---------- */
const toTop = $('#toTop');

window.addEventListener('scroll', () => {
  toTop.classList.toggle('is-visible', window.scrollY > 500);
}, { passive: true });

toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
