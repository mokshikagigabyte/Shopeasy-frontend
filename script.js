// ~/storage/shared/shopeasy-frontend/script.js
// Helper: Get simulated JWT token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper: Get current user email from token
const getUserEmail = () => {
  const token = getToken();
  return token ? token.replace('simulated-token-', '') : null;
};

// Helper: Check if element exists
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) console.error(`Element with ID ${id} not found`);
  return element;
}

// Utility: Generate unique ID
const generateUniqueId = () => `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize wishlist, cart, products, and payment statement
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
  let paymentStatement = JSON.parse(localStorage.getItem('paymentStatement') || '[]');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  let paymentConfirmed = JSON.parse(localStorage.getItem('paymentConfirmed') || 'false');

  // Debug initialization
  console.log('Initial cart:', cart);
  console.log('Initial paymentConfirmed:', paymentConfirmed);
  console.log('Initial paymentStatement:', paymentStatement);
  console.log('Current page:', currentPage);

  // Authentication check for protected pages
  const protectedPages = ['index.html', 'men.html', 'category.html', 'yourcart.html', 'wishlist.html', 'qr.html', 'cod.html'];
  if (protectedPages.includes(currentPage) && !getToken()) {
    console.log('No token found, redirecting to login.html');
    window.location.href = 'login.html';
    return;
  }

  // Owner authentication for statement.html
  if (currentPage === 'statement.html') {
    const ownerEmail = 'mokshika470@gmail.com';
    const ownerPassword = 'admin123';
    const authSection = getElement('auth-section');
    const statementSection = getElement('statement-section');
    const ownerLoginForm = getElement('owner-login-form');
    const errorMsg = getElement('error-msg');

    if (getUserEmail() === ownerEmail && localStorage.getItem('ownerAuthenticated') === 'true') {
      authSection.style.display = 'none';
      statementSection.style.display = 'block';
      renderStatement();
    } else {
      authSection.style.display = 'block';
      statementSection.style.display = 'none';
      if (getUserEmail() && getUserEmail() !== ownerEmail) {
        console.log('Unauthorized access to statement.html by:', getUserEmail());
        errorMsg.style.display = 'block';
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
      }
    }

    if (ownerLoginForm) {
      ownerLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = getElement('owner-email');
        const passwordInput = getElement('owner-password');
        const email = emailInput?.value;
        const password = passwordInput?.value;
        if (email === ownerEmail && password === ownerPassword) {
          localStorage.setItem('ownerAuthenticated', 'true');
          localStorage.setItem('token', `simulated-token-${email}`);
          authSection.style.display = 'none';
          statementSection.style.display = 'block';
          console.log('Owner login successful');
          renderStatement();
        } else {
          errorMsg.style.display = 'block';
          setTimeout(() => { errorMsg.style.display = 'none'; }, 3000);
          console.error('Owner login failed');
        }
      });
    }
  }

  // Hamburger menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
      console.log('Menu toggled:', navLinks.classList.contains('active'));
    });
  }

  // Authentication
  const authSection = getElement('auth-section');
  const loginForm = getElement('loginForm');
  const registerForm = getElement('registerForm');
  const loginFormElement = getElement('login-form');
  const registerFormElement = getElement('register-form');

  // Debug auth elements
  console.log('Auth elements:', {
    authSection: !!authSection,
    loginForm: !!loginForm,
    registerForm: !!registerForm,
    loginFormElement: !!loginFormElement,
    registerFormElement: !!registerFormElement
  });

  // Toggle between login and register forms
  function toggleForm() {
    if (loginForm && registerForm) {
      loginForm.classList.toggle('hidden');
      registerForm.classList.toggle('hidden');
      console.log('Toggled forms:', loginForm.classList.contains('hidden') ? 'Register' : 'Login');
    } else {
      console.error('Cannot toggle forms: loginForm or registerForm missing');
    }
  }
  document.querySelectorAll('.toggle-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toggleForm();
    });
  });

  // Handle login form submission (frontend-only)
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = getElement('login-email');
      const passwordInput = getElement('login-password');
      const email = emailInput?.value;
      const password = passwordInput?.value;
      if (!email || !password) {
        alert('Please enter email and password');
        return;
      }

      // Check credentials against localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('token', `simulated-token-${email}`);
        if (authSection) authSection.style.display = 'none';
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        console.log('Login successful for:', email);
        window.location.href = 'index.html';
      } else {
        alert('Invalid email or password');
        console.error('Login failed: Invalid credentials');
      }
    });
  }

  // Handle register form submission (frontend-only)
  if (registerFormElement) {
    registerFormElement.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = getElement('login-email');
      const passwordInput = getElement('login-password');
      const email = emailInput?.value;
      const password = passwordInput?.value;
      if (!email || !password) {
        alert('Please enter email and password');
        return;
      }

      // Store new user in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email === email)) {
        alert('Email already registered');
        console.error('Registration failed: Email exists');
        return;
      }
      users.push({ email, password });
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('token', `simulated-token-${email}`);
      if (authSection) authSection.style.display = 'none';
      if (loginForm) loginForm.classList.add('hidden');
      if (registerForm) registerForm.classList.add('hidden');
      console.log('Registration successful for:', email);
      window.location.href = 'index.html';
    });
  }

  // Load all products (static only)
  function loadProducts(query = '') {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid && !query) return console.warn(`No product grid on ${currentPage}`);

    // Load static products from HTML
    const products = [];
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      const wishlistIcon = card.querySelector('.wishlist-icon');
      const id = wishlistIcon?.dataset.id || card.dataset.id || generateUniqueId();
      const name = card.querySelector('h3')?.textContent.trim() || 'Unnamed Product';
      const price = card.querySelector('p')?.textContent.replace(/[^0-9.]/g, '') || '0';
      const image = card.querySelector('img')?.dataset.image || card.querySelector('img')?.src || 'https://via.placeholder.com/150';
      if (id && name && price && !image.startsWith('content://')) {
        products.push({ id, name, price, image, page: currentPage });
        card.dataset.id = id;
        if (wishlistIcon) {
          wishlistIcon.dataset.id = id;
          wishlistIcon.dataset.name = name;
          wishlistIcon.dataset.price = price;
          wishlistIcon.dataset.image = image;
        }
      } else {
        console.warn('Invalid product data:', { id, name, price, image });
      }
    });
    allProducts = [...new Map([...allProducts, ...products].map(p => [p.id, p])).values()];
    localStorage.setItem('allProducts', JSON.stringify(allProducts));
    console.log('Updated allProducts:', allProducts);

    // Filter products if query exists
    if (query) {
      const targetGrid = document.querySelector('.product-grid') || document.createElement('div');
      if (!targetGrid.classList.contains('product-grid')) {
        targetGrid.classList.add('product-grid');
        const searchResults = getElement('searchResults');
        if (searchResults) searchResults.appendChild(targetGrid);
      }
      targetGrid.innerHTML = '';
      const filteredProducts = allProducts.filter(product =>
        (product.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (product.price?.toString().toLowerCase() || '').includes(query.toLowerCase())
      );
      filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.innerHTML = `
          <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <button class="add-to-cart">Add to Cart</button>
            <a href="#" class="order-now">Order Now</a>
            <i class="fas fa-heart wishlist-icon${wishlist.some(item => item.id === product.id) ? ' active' : ''}" 
               data-id="${product.id}" 
               data-name="${product.name}" 
               data-price="${product.price}" 
               data-image="${product.image || 'https://via.placeholder.com/150'}"></i>
          </div>
        `;
        targetGrid.appendChild(card);
      });
      console.log('Filtered products:', filteredProducts.length);
    }
    updateWishlistIcons();
  }

  // Update wishlist icon states
  function updateWishlistIcons() {
    document.querySelectorAll('.wishlist-icon').forEach(icon => {
      if (icon.dataset.id) {
        icon.classList.toggle('active', wishlist.some(item => item.id === icon.dataset.id));
      }
    });
  }

  // Render payment statement
  function renderStatement() {
    const statementBody = getElement('statement-body');
    if (!statementBody) return console.error('statement-body not found');

    statementBody.innerHTML = '';
    if (!paymentStatement.length) {
      statementBody.innerHTML = '<tr><td colspan="6">No payment records found.</td></tr>';
      return;
    }

    paymentStatement.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.transactionId}</td>
        <td>${record.email}</td>
        <td>${record.method}</td>
        <td>${record.status}</td>
        <td>${new Date(record.timestamp).toLocaleString()}</td>
        <td>${record.items ? record.items.map(item => item.name).join(', ') : 'N/A'}</td>
      `;
      statementBody.appendChild(row);
    });
    console.log('Rendered payment statement:', paymentStatement);
  }

  // Verify payment for current user
  function verifyPayment(email) {
    const latestPayment = paymentStatement
      .filter(record => record.email === email)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    return latestPayment && latestPayment.status === 'success';
  }

  // Record payment attempt
  function recordPayment(method, status, email, items = null) {
    const transactionId = generateUniqueId();
    const record = {
      transactionId,
      email,
      method,
      status,
      timestamp: Date.now(),
      items: status === 'success' ? items : null
    };
    paymentStatement.push(record);
    localStorage.setItem('paymentStatement', JSON.stringify(paymentStatement));
    console.log('Recorded payment:', record);
    return record;
  }

  // Folding sections (men.html, category.html)
  if (['men.html', 'category.html'].includes(currentPage)) {
    const sectionTitles = document.querySelectorAll('.section-title');
    console.log('Found section titles:', sectionTitles.length);
    sectionTitles.forEach(title => {
      title.addEventListener('click', () => {
        console.log('Section title clicked:', title.textContent);
        const section = title.closest('.product-container');
        if (!section) {
          console.warn('No product-container found for section:', title.textContent);
          return;
        }
        const productGrid = section.querySelector('.product-grid');
        if (!productGrid) {
          console.warn('No product-grid found in section:', title.textContent);
          return;
        }
        section.classList.toggle('active');
        productGrid.style.display = section.classList.contains('active') ? 'grid' : 'none';
        console.log(`Toggled section: ${title.textContent}, Active: ${section.classList.contains('active')}`);
      });
    });
  }

  // Event delegation
  document.addEventListener('click', async (e) => {
    const target = e.target;
    const productCard = target.closest('.product-card');
    if (productCard) {
      const id = productCard.dataset.id || generateUniqueId();
      const name = productCard.querySelector('h3')?.textContent.trim() || 'Unnamed Product';
      const price = productCard.querySelector('p')?.textContent.replace(/[^0-9.]/g, '') || '0';
      const image = productCard.querySelector('img')?.src || 'https://via.placeholder.com/150';
      const product = { id, name, price, image };

      console.log('Product card clicked:', { id, name, price, image });

      // Wishlist icon
      if (target.classList.contains('wishlist-icon')) {
        if (!id || !image || image.startsWith('content://')) {
          console.warn('Invalid wishlist item:', product);
          return;
        }
        const index = wishlist.findIndex(item => item.id === id);
        if (index === -1) {
          wishlist.push(product);
          target.classList.add('active');
          console.log('Added to wishlist:', id);
        } else {
          wishlist.splice(index, 1);
          target.classList.remove('active');
          console.log('Removed from wishlist:', id);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        if (currentPage === 'wishlist.html') renderWishlist();
        updateWishlistIcons();
      }

      // Add to Cart
      if (target.classList.contains('add-to-cart')) {
        if (!id || !name || !price || !image || image.startsWith('content://')) {
          console.error('Invalid product for cart:', product);
          alert('Cannot add to cart: Invalid product data');
          return;
        }
        if (!cart.some(item => item.id === id)) {
          cart.push(product);
          localStorage.setItem('cart', JSON.stringify(cart));
          alert(`${name} added to cart!`);
          console.log('Added to cart:', product);
          console.log('Updated cart:', cart);
          if (currentPage === 'yourcart.html') renderCart();
        } else {
          alert(`${name} is already in your cart.`);
        }
      }

      // Remove from Cart (only on yourcart.html)
      if (target.classList.contains('remove-from-cart') && currentPage === 'yourcart.html') {
        const index = cart.findIndex(item => item.id === id);
        if (index !== -1) {
          cart.splice(index, 1);
          localStorage.setItem('cart', JSON.stringify(cart));
          alert(`${name} removed`);
          console.log('Removed from cart', id);
          console.log('Updated cart:', cart);
          renderCart();
        }
      }

      // Order Now
      if (target.classList.contains('order-now') && currentPage === 'yourcart.html') {
        e.preventDefault();
        if (!cart.length) {
          alert('Your cart is empty. Add items to place an order.');
          return;
        }
        const email = getUserEmail();
        if (!verifyPayment(email)) {
          const paymentStatus = getElement('payment-status');
          const failureMsg = getElement('failure-msg');
          if (paymentStatus) paymentStatus.style.display = 'block';
          if (failureMsg) {
            failureMsg.style.display = 'block';
            setTimeout(() => { failureMsg.style.display = 'none'; }, 3000);
          }
          console.log('Order attempted without payment verification');
          return;
        }
        // Confirm order
        console.log(`Order placed for: ${cart.map(item => item.name).join(', ')}`);
        const successMsg = getElement('success-msg');
        if (successMsg) {
          successMsg.style.display = 'block';
          setTimeout(() => { successMsg.style.display = 'none'; }, 3000);
        }
        // Update statement with successful order
        const latestPayment = paymentStatement
          .filter(record => record.email === email)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        if (latestPayment && !latestPayment.items) {
          latestPayment.items = [...cart];
          localStorage.setItem('paymentStatement', JSON.stringify(paymentStatement));
        }
        // Clear cart and reset payment
        cart = [];
        paymentConfirmed = false;
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('paymentConfirmed', JSON.stringify(paymentConfirmed));
        renderCart();
        console.log('Order confirmed, cart cleared');
      }
    }

    // Pay with QR or COD
    if (target.id === 'pay-qr' && currentPage === 'yourcart.html') {
      window.location.href = 'qr.html';
    }
    if (target.id === 'pay-cod' && currentPage === 'yourcart.html') {
      window.location.href = 'cod.html';
    }

    // Scan QR Code
    if (target.id === 'scan-qr' && currentPage === 'qr.html') {
      const qrUpload = getElement('qr-upload');
      if (qrUpload) {
        qrUpload.click();
      }
    }

    // Close nav-links and check payment status
    if (target.tagName === 'A' && navLinks?.classList.contains('active')) {
      navLinks.classList.remove('active');
      const icon = hamburger?.querySelector('i');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
      }
      // Record failed payment if navigating away without confirmation
      if (['qr.html', 'cod.html'].includes(currentPage) && !paymentConfirmed) {
        const failureMsg = getElement('failure-msg');
        if (failureMsg) {
          failureMsg.style.display = 'block';
          setTimeout(() => { failureMsg.style.display = 'none'; }, 3000);
        }
        const email = getUserEmail();
        if (email && currentPage === 'qr.html') {
          recordPayment('QR', 'failed', email);
        }
      }
    }
  });

  // Prevent navigation if payment not confirmed
  if (['qr.html', 'cod.html'].includes(currentPage)) {
    window.addEventListener('beforeunload', (e) => {
      if (!paymentConfirmed) {
        const failureMsg = getElement('failure-msg');
        if (failureMsg) {
          failureMsg.style.display = 'block';
          setTimeout(() => { failureMsg.style.display = 'none'; }, 3000);
        }
        const email = getUserEmail();
        if (email && currentPage === 'qr.html') {
          recordPayment('QR', 'failed', email);
        }
        e.preventDefault();
        e.returnValue = 'You didn\'t scan or place the order. Are you sure you want to leave?';
      }
    });
  }

  // QR Code Scanning
  if (currentPage === 'qr.html') {
    const qrUpload = getElement('qr-upload');
    const confirmPaymentBtn = getElement('confirm-payment');
    const successMsg = getElement('success-msg');
    const qrSection = getElement('qr-section');

    if (qrUpload && confirmPaymentBtn && successMsg && qrSection) {
      qrUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
          console.warn('No QR code image selected');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            const email = getUserEmail();
            try {
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              if (code && code.data === 'PAYMENT_CONFIRMED') {
                paymentConfirmed = true;
                localStorage.setItem('paymentConfirmed', JSON.stringify(paymentConfirmed));
                recordPayment('QR', 'success', email, cart);
                qrSection.style.display = 'none';
                confirmPaymentBtn.style.display = 'none';
                successMsg.style.display = 'block';
                console.log('QR payment confirmed automatically');
              } else {
                console.warn('Invalid or unrecognized QR code:', code?.data);
                recordPayment('QR', 'failed', email);
                const failureMsg = getElement('failure-msg');
                if (failureMsg) {
                  failureMsg.style.display = 'block';
                  setTimeout(() => { failureMsg.style.display = 'none'; }, 3000);
                }
                alert('Invalid QR code. Please try again.');
              }
            } catch (error) {
              console.error('Error scanning QR code:', error);
              recordPayment('QR', 'failed', email);
              const failureMsg = getElement('failure-msg');
              if (failureMsg) {
                failureMsg.style.display = 'block';
                setTimeout(() => { failureMsg.style.display = 'none'; }, 3000);
              }
              alert('Error scanning QR code. Please try again.');
            }
          };
        };
        reader.readAsDataURL(file);
      });

      // Manual confirm payment (fallback)
      confirmPaymentBtn.addEventListener('click', () => {
        const email = getUserEmail();
        paymentConfirmed = true;
        localStorage.setItem('paymentConfirmed', JSON.stringify(paymentConfirmed));
        recordPayment('QR', 'success', email, cart);
        qrSection.style.display = 'none';
        confirmPaymentBtn.style.display = 'none';
        successMsg.style.display = 'block';
        console.log('QR payment confirmed manually');
      });
    }
  }

  // Search Functionality
  const searchInput = getElement('searchInput');
  const searchResults = getElement('searchResults');
  if (searchInput && searchResults) {
    function filterAndInsertProducts() {
      const query = searchInput.value.toLowerCase().trim();
      searchResults.innerHTML = '';
      searchResults.classList.remove('active');

      if (!query) {
        document.querySelectorAll('.product-card.filtered').forEach(card => card.remove());
        return;
      }

      const filteredProducts = allProducts.filter(product =>
        (product.name?.toLowerCase() || '').includes(query) ||
        (product.price?.toString().toLowerCase() || '').includes(query)
      );

      if (filteredProducts.length) {
        searchResults.innerHTML = `<p>${filteredProducts.length} result(s) found.</p>`;
        const targetGrid = document.createElement('div');
        targetGrid.classList.add('product-grid');
        searchResults.appendChild(targetGrid);

        filteredProducts.forEach(product => {
          const productCard = document.createElement('div');
          productCard.classList.add('product-card', 'filtered');
          productCard.dataset.id = product.id;
          productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>₹${product.price}</p>
              <button class="add-to-cart">Add to Cart</button>
              <a href="#" class="order-now">Order Now</a>
              <i class="fas fa-heart wishlist-icon${wishlist.some(item => item.id === product.id) ? ' active' : ''}" 
                 data-id="${product.id}" 
                 data-name="${product.name}" 
                 data-price="${product.price}" 
                 data-image="${product.image}"></i>
            </div>
          `;
          targetGrid.appendChild(productCard);
        });
        searchResults.classList.add('active');
        updateWishlistIcons();
      } else {
        searchResults.innerHTML = '<p>No results found.</p>';
        searchResults.classList.add('active');
      }
    }

    let searchTimeout;
    function debouncedSearch() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(filterAndInsertProducts, 300);
    }

    searchInput.addEventListener('input', debouncedSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') filterAndInsertProducts();
    });

    document.addEventListener('click', (e) => {
      if (!searchResults.contains(e.target) && !searchInput.contains(e.target) && !e.target.classList.contains('fa-search')) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('active');
      }
    });
  }

  // Render Wishlist
  function renderWishlist() {
    const wishlistGrid = getElement('wishlistGrid');
    if (!wishlistGrid) return;

    wishlistGrid.innerHTML = '';
    if (!wishlist.length) {
      wishlistGrid.innerHTML = '<p>Your wishlist is empty.</p>';
      return;
    }

    wishlist.forEach(item => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.dataset.id = item.id;
      productCard.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="product-info">
          <h3>${item.name}</h3>
          <p>₹${item.price}</p>
          <button class="add-to-cart">Add to Cart</button>
          <a href="#" class="order-now">Order Now</a>
          <i class="fas fa-heart wishlist-icon active" 
             data-id="${item.id}" 
             data-name="${item.name}" 
             data-price="${item.price}" 
             data-image="${item.image}"></i>
        </div>
      `;
      wishlistGrid.appendChild(productCard);
    });
    updateWishlistIcons();
  }

  // Render Cart
  function renderCart() {
    const cartGrid = getElement('cartGrid');
    if (!cartGrid) {
      console.error('cartGrid not found on yourcart.html');
      return;
    }

    console.log('Rendering cart with items:', cart);
    cartGrid.innerHTML = '';
    if (!cart.length) {
      cartGrid.innerHTML = '<p>Your cart is empty.</p>';
      console.log('Cart is empty');
      const paymentStatus = getElement('payment-status');
      if (paymentStatus) paymentStatus.style.display = 'none';
      return;
    }

    cart.forEach(item => {
      console.log('Rendering cart item:', item);
      if (!item.id || !item.name || !item.price || !item.image) {
        console.warn('Invalid cart item:', item);
        return;
      }
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.dataset.id = item.id;
      productCard.innerHTML = `
        <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.name}">
        <div class="product-info">
          <h3>${item.name}</h3>
          <p>₹${item.price}</p>
          <button class="remove-from-cart">Remove</button>
          <a href="#" class="order-now">Order Now</a>
        </div>
      `;
      cartGrid.appendChild(productCard);
    });
    console.log('Cart rendering complete');

    // Show payment status if cart is not empty and payment not verified
    const paymentStatus = getElement('payment-status');
    if (paymentStatus && !verifyPayment(getUserEmail()) && cart.length) {
      paymentStatus.style.display = 'block';
    } else if (paymentStatus) {
      paymentStatus.style.display = 'none';
    }
  }

  // Feedback Form (help.html)
  const form = getElement('feedback-form');
  const popup = getElement('thank-you-popup');
  const closeBtn = getElement('close-popup');
  if (form && popup && closeBtn) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = getElement('name')?.value;
      const email = getElement('email')?.value;
      const message = getElement('message')?.value;
      const rating = document.querySelector('input[name="rating"]:checked')?.value;
      if (!name || !email || !message) return alert('Please fill all fields');
      console.log('Feedback submitted:', { name, email, message, rating });
      form.reset();
      popup.style.display = 'flex';
    });
    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  }

  // COD Payment (cod.html)
  const codForm = getElement('cod-form');
  const successMsg = getElement('success-msg');
  if (codForm && successMsg) {
    codForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = codForm.querySelector('input[placeholder="Your Name"]')?.value;
      const address = codForm.querySelector('input[placeholder="Address"]')?.value;
      const phone = codForm.querySelector('input[placeholder="Phone Number"]')?.value;
      if (!name || !address || !phone) {
        const email = getUserEmail();
        if (email) recordPayment('COD', 'failed', email);
        return alert('Please fill all fields');
      }
      const email = getUserEmail();
      paymentConfirmed = true;
      localStorage.setItem('paymentConfirmed', JSON.stringify(paymentConfirmed));
      recordPayment('COD', 'success', email, cart);
      codForm.style.display = 'none';
      successMsg.style.display = 'block';
      console.log('COD order placed:', { name, address, phone });
    });
  }

  // Initialize
  if (['index.html', 'men.html', 'category.html'].includes(currentPage)) {
    if (getToken()) loadProducts();
    else if (authSection) authSection.style.display = 'block';
    else window.location.href = 'login.html';
  }
  if (currentPage === 'wishlist.html') renderWishlist();
  if (currentPage === 'yourcart.html') renderCart();
  if (currentPage === 'statement.html' && getUserEmail() === 'owner@example.com' && localStorage.getItem('ownerAuthenticated') === 'true') {
    renderStatement();
  }
});