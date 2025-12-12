# frontend/Dockerfile
# Giai đoạn 1: Build ứng dụng
FROM node:20 as builder
WORKDIR /app

ARG VITE_API_URL

# SỬA LỖI COPY: Tham chiếu file từ thư mục 'frontend' trong context gốc
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
# Copy mã nguồn frontend
COPY frontend/ .

# Thiết lập biến môi trường trước khi build
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Giai đoạn 2: Phục vụ bằng Nginx
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
# Copy file nginx.conf (từ thư mục gốc)
COPY nginx.conf /etc/nginx/conf.d/default.conf 

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80