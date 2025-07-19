// js/product-detail.js

// Lấy id sản phẩm từ URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Gọi API lấy chi tiết sản phẩm và render ra giao diện
async function loadProductDetail() {
  const id = getProductIdFromUrl();
  if (!id) {
    document.getElementById('productDetailContainer').innerHTML = '<p>Không tìm thấy sản phẩm!</p>';
    return;
  }
  try {
    const res = await fetch(`http://localhost:8000/product/products/${id}`);
    if (!res.ok) throw new Error('Không lấy được chi tiết sản phẩm!');
    const data = await res.json();
    const product = data.result;
    document.getElementById('productDetailContainer').innerHTML = `
      <div class="cards" style="max-width:420px;margin:0 auto;">
        <article class="information card">
          <span class="category">${product.categoryName || ''}</span>
          <div class="imageContainer">
            <img class="productImage" src="${product.imageUrl || './public/images/cart_logo.png'}" alt="${product.name}" />
          </div>
          <h2 class="productName">${product.name}</h2>
          <div class="productRating">
            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
          </div>
          <p class="productDescription">${product.description || ''}</p>
          <div class="productPriceElement">
            <p class="productPrice">₫${product.variants?.[0]?.price?.toLocaleString() || 0}</p>
            <p class="productActualPrice">₫${product.variants?.[0]?.actualPrice?.toLocaleString() || 0}</p>
          </div>
          <div class="productStockElement">
            <p class="productProperty">Total Stocks Available:</p>
            <p class="productStock">${product.variants?.[0]?.stock || 0}</p>
          </div>
        </article>
      </div>
    `;
  } catch (err) {
    document.getElementById('productDetailContainer').innerHTML = '<p>Lỗi khi tải chi tiết sản phẩm!</p>';
  }
}

window.addEventListener('DOMContentLoaded', loadProductDetail);
