import { addToCart } from "./addToCart";
import { homeQuantityToggle } from "./homeQuantityToggle";
import { getBestImageUrl } from "./googleDriveManager";

const productContainer = document.querySelector("#productContainer");
const productTemplate = document.querySelector("#productTemplate");

export const showProductContainer = (products) => {
  if (!products) {
    return false;
  } 

  products.forEach((curProd) => {
    const { brand, category, description, id, image, name, price, stock } =
      curProd;

    const productClone = document.importNode(productTemplate.content, true);

    productClone.querySelector("#cardValue").setAttribute("id", `card${id}`);

    productClone.querySelector(".category").textContent = category;
    productClone.querySelector(".productName").textContent = name;
    
    // Use Google Drive image if available, otherwise fallback to local image
    const imageUrl = getBestImageUrl(curProd);
    const productImage = productClone.querySelector(".productImage");
    productImage.src = imageUrl;
    productImage.alt = name;
    
    // Add error handling for failed image loads
    productImage.onerror = function() {
      this.src = './public/images/placeholder.svg';
    };
    productClone.querySelector(".productStock").textContent = stock;
    productClone.querySelector(".productDescription").textContent = description;
    productClone.querySelector(".productPrice").textContent = `₹${price}`;
    productClone.querySelector(".productActualPrice").textContent = `₹${
      price * 4
    }`;

    productClone
      .querySelector(".stockElement")
      .addEventListener("click", (event) => {
        homeQuantityToggle(event, id, stock);
      });

    productClone
      .querySelector(".add-to-cart-button")
      .addEventListener("click", (event) => {
        addToCart(event, id, stock);
      });

    productContainer.append(productClone);
  });
};