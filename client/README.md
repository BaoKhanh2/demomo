# E-commerce Website

A simple e-commerce website built using HTML, CSS, and Vanilla JavaScript, powered by Vite for fast development and bundling. This project utilizes a local JSON API to dynamically fetch product data and provides basic e-commerce functionalities like adding items to a cart, viewing the cart, and calculating the total bill.

## Features

- **Product Display**: Products are fetched dynamically from a local JSON API and displayed on the website.
- **Choose Number of Items**: Users can select the number of items they wish to purchase.
- **Add to Cart**: Items can be added to a shopping cart.
- **View Cart**: Users can view the items added to the cart along with their quantities.
- **Remove from Cart**: Option to remove items from the cart.
- **Total Bill Summary**: Displays the total cost of the items in the cart.

## Technologies Used

- **HTML**
- **CSS**
- **JavaScript (Vanilla JS)**
- **Vite** (for development and bundling)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adarshmusa/ecommerce-website.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ecommerce-website
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and go to `http://localhost:3000` to view the website.

## Screenshots

![Screenshot 2024-09-08 164611](https://github.com/user-attachments/assets/78d3917e-ef66-43b4-99d6-0ceee094f83c)
![Screenshot 2024-09-08 164710](https://github.com/user-attachments/assets/bafa9646-8126-420e-be7a-7bd31eba2663)
![Screenshot 2024-09-08 164735](https://github.com/user-attachments/assets/c44cc7d4-04c1-404e-bc89-50119d69df7a)
![Screenshot 2024-09-08 164810](https://github.com/user-attachments/assets/7c0e7737-9209-4a13-a403-1bfead972ba2)


## Folder Structure

```markdown

ecommerce-website/
├── api/                 # Folder for local JSON API
│   └── products.json    # JSON file containing product data
├── node_modules/        # Node.js modules (generated after npm install)
├── public/              # Public folder for assets
│   └── images/          # Folder for storing images
├── .gitignore           # Git ignore file
├── about.html           # About page
├── addToCart.html       # Add to Cart page
├── addToCart.js         # JavaScript for Add to Cart functionality
├── contact.html         # Contact page
├── fetchQuantityFromCartLS.js  # JS to fetch quantity from local storage
├── getCartProducts.js   # JS to get products in the cart
├── homeProductsCards.js # JS for displaying home product cards
├── homeQuantityToggle.js # JS for toggling quantity on the home page
├── incrementDecrement.js # JS for increment and decrement functionality
├── index.html           # Main HTML file
├── main.js              # Main JavaScript file
├── package-lock.json    # Lock file for npm dependencies
├── package.json         # Project configuration and scripts
├── products.html        # Products page
├── removeProdFromCart.js # JS for removing products from the cart
├── showAddToCartCards.js # JS for showing cards on the add-to-cart page
├── showToast.js         # JS for showing toast notifications
├── style.css            # Main stylesheet
├── updateCartProductTotal.js # JS to update total for products in cart
└── updateCartValue.js   # JS to update cart value
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## Contact

For any questions or feedback, feel free to reach out!
