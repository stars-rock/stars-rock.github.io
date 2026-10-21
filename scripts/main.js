// Без JS страница полная: вкладки вопросов и кнопка копирования включаются только здесь.
document.documentElement.classList.add('js');

// Появление блоков при скролле: один раз на элемент, без повторов.
// Всё, что двигается, описано в tokens.css — здесь только переключение класса.

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const stagger = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--stagger'),
    10
  ) || 70;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      const step = Math.min(index, 3); // каскад не длиннее четырёх шагов
      entry.target.style.transitionDelay = `${step * stagger}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  targets.forEach((el) => observer.observe(el));
})();

// «Что спрашивают перед началом» — вкладки по WAI-ARIA: клик, ↑↓, Home/End.
(() => {
  'use strict';

  const tabs = [...document.querySelectorAll('.faq-tabs__tab')];
  if (!tabs.length) return;

  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).classList.toggle('is-active', on);
    });
  };

  const keys = { ArrowDown: 1, ArrowUp: -1 };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      let next;
      if (e.key in keys) next = (i + keys[e.key] + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      select(tabs[next]);
      tabs[next].focus();
    });
  });
})();

// Кнопка связи внизу экрана на телефоне: прячется на первом экране и у «Контакта»,
// где своя кнопка уже на виду.
(() => {
  'use strict';

  const cta = document.querySelector('.mobile-cta');
  const zones = ['hero', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  if (!cta || !zones.length || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  cta.hidden = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    cta.hidden = visible.size > 0;
  });
  zones.forEach((z) => observer.observe(z));
})();

// Копирование адреса в «Контакте». Без Clipboard API кнопка не нужна — убираем.
(() => {
  'use strict';

  const buttons = document.querySelectorAll('[data-copy]');
  const status = document.querySelector('[data-copy-status]');
  if (!navigator.clipboard) {
    buttons.forEach((b) => b.remove());
    return;
  }
  buttons.forEach((b) => b.addEventListener('click', () => {
    navigator.clipboard.writeText(b.dataset.copy).then(() => {
      b.textContent = 'Скопировано';
      if (status) status.textContent = 'Адрес скопирован';
      setTimeout(() => {
        b.textContent = 'Скопировать';
        if (status) status.textContent = '';
      }, 1600);
    });
  }));
})();
