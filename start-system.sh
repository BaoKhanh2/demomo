#!/bin/bash

echo "🚀 Khởi động hệ thống Microservice E-commerce..."

# Function để đợi service ready
wait_for_service() {
    local service_name=$1
    local health_url=$2
    local max_attempts=${3:-30}
    local attempt=1
    
    echo "⏳ Đợi $service_name ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -sf "$health_url" > /dev/null 2>&1; then
            echo "✅ $service_name đã sẵn sàng!"
            return 0
        fi
        
        echo "  Attempt $attempt/$max_attempts - $service_name chưa ready..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ Timeout waiting for $service_name"
    return 1
}

# Bước 1: Khởi động Infrastructure Services
echo "📦 Bước 1: Khởi động Infrastructure (Kafka, Discovery Server)..."
docker-compose up -d kafka discovery-server

# Đợi Kafka và Discovery Server
echo "⏳ Đợi Infrastructure services..."
sleep 15

wait_for_service "Discovery Server" "http://localhost:8761" 30

# Kiểm tra Kafka TCP connection
echo "⏳ Đợi Kafka ready..."
attempt=1
max_attempts=30
while [ $attempt -le $max_attempts ]; do
    if timeout 2 bash -c "</dev/tcp/localhost/9092" 2>/dev/null; then
        echo "✅ Kafka đã sẵn sàng!"
        break
    fi
    echo "  Attempt $attempt/$max_attempts - Kafka chưa ready..."
    sleep 2
    ((attempt++))
done

# Bước 2: Khởi động Business Services
echo "📦 Bước 2: Khởi động Business Services..."
docker-compose up -d user-service file-service product-service inventory-service

# Đợi Business Services
echo "⏳ Đợi Business Services register với Eureka..."
sleep 20

wait_for_service "User Service" "http://localhost:8070/actuator/health" 30
wait_for_service "Product Service" "http://localhost:8060/actuator/health" 30  
wait_for_service "Inventory Service" "http://localhost:8040/actuator/health" 30
wait_for_service "File Service" "http://localhost:8050/actuator/health" 30

# Bước 3: Khởi động API Gateway
echo "📦 Bước 3: Khởi động API Gateway..."
docker-compose up -d api-gateway

# Đợi API Gateway
wait_for_service "API Gateway" "http://localhost:8000/actuator/health" 30

# Bước 4: Hiển thị thông tin hệ thống
echo ""
echo "🎉 Hệ thống đã khởi động thành công!"
echo ""
echo "📋 Thông tin Services:"
echo "  🔍 Discovery Server: http://localhost:8761"
echo "  🚪 API Gateway: http://localhost:8000"
echo "  👤 User Service: http://localhost:8070"
echo "  📦 Product Service: http://localhost:8060"
echo "  📊 Inventory Service: http://localhost:8040"
echo "  📁 File Service: http://localhost:8050"
echo "  📡 Kafka: localhost:9092"
echo ""
echo "🌐 Frontend URLs:"
echo "  👥 Client Web: http://localhost:3000 (cần chạy: cd client && npm run dev)"
echo "  🔧 Admin Dashboard: ./admin/index.html"
echo ""
echo "🧪 Testing:"
echo "  Health Check: ./health-check.sh"
echo "  Example API: curl http://localhost:8000/product/products"
echo ""
echo "📊 Monitoring:"
echo "  Service Registry: http://localhost:8761"
echo "  Container Status: docker-compose ps"
echo "  Logs: docker-compose logs -f [service-name]"

# Chạy health check cuối cùng
echo ""
echo "🔍 Chạy health check cuối cùng..."
./health-check.sh