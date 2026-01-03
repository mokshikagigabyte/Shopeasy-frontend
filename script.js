/* ==========================================================
   GLOBAL STATE MANAGEMENT
   Centralized state for user, cart, wishlist, orders
========================================================== */
const state = {
  user: null,          // {id, username, email}
  users: [],           // array of registered users
  products: [],        // loaded from mock data
  cart: [],            // array of {productId, quantity}
  wishlist: [],        // array of productId
  orders: []           // array of order objects
};

// Load state from localStorage
const loadState = () => {
  state.users = JSON.parse(localStorage.getItem('users')) || [];
  state.user = JSON.parse(localStorage.getItem('currentUser')) || null;
  state.cart = JSON.parse(localStorage.getItem('cart')) || [];
  state.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  state.orders = JSON.parse(localStorage.getItem('orders')) || [];
};

// Save state to localStorage
const saveState = () => {
  localStorage.setItem('users', JSON.stringify(state.users));
  localStorage.setItem('currentUser', JSON.stringify(state.user));
  localStorage.setItem('cart', JSON.stringify(state.cart));
  localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
  localStorage.setItem('orders', JSON.stringify(state.orders));
};

/* ==========================================================
   MOCK PRODUCTS DATA (Simulating API Response)
========================================================== */
const loadProducts = () => {
  state.products = [
    {
      id: 1, name: 'Men T-Shirt', category: 'Men',
      price: 499, image: 'images/men1.jpg', description: 'Comfortable cotton t-shirt'
    },
    {
      id: 2, name: 'Women Dress', category: 'Women',
      price: 1299, image: 'images/women1.jpg', description: 'Elegant summer dress'
    },
    {
      id: 3, name: 'Kids Sneakers', category: 'Kids',
      price: 799, image: 'images/kids1.jpg', description: 'Durable and stylish sneakers'
    }
    // TODO: Add more products or fetch from backend
  ];
};

/* ==========================================================
   AUTH FUNCTIONS
========================================================== */
const Auth = (() => {

  // REGISTER
  const register = ({username, email, password}) => {
    if(state.users.find(u => u.email === email)){
      return {success:false, message:'Email already registered'};
    }
    const id = Date.now();
    const newUser = {id, username, email, password};
    state.users.push(newUser);
    saveState();
    return {success:true, user:newUser};
  };

  // LOGIN
  const login = ({email, password}) => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if(user){
      state.user = user;
      saveState();
      return {success:true, user};
    }
    return {success:false, message:'Invalid credentials'};
  };

  // LOGOUT
  const logout = () => {
    state.user = null;
    saveState();
  };

  // SESSION CHECK
  const isLoggedIn = () => !!state.user;

  return {register, login, logout, isLoggedIn};
})();

/* ==========================================================
   PRODUCT FUNCTIONS
========================================================== */
const Product = (() => {

  // FILTER PRODUCTS BY CATEGORY
  const filterByCategory = (category) => {
    if(category === 'all') return state.products;
    return state.products.filter(p => p.category === category);
  };

  // RENDER PRODUCTS TO PAGE
  const renderProducts = (containerSelector, category='all') => {
    const container = document.querySelector(containerSelector);
    if(!container) return;
    const products = filterByCategory(category);
    container.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <div class="product-info">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p>₹${p.price}</p>
          <button class="add-to-cart" data-id="${p.id}">Add to Cart</button>
          <button class="wishlist-btn" data-id="${p.id}">
            ${state.wishlist.includes(p.id)? 'Remove Wishlist' : 'Add Wishlist'}
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  };

  return {renderProducts, filterByCategory};
})();

