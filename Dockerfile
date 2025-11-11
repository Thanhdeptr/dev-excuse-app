# Sử dụng base image Node.js 18
FROM node:18-slim
WORKDIR /app

# Copy file package.json và cài đặt thư viện
COPY package*.json ./
# Chỉ cài thư viện production để image nhẹ
RUN npm install --only=production

# Copy toàn bộ code vào
COPY . .

# Mở port 3000
EXPOSE 3000

# Lệnh để chạy app
CMD ["node", "app.js"]