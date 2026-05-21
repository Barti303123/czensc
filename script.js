document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ZAKŁADKI (TABS) I MINIATURKI ZDJĘĆ NA KARCIE PRODUKTU
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.getAttribute('data-target')).classList.add('active');
            });
        });
    }

    const thumbnails = document.querySelectorAll('.thumbnails img');
    const mainImg = document.querySelector('.main-image img');
    if (thumbnails.length > 0 && mainImg) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() { mainImg.src = this.src; });
        });
    }

    // 2. ŁADOWANIE PRODUKTÓW Z JSON (TYLKO NA STRONIE SKLEPU)
    const shopGrid = document.querySelector('.shop-layout .products-grid');

    if (shopGrid) {
        fetch('plik.json')
            .then(response => response.json())
            .then(products => {
                renderProducts(products, shopGrid);
                initFiltersAndSearch(); 
            })
            .catch(error => console.error('Błąd ładowania pliku JSON:', error));
    } else {
        // Jesteśmy na innej stronie, uruchom obsługę globalnej lupy
        initFiltersAndSearch();
    }

    // Funkcja budująca HTML na podstawie danych
    function renderProducts(products, grid) {
        grid.innerHTML = ''; 
        products.forEach(product => {
            const html = `
                <a href="produkt.html?sku=${product.sku}" class="product-card" data-brand="${product.brand.toLowerCase()}">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200x150?text=Brak+Zdj%C4%99cia'">
                    <p class="product-sku">${product.sku}</p>
                    <h3 class="product-name">${product.name}</h3>
                </a>
            `;
            grid.insertAdjacentHTML('beforeend', html);
        });
    }

    // 3. WYSZUKIWARKA I FILTRY MAREK
    function initFiltersAndSearch() {
        const searchInput = document.getElementById('searchInput');
        const productCards = document.querySelectorAll('.product-card');
        const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
        const filterBtn = document.querySelector('.sidebar .btn');

        // Odczytanie wyszukiwania z linku (jeśli klient przeszedł z innej strony)
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('szukaj');
        
        if (searchQuery && searchInput) {
            searchInput.value = searchQuery; // Wpisz to, co klient szukał do paska
        }

        function applyFilters() {
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            
            const activeBrands = Array.from(checkboxes)
                .filter(box => box.checked)
                .map(box => box.nextElementSibling.textContent.toLowerCase());

            productCards.forEach(card => {
                const name = card.querySelector('.product-name').textContent.toLowerCase();
                const sku = card.querySelector('.product-sku').textContent.toLowerCase();
                const brand = card.getAttribute('data-brand') || '';

                const matchesSearch = name.includes(searchTerm) || sku.includes(searchTerm);
                const matchesBrand = activeBrands.length === 0 || activeBrands.includes(brand) || activeBrands.some(b => name.includes(b));

                if (matchesSearch && matchesBrand) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }

        // Filtrowanie na żywo na stronie sklepu
        if (searchInput && productCards.length > 0) {
            searchInput.addEventListener('input', applyFilters);
            applyFilters(); // Uruchom raz od razu (ważne dla parametru z URL)
        }

        // Przekierowanie z innej strony do sklepu po wciśnięciu Enter
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const isShopPage = window.location.pathname.includes('sklep.html');
                    if (!isShopPage) {
                        // Przenieś do sklepu z parametrem szukaj=...
                        window.location.href = `sklep.html?szukaj=${encodeURIComponent(searchInput.value)}`;
                    }
                }
            });
        }

        // Filtrowanie po kliknięciu buttona "Filtr"
        if (filterBtn) filterBtn.addEventListener('click', applyFilters);
    }
});