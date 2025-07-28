# API ENDPOINTS & TESTING GUIDE

## 🔍 POSTMAN COLLECTION ANALYSIS

Từ file `My Service.postman_collection (1).json`, hệ thống có các API endpoints sau:

### 📦 Product Service APIs

#### 1. Product Management
```http
# Tạo sản phẩm mới
POST http://localhost:8060/products/create
Content-Type: application/json

{
  "name": "Sản phẩm mới",
  "description": "Mô tả sản phẩm",
  "price": 299000,
  "categoryId": "category-id",
  "imageUrl": "https://example.com/image.jpg"
}
```

```http
# Xóa sản phẩm
DELETE http://localhost:8060/products/{productId}
```

```http
# Lấy danh sách sản phẩm
GET http://localhost:8060/products
```

```http
# Lấy sản phẩm theo danh mục
GET http://localhost:8060/products/category/{categoryId}
```

```http
# Lấy chi tiết sản phẩm
GET http://localhost:8060/products/{productId}
```

#### 2. Category Management
```http
# Lấy cây danh mục
GET http://localhost:8060/categories/tree
```

### 🔐 Authentication APIs (dự đoán)
```http
# Đăng nhập
POST http://localhost:8070/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password"
}
```

```http
# Đăng ký
POST http://localhost:8070/auth/register
Content-Type: application/json

{
  "username": "newuser@example.com",
  "password": "password",
  "fullName": "Tên đầy đủ"
}
```

### 📊 Inventory APIs (dự đoán)
```http
# Kiểm tra tồn kho
GET http://localhost:8040/inventory/{productId}
```

```http
# Cập nhật tồn kho
PUT http://localhost:8040/inventory/{productId}
Content-Type: application/json

{
  "quantity": 100,
  "operation": "SET" // SET, ADD, SUBTRACT
}
```

### 📁 File Service APIs (dự đoán)
```http
# Upload file
POST http://localhost:8050/files/upload
Content-Type: multipart/form-data

form-data:
  file: [binary file]
  category: "product-images"
```

```http
# Lấy file
GET http://localhost:8050/files/{fileId}
```

## 🌐 API Gateway Routing

API Gateway (port 8000) sẽ route requests như sau:

```yaml
Routes:
  /user/**     → User Service (8070)
  /product/**  → Product Service (8060) 
  /inventory/** → Inventory Service (8040)
  /file/**     → File Service (8050)
```

Ví dụ:
```http
# Thay vì gọi trực tiếp:
GET http://localhost:8060/products

# Client sẽ gọi qua Gateway:
GET http://localhost:8000/product/products
```

## 🧪 TESTING STRATEGY

### 1. Unit Testing
```bash
# Test từng service độc lập
mvn test -f user-service/pom.xml
mvn test -f product-service/pom.xml
mvn test -f inventory-service/pom.xml
mvn test -f file-service/pom.xml
```

### 2. Integration Testing
```bash
# Khởi động toàn bộ hệ thống
docker-compose up -d

# Đợi health checks pass
./wait-for-services.sh

# Chạy integration tests
npm run test:integration
```

### 3. End-to-End Testing
```javascript
// E2E test flow
describe('E-commerce Flow', () => {
  it('should complete purchase flow', async () => {
    // 1. Đăng ký user
    await registerUser();
    
    // 2. Đăng nhập
    const token = await login();
    
    // 3. Browse products
    const products = await getProducts();
    
    // 4. Add to cart
    await addToCart(products[0].id, 2);
    
    // 5. Checkout
    await checkout(token);
    
    // 6. Verify inventory updated
    const inventory = await getInventory(products[0].id);
    expect(inventory.quantity).toBe(originalQuantity - 2);
  });
});
```

## 📋 HEALTH CHECK ENDPOINTS

```bash
# Discovery Server
curl http://localhost:8761/

# User Service
curl http://localhost:8070/actuator/health

# Product Service  
curl http://localhost:8060/actuator/health

# Inventory Service
curl http://localhost:8040/actuator/health

# File Service
curl http://localhost:8050/actuator/health

# API Gateway (health check qua Discovery)
curl http://localhost:8000/actuator/health
```

## 🔧 DEVELOPMENT WORKFLOW

### 1. Khởi động Development Environment
```bash
# Clone repository
git clone <repo-url>
cd demomo

# Khởi động infrastructure
docker-compose up -d kafka discovery-server

# Đợi services ready
sleep 30

# Khởi động business services
docker-compose up -d user-service product-service inventory-service file-service

# Đợi services register với Eureka
sleep 20

# Khởi động Gateway
docker-compose up -d api-gateway

# Khởi động Frontend
cd client
npm install
npm run dev
```

### 2. Local Development với Hot Reload
```bash
# Development mode cho từng service
# User Service
cd user-service && mvn spring-boot:run

# Product Service  
cd product-service && mvn spring-boot:run

# Frontend
cd client && npm run dev
```

### 3. Testing Local Changes
```bash
# Test API endpoints
curl http://localhost:8000/product/products

# Test Frontend
open http://localhost:3000

# Monitor logs
docker-compose logs -f user-service
docker-compose logs -f product-service
```

## 📊 MONITORING & DEBUGGING

### 1. Service Registry Dashboard
```bash
# Xem services đã đăng ký
open http://localhost:8761
```

### 2. Application Logs
```bash
# Xem logs realtime
docker-compose logs -f

# Logs cho service cụ thể
docker-compose logs -f product-service
docker-compose logs -f api-gateway
```

### 3. Health Status
```bash
#!/bin/bash
# health-check.sh

services=("discovery-server:8761" "user-service:8070" "product-service:8060" "inventory-service:8040" "file-service:8050")

for service in "${services[@]}"; do
  name=$(echo $service | cut -d: -f1)
  port=$(echo $service | cut -d: -f2)
  
  if [ "$name" = "discovery-server" ]; then
    url="http://localhost:$port/"
  else
    url="http://localhost:$port/actuator/health"
  fi
  
  status=$(curl -s -o /dev/null -w "%{http_code}" $url)
  
  if [ $status -eq 200 ]; then
    echo "✅ $name is healthy"
  else
    echo "❌ $name is unhealthy (status: $status)"
  fi
done
```

## 🐛 COMMON ISSUES & TROUBLESHOOTING

### 1. Service Discovery Issues
```bash
# Problem: Service không register được với Eureka
# Solution: 
docker-compose restart discovery-server
sleep 30
docker-compose restart user-service product-service inventory-service file-service
```

### 2. Kafka Connection Issues
```bash
# Problem: Services không connect được Kafka
# Solution:
docker-compose restart kafka
# Đợi Kafka hoàn toàn ready
sleep 60
docker-compose restart product-service inventory-service
```

### 3. Network Issues
```bash
# Problem: Services không giao tiếp được
# Solution: Kiểm tra Docker network
docker network ls
docker network inspect demomo_backend
```

### 4. Port Conflicts
```bash
# Problem: Port đã được sử dụng
# Solution: Kill processes using ports
sudo lsof -ti:8761 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```