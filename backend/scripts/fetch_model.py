import os, requests

# Đường dẫn lưu model trong project
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "app", "llm", "models", "phobertsum_lightweight.pt")

# Link tải model từ GitHub Release (sau khi bạn upload .pt)
URL = "https://github.com/Group9-prj1/Project-1-Group-9/releases/download/v1.0-model/phobertsum_lightweight.pt"

def ensure_model():
    """Kiểm tra nếu chưa có model thì tự tải về"""
    if os.path.exists(MODEL_PATH):
        print("✅ Model đã tồn tại:", MODEL_PATH)
        return MODEL_PATH

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    print("⬇️  Đang tải model từ GitHub...")

    with requests.get(URL, stream=True) as r:
        r.raise_for_status()
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(1 << 20):
                if chunk:
                    f.write(chunk)

    print("✅ Tải xong model:", MODEL_PATH)
    return MODEL_PATH


if __name__ == "__main__":
    ensure_model()
