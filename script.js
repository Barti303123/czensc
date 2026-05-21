document.addEventListener('DOMContentLoaded', () => {
    
    // Obsługa zakładek (Tabs) na karcie produktu
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Usuń klasę active ze wszystkich przycisków i treści
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Dodaj klasę active do klikniętego przycisku
                btn.classList.add('active');
                
                // Pokaż odpowiednią treść
                const targetId = btn.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

    // Zamiana głównego zdjęcia po kliknięciu w miniaturkę na karcie produktu
    const thumbnails = document.querySelectorAll('.thumbnails img');
    const mainImg = document.querySelector('.main-image img');

    if (thumbnails.length > 0 && mainImg) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                mainImg.src = this.src;
            });
        });
    }
    
    // Prosta obsługa formularzy (zapobieganie przeładowaniu dla demontracji)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Wiadomość została wysłana pomyślnie!');
            form.reset();
        });
    });
});