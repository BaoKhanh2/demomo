// js/main.js - Main script cho trang chủ

// Function để hiển thị sản phẩm nổi bật trên trang chủ
async function displayFeaturedProducts() {
  try {
    console.log('🏠 Loading featured products for homepage...');
    
    // Thử load từ API mới trước
    try {
      const response = await fetch('http://localhost:8060/products?limit=6');
      if (response.ok) {
        const products = await response.json();
        console.log(`✅ Loaded ${products.length} featured products from new API`);
        displayProductCards(products.slice(0, 6)); // Chỉ hiển thị 6 sản phẩm đầu
        return;
      }
    } catch (newAPIError) {
      console.warn('⚠️ New API failed:', newAPIError.message);
      // Không hiển thị gì nếu API thất bại
    }
    
  } catch (error) {
    console.error('❌ Error loading featured products:', error);
  }
}

// Function để hiển thị card sản phẩm
function displayProductCards(products) {
  const container = document.getElementById('productContainer');
  if (!container) {
    console.error('❌ Không tìm thấy productContainer');
    return;
  }

  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  container.style.gap = '24px';
  container.style.padding = '20px 0';

  container.innerHTML = products.map(product => {
    const variant = product.variants?.[0] || {};
    return `
      <div class="product-card" style="
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
        cursor: pointer;
      " 
      onmouseover="this.style.transform='translateY(-5px)'"
      onmouseout="this.style.transform='translateY(0)'"
      onclick="navigateToProductDetail(${product.id})">
        
        <div class="product-image" style="
          width: 100%;
          height: 200px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        ">
          <img src="${product.imageUrl || './public/images/cart_logo.png'}" 
               alt="${product.name}"
               style="max-width: 100%; max-height: 100%; object-fit: cover;"
               onerror="this.src='./public/images/cart_logo.png'" />
        </div>
        
        <h3 style="
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
          height: 2.4em;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        ">${product.name}</h3>
        
        <p style="
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 16px;
          height: 2.7em;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        ">${product.description}</p>
        
        <div class="product-rating" style="margin-bottom: 12px;">
          <div style="color: #f39c12; font-size: 0.9rem;">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>
        </div>
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        ">
          <div>
            <span style="
              font-size: 1.3rem;
              font-weight: 700;
              color: #e74c3c;
            ">₫${(variant.price || 0).toLocaleString()}</span>
            ${variant.actualPrice ? `
              <br><span style="
                font-size: 0.9rem;
                color: #95a5a6;
                text-decoration: line-through;
              ">₫${variant.actualPrice.toLocaleString()}</span>
            ` : ''}
          </div>
          
          <div style="color: #28a745; font-size: 0.9rem;">
            <i class="fa-solid fa-check-circle"></i> Còn hàng
          </div>
        </div>
        
        <button style="
          width: 100%;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        " onclick="event.stopPropagation(); addToCart(${product.id})">
          <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ
        </button>
      </div>
    `;
  }).join('');
}

// Function để điều hướng đến trang chi tiết sản phẩm
function navigateToProductDetail(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

// Function để thêm vào giỏ hàng (placeholder)
function addToCart(productId) {
  console.log(`🛒 Adding product ${productId} to cart`);
  // TODO: Implement add to cart functionality
  alert(`Đã thêm sản phẩm ${productId} vào giỏ hàng!`);
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏠 Homepage loaded');
  displayFeaturedProducts();
});