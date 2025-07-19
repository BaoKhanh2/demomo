// js/connect-products.js

// Function tạo sản phẩm mẫu khi API không hoạt động
function createSampleProducts() {
  return [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      description: "Điện thoại thông minh cao cấp với chip A17 Pro",
      imageUrl: "./public/images/iphone.png",
      variants: [{ price: 29990000, stock: 50 }]
    },
    {
      id: 2,
      name: "MacBook Pro 16 inch",
      description: "Laptop hiệu năng cao cho chuyên gia",
      imageUrl: "./public/images/laptop.png",
      variants: [{ price: 59990000, stock: 30 }]
    },
    {
      id: 3,
      name: "AirPods Pro 2",
      description: "Tai nghe không dây chống ồn tốt nhất",
      imageUrl: "./public/images/headphone.png",
      variants: [{ price: 6990000, stock: 100 }]
    },
    {
      id: 4,
      name: "Apple Watch Series 9",
      description: "Đồng hồ thông minh với tính năng sức khỏe tiên tiến",
      imageUrl: "./public/images/watch.png",
      variants: [{ price: 9990000, stock: 75 }]
    }
  ];
}

async function loadProducts() {
  try {
    console.log("🔄 Bắt đầu tải sản phẩm...");
    
    let products = [];
    
    try {
      // Bước 1: Lấy danh sách categories
      console.log("📂 Lấy danh sách categories...");
      const categoriesRes = await fetch(`http://localhost:8000/product/categories/tree`);
      if (!categoriesRes.ok) throw new Error("❌ Lỗi khi gọi API categories: " + categoriesRes.status);
      
      const categoriesData = await categoriesRes.json();
      const categories = Array.isArray(categoriesData.result) ? categoriesData.result : [];
      console.log("✅ Tìm thấy", categories.length, "categories:", categories.map(c => `${c.id}:${c.name || c.id}`));
      
      // Bước 2: Lấy sản phẩm từ TẤT CẢ categories
      let allProducts = [];
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`🔍 Lấy sản phẩm từ category ${i + 1}/${categories.length}: ${category.id} (${category.name || 'No name'})`);
        
        try {
          const res = await fetch(`http://localhost:8000/product/products/category/${category.id}`);
          if (res.ok) {
            const data = await res.json();
            const categoryProducts = Array.isArray(data.result) ? data.result : [];
            console.log(`  ✅ Category ${category.id}: ${categoryProducts.length} sản phẩm`);
            allProducts = allProducts.concat(categoryProducts);
          } else {
            console.log(`  ❌ Category ${category.id}: Error ${res.status}`);
          }
        } catch (err) {
          console.warn(`  ⚠️ Category ${category.id}: ${err.message}`);
        }
      }
      
      // Bước 3: Loại bỏ sản phẩm trùng lặp (nếu có)
      products = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      console.log("🎯 Tổng cộng:", allProducts.length, "sản phẩm,", products.length, "sản phẩm duy nhất");
      
    } catch (err) {
      console.error("❌ API không hoạt động:", err);
      products = createSampleProducts();
      console.log("🎭 Sử dụng", products.length, "sản phẩm mẫu");
    }
    
    console.log("🎨 Hiển thị", products.length, "sản phẩm");
    
    // Hiển thị sản phẩm ở phần chính
    const container = document.getElementById("productContainer");
    const template = document.getElementById("productTemplate");
    
    if (!container) {
      console.error("❌ Không tìm thấy productContainer!");
      return;
    }
    
    container.innerHTML = "";
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.gap = "24px";
    container.style.justifyContent = "center";
    
    if (products.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#888;font-size:1.2rem;width:100%;">Không có sản phẩm nào để hiển thị</p>';
      return;
    }
    
    products.forEach((product) => {
      // Nếu template chưa có nội dung, tạo card mặc định
      let clone;
      if (template && template.content && template.content.children.length > 0) {
        clone = template.content.cloneNode(true);
      } else {
        clone = document.createElement("div");
        clone.className = "cards";
        clone.style.border = "1px solid #eee";
        clone.style.borderRadius = "10px";
        clone.style.padding = "18px";
        clone.style.background = "#fff";
        clone.style.width = "240px";
        clone.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
        clone.style.cursor = "pointer";
        clone.style.margin = "0";
        clone.style.transition = "box-shadow 0.2s, transform 0.2s";
        clone.addEventListener('mouseenter', () => {
          clone.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
          clone.style.transform = "translateY(-4px) scale(1.03)";
        });
        clone.addEventListener('mouseleave', () => {
          clone.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
          clone.style.transform = "none";
        });
        clone.innerHTML = `
          <img class="productImage" src="${product.imageUrl || './public/images/cart_logo.png'}" alt="${product.name}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:12px;" />
          <h4 class="productName" style="margin:10px 0 6px;font-size:1.12rem;font-weight:600;color:#222;">${product.name}</h4>
          <p style="color:#888;font-size:1rem;margin-bottom:8px;">₫${product.variants?.[0]?.price?.toLocaleString() || 0}</p>
          <button style="background:#007bff;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-size:0.98rem;cursor:pointer;transition:background 0.2s;">Xem chi tiết</button>
        `;
        clone.querySelector('button').addEventListener('click', function(e) {
          e.stopPropagation();
          window.location.href = `product-detail.html?id=${product.id}`;
        });
      }
      clone.querySelector('.productName').textContent = product.name;
      clone.querySelector('.productImage').src = 
        product.imageUrl?.startsWith("http") && !product.imageUrl.includes("via.placeholder.com")
          ? product.imageUrl
          : "./public/images/cart_logo.png";
      clone.querySelector('.productImage').alt = product.name;
      clone.addEventListener('click', function() {
        window.location.href = `product-detail.html?id=${product.id}`;
      });
      container.appendChild(clone);
    });
  } catch (err) {
    console.error("❌ Lỗi tổng thể khi tải sản phẩm:", err);
    
    // Hiển thị sản phẩm mẫu làm fallback
    const container = document.getElementById("productContainer");
    if (container) {
      const sampleProducts = createSampleProducts();
      console.log("🎭 Sử dụng", sampleProducts.length, "sản phẩm mẫu");
      
      container.innerHTML = "";
      container.style.display = "flex";
      container.style.flexWrap = "wrap";
      container.style.gap = "24px";
      container.style.justifyContent = "center";
      
      sampleProducts.forEach((product) => {
        const clone = document.createElement("div");
        clone.className = "cards";
        clone.style.border = "1px solid #eee";
        clone.style.borderRadius = "10px";
        clone.style.padding = "18px";
        clone.style.background = "#fff";
        clone.style.width = "240px";
        clone.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
        clone.style.cursor = "pointer";
        clone.style.margin = "0";
        clone.style.transition = "box-shadow 0.2s, transform 0.2s";
        clone.addEventListener('mouseenter', () => {
          clone.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
          clone.style.transform = "translateY(-4px) scale(1.03)";
        });
        clone.addEventListener('mouseleave', () => {
          clone.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
          clone.style.transform = "none";
        });
        clone.innerHTML = `
          <img class="productImage" src="${product.imageUrl || './public/images/cart_logo.png'}" alt="${product.name}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:12px;" />
          <h4 class="productName" style="margin:10px 0 6px;font-size:1.12rem;font-weight:600;color:#222;">${product.name}</h4>
          <p style="color:#888;font-size:1rem;margin-bottom:8px;">₫${product.variants?.[0]?.price?.toLocaleString() || 0}</p>
          <button style="background:#007bff;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-size:0.98rem;cursor:pointer;transition:background 0.2s;">Xem chi tiết</button>
        `;
        clone.querySelector('button').addEventListener('click', function(e) {
          e.stopPropagation();
          alert(`Chi tiết sản phẩm: ${product.name}`);
        });
        clone.addEventListener('click', function() {
          alert(`Click vào sản phẩm: ${product.name}`);
        });
        container.appendChild(clone);
      });
    }
  }
}

