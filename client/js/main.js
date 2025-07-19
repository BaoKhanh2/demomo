import './style.css'
import products from "../api/products.json";
import { showProductContainer } from './homeProductsCards';

// create a function to display all the products as a card
showProductContainer(products);