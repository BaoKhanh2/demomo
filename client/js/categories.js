
export async function loadCategoryMenu() {
  try {
    const res = await fetch("http://localhost:8000/product/categories/tree");
    const data = await res.json();
    const categories = Array.isArray(data.result) ? data.result : [];

    const menu = document.getElementById("categoryMenu");
    menu.innerHTML = "";

    categories.forEach((parent) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = parent.name;
      link.classList.add("category-parent");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `product-detail.html?id=${parent.id}`;
      });

      // Tạo menu con bên trong từng li
      const subMenu = document.createElement("ul");
      subMenu.className = "sub-category-menu";
      if (Array.isArray(parent.children) && parent.children.length > 0) {
        parent.children.forEach((child) => {
          const subLi = document.createElement("li");
          const subLink = document.createElement("a");
          subLink.href = "#";
          subLink.textContent = child.name;
          subLink.classList.add("sub-category-item");
          subLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = `product-detail.html?id=${child.id}`;
          });
          subLi.appendChild(subLink);
          subMenu.appendChild(subLi);
        });
      }
      li.appendChild(link);
      li.appendChild(subMenu);
      menu.appendChild(li);
    });
  } catch (error) {
    console.error("❌ Lỗi khi tải danh mục:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadCategoryMenu);