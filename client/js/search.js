// Search functionality
export class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchButton = document.getElementById('searchButton');
    this.searchContainer = null;
    this.searchDropdown = null;
    this.isDropdownVisible = false;
    this.init();
  }

  init() {
    if (this.searchInput && this.searchButton) {
      this.createSearchDropdown();
      
      // Xử lý khi nhấn nút tìm kiếm
      this.searchButton.addEventListener('click', () => {
        this.performSearch();
      });

      // Xử lý khi nhấn Enter trong ô tìm kiếm
      this.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });

      // Xử lý khi focus vào search input
      this.searchInput.addEventListener('focus', () => {
        this.showSearchDropdown();
      });

      // Xử lý khi click ra ngoài
      document.addEventListener('click', (e) => {
        if (!this.searchContainer.contains(e.target)) {
          this.hideSearchDropdown();
        }
      });

      // Xử lý tìm kiếm tự động khi gõ (debounced)
      let searchTimeout;
      this.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const query = this.searchInput.value.trim();
          if (query.length >= 1) {
            this.updateSearchSuggestions(query);
            this.showSearchDropdown();
          } else {
            this.updateSearchSuggestions('');
            this.showSearchDropdown();
          }
        }, 200);
      });

      // Keyboard navigation
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideSearchDropdown();
          this.searchInput.blur();
        }
      });

      // Re-position dropdown on scroll/resize
      window.addEventListener('scroll', () => {
        if (this.isDropdownVisible) {
          this.showSearchDropdown(); // Re-calculate position
        }
      });

      window.addEventListener('resize', () => {
        if (this.isDropdownVisible) {
          this.showSearchDropdown(); // Re-calculate position
        }
      });
    }
  }

  createSearchDropdown() {
    this.searchContainer = this.searchInput.closest('.search-container');
    
    this.searchDropdown = document.createElement('div');
    this.searchDropdown.className = 'search-dropdown';
    this.searchDropdown.innerHTML = `
      <div class="search-dropdown-header">
        <h4 class="search-dropdown-title">Tìm kiếm nhanh</h4>
      </div>
      <div class="search-suggestions">
        <div class="search-suggestion-item" data-suggestion="laptop">
          <i class="fa-solid fa-laptop search-suggestion-icon"></i>
          <span class="search-suggestion-text">Laptop</span>
        </div>
        <div class="search-suggestion-item" data-suggestion="smartphone">
          <i class="fa-solid fa-mobile-screen search-suggestion-icon"></i>
          <span class="search-suggestion-text">Smartphone</span>
        </div>
        <div class="search-suggestion-item" data-suggestion="headphones">
          <i class="fa-solid fa-headphones search-suggestion-icon"></i>
          <span class="search-suggestion-text">Headphones</span>
        </div>
        <div class="search-suggestion-item" data-suggestion="watch">
          <i class="fa-solid fa-clock search-suggestion-icon"></i>
          <span class="search-suggestion-text">Đồng hồ</span>
        </div>
        <div class="search-suggestion-item" data-suggestion="speaker">
          <i class="fa-solid fa-volume-high search-suggestion-icon"></i>
          <span class="search-suggestion-text">Loa</span>
        </div>
      </div>
      <div class="search-dropdown-footer">
        <p class="search-dropdown-footer-text">
          Nhấn <kbd class="search-hotkey">Enter</kbd> để tìm kiếm
        </p>
      </div>
    `;
    
    // Add to body instead of search container for fixed positioning
    document.body.appendChild(this.searchDropdown);
    
    // Add click listeners to suggestions
    this.searchDropdown.querySelectorAll('.search-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const suggestion = item.dataset.suggestion;
        this.searchInput.value = suggestion;
        this.performSearch();
        this.hideSearchDropdown();
      });
    });
  }

  showSearchDropdown() {
    if (this.searchDropdown && !this.isDropdownVisible) {
      // Calculate position relative to search container
      const rect = this.searchContainer.getBoundingClientRect();
      const dropdownWidth = Math.max(320, rect.width);
      
      this.searchDropdown.style.top = `${rect.bottom + 8}px`;
      this.searchDropdown.style.left = `${rect.left}px`;
      this.searchDropdown.style.width = `${dropdownWidth}px`;
      
      this.searchDropdown.classList.add('show');
      this.isDropdownVisible = true;
    }
  }

  hideSearchDropdown() {
    if (this.searchDropdown && this.isDropdownVisible) {
      this.searchDropdown.classList.remove('show');
      this.isDropdownVisible = false;
    }
  }

  updateSearchSuggestions(query) {
    if (!this.searchDropdown) return;
    
    // Re-position dropdown in case container moved
    if (this.isDropdownVisible) {
      const rect = this.searchContainer.getBoundingClientRect();
      const dropdownWidth = Math.max(320, rect.width);
      
      this.searchDropdown.style.top = `${rect.bottom + 8}px`;
      this.searchDropdown.style.left = `${rect.left}px`;
      this.searchDropdown.style.width = `${dropdownWidth}px`;
    }
    
    const suggestionsContainer = this.searchDropdown.querySelector('.search-suggestions');
    
    if (!query) {
      // Show default suggestions
      suggestionsContainer.innerHTML = `
        <div class="search-suggestion-item" data-suggestion="laptop">
          <i class="fa-solid fa-laptop search-suggestion-icon"></i>
          <span class="search-suggestion-text">Laptop</span>
        </div>
        <div class="search-suggestion-item" data-suggestion="smartphone">
          <i class="fa-solid fa-mobile-screen search-suggestion-icon"></i>
          <span class="search-suggestion-text">Smartphone</span>
        </div>
        <div class="search-suggestion-item" data-suggestion="headphones">
          <i class="fa-solid fa-headphones search-suggestion-icon"></i>
          <span class="search-suggestion-text">Headphones</span>
        </div>
        <div class="search-suggestion-item" data-suggestion="watch">
          <i class="fa-solid fa-clock search-suggestion-icon"></i>
          <span class="search-suggestion-text">Đồng hồ</span>
        </div>
        <div class="search-suggestion-item" data-suggestion="speaker">
          <i class="fa-solid fa-volume-high search-suggestion-icon"></i>
          <span class="search-suggestion-text">Loa</span>
        </div>
      `;
    } else {
      // Show search-based suggestions
      const suggestions = this.generateSuggestions(query);
      suggestionsContainer.innerHTML = suggestions.map(suggestion => `
        <div class="search-suggestion-item" data-suggestion="${suggestion.text}">
          <i class="${suggestion.icon} search-suggestion-icon"></i>
          <span class="search-suggestion-text">${suggestion.text}</span>
        </div>
      `).join('');
    }
    
    // Re-add click listeners
    suggestionsContainer.querySelectorAll('.search-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const suggestion = item.dataset.suggestion;
        this.searchInput.value = suggestion;
        this.performSearch();
        this.hideSearchDropdown();
      });
    });
  }

  generateSuggestions(query) {
    const allSuggestions = [
      { text: 'laptop', icon: 'fa-solid fa-laptop' },
      { text: 'smartphone', icon: 'fa-solid fa-mobile-screen' },
      { text: 'headphones', icon: 'fa-solid fa-headphones' },
      { text: 'đồng hồ', icon: 'fa-solid fa-clock' },
      { text: 'watch', icon: 'fa-solid fa-clock' },
      { text: 'loa', icon: 'fa-solid fa-volume-high' },
      { text: 'speaker', icon: 'fa-solid fa-volume-high' },
      { text: 'máy tính', icon: 'fa-solid fa-desktop' },
      { text: 'computer', icon: 'fa-solid fa-desktop' },
      { text: 'tablet', icon: 'fa-solid fa-tablet' },
      { text: 'camera', icon: 'fa-solid fa-camera' },
      { text: 'keyboard', icon: 'fa-solid fa-keyboard' },
      { text: 'mouse', icon: 'fa-solid fa-computer-mouse' }
    ];
    
    const filtered = allSuggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    );
    
    // Add the current query as first suggestion
    const currentQuery = {
      text: query,
      icon: 'fa-solid fa-magnifying-glass'
    };
    
    return [currentQuery, ...filtered.slice(0, 4)];
  }

  async performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) {
      alert('Vui lòng nhập từ khóa tìm kiếm!');
      return;
    }

    try {
      this.hideSearchDropdown();
      // Chuyển hướng đến trang kết quả tìm kiếm
      window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm:', error);
      alert('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!');
    }
  }

  async searchProducts(query) {
    try {
      const response = await fetch(`http://localhost:8000/product/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        return data.result || [];
      } else {
        console.error('❌ API trả về lỗi:', data.message);
        return [];
      }
    } catch (error) {
      console.error('❌ Lỗi khi gọi API tìm kiếm:', error);
      return [];
    }
  }

  async showSearchSuggestions(query) {
    const products = await this.searchProducts(query);
    const suggestions = products.slice(0, 5); // Chỉ hiển thị 5 gợi ý đầu tiên
    
    this.renderSuggestions(suggestions);
  }

  renderSuggestions(suggestions) {
    // Xóa dropdown cũ nếu có
    const existingDropdown = document.querySelector('.search-suggestions.product-suggestions');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    if (suggestions.length === 0) return;

    // Tạo dropdown mới
    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions product-suggestions';
    dropdown.innerHTML = suggestions.map(product => `
      <div class="suggestion-item" data-product-id="${product.id}">
        <img src="${product.image || './public/images/default-product.png'}" alt="${product.name}" class="suggestion-image">
        <div class="suggestion-text">
          <div class="suggestion-name">${product.name}</div>
          <div class="suggestion-price">${product.price ? product.price.toLocaleString() + ' VNĐ' : 'Liên hệ'}</div>
        </div>
      </div>
    `).join('');

    // Thêm event listeners cho từng item
    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const productId = item.dataset.productId;
        window.location.href = `product-detail.html?id=${productId}`;
      });
    });

    // Thêm dropdown vào container
    const searchContainer = document.querySelector('.search-container');
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(dropdown);

    // Ẩn dropdown khi click ra ngoài
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
          this.hideSearchSuggestions();
        }
      }, { once: true });
    }, 100);
  }

  hideSearchSuggestions() {
    const dropdown = document.querySelector('.search-suggestions.product-suggestions');
    if (dropdown) {
      dropdown.remove();
    }
  }
}

// Khởi tạo search manager khi trang được load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('searchInput')) {
    new SearchManager();
  }
});
