const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

const modals = document.querySelectorAll('.modal');
const closeButtons = document.querySelectorAll('.modal-close');
const switchButtons = document.querySelectorAll('[data-switch]');

function openModal(modal) {
    closeAllModals();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    modals.forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
}

loginBtn.addEventListener('click', () => openModal(loginModal));
registerBtn.addEventListener('click', () => openModal(registerModal));

closeButtons.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
});

modals.forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) closeAllModals();
    });
});

switchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.switch;
        if (target === 'login') openModal(loginModal);
        if (target === 'register') openModal(registerModal);
    });
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
});
