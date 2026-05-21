document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ZAKŁADKI (TABS) I MINIATURKI
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

    // 2. GŁÓWNY SYSTEM SKLEPU
    const shopGrid = document.querySelector('.shop-layout .products-grid');
    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    if (shopGrid) {
        fetch('plik.json')
            .then(response => response.json())
            .then(products => {
                allProducts = products;
                filteredProducts = products;
                initFiltersAndSearch();
                renderPage(1);
            })
            .catch(error => console.error('Błąd ładowania pliku JSON:', error));
    } else {
        initGlobalSearch();
    }

    // --- RYSOWANIE SIATKI ---
    function renderPage(page) {
        currentPage = page;
        shopGrid.innerHTML = ''; 
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filteredProducts.slice(start, end);

        paginatedItems.forEach(product => {
            // Używamy bezpiecznego linku encodeURIComponent
            const safeSku = encodeURIComponent(product.sku);
            const html = `
                <a href="produkt.html?sku=${safeSku}" class="product-card" data-brand="${product.brand.toLowerCase()}">
                    <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">
                    <p class="product-sku">${product.sku}</p>
                    <h3 class="product-name">${product.name}</h3>
                </a>
            `;
            shopGrid.insertAdjacentHTML('beforeend', html);
        });

        updatePaginationUI();
        const countDisplay = document.querySelector('.shop-top-bar p');
        if (countDisplay) {
            const showingEnd = Math.min(end, filteredProducts.length);
            const showingStart = filteredProducts.length > 0 ? start + 1 : 0;
            countDisplay.textContent = `Wyświetlanie ${showingStart}–${showingEnd} z ${filteredProducts.length} wyników`;
        }
    }

    // --- PAGINACJA ---
    function updatePaginationUI() {
        let paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;
        
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (totalPages <= 1) return; 

        for (let i = 1; i <= totalPages; i++) {
            const span = document.createElement('span');
            span.className = `page-num ${i === currentPage ? 'active' : ''}`;
            span.textContent = i;
            span.addEventListener('click', () => {
                renderPage(i);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(span);
        }
    }

    // --- FILTRY ---
    function initFiltersAndSearch() {
        const searchInput = document.getElementById('searchInput');
        const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
        const filterBtn = document.querySelector('.sidebar .btn');
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('szukaj');

        if (searchQuery && searchInput) searchInput.value = decodeURIComponent(searchQuery);

        function applyFilters() {
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const activeBrands = Array.from(checkboxes)
                .filter(box => box.checked)
                .map(box => box.nextElementSibling.textContent.toLowerCase());

            filteredProducts = allProducts.filter(product => {
                const name = product.name.toLowerCase();
                const sku = product.sku.toLowerCase();
                const brand = product.brand.toLowerCase();

                const matchesSearch = name.includes(searchTerm) || sku.includes(searchTerm);
                const matchesBrand = activeBrands.length === 0 || activeBrands.includes(brand) || activeBrands.some(b => name.includes(b));
                return matchesSearch && matchesBrand;
            });
            renderPage(1);
        }

        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (filterBtn) filterBtn.addEventListener('click', applyFilters);
        if (searchQuery) applyFilters();
    }

    // --- WYSZUKIWARKA GLOBALNA ---
    function initGlobalSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    window.location.href = `sklep.html?szukaj=${encodeURIComponent(searchInput.value)}`;
                }
            });
        }
    }

    // ---------------------------------------------------------
    // 4. ŁADOWANIE POJEDYNCZEGO PRODUKTU
    // ---------------------------------------------------------
    const productSingleLayout = document.querySelector('.product-single-layout');
    
    if (productSingleLayout) {
        const urlParams = new URLSearchParams(window.location.search);
        const rawSku = urlParams.get('sku');

        if (rawSku) {
            // Odkodowujemy SKU z linku
            const productSku = decodeURIComponent(rawSku);

            fetch('plik.json')
                .then(response => response.json())
                .then(products => {
                    // Znajdź dokładne dopasowanie SKU jako tekst
                    const product = products.find(p => String(p.sku) === String(productSku));
                    
                    if (product) {
                        document.querySelector('.product-info h1').textContent = `${product.sku} ${product.name}`;
                        document.querySelector('.category-label').textContent = product.category.toUpperCase();
                        
                        const breadcrumbs = document.querySelector('.breadcrumbs p');
                        if (breadcrumbs) {
                            breadcrumbs.textContent = `Strona Główna / Sklep / ${product.category} / ${product.sku} ${product.name}`;
                        }
                        
                        const mainImage = document.querySelector('.main-image img');
                        if (mainImage) {
                            mainImage.src = product.image;
                            mainImage.alt = product.name;
                            // Jeśli obrazka nie ma fizycznie na serwerze, ukrywamy go, żeby nie sypało błędami
                            mainImage.onerror = function() {
                                this.style.display = 'none';
                            };
                        }

                        const thumbnailsContainer = document.querySelector('.thumbnails');
                        if (thumbnailsContainer) {
                            thumbnailsContainer.style.display = 'none';
                        }
                    } else {
                        // Zabezpieczenie na wypadek, gdyby produkt nie istniał w JSON
                        document.querySelector('.product-info h1').textContent = "Nie znaleziono produktu w bazie";
                    }
                })
                .catch(error => console.error('Błąd ładowania produktu:', error));
        }
    }
});