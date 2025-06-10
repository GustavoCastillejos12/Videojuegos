// Global variables
let cart = [];
let currentSlide = 0;
let slideInterval;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    setupEventListeners();
    
    // Solo iniciar el carrusel si estamos en la página principal
    if (document.querySelector('.carousel-container')) {
        startSlideShow();
    }
    
    checkSessionStatus(); // Verificar estado de la sesión al cargar
    
    // Solo cargar productos si estamos en la página de catálogo
    if (document.getElementById('productos-container')) {
        loadProducts();
        setupCatalogFilters();
    }
});

// Carousel Functions
function startSlideShow() {
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('prev');
    dots[currentSlide].classList.remove('active');
    
    // Update current slide index
    currentSlide = (currentSlide + 1) % slides.length;
    
    // Add active class to new slide
    slides[currentSlide].classList.add('active');
    slides[currentSlide].classList.remove('prev');
    dots[currentSlide].classList.add('active');
}

function prevSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('prev');
    dots[currentSlide].classList.remove('active');
    
    // Update current slide index
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    
    // Add active class to new slide
    slides[currentSlide].classList.add('active');
    slides[currentSlide].classList.remove('prev');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('prev');
    dots[currentSlide].classList.remove('active');
    
    // Update current slide index
    currentSlide = index;
    
    // Add active class to new slide
    slides[currentSlide].classList.add('active');
    slides[currentSlide].classList.remove('prev');
    dots[currentSlide].classList.add('active');
}

// Event Listeners Setup
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Checkout Button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Pausar el carrusel cuando el mouse está sobre él
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startSlideShow();
        });
    }

    // Agregar event listeners para los controles del carrusel
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            startSlideShow();
        });
        
        nextButton.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            startSlideShow();
        });
    }

    // Agregar event listener para el botón de subir producto
    document.addEventListener('click', function(event) {
        if (event.target.matches('[data-bs-target="#uploadProductModal"]')) {
            event.preventDefault();
            
            // Verificar si el usuario está logueado
            fetch('/Venta%20videoj/auth/check_session.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.usuario) {
                        // Cerrar el menú desplegable
                        const dropdown = document.querySelector('.user-profile-dropdown');
                        if (dropdown) {
                            dropdown.style.display = 'none';
                        }
                        // Abrir el modal
                        const modal = new bootstrap.Modal(document.getElementById('uploadProductModal'));
                        modal.show();
                    } else {
                        // Si no está logueado, mostrar el modal de login
                        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                        loginModal.show();
                        showNotification('Por favor, inicia sesión para subir productos', 'warning');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Error al verificar la sesión', 'error');
                });
        }
    });
}

// Función para verificar el estado de la sesión
async function checkSessionStatus() {
    try {
        const response = await fetch('/Venta%20videoj/auth/check_session.php');
        const data = await response.json();
        
        if (data.success && data.usuario) {
            console.log('Usuario autenticado:', data.usuario);
            updateUIAfterLogin(data.usuario);
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/Venta%20videoj/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            alert(data.message);
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            // Actualizar la interfaz para mostrar que el usuario está logueado
            console.log('Llamando a updateUIAfterLogin con:', data.usuario);
            updateUIAfterLogin(data.usuario);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch('/Venta%20videoj/auth/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `nombre=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&confirmPassword=${encodeURIComponent(confirmPassword)}`
        });

        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar usuario');
    }
}