/* ==========================================================
   CART FUNCTIONS
========================================================== */
const Cart = (() => {

  const addToCart = (productId) => {
    const item = state.cart.find(i => i.productId === productId);
    if(item){
      item.quantity++;
    } else {
      state.cart.push({productId, quantity:1});
    }
    saveState();
    renderCart();
  };

  const removeFromCart = (productId) => {
    state.cart = state.cart.filter(i => i.productId !== productId);
    saveState();
    renderCart();
  };

  const updateQuantity = (productId, qty) => {
    const item = state.cart.find(i => i.productId === productId);
    if(item){
      item.quantity = qty;
      if(item.quantity <= 0) removeFromCart(productId);
      saveState();
      renderCart();
    }
  };

  const calculateTotal = () => {
    return state.cart.reduce((acc,i)=>{
      const prod = state.products.find(p=>p.id===i.productId);
      return acc + (prod.price * i.quantity);
    },0);
  };

  const renderCart = () => {
    const container = document.querySelector('#cart-items');
    if(!container) return;
    container.innerHTML = '';
    state.cart.forEach(item => {
      const product = state.products.find(p=>p.id===item.productId);
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <span>${product.name}</span>
        <span>₹${product.price}</span>
        <input type="number" value="${item.quantity}" min="1" data-id="${product.id}" class="qty-input">
        <button class="remove-cart" data-id="${product.id}">Remove</button>
      `;
      container.appendChild(row);
    });
    const totalEl = document.querySelector('#cart-total');
    if(totalEl) totalEl.textContent = `Total: ₹${calculateTotal()}`;
  };

  return {addToCart, removeFromCart, updateQuantity, renderCart, calculateTotal};
})();

/* ==========================================================
   WISHLIST FUNCTIONS
========================================================== */
const Wishlist = (() => {

  const toggleWishlist = (productId) => {
    if(state.wishlist.includes(productId)){
      state.wishlist = state.wishlist.filter(id=>id!==productId);
    } else {
      state.wishlist.push(productId);
    }
    saveState();
    renderWishlist();
  };

  const renderWishlist = () => {
    const container = document.querySelector('#wishlist-items');
    if(!container) return;
    container.innerHTML = '';
    state.wishlist.forEach(id=>{
      const product = state.products.find(p=>p.id===id);
      const row = document.createElement('div');
      row.className = 'wishlist-item';
      row.innerHTML = `
        <span>${product.name}</span>
        <span>₹${product.price}</span>
        <button class="remove-wishlist" data-id="${id}">Remove</button>
      `;
      container.appendChild(row);
    });
  };

  return {toggleWishlist, renderWishlist};
})();

/* ==========================================================
   ORDER & CHECKOUT FUNCTIONS
========================================================== */
const Order = (() => {

  const createOrder = (paymentMethod='COD') => {
    if(!state.user || state.cart.length === 0) return null;
    const id = `ORD${Date.now()}`;
    const items = state.cart.map(i=>({productId:i.productId, quantity:i.quantity}));
    const total = Cart.calculateTotal();
    const order = {id, userId: state.user.id, items, total, paymentMethod, timestamp: new Date().toISOString(), status:'Pending'};
    state.orders.push(order);
    state.cart = [];
    saveState();
    Cart.renderCart();
    return order;
  };

  const renderStatement = () => {
    const container = document.querySelector('#statement-body');
    if(!container) return;
    container.innerHTML = '';
    state.orders.forEach(o=>{
      const user = state.users.find(u=>u.id===o.userId);
      const itemsDesc = o.items.map(i=>{
        const p = state.products.find(prod=>prod.id===i.productId);
        return `${p.name} (x${i.quantity})`;
      }).join(', ');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${o.id}</td>
        <td>${user.email}</td>
        <td>${o.paymentMethod}</td>
        <td>${o.status}</td>
        <td>${new Date(o.timestamp).toLocaleString()}</td>
        <td>${itemsDesc}</td>
      `;
      container.appendChild(row);
    });
  };

  return {createOrder, renderStatement};
})();

/* ==========================================================
   PAGE-AWARE INIT
========================================================== */
const initPage = () => {
  loadState();
  loadProducts();

  const page = document.body.dataset.page; // set <body data-page="home">
  
  try{
    switch(page){
      case 'index':
      case 'category':
      case 'Men':
      case 'Women':
      case 'Kids':
        Product.renderProducts('#product-container', page==='index'?'all':page);
        break;
      case 'yourcart':
        Cart.renderCart();
        break;
      case 'wishlist':
        Wishlist.renderWishlist();
        break;
      case 'login':
        initAuthForms();
        break;
      case 'statement':
        Order.renderStatement();
        break;
      case 'order':
      case 'cod':
      case 'qr':
        renderCheckoutPage();
        break;
      case 'help':
        // optional help scripts
        break;
      default:
        break;
    }

    initGlobalEvents();
  } catch(err){
    console.error('Page init error:', err);
  }
};

