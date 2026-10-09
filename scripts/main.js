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

// Сквозная навигация — только после первого скролла (docs/concept.md).
(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  if (!header) return;

  const reveal = () => {
    header.hidden = false;
    window.removeEventListener('scroll', reveal);
  };

  window.addEventListener('scroll', reveal, { passive: true });
})();

// «Вопросы и границы» — вкладки по WAI-ARIA: клик, ↑↓, Home/End.
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
