# frontend/Dockerfile
# Giai đoạn 1: Build ứng dụng
FROM node:20 as builder
WORKDIR /app

# Khai báo Build Argument
ARG VITE_API_URL

# Copy dependencies và cài đặt
COPY package.json package-lock.json ./
RUN npm install

# Copy mã nguồn frontend
COPY . .

# Thiết lập biến môi trường trước khi build
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Giai đoạn 2: Phục vụ bằng Nginx
FROM nginx:alpine
# Xóa cấu hình mặc định và thêm cấu hình riêng
RUN rm /etc/nginx/conf.d/default.conf

# Sao chép file cấu hình Nginx (từ thư mục gốc của dự án)
COPY nginx.conf /etc/nginx/conf.d/default.conf 

# Sao chép kết quả build
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
