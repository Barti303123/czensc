document.addEventListener('DOMContentLoaded', () => {

    // --- NIEZAWODNY OBRAZEK ZASTĘPCZY (Wbudowany w kod - omija adblockery) ---
    const fallbackImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22150%22%20viewBox%3D%220%200%20200%20150%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22200%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23adb5bd%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EBrak%20Zdjecia%3C%2Ftext%3E%3C%2Fsvg%3E';

    // ==========================================
    // 1. ZAKŁADKI I MINIATURKI (Karta produktu)
    // ==========================================
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

    // ==========================================
    // 2. GLOBALNA WYSZUKIWARKA (LUPA) - POPRAWIONA
    // ==========================================
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Funkcja wykonująca wyszukiwanie
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                // Przenieś do sklepu tylko jeśli nie jesteśmy w sklepie
                if (!window.location.pathname.includes('sklep.html')) {
                    window.location.href = `sklep.html?szukaj=${encodeURIComponent(query)}`;
                }
            }
        };

        // Nasłuchiwanie klawisza Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Blokuje domyślne zachowanie przeglądarki!
                performSearch();
            }
        });

        // Nasłuchiwanie KLIKNIĘCIA w ikonę lupy
        const searchIcon = searchInput.nextElementSibling;
        if (searchIcon && searchIcon.tagName === 'I') {
            searchIcon.style.cursor = 'pointer';
            searchIcon.addEventListener('click', performSearch);
        }
    }

    // ==========================================
    // 3. STRONA GŁÓWNA (4 najnowsze produkty)
    // ==========================================
    const homeGrid = document.getElementById('homeProductsGrid');
    if (homeGrid) {
        fetch('plik.json')
            .then(response => response.json())
            .then(products => {
                homeGrid.innerHTML = ''; 
                const firstFour = products.slice(0, 4);
                
                firstFour.forEach(product => {
                    const safeSku = encodeURIComponent(product.sku);
                    const html = `
                        <a href="produkt.html?sku=${safeSku}" class="product-card">
                            <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='${fallbackImage}';">
                            <p class="product-sku">${product.sku}</p>
                            <h3 class="product-name">${product.name}</h3>
                        </a>
                    `;
                    homeGrid.insertAdjacentHTML('beforeend', html);
                });
            })
            .catch(error => console.error('Błąd na stronie głównej:', error));
    }

    // ==========================================
    // 4. STRONA SKLEPU (Filtry, Paginacja)
    // ==========================================
    const shopGrid = document.querySelector('.shop-layout .products-grid');
    if (shopGrid) {
        let allProducts = [];
        let filteredProducts = [];
        let currentPage = 1;
        const itemsPerPage = 12;

        fetch('plik.json')
            .then(response => response.json())
            .then(products => {
                allProducts = products;
                filteredProducts = products;
                initShopFilters();
                renderPage(1);
            });

        function renderPage(page) {
            currentPage = page;
            shopGrid.innerHTML = ''; 
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = filteredProducts.slice(start, end);

            paginatedItems.forEach(product => {
                const safeSku = encodeURIComponent(product.sku);
                const html = `
                    <a href="produkt.html?sku=${safeSku}" class="product-card" data-brand="${product.brand.toLowerCase()}">
                        <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='${fallbackImage}';">
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

        function initShopFilters() {
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
    }

    // ==========================================
    // 5. STRONA POJEDYNCZEGO PRODUKTU
    // ==========================================
    const productSingleLayout = document.querySelector('.product-single-layout');
    if (productSingleLayout) {
        const urlParams = new URLSearchParams(window.location.search);
        const rawSku = urlParams.get('sku');

        if (rawSku) {
            const productSku = decodeURIComponent(rawSku);

            fetch('plik.json')
                .then(response => response.json())
                .then(products => {
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
                            mainImage.onerror = function() {
                                this.onerror = null; 
                                this.src = fallbackImage; 
                            };
                        }

                        const thumbnailsContainer = document.querySelector('.thumbnails');
                        if (thumbnailsContainer) thumbnailsContainer.style.display = 'none';
                    }
                });
        }
    }
});