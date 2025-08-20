// Backend URL
const BACKEND_URL = 'https://shopeasy-backend-5.onrender.com';

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
const generateUniqueId = () => `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Toggle between login and register forms
function toggleForm() {
  const loginForm = getElement('loginForm');
  const registerForm = getElement('registerForm');
  if (loginForm && registerForm) {
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    console.log('Toggled forms:', loginForm.classList.contains('hidden') ? 'Register form shown' : 'Login form shown');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize data
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
  let paymentStatement = JSON.parse(localStorage.getItem('paymentStatement') || '[]');
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  let paymentConfirmed = JSON.parse(localStorage.getItem('paymentConfirmed') || 'false');

  console.log('Initial state:', { cart, wishlist, paymentConfirmed, paymentStatement, currentPage, allProducts });

  // Authentication check for protected pages
  const protectedPages = ['home.html', 'men.html', 'category.html', 'yourcart.html', 'wishlist.html', 'qr.html', 'cod.html', 'help.html'];
  if (protectedPages.includes(currentPage) && !getToken()) {
    console.log('No token, redirecting to index.html');
    window.location.href = 'index.html';
    return;
  }

  // Owner authentication for statement.html
  if (currentPage === 'statement.html') {
    const ownerEmail = 'mokshika470@gmai.com'com'maicom'macom'mcom'com'com';
    const ownerPassword = 'admin123';
    const authSection = getElement('auth-section');
    const statementSection = getElement('statement-section');
    const ownerLoginForm = getElement('owner-login-form');
    const errorMsg = getElement('error-msg');

    if (authSection && statementSection) {
      if (getUserEmail() === ownerEmail && localStorage.getItem('ownerAuthenticated') === 'true') {
        authSection.style.display = 'none';
        statementSection.style.display = 'block';
        renderStatement();
      } else {
        authSection.style.display = 'block';
        statementSection.style.display = 'none';
        if (getUserEmail() && getUserEmail() !== ownerEmail) {
          console.log('Unauthorized access to statement.html by:', getUserEmail());
          if (errorMsg) {
            errorMsg.style.display = 'block';
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
          }
        }
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
          if (errorMsg) {
            errorMsg.style.display = 'block';
            setTimeout(() => { errorMsg.style.display = 'none'; }, 3000);
          }
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
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
      console.log('Menu toggled:', navLinks.classList.contains('active'));
    });
  }

  // Authentication (index.html)
  const loginFormElement = getElement('login-form');
  const registerFormElement = getElement('register-form');
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = getElement('login-email');
      const passwordInput = getElement('login-password');
      const email = emailInput?.value;
      const password = passwordInput?.value;
      if (!email || !password) {
        alert('Please enter email and password');
        console.error('Login failed: Missing email or password');
        return;
      }
      try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok && data.token) {
          localStorage.setItem('token', data.token);
          console.log('Login successful:', email);
          window.location.href = 'home.html';
        } else {
          alert(data.message || 'Invalid email or password');
          console.error('Login failed:', data.message || 'Invalid credentials');
        }
      } catch (error) {
        alert('Error connecting to server');
        console.error('Login error:', error);
      }
    });
  }
  if (registerFormElement) {
    registerFormElement.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = getElement('register-username');
      const emailInput = getElement('register-email');
      const passwordInput = getElement('register-password');
      const username = usernameInput?.value;
      const email = emailInput?.value;
      const password = passwordInput?.value;
      if (!username || !email || !password) {
        alert('Please enter username, email, and password');
        console.error('Registration failed: Missing fields');
        return;
      }
      try {
        const response = await fetch(`${BACKEND_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok && data.token) {
          localStorage.setItem('token', data.token);
          console.log('Registration successful:', email);
          window.location.href = 'home.html';
        } else {
          alert(data.message || 'Email already registered');
          console.error('Registration failed:', data.message || 'Email exists');
        }
      } catch (error) {
        alert('Error connecting to server');
        console.error('Registration error:', error);
      }
    });
  }

  // Load products from all pages
  function loadProducts(query = '') {
    const productPages = ['home.html', 'men.html', 'category.html'];
    if (productPages.includes(currentPage) && !query) {
      const productGrids = document.querySelectorAll('.product-grid');
      if (!productGrids.length) {
        console.warn(`No product grids on ${currentPage}`);
        return;
      }

      const products = [];
      productGrids.forEach(grid => {
        const productCards = grid.querySelectorAll('.product-card');
        productCards.forEach(card => {
          const id = card.dataset.id || generateUniqueId();
          const wishlistIcon = card.querySelector('.wishlist-icon');
          const name = card.querySelector('h3')?.textContent.trim() || 'Unnamed Product';
          const price = parseFloat(card.querySelector('p')?.textContent.replace(/[^0-9.]/g, '')) || 0;
          const image = card.querySelector('img')?.src || 'https://via.placeholder.com/150';
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
      });
      allProducts = [...new Map([...allProducts, ...products].map(p => [p.id, p])).values()];
      localStorage.setItem('allProducts', JSON.stringify(allProducts));
      console.log('Loaded products from', currentPage, ':', products.length, 'Total products:', allProducts.length);
    }

    if (query) {
      const searchResults = getElement('searchResults');
      if (!searchResults) return console.error('searchResults not found');
      searchResults.innerHTML = '';
      const targetGrid = document.createElement('div');
      targetGrid.classList.add('product-grid');
      searchResults.appendChild(targetGrid);

      const filteredProducts = allProducts.filter(product =>
        (product.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (product.price?.toString().toLowerCase() || '').includes(query.toLowerCase())
      );

      if (filteredProducts.length) {
        searchResults.innerHTML = `<p>${filteredProducts.length} result(s) found.</p>`;
        filteredProducts.forEach(product => {
          const isInCart = cart.some(item => item.id === product.id);
          const card = document.createElement('div');
          card.className = 'product-card';
          card.dataset.id = product.id;
          card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>₹${product.price}</p>
              <button class="add-to-cart" ${ isInCart ? 'disabled' : '' }>${ isInCart ? 'In Cart' : 'Add to Cart' }</button>
              <a href="#" class="order-now">Order Now</a>
              <i class="fas fa-heart wishlist-icon${wishlist.some(item => item.id === product.id) ? ' active' : ''}" 
                 data-id="${product.id}" 
                 data-name="${product.name}" 
                 data-price="${product.price}" 
                 data-image="${product.image}"></i>
            </div>
          `;
          targetGrid.appendChild(card);
        });
        searchResults.classList.add('active');
        console.log('Filtered products:', filteredProducts);
      } else {
        searchResults.innerHTML = '<p>No results found.</p>';
        searchResults.classList.add('active');
        console.log('No products found for query:', query);
      }
      updateWishlistIcons();
    }
  }

  // Update wishlist icon states
  function updateWishlistIcons() {
    document.querySelectorAll('.wishlist-icon').forEach(icon => {
      if (icon.dataset.id) {
        icon.classList.toggle('active', wishlist.some(item => item.id === icon.dataset.id));
      }
    });
    console.log('Updated wishlist icons:', wishlist);
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

  // Folding sections
  if (['men.html', 'category.html'].includes(currentPage)) {
    const sectionTitles = document.querySelectorAll('.section-title');
    console.log('Found section titles:', sectionTitles.length);
    sectionTitles.forEach(title => {
      title.addEventListener('click', () => {
        const section = title.closest('.product-container');
        if (!section) {
          console.warn('No product-container for section:', title.textContent);
          return;
        }
        const productGrid = section.querySelector('.product-grid');
        if (!productGrid) {
          console.warn('No product-grid in section:', title.textContent);
          return;
        }
        section.classList.toggle('active');
        productGrid.style.display = section.classList.contains('active') ? 'grid' : 'none';
        console.log(`Toggled section: ${title.textContent}, Active: ${section.classList.contains('active')}`);
      });
    });
  }

  // Feedback Form (help.html)
  const feedbackForm = getElement('feedback-form');
  const feedbackSuccessMsg = getElement('success-msg');
  if (feedbackForm && feedbackSuccessMsg) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = getElement('feedback-name')?.value;
      const email = getElement('feedback-email')?.value;
      const message = getElement('feedback-message')?.value;
      if (!name || !email || !message) {
        alert('Please fill all feedback fields');
        console.error('Feedback submission failed: Missing fields');
        return;
      }
      feedbackForm.style.display = 'none';
      feedbackSuccessMsg.style.display = 'block';
      console.log('Feedback submitted:', { name, email, message });
      setTimeout(() => {
        feedbackSuccessMsg.style.display = 'none';
        feedbackForm.style.display = 'block';
        feedbackForm.reset();
      }, 3000);
    });
  }

  // Event delegation for cart, wishlist, and order
  document.addEventListener('click', (e) => {
    const target = e.target;
    const productCard = target.closest('.product-card');
    if (productCard) {
      const id = productCard.dataset.id || generateUniqueId();
      const name = productCard.querySelector('h3')?.textContent.trim() || 'Unnamed Product';
      const price = parseFloat(productCard.querySelector('p')?.textContent.replace(/[^0-9.]/g, '')) || 0;
      const image = productCard.querySelector('img')?.src || 'https://via.placeholder.com/150';
      const product = { id, name, price, image };

      // Wishlist
      if (target.classList.contains('wishlist-icon')) {
        e.preventDefault();
        if (!id || !image || image.startsWith('content://')) {
          console.warn('Invalid wishlist item:', product);
          alert('Cannot add to wishlist: Invalid product data');
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
      if (target.classList.contains('add-to-cart') && !target.disabled) {
        e.preventDefault();
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
          if (currentPage === 'yourcart.html') renderCart();
          loadProducts(document.querySelector('#searchInput')?.value || '');
        } else {
          alert(`${name} is already in your cart.`);
        }
      }

      // Remove from Cart
      if (target.classList.contains('remove-from-cart') && currentPage === 'yourcart.html') {
        e.preventDefault();
        const index = cart.findIndex(item => item.id === id);
        if (index !== -1) {
          cart.splice(index, 1);
          localStorage.setItem('cart', JSON.stringify(cart));
          alert(`${name} removed from cart!`);
          console.log('Removed from cart:', id);
          renderCart();
          loadProducts(document.querySelector('#searchInput')?.value || '');
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
        console.log(`Order placed for: ${cart.map(item => item.name).join(', ')}`);
        const successMsg = getElement('success-msg');
        if (successMsg) {
          successMsg.style.display = 'block';
          setTimeout(() => { successMsg.style.display = 'none'; }, 3000);
        }
        const latestPayment = paymentStatement
          .filter(record => record.email === email)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        if (latestPayment && !latestPayment.items) {
          latestPayment.items = [...cart];
          localStorage.setItem('paymentStatement', JSON.stringify(paymentStatement));
        }
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
      if (qrUpload) qrUpload.click();
    }

    // Navbar link click
    if (target.tagName === 'A' && navLinks?.classList.contains('active')) {
      navLinks.classList.remove('active');
      const icon = hamburger?.querySelector('i');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
      }
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

  // QR Code Scanning
  if (currentPage === 'qr.html') {
    const qrUpload = getElement('qr-upload');
    const confirmPaymentBtn = getElement('confirm-payment');
    const successMsg = getElement('success-msg');
    const failureMsg = getElement('failure-msg');
    const qrSection = getElement('qr-section');
    const statementLink = getElement('statement');

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
                if (statementLink) statementLink.style.display = 'block';
                console.log('QR payment confirmed automatically');
              } else {
                console.warn('Invalid QR code:', code?.data);
                recordPayment('QR', 'failed', email);
                if (failureMsg) {
                  failureMsg.style.display = 'block';
                  setTimeout(() => { failureMsg.style.display = 'none'; }, 3000);
                }
                alert('Invalid QR code. Please try again.');
              }
            } catch (error) {
              console.error('Error scanning QR code:', error);
              recordPayment('QR', 'failed', email);
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

      confirmPaymentBtn.addEventListener('click', () => {
        const email = getUserEmail();
        paymentConfirmed = true;
        localStorage.setItem('paymentConfirmed', JSON.stringify(paymentConfirmed));
        recordPayment('QR', 'success', email, cart);
        qrSection.style.display = 'none';
        confirmPaymentBtn.style.display = 'none';
        successMsg.style.display = 'block';
        if (statementLink) statementLink.style.display = 'block';
        console.log('QR payment confirmed manually');
      });
    }
  }

  // COD Payment
  const codForm = getElement('cod-form');
  const codSuccessMsg = getElement('success-msg');
  const statementLink = getElement('statement');
  if (codForm && codSuccessMsg) {
    codForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = codForm.querySelector('input[placeholder="Your Name"]')?.value;
      const address = codForm.querySelector('input[placeholder="Address"]')?.value;
      const phone = codForm.querySelector('input[placeholder="Phone Number"]')?.value;
      const email = getUserEmail();
      if (!name || !address || !phone) {
        if (email) recordPayment('COD', 'failed', email);
        alert('Please fill all fields');
        return;
      }
      paymentConfirmed = true;
      localStorage.setItem('paymentConfirmed', JSON.stringify(paymentConfirmed));
      recordPayment('COD', 'success', email, cart);
      codForm.style.display = 'none';
      codSuccessMsg.style.display = 'block';
      if (statementLink) statementLink.style.display = 'block';
      console.log('COD order placed:', { name, address, phone });
    });
  }

  // Search Functionality
  const searchInput = getElement('searchInput');
  const searchResults = getElement('searchResults');
  if (searchInput && searchResults) {
    function filterAndInsertProducts() {
      const query = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';
      searchResults.classList.remove('active');

      if (!query) {
        console.log('Cleared search results');
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
          const isInCart = cart.some(item => item.id === product.id);
          const card = document.createElement('div');
          card.classList.add('product-card');
          card.dataset.id = product.id;
          card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>₹${product.price}</p>
              <button class="add-to-cart" ${isInCart ? 'disabled' : ''}>${isInCart ? 'In Cart' : 'Add to Cart'}</button>
              <a href="#" class="order-now">Order Now</a>
              <i class="fas fa-heart wishlist-icon${wishlist.some(item => item.id === product.id) ? ' active' : ''}" 
                 data-id="${product.id}" 
                 data-name="${product.name}" 
                 data-price="${product.price}" 
                 data-image="${product.image}"></i>
            </div>
          `;
          targetGrid.appendChild(card);
        });
        searchResults.classList.add('active');
        console.log('Filtered products:', filteredProducts);
      } else {
        searchResults.innerHTML = '<p>No results found.</p>';
        searchResults.classList.add('active');
        console.log('No products found for query:', query);
      }
      updateWishlistIcons();
    }

    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(filterAndInsertProducts, 300);
    });
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') filterAndInsertProducts();
    });

    document.addEventListener('click', (e) => {
      if (!searchResults.contains(e.target) && !searchInput.contains(e.target) && !e.target.classList.contains('fa-search')) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('active');
        console.log('Closed search results');
      }
    });
  }

  // Render Wishlist
  function renderWishlist() {
    const wishlistGrid = getElement('wishlistGrid');
    if (!wishlistGrid) return console.error('wishlistGrid not found');

    wishlistGrid.innerHTML = '';
    if (!wishlist.length) {
      wishlistGrid.innerHTML = '<p>Your wishlist is empty.</p>';
      return;
    }

    wishlist.forEach(item => {
      const isInCart = cart.some(cartItem => cartItem.id === item.id);
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.dataset.id = item.id;
      productCard.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="product-info">
          <h3>${item.name}</h3>
          <p>₹${item.price}</p>
          <button class="add-to-cart" ${isInCart ? 'disabled' : ''}>${isInCart ? 'In Cart' : 'Add to Cart'}</button>
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
    console.log('Rendered wishlist:', wishlist);
  }

  // Render Cart
  function renderCart() {
    const cartGrid = getElement('cartGrid');
    if (!cartGrid) return console.error('cartGrid not found');

    cartGrid.innerHTML = '';
    if (!cart.length) {
      cartGrid.innerHTML = '<p>Your cart is empty.</p>';
      console.log('Cart is empty');
      const paymentStatus = getElement('payment-status');
      if (paymentStatus) paymentStatus.style.display = 'none';
      return;
    }

    cart.forEach(item => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.dataset.id = item.id;
      productCard.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="product-info">
          <h3>${item.name}</h3>
          <p>₹${item.price}</p>
          <button class="remove-from-cart">Remove from Cart</button>
          <a href="#" class="order-now">Order Now</a>
        </div>
      `;
      cartGrid.appendChild(productCard);
    });
    const paymentStatus = getElement('payment-status');
    if (paymentStatus && !verifyPayment(getUserEmail()) && cart.length) {
      paymentStatus.style.display = 'block';
    } else if (paymentStatus) {
      paymentStatus.style.display = 'none';
    }
    console.log('Rendered cart:', cart);
  }

  // Initialize
  if (['home.html', 'men.html', 'category.html'].includes(currentPage)) {
    if (getToken()) {
      loadProducts();
      const productContainers = document.querySelectorAll('.product-container');
      if (productContainers.length && ['men.html', 'category.html'].includes(currentPage)) {
        productContainers.forEach(container => {
          container.classList.add('active');
          const productGrid = container.querySelector('.product-grid');
          if (productGrid) productGrid.style.display = 'grid';
        });
      }
    } else {
      window.location.href = 'index.html';
    }
  }
  if (currentPage === 'wishlist.html') renderWishlist();
  if (currentPage === 'yourcart.html') renderCart();
  if (currentPage === 'statement.html' && getUserEmail() === 'owner@example.com' && localStorage.getItem('ownerAuthenticated') === 'true') {
    renderStatement();
  }
});
