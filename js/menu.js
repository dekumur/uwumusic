const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu');
const closeBtn = document.querySelector('.menu-close');
const overlay = document.querySelector('.menu-overlay');

function openMenu() {
    burger.classList.add('active');
    menu.classList.add('active');
    overlay.classList.add('active');
}

function closeMenu() {
    burger.classList.remove('active');
    menu.classList.remove('active');
    overlay.classList.remove('active');
}

burger.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
