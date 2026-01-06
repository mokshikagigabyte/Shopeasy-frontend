
/* ==========================================================
   BASE CONFIG
========================================================== */
const BASE_URL = "https://shopeasy-backend-3-i96s.onrender.com";

/* ==========================================================
   AUTH GUARD (RUN AFTER DOM LOAD)
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const isAuthPage =
    location.pathname.includes("login.html") ||
    location.pathname.includes("register.html");

  const token = localStorage.getItem("token");

  if (!token && !isAuthPage) {
    location.href = "login.html";
  }
});

/* ==========================================================
   SEARCH (FRONTEND FILTER)
========================================================== */
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

if (searchInput && searchResults) {
  const products = document.querySelectorAll(".product-card");

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    searchResults.innerHTML = "";

    if (!value) {
      searchResults.style.display = "none";
      return;
    }

    products.forEach(p => {
      const name = p.dataset.name?.toLowerCase();
      if (name && name.includes(value)) {
        const div = document.createElement("div");
        div.className = "search-item";
        div.textContent = p.dataset.name;
        div.onclick = () => {
          p.scrollIntoView({ behavior: "smooth" });
          searchResults.style.display = "none";
          searchInput.value = "";
        };
        searchResults.appendChild(div);
        searchResults.style.display = "block";
      }
    });
  });
}

/* ==========================================================
   AUTH HEADER HELPER
========================================================== */
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  };
}

/* ==========================================================
   ADD TO CART
========================================================== */
document.querySelectorAll(".add-to-cart").forEach(btn => {
  btn.addEventListener("click", async e => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const payload = {
      productId: card.dataset.id,
      name: card.dataset.name,
      price: card.dataset.price,
      image: card.dataset.image,
      quantity: 1
    };

    try {
      const res = await fetch(`${BASE_URL}/cart/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      res.ok ? alert("🛒 Added to cart") : alert(data.message || "Cart failed");
    } catch (err) {
      alert("Server error");
      console.error(err);
    }
  });
});

/* ==========================================================
   WISHLIST ADD
========================================================== */
document.querySelectorAll(".wishlist-icon").forEach(icon => {
  icon.addEventListener("click", async e => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const payload = {
      productId: card.dataset.id,
      name: card.dataset.name,
      price: card.dataset.price,
      image: card.dataset.image
    };

    try {
      const res = await fetch(`${BASE_URL}/wishlist/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        icon.classList.toggle("active");
        alert("❤️ Added to wishlist");
      }
    } catch (err) {
      console.error(err);
    }
  });
});

/* ==========================================================
   WISHLIST PAGE LOAD
========================================================== */
const wishlistGrid = document.getElementById("wishlistGrid");
if (wishlistGrid) loadWishlist();

async function loadWishlist() {
  const res = await fetch(`${BASE_URL}/wishlist`, {
    headers: authHeaders()
  });

  const items = await res.json();
  wishlistGrid.innerHTML = "";

  if (!items.length) {
    wishlistGrid.innerHTML = "<p>Your wishlist is empty ❤️</p>";
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "wishlist-card";
    div.innerHTML = `
      <img src="${item.image}">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <button class="remove">Remove</button>
      <button class="move">Move to Cart</button>
    `;

    div.querySelector(".remove").onclick = async () => {
      await fetch(`${BASE_URL}/wishlist/remove/${item.productId}`, {
        method: "DELETE",
        headers: authHeaders()
      });
      loadWishlist();
    };

    div.querySelector(".move").onclick = async () => {
      await fetch(`${BASE_URL}/cart/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...item, quantity: 1 })
      });
      await fetch(`${BASE_URL}/wishlist/remove/${item.productId}`, {
        method: "DELETE",
        headers: authHeaders()
      });
      loadWishlist();
    };

    wishlistGrid.appendChild(div);
  });
}

/* ==========================================================
   CART PAGE
========================================================== */
const cartGrid = document.getElementById("cartGrid");
if (cartGrid) loadCart();

async function loadCart() {
  const res = await fetch(`${BASE_URL}/cart`, {
    headers: authHeaders()
  });

  const items = await res.json();
  cartGrid.innerHTML = "";

  if (!items.length) {
    cartGrid.innerHTML = "<p>Your cart is empty 🛒</p>";
    return;
  }

  let total = 0;

  items.forEach(item => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.className = "cart-card";
    div.innerHTML = `
      <img src="${item.image}">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <p>Qty: ${item.quantity}</p>
      <button>Remove</button>
    `;

    div.querySelector("button").onclick = async () => {
      await fetch(`${BASE_URL}/cart/remove/${item.productId}`, {
        method: "DELETE",
        headers: authHeaders()
      });
      loadCart();
    };

    cartGrid.appendChild(div);
  });

  cartGrid.innerHTML += `<h2>Total: ₹${total}</h2>`;
}

/* ==========================================================
   LOGIN
========================================================== */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    
    const email = loginForm.querySelector("#login-email").value;
    const password = loginForm.querySelector("#login-password").value;

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful");
      location.href = "index.html";
    } else {
      alert(data.message || "Login failed");
    }
  });
}

/* ==========================================================
   REGISTER
========================================================== */
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async e => {
    e.preventDefault();
    
    const name = registerForm.querySelector("#register-username").value;
    const email = registerForm.querySelector("#register-email").value;
    const password = registerForm.querySelector("#register-password").value;

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (res.ok) {
      alert("Registered successfully. Please login.");
      location.href = "login.html";
    } else {
      const data = await res.json();
      alert(data.message || "Registration failed");
    }
  });
}

/* ==========================================================
   NAV TOGGLE
========================================================== */
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}
