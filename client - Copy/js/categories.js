
// ========================================
// CATEGORY MENU LOADER - Tối ưu hóa
// ========================================

class CategoryManager {
  constructor() {
    this.apiUrl = "http://localhost:8000/product/categories/tree";
    // Không sử dụng fallback categories để tránh hiển thị dữ liệu mẫu
  }

  // loadCategories: Tải danh mục từ API - không dùng dữ liệu mẫu
  async loadCategories() {
    try {
      console.log("🔗 Đang gọi API danh mục:", this.apiUrl);
      const res = await fetch(this.apiUrl);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("📊 Dữ liệu API trả về:", data);
      
      // Kiểm tra cấu trúc response
      let categories = [];
      if (Array.isArray(data.result)) {
        categories = data.result;
        console.log("✅ Tìm thấy categories trong data.result");
      } else if (Array.isArray(data.data)) {
        categories = data.data;
        console.log("✅ Tìm thấy categories trong data.data");
      } else if (Array.isArray(data)) {
        categories = data;
        console.log("✅ Tìm thấy categories trong data");
      } else {
        console.log("❌ Không tìm thấy categories trong response");
      }
      
      console.log(`📋 Tổng số danh mục: ${categories.length}`);
      return categories;
      
    } catch (error) {
      console.log(`⚠️ Lỗi khi gọi API danh mục: ${error.message}`);
      return [];
    }
  }

  // createCategoryItem: Tạo item danh mục với event click
  createCategoryItem(category, isSubCategory = false) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    
    link.href = "#";
    link.textContent = category.name;
    link.className = isSubCategory ? "sub-category-item" : "category-parent";
    link.setAttribute('data-category-id', category.id);
    
    // Kiểm tra xem category có sản phẩm không
    const hasProducts = this.categoryHasProducts(category);
    
    if (!hasProducts) {
      link.style.opacity = '0.5';
      link.style.cursor = 'not-allowed';
      link.title = 'Danh mục này chưa có sản phẩm';
      // Không thêm click handler cho category rỗng
    } else {
      link.onclick = (e) => {
        e.preventDefault();
        this.navigateToCategory(category.id, category.name);
      };
    }
    
    li.appendChild(link);
    return li;
  }

  // categoryHasProducts: Kiểm tra category có sản phẩm không
  categoryHasProducts(category) {
    // Đơn giản hóa: cho phép click tất cả categories để test API
    // API sẽ trả về empty nếu không có sản phẩm
    return true;
  }

  // buildMenu: Xây dựng menu từ danh sách categories
  buildMenu(categories) {
    const menu = document.getElementById("categoryMenu");
    if (!menu) {
      return;
    }
    
    menu.innerHTML = "";
    
    // Nếu không có categories, hiển thị thông báo lỗi API
    if (!categories || categories.length === 0) {
      const noDataItem = document.createElement("li");
      noDataItem.innerHTML = `
        <a href="#" style="color: #dc3545; font-style: italic;">
          <i class="fas fa-wifi" style="margin-right: 8px;"></i>
          Không thể kết nối API danh mục
        </a>
      `;
      menu.appendChild(noDataItem);
      return;
    }
    
    categories.forEach(parent => {
      const parentLi = this.createCategoryItem(parent);
      
      // Thêm subcategories nếu có
      if (parent.children?.length > 0) {
        const subMenu = document.createElement("ul");
        subMenu.className = "sub-category-menu";
        
        parent.children.forEach(child => {
          const childLi = this.createCategoryItem(child, true);
          subMenu.appendChild(childLi);
        });
        
        parentLi.appendChild(subMenu);
      }
      
      menu.appendChild(parentLi);
    });
  }

  // navigateToCategory: Điều hướng đến trang sản phẩm theo danh mục
  navigateToCategory(categoryId, categoryName) {
    // Đơn giản hóa URL, không cần useNewAPI flag
    const url = `products.html?categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`;
    window.location.href = url;
  }

  // init: Khởi tạo category menu
  async init() {
    console.log("🚀 Bắt đầu tải danh mục...");
    const categories = await this.loadCategories();
    this.buildMenu(categories);
    
    // Log kết quả
    if (categories.length > 0) {
      console.log(`✅ Đã tải ${categories.length} danh mục từ API thành công`);
    } else {
      console.log(`❌ Không có danh mục từ API - kiểm tra console để debug`);
    }
  }
}

// Khởi tạo khi DOM ready
window.addEventListener("DOMContentLoaded", () => {
  const categoryManager = new CategoryManager();
  categoryManager.init();
});

// Export cho global access
window.navigateToNewProductAPI = (categoryId, categoryName) => {
  const categoryManager = new CategoryManager();
  categoryManager.navigateToCategory(categoryId, categoryName);
};