window.addEventListener("DOMContentLoaded", loadProducts);

// Thêm modal HTML vào cuối body nếu chưa có
if (!document.getElementById('productDetailModal')) {
  const modal = document.createElement('div');
  modal.id = 'productDetailModal';
  modal.innerHTML = `
    <div class="modal-overlay" style="display:none;"></div>
    <div class="modal-content" style="display:none;">
      <button class="modal-close">&times;</button>
      <div id="modalProductDetail"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Hàm mở modal chi tiết sản phẩm
function showProductDetailModal(product) {
  const modal = document.getElementById('productDetailModal');
  const detail = document.getElementById('modalProductDetail');
  detail.innerHTML = `
    <h2 style='text-align:center;'>${product.name}</h2>
    <img src="${product.imageUrl || './public/images/cart_logo.png'}" alt="${product.name}" style="max-width:180px;max-height:180px;display:block;margin:0 auto 12px;"/>
    <p><b>Giá:</b> ₫${product.variants?.[0]?.price?.toLocaleString() || 0}</p>
    <p><b>Mô tả:</b> ${product.description || 'Không có mô tả'}</p>
    <p><b>Tồn kho:</b> ${product.variants?.[0]?.stock || 0}</p>
  `;
  modal.style.display = 'block';
}

// Đóng modal
function closeProductDetailModal() {
  document.getElementById('productDetailModal').style.display = 'none';
}
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
    closeProductDetailModal();
  }
});

export async function loadProductsByCategory(categoryId) {
  try {
    const res = await fetch(`http://localhost:8000/product/products/category/${categoryId}`);
    if (!res.ok) throw new Error("Lỗi khi gọi API sản phẩm: " + res.status);

    const data = await res.json();
    const products = Array.isArray(data.result) ? data.result : [];

        const container = document.getElementById("productContainer");
        if (products.length === 0) {
            if (container) container.innerHTML = '<p style="text-align:center;">Không có sản phẩm trong danh mục này!</p>';
            return;
        }
        container.innerHTML = "";
        const template = document.getElementById("productTemplate");
        products.forEach((product) => {
            // Nếu template chưa có nội dung, tạo card mặc định
            let clone;
            if (template && template.content && template.content.children.length > 0) {
              clone = template.content.cloneNode(true);
            } else {
              clone = document.createElement("div");
              clone.className = "cards";
              clone.style.border = "1px solid #eee";
              clone.style.borderRadius = "8px";
              clone.style.padding = "16px";
              clone.style.background = "#fff";
              clone.style.width = "220px";
              clone.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              clone.style.cursor = "pointer";
              clone.style.margin = "12px";
              clone.innerHTML = `
                <img class="productImage" src="${product.imageUrl || './public/images/cart_logo.png'}" alt="${product.name}" style="width:100%;height:140px;object-fit:cover;border-radius:6px;" />
                <h4 class="productName" style="margin:12px 0 6px;font-size:1.08rem;font-weight:500;">${product.name}</h4>
                <p style="color:#888;font-size:0.98rem;">₫${product.variants?.[0]?.price?.toLocaleString() || 0}</p>
              `;
            }
            clone.querySelector('.productName').textContent = product.name;
            clone.querySelector('.productImage').src = 
                product.imageUrl?.startsWith("http") && !product.imageUrl.includes("via.placeholder.com")
                    ? product.imageUrl
                    : "./public/images/cart_logo.png";
            clone.querySelector('.productImage').alt = product.name;
            clone.addEventListener('click', function() {
                window.location.href = `product-detail.html?id=${product.id}`;
            });
            container.appendChild(clone);
        });
  } catch (err) {
    console.error("❌ Lỗi khi tải sản phẩm theo danh mục:", err);
  }
}
