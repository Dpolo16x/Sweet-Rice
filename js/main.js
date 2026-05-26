/*
==============================================================
  ARROZ CON LECHE DELICIOSO — main.js
  Archivo: js/main.js

  Funciones:
  1. Navbar: sombra al hacer scroll
  2. Menú hamburguesa en móvil
  3. Cierre del menú al hacer clic en un link
  4. Animaciones de entrada al hacer scroll (IntersectionObserver)
  5. Smooth scroll + offset para la navbar fija
==============================================================
*/


/* ============================================================
   1. NAVBAR — Añade sombra cuando el usuario hace scroll
   ============================================================ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  // Si el scroll es mayor a 50px, añade la clase 'scrolled'
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


/* ============================================================
   2. MENÚ HAMBURGUESA (móvil)
   Alterna las clases 'open' en el botón y en el menú
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
  // Accesibilidad: actualizar aria-expanded
  const isOpen = navMenu.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});


/* ============================================================
   3. CIERRE DEL MENÚ al hacer clic en cualquier link
   ============================================================ */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});


/* ============================================================
   4. ANIMACIONES AL HACER SCROLL — IntersectionObserver
   
   Los elementos con clases .reveal-up / .reveal-left / .reveal-right
   son invisibles por defecto (CSS). Cuando entran en el viewport,
   se les añade la clase 'visible' que activa la animación de CSS.
   ============================================================ */

// Seleccionamos todos los elementos que deben animarse
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

// Configuración del observer
const observerOptions = {
  threshold: 0.12,       // Se activa cuando el 12% del elemento es visible
  rootMargin: '0px 0px -40px 0px'  // Activa un poco antes del borde inferior
};

// Creamos el observer
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // El elemento entró al viewport: añadir clase para animar
      entry.target.classList.add('visible');
      // Una vez animado, dejamos de observarlo (mejor rendimiento)
      scrollObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observamos cada elemento
revealElements.forEach(el => scrollObserver.observe(el));


/* ============================================================
   5. SMOOTH SCROLL con offset para la navbar fija
   
   Los links tipo href="#seccion" hacen scroll suave pero
   necesitamos compensar el alto de la navbar fija (≈ 72px)
   ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    // Ignorar links vacíos
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    // Calculamos la posición con offset de la navbar
    const navbarHeight = navbar.offsetHeight;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 8;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });
});


/* ============================================================
   6. STAGGER DELAY en tarjetas del menú
   
   Añade delays de animación progresivos a las tarjetas
   del menú para que aparezcan en cascada al hacer scroll
   ============================================================ */
document.querySelectorAll('.menu-card').forEach((card, index) => {
  // Cada tarjeta tiene un delay 80ms mayor que la anterior
  card.style.transitionDelay = `${index * 80}ms`;
});

document.querySelectorAll('.gallery-item').forEach((item, index) => {
  item.style.transitionDelay = `${index * 100}ms`;
});