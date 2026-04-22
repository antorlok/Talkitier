/**
 * Scripts Frontend - TalkiTier
 * Lógica base lista para ser migrada a Composition API (Vue 3)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Control de estado para Navbar Sticky (Scroll Event)
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                // Añadir sombra sutil cuando el usuario hace scroll
                navbar.classList.add('shadow-sm');
                navbar.classList.replace('bg-white/90', 'bg-white/95');
            } else {
                // Remover sombra en el top de la página para mantener minimalismo
                navbar.classList.remove('shadow-sm');
                navbar.classList.replace('bg-white/95', 'bg-white/90');
            }
        });
    }

    // 2. Control del Menú Móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Cerrar menú al hacer click en un enlace
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
});
