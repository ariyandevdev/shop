export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
};

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description:
      "Premium noise-cancelling wireless headphones with long battery life.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    category: "Electronics",
  },
  {
    id: "2",
    name: "Smart Watch",
    description:
      "Fitness tracker with heart rate monitoring and sleep analysis.",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    category: "Electronics",
  },
  {
    id: "3",
    name: "Bluetooth Speaker",
    description: "Portable speaker with deep bass and waterproof design.",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    category: "Electronics",
  },
  {
    id: "4",
    name: "Coffee Mug",
    description:
      "Ceramic mug with stylish design – perfect for your morning coffee.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5",
    category: "Home & Kitchen",
  },
  {
    id: "6",
    name: "Running Shoes",
    description: "Lightweight running shoes for ultimate comfort and support.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    category: "Sports & Outdoors",
  },
  {
    id: "7",
    name: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness and modern design.",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1509223197845-458d87318791",
    category: "Home & Kitchen",
  },
  {
    id: "9",
    name: "Sunglasses",
    description:
      "Polarized sunglasses with UV protection for outdoor adventures.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
    category: "Accessories",
  },
];
