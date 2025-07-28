#!/bin/bash

# Script kiểm tra health của tất cả services
echo "🔍 Kiểm tra health của các services..."

# Function kiểm tra health
check_health() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Đang kiểm tra $name... "
    
    # Sử dụng timeout để tránh hang
    status=$(timeout 10 curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status" = "$expected_status" ]; then
        echo "✅ HEALTHY (HTTP $status)"
        return 0
    else
        echo "❌ UNHEALTHY (HTTP $status)"
        return 1
    fi
}

# Kiểm tra Docker containers trước
echo "📦 Kiểm tra trạng thái Docker containers..."
docker-compose ps

echo ""
echo "🏥 Kiểm tra health endpoints..."

# Array chứa thông tin services
declare -a services=(
    "Discovery Server:http://localhost:8761/:200"
    "User Service:http://localhost:8070/actuator/health:200"
    "Product Service:http://localhost:8060/actuator/health:200"
    "Inventory Service:http://localhost:8040/actuator/health:200"
    "File Service:http://localhost:8050/actuator/health:200"
    "API Gateway:http://localhost:8000/actuator/health:200"
)

healthy_count=0
total_count=${#services[@]}

# Kiểm tra từng service
for service_info in "${services[@]}"; do
    IFS=':' read -r name url expected_status <<< "$service_info"
    
    if check_health "$name" "$url" "$expected_status"; then
        ((healthy_count++))
    fi
done

echo ""
echo "📊 Kết quả: $healthy_count/$total_count services healthy"

# Kiểm tra Kafka riêng (TCP check)
echo -n "Đang kiểm tra Kafka... "
if timeout 5 bash -c "</dev/tcp/localhost/9092" 2>/dev/null; then
    echo "✅ HEALTHY (TCP connection OK)"
    ((healthy_count++))
    ((total_count++))
else
    echo "❌ UNHEALTHY (Cannot connect to port 9092)"
fi

echo ""
echo "🎯 Tổng kết cuối cùng: $healthy_count/$total_count services healthy"

if [ $healthy_count -eq $total_count ]; then
    echo "🎉 Tất cả services đang hoạt động bình thường!"
    exit 0
else
    echo "⚠️ Có $(($total_count - $healthy_count)) services gặp vấn đề"
    echo ""
    echo "💡 Gợi ý troubleshooting:"
    echo "  1. Kiểm tra Docker containers: docker-compose ps"
    echo "  2. Xem logs: docker-compose logs -f [service-name]"  
    echo "  3. Restart services: docker-compose restart [service-name]"
    echo "  4. Chờ thêm thời gian để services khởi động hoàn toàn"
    exit 1
fi