// Función para actualizar la UI después del login
function updateUIAfterLogin(usuario) {
    console.log('Iniciando updateUIAfterLogin con usuario:', usuario);

    // Ocultar botones de login/registro
    const authButtons = document.querySelectorAll('.auth-buttons');
    console.log('Botones de autenticación encontrados:', authButtons.length);
    authButtons.forEach(button => {
        button.style.display = 'none';
    });

    // Crear y mostrar el botón de perfil
    const profileButton = document.createElement('div');
    profileButton.className = 'user-profile';
    profileButton.innerHTML = '<i class="fas fa-user-circle"></i>';
    profileButton.onclick = toggleProfileDropdown;
    profileButton.style.display = 'flex';
    
    // Insertar el botón de perfil en el contenedor designado
    const profileContainer = document.getElementById('profileContainer');
    console.log('Contenedor de perfil encontrado:', !!profileContainer);
    
    if (profileContainer) {
        // Limpiar el contenedor primero
        profileContainer.innerHTML = '';
        // Agregar el botón
        profileContainer.appendChild(profileButton);
        console.log('Botón de perfil agregado al contenedor');
        
        // Verificar que el botón se haya agregado correctamente
        const addedButton = profileContainer.querySelector('.user-profile');
        console.log('Botón agregado verificado:', !!addedButton);
        
        // Forzar la visibilidad del botón
        if (addedButton) {
            addedButton.style.display = 'flex';
            addedButton.style.visibility = 'visible';
            addedButton.style.opacity = '1';
        }
    } else {
        console.error('No se encontró el contenedor de perfil');
    }

    // Asegurarse de que el menú desplegable exista
    let dropdown = document.querySelector('.user-profile-dropdown');
    if (!dropdown) {
        console.log('Creando nuevo menú desplegable');
        dropdown = document.createElement('div');
        dropdown.className = 'user-profile-dropdown';
        dropdown.style.display = 'none';
        dropdown.innerHTML = `
            <div class="dropdown-menu dropdown-menu-end" style="display: block; position: absolute; right: 20px; top: 60px; background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1);">
                <div class="dropdown-header text-light">
                    <i class="fas fa-user-circle me-2"></i>
                    <span class="user-name"></span>
                </div>
                <div class="dropdown-divider" style="border-color: rgba(255, 255, 255, 0.1);"></div>
                <a class="dropdown-item text-light" href="#" data-bs-toggle="modal" data-bs-target="#uploadProductModal">
                    <i class="fas fa-upload me-2"></i> Subir Juego
                </a>
                <a class="dropdown-item text-light" href="#" id="editProfileBtn">
                    <i class="fas fa-user-edit me-2"></i> Editar Perfil
                </a>
                <div class="dropdown-divider" style="border-color: rgba(255, 255, 255, 0.1);"></div>
                <a class="dropdown-item text-light" href="#" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                </a>
        </div>
    `;
        document.body.appendChild(dropdown);
    }

    // Actualizar el nombre de usuario en el dropdown
    const userNameElement = dropdown.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = usuario.nombre;
        console.log('Nombre de usuario actualizado:', usuario.nombre);
    }
}

// Función para alternar la visibilidad del menú desplegable
function toggleProfileDropdown(event) {
    event.stopPropagation(); // Evitar que el evento se propague
    const dropdown = document.querySelector('.user-profile-dropdown');
    const profileButton = document.querySelector('.user-profile');
    
    if (dropdown && profileButton) {
        // Calcular la posición del botón
        const buttonRect = profileButton.getBoundingClientRect();
        
        // Posicionar el dropdown debajo del botón
        dropdown.style.position = 'absolute';
        dropdown.style.top = `${buttonRect.bottom + window.scrollY}px`;
        dropdown.style.right = `${window.innerWidth - buttonRect.right}px`;
        
        // Alternar visibilidad
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        
        // Asegurar que el menú sea visible
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.display = 'block';
            menu.style.opacity = '1';
            menu.style.visibility = 'visible';
        }
    }
}

// Cerrar el menú desplegable al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.user-profile-dropdown');
    const profileButton = document.querySelector('.user-profile');
    
    if (dropdown && profileButton) {
        if (!dropdown.contains(event.target) && !profileButton.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    }
});

// Función para cerrar sesión
function handleLogout() {
    fetch('/Venta%20videoj/auth/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remover el botón de perfil y el dropdown
                const profileButton = document.querySelector('.user-profile');
                const dropdown = document.querySelector('.user-profile-dropdown');
                if (profileButton) profileButton.remove();
                if (dropdown) dropdown.remove();

                // Mostrar los botones de autenticación
                const authButtons = document.querySelectorAll('.auth-buttons');
                authButtons.forEach(button => {
                    button.style.display = 'inline-block';
                });

                location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cerrar sesión');
        });
}

// Handle Checkout
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'warning');
        return;
    }

    // Aquí iría la lógica de pago
    showNotification('¡Gracias por tu compra!', 'success');
    cart = [];
    updateCartDisplay();
    bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
}

