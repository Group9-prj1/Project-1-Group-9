# backend/Dockerfile
FROM python:3.11-slim
ENV PYTHONUNBUFFERED 1
WORKDIR /app
# SỬA LỖI COPY: Tham chiếu file từ thư mục 'backend' trong context gốc
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy mã nguồn backend vào container
COPY backend/ /app/

# Lệnh Build: Chạy Alembic migrations và Tải Model AI
RUN alembic upgrade head && python app/llm/load_model.py 

# Lệnh chạy server Gunicorn/Uvicorn
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000"]