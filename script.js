/* ==========================================================
   BASE CONFIG
========================================================== */
const BASE_URL = "https://shopeasy-backend-3-i96s.onrender.com";

/* ==========================================================
   NAVBAR – HAMBURGER
========================================================== */
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

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
   ADD TO CART (ALL PRODUCT PAGES)
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      res.ok ? alert("🛒 Added to cart") : alert(data.message || "Cart failed");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
});

/* ==========================================================
   WISHLIST – ADD (ALL PRODUCT PAGES)
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
        headers: { "Content-Type": "application/json" },
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
   WISHLIST PAGE – LOAD / REMOVE / MOVE TO CART
========================================================== */
const wishlistGrid = document.getElementById("wishlistGrid");
if (wishlistGrid) loadWishlist();

async function loadWishlist() {
  try {
    const res = await fetch(`${BASE_URL}/wishlist`);
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
        await fetch(`${BASE_URL}/wishlist/remove/${item.productId}`, { method: "DELETE" });
        loadWishlist();
      };

      div.querySelector(".move").onclick = async () => {
        await fetch(`${BASE_URL}/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...item, quantity: 1 })
        });
        await fetch(`${BASE_URL}/wishlist/remove/${item.productId}`, { method: "DELETE" });
        loadWishlist();
      };

      wishlistGrid.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================
   CART PAGE – LOAD / REMOVE / TOTAL
========================================================== */
const cartGrid = document.getElementById("cartGrid");
if (cartGrid) loadCart();

async function loadCart() {
  try {
    const res = await fetch(`${BASE_URL}/cart`);
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
        await fetch(`${BASE_URL}/cart/remove/${item.productId}`, { method: "DELETE" });
        loadCart();
      };

      cartGrid.appendChild(div);
    });

    const totalDiv = document.createElement("h2");
    totalDiv.innerText = `Total: ₹${total}`;
    cartGrid.appendChild(totalDiv);

  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================
   LOGIN & REGISTER (NO INLINE JS)
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
    } else alert(data.message || "Login failed");
  });
}

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

    const data = await res.json();
    res.ok ? alert("Registered successfully") : alert(data.message || "Register failed");
  });
}

/* ==========================================================
   COD ORDER
========================================================== */
const codForm = document.getElementById("cod-form");
if (codForm) {
  codForm.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      name: codForm.querySelector('input[placeholder="Your Name"]').value,
      address: codForm.querySelector('input[placeholder="Address"]').value,
      phone: codForm.querySelector('input[placeholder="Phone Number"]').value
    };

    const res = await fetch(`${BASE_URL}/order/cod`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    res.ok ? alert("Order placed successfully") : alert("Order failed");
  });
}

/* ==========================================================
   QR PAYMENT (DEMO FLOW)
========================================================== */
let qrScanned = false;
document.getElementById("scan-qr-btn")?.addEventListener("click", () => {
  qrScanned = true;
  alert("QR scanned (demo)");
});

document.getElementById("confirm-payment")?.addEventListener("click", () => {
  document.getElementById("qr-success-msg").style.display = qrScanned ? "block" : "none";
  document.getElementById("qr-failure-msg").style.display = qrScanned ? "none" : "block";
});

/* ==========================================================
   OWNER STATEMENT (ADMIN)
========================================================== */
const ownerForm = document.getElementById("owner-login-form");
if (ownerForm) {
  ownerForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = ownerForm.querySelector("#owner-email").value;
    const password = ownerForm.querySelector("#owner-password").value;

    const res = await fetch(`${BASE_URL}/owner/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("statement-section").style.display = "block";
      loadStatements();
    } else {
      document.getElementById("error-msg").style.display = "block";
    }
  });
}

async function loadStatements() {
  const res = await fetch(`${BASE_URL}/owner/statements`);
  const data = await res.json();
  const body = document.getElementById("statement-body");
  body.innerHTML = "";
  data.forEach(tx => {
    body.innerHTML += `
      <tr>
        <td>${tx.transactionId}</td>
        <td>${tx.email}</td>
        <td>${tx.paymentMethod}</td>
        <td>${tx.status}</td>
        <td>${new Date(tx.createdAt).toLocaleString()}</td>
        <td>${tx.items.map(i => i.name).join(", ")}</td>
      </tr>
    `;
  });
}
