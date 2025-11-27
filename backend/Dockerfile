# backend/Dockerfile
FROM python:3.11-slim
ENV PYTHONUNBUFFERED 1
WORKDIR /app
# Copy dependencies và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy mã nguồn backend vào container
COPY . /app/

# Lệnh Build: Chạy Alembic migrations và Tải Model AI
# LƯU Ý: Đảm bảo load_model.py là đúng file bạn muốn chạy
RUN alembic upgrade head && python app/llm/load_model.py 

# Lệnh chạy server Gunicorn/Uvicorn
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000"]
