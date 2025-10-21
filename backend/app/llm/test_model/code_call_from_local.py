import requests


url = "https://charleigh-nonrectangular-dispiritedly.ngrok-free.dev/predict"
data = {
    "text": "Trong buổi họp giao ban sáng nay tại trụ sở Bộ Lao động - Thương binh và Xã hội, đại diện Bộ cho biết trong thời gian vừa qua, nhiều người lao động, đặc biệt là những người thuộc nhóm thu nhập thấp, những người bị mất việc làm do ảnh hưởng của tình hình kinh tế suy thoái, vẫn đang gặp rất nhiều khó khăn trong việc tìm kiếm việc làm ổn định. Do đó, Bộ đã đề xuất một gói hỗ trợ mới với tổng giá trị dự kiến khoảng 15.000 tỷ đồng. Gói hỗ trợ này không chỉ tập trung vào việc cấp tiền trực tiếp mà còn bao gồm cả các chương trình đào tạo lại kỹ năng làm việc, hỗ trợ vốn vay với lãi suất ưu đãi, thậm chí còn khuyến khích các doanh nghiệp tham gia tuyển dụng thông qua các chính sách miễn giảm thuế. Tuy nhiên, một số chuyên gia cảnh báo rằng nếu quy trình triển khai không rõ ràng và minh bạch, thì rất dễ dẫn đến tình trạng sai đối tượng hoặc thất thoát ngân sách như từng xảy ra với một số gói cứu trợ trước đây.",
    "max_sent": 2
}

res = requests.post(url, json=data)
try:
    res.raise_for_status()
    result = res.json()
    print("Tóm tắt:", result["summary"])
    print("Độ tin cậy trung bình:", result["avg_confidence"])
    print("Điểm từng câu:")
    for sent, score in result["sentence_scores"].items():
        print(f" - {sent[:80]}... → {score:.4f}")
except requests.exceptions.HTTPError:
    print("Lỗi server:", res.status_code)
    print("Chi tiết lỗi:", res.text)
