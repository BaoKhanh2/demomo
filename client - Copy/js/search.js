// js/search.js - Chức năng tìm kiếm sản phẩm

// Function tìm kiếm sản phẩm
async function searchProducts(searchTerm) {
  try {
    console.log(`🔍 Searching for: ${searchTerm}`);
    
    if (!searchTerm || searchTerm.trim() === '') {
      // Nếu không có từ khóa, load lại tất cả sản phẩm
      if (typeof loadProductsFromNewAPI === 'function') {
        await loadProductsFromNewAPI();
      }
      return;
    }

    // Thử tìm kiếm từ API mới trước
    try {
      const response = await fetch(`http://localhost:8060/products?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const products = await response.json();
        console.log(`✅ Found ${products.length} products from new API`);
        
        if (typeof displayProductsFromNewAPI === 'function') {
          await displayProductsFromNewAPI(products);
        } else {
          displaySearchResults(products);
        }
        return;
      }
    } catch (newAPIError) {
      console.warn('⚠️ New API search failed:', newAPIError.message);
      showSearchError();
    }
  } catch (error) {
    console.error('❌ Search error:', error);
    showSearchError();
  }
}

// Function hiển thị kết quả tìm kiếm
function displaySearchResults(products) {
  const container = document.getElementById('featuredProductContainer') || document.getElementById('productContainer');
  if (!container) {
    console.error('❌ Không tìm thấy container để hiển thị kết quả tìm kiếm');
    return;
  }

  // Cập nhật tiêu đề
  const heading = document.querySelector('.section-common--heading');
  if (heading) {
    heading.textContent = `Kết quả tìm kiếm (${products.length} sản phẩm)`;
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div style="
        text-align: center;
        padding: 60px 20px;
        grid-column: 1 / -1;
      ">
        <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
        <h3 style="color: #666; margin-bottom: 10px;">Không tìm thấy sản phẩm</h3>
        <p style="color: #999;">Hãy thử tìm kiếm với từ khóa khác</p>
      </div>
    `;
    return;
  }

  // Hiển thị sản phẩm
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  container.style.gap = '24px';
  container.style.padding = '20px 0';

  container.innerHTML = products.map(product => `
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
    onclick="window.location.href='product-detail.html?id=${product.id}'">
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
      
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span style="
          font-size: 1.3rem;
          font-weight: 700;
          color: #e74c3c;
        ">₫${(product.variants?.[0]?.price || 0).toLocaleString()}</span>
        
        <button style="
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
        ">
          <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Function hiển thị lỗi tìm kiếm
function showSearchError() {
  const container = document.getElementById('featuredProductContainer') || document.getElementById('productContainer');
  if (container) {
    container.innerHTML = `
      <div style="
        text-align: center;
        padding: 60px 20px;
        grid-column: 1 / -1;
      ">
        <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
        <h3 style="color: #e74c3c; margin-bottom: 10px;">Lỗi tìm kiếm</h3>
        <p style="color: #999;">Không thể kết nối đến server</p>
      </div>
    `;
  }
}

// Khởi tạo tìm kiếm khi trang load
function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  
  if (searchInput && searchButton) {
    // Xử lý khi nhấn nút tìm kiếm
    searchButton.addEventListener('click', () => {
      const searchTerm = searchInput.value.trim();
      searchProducts(searchTerm);
    });
    
    // Xử lý khi nhấn Enter
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        searchProducts(searchTerm);
      }
    });
    
    // Tìm kiếm realtime (tùy chọn)
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length >= 2) {
          searchProducts(searchTerm);
        } else if (searchTerm.length === 0) {
          // Load lại tất cả sản phẩm khi xóa hết từ khóa
          if (typeof loadProductsFromNewAPI === 'function') {
            loadProductsFromNewAPI();
          }
        }
      }, 500); // Delay 500ms để tránh gọi API quá nhiều
    });
    
    console.log('✅ Search functionality initialized');
  }
}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', initializeSearch);