/* ==========================================================
   GLOBAL EVENT LISTENERS
========================================================== */
const initGlobalEvents = () => {
  // PRODUCT BUTTONS
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = parseInt(e.target.dataset.id);
      Cart.addToCart(id);
    });
  });

  document.querySelectorAll('.wishlist-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = parseInt(e.target.dataset.id);
      Wishlist.toggleWishlist(id);
      e.target.textContent = state.wishlist.includes(id)? 'Remove Wishlist':'Add Wishlist';
    });
  });

  // CART QUANTITY CHANGE
  document.querySelectorAll('.qty-input').forEach(input=>{
    input.addEventListener('change', e=>{
      const id = parseInt(e.target.dataset.id);
      const qty = parseInt(e.target.value);
      Cart.updateQuantity(id, qty);
    });
  });

  // CART REMOVE BUTTONS
  document.querySelectorAll('.remove-cart').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = parseInt(e.target.dataset.id);
      Cart.removeFromCart(id);
    });
  });

  // WISHLIST REMOVE BUTTONS
  document.querySelectorAll('.remove-wishlist').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = parseInt(e.target.dataset.id);
      Wishlist.toggleWishlist(id);
    });
  });

  // LOGOUT BUTTON (if exists)
  const logoutBtn = document.querySelector('#logout-btn');
  if(logoutBtn) logoutBtn.addEventListener('click', ()=>{ Auth.logout(); location.reload(); });
};

/* ==========================================================
   AUTH FORM INIT
========================================================== */
const initAuthForms = () => {
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');

  // LOGIN
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const email = document.querySelector('#login-email').value.trim();
      const password = document.querySelector('#login-password').value.trim();
      const res = Auth.login({email, password});
      if(res.success){
        alert('Login successful!');
        location.href = 'index.html';
      } else {
        alert(res.message);
      }
    });
  }

  // REGISTER
  if(registerForm){
    registerForm.addEventListener('submit', e=>{
      e.preventDefault();
      const username = document.querySelector('#register-username').value.trim();
      const email = document.querySelector('#register-email').value.trim();
      const password = document.querySelector('#register-password').value.trim();
      const res = Auth.register({username,email,password});
      if(res.success){
        alert('Registration successful! Please login.');
        location.href = 'login.html';
      } else {
        alert(res.message);
      }
    });
  }
};

/* ==========================================================
   CHECKOUT PAGE RENDER
========================================================== */
const renderCheckoutPage = () => {
  const container = document.querySelector('#checkout-container');
  if(!container) return;
  container.innerHTML = `
    <h2>Order Summary</h2>
    <div id="checkout-items"></div>
    <p id="checkout-total">Total: ₹${Cart.calculateTotal()}</p>
    <button id="checkout-cod">Pay with COD</button>
    <button id="checkout-qr">Pay with QR</button>
  `;
  const itemsContainer = document.querySelector('#checkout-items');
  state.cart.forEach(item=>{
    const product = state.products.find(p=>p.id===item.productId);
    const div = document.createElement('div');
    div.textContent = `${product.name} x${item.quantity} - ₹${product.price*item.quantity}`;
    itemsContainer.appendChild(div);
  });

  document.querySelector('#checkout-cod').addEventListener('click', ()=>{
    const order = Order.createOrder('COD');
    if(order) alert(`Order ${order.id} placed with COD!`);
    location.href = 'statement.html';
  });

  document.querySelector('#checkout-qr').addEventListener('click', ()=>{
    const order = Order.createOrder('QR');
    if(order) alert(`Order ${order.id} placed with QR!`);
    location.href = 'qr.html';
  });
};

/* ==========================================================
   INIT SCRIPT
========================================================== */
document.addEventListener('DOMContentLoaded', initPage);