// Función para cargar los productos
async function loadProducts() {
    try {
        console.log('Cargando productos...');
        const response = await fetch('/Venta%20videoj/auth/get_products.php');
        const data = await response.json();
        
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            if (data.productos && data.productos.length > 0) {
                console.log('Productos encontrados:', data.productos.length);
                displayProducts(data.productos);
            } else {
                console.log('No se encontraron productos');
                const container = document.getElementById('productos-container');
                if (container) {
                    container.innerHTML = '<div class="col-12 text-center"><p>No hay productos disponibles en este momento.</p></div>';
                }
            }
        } else {
            console.error('Error al cargar productos:', data.message);
            const container = document.getElementById('productos-container');
            if (container) {
                container.innerHTML = '<div class="col-12 text-center"><p>Error al cargar los productos. Por favor, intenta más tarde.</p></div>';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('productos-container');
        if (container) {
            container.innerHTML = '<div class="col-12 text-center"><p>Error al cargar los productos. Por favor, intenta más tarde.</p></div>';
        }
    }
}

// Función para mostrar los productos
function displayProducts(productos) {
    const container = document.getElementById('productos-container');
    if (!container) {
        console.error('No se encontró el contenedor de productos');
        return;
    }
    
    container.innerHTML = '';

    productos.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-4';
        
        col.innerHTML = `
            <div class="product-card" data-product-id="${producto.id}" data-fecha="${producto.fecha_publicacion}">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="platform"><i class="fas fa-gamepad"></i> ${producto.plataforma}</p>
                    <p class="price">$${parseFloat(producto.precio).toFixed(2)}</p>
                    <p class="seller"><small>Vendedor: ${producto.vendedor_nombre}</small></p>
                    <button class="btn btn-primary w-100" onclick="addToCart(${producto.id})">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

// Función para manejar la subida de productos
async function handleProductUpload(event) {
    event.preventDefault();
    console.log('Iniciando subida de producto...');
    
    // Verificar si el usuario está logueado
    try {
        const sessionResponse = await fetch('/Venta%20videoj/auth/check_session.php');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.success || !sessionData.usuario) {
            showNotification('Por favor, inicia sesión para subir productos', 'warning');
            return;
        }
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Validar que todos los campos requeridos estén presentes
        const requiredFields = ['nombre', 'descripcion', 'precio', 'plataforma', 'clave', 'imagen'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                showNotification(`Por favor, completa el campo ${field}`, 'error');
                return;
            }
        }
        
        console.log('Enviando datos del formulario...');
        const response = await fetch('/Venta%20videoj/auth/upload_product.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('Respuesta recibida:', response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Respuesta del servidor no válida');
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.success) {
            showNotification('Producto subido exitosamente', 'success');
            form.reset();
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadProductModal'));
            if (modal) {
                modal.hide();
            }
            // Recargar la lista de productos si estamos en la página de catálogo
            if (document.getElementById('productos-container')) {
                loadProducts();
            }
        } else {
            showNotification(data.message || 'Error al subir el producto', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al comunicarse con el servidor', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar la entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Funciones para el catálogo
function setupCatalogFilters() {
    const searchInput = document.getElementById('searchInput');
    const platformFilter = document.getElementById('platformFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    if (platformFilter) {
        platformFilter.addEventListener('change', filterProducts);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', filterProducts);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const platform = document.getElementById('platformFilter')?.value || '';
    const sortBy = document.getElementById('sortFilter')?.value || 'newest';

    const productos = Array.from(document.querySelectorAll('.product-card')).map(card => {
        const container = card.closest('.col-md-4');
        return {
            element: container,
            nombre: card.querySelector('.card-title').textContent.toLowerCase(),
            plataforma: card.querySelector('.platform').textContent.toLowerCase(),
            precio: parseFloat(card.querySelector('.price').textContent.replace('$', '')),
            fecha: new Date(card.dataset.fecha || Date.now())
        };
    });

    // Filtrar
    let filtered = productos.filter(producto => {
        const matchesSearch = producto.nombre.includes(searchTerm);
        const matchesPlatform = !platform || producto.plataforma.includes(platform.toLowerCase());
        return matchesSearch && matchesPlatform;
    });

    // Ordenar
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'price_asc':
                return a.precio - b.precio;
            case 'price_desc':
                return b.precio - a.precio;
            case 'newest':
            default:
                return b.fecha - a.fecha;
        }
    });

    // Actualizar la vista
    const container = document.getElementById('productos-container');
    if (container) {
        container.innerHTML = '';
        filtered.forEach(producto => {
            container.appendChild(producto.element);
        });
    }
}

// Función para agregar al carrito
function addToCart(productId) {
    console.log('Intentando agregar producto:', productId);
    const product = document.querySelector(`[data-product-id="${productId}"]`);
    if (!product) {
        console.error('Producto no encontrado:', productId);
        return;
    }

    const cartItem = {
        id: productId,
        name: product.querySelector('.card-title').textContent,
        price: parseFloat(product.querySelector('.price').textContent.replace('$', '')),
        image: product.querySelector('.card-img-top').src
    };

    console.log('Item a agregar:', cartItem);

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItem.quantity = 1;
        cart.push(cartItem);
    }

    console.log('Carrito actualizado:', cart);
    updateCartDisplay();
    showNotification('Producto agregado al carrito', 'success');
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.querySelector('.cart-count');

    if (cartItems) {
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(itemElement);
        });

        if (cartTotal) {
            cartTotal.textContent = total.toFixed(2);
        }
    }

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Función para remover del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    showNotification('Producto removido del carrito', 'info');
} 