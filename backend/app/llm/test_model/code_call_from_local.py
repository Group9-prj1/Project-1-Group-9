import requests


url = "https://charleigh-nonrectangular-dispiritedly.ngrok-free.dev/predict"
data = {
    "text": """Hoa – một trong những món quà diệu kỳ nhất mà thiên nhiên ban tặng cho con người – từ bao đời nay đã trở thành biểu tượng của cái đẹp, của tình yêu, niềm tin và hi vọng. Từ những cánh đồng bạt ngàn hoa dại đến những khu vườn rực rỡ sắc màu, hoa hiện diện ở khắp mọi nơi, làm cho cuộc sống thêm phần tươi đẹp và tràn đầy sức sống. Không chỉ là vẻ đẹp bên ngoài, hoa còn mang trong mình một linh hồn, một ý nghĩa riêng biệt mà con người luôn trân quý.

Mỗi loài hoa đều có một câu chuyện riêng. Hoa hồng đỏ tượng trưng cho tình yêu nồng cháy và lãng mạn; hoa sen lại mang vẻ đẹp thanh khiết, biểu trưng cho tâm hồn cao quý, vượt lên khỏi bùn lầy để toả hương thơm ngát. Hoa cúc giản dị mà bền bỉ, thể hiện lòng hiếu thảo và sự trường tồn; còn hoa hướng dương thì luôn hướng về phía ánh sáng, như nhắc nhở con người hãy luôn giữ niềm tin và hy vọng trong cuộc sống. Dù là những bông hoa dại mọc ven đường hay những loài hoa quý hiếm trong vườn, tất cả đều có giá trị riêng, góp phần tô điểm cho bức tranh thiên nhiên thêm phần sinh động.

Hoa không chỉ làm đẹp cho đời mà còn gắn liền với văn hoá và cảm xúc của con người. Trong nghệ thuật, hoa là nguồn cảm hứng vô tận cho thơ ca, hội họa, âm nhạc và nhiếp ảnh. Từ những bài thơ ca ngợi vẻ đẹp mong manh của cánh hoa, đến những bức tranh tái hiện sắc màu rực rỡ của tự nhiên, hay những bản nhạc nhẹ nhàng gợi nhớ hương hoa, tất cả đều thể hiện tình yêu của con người đối với thiên nhiên. Hoa cũng thường xuất hiện trong những dịp đặc biệt của cuộc sống: lễ cưới, sinh nhật, tang lễ, hay những ngày kỷ niệm – như một cách để bày tỏ cảm xúc và gửi gắm lời nhắn nhủ sâu sắc.

Một bông hoa nhỏ bé có thể khiến lòng người trở nên nhẹ nhàng và ấm áp. Giữa những bộn bề, lo toan của cuộc sống, chỉ cần ngắm nhìn một đóa hoa nở rộ, con người như được trở về với sự bình yên và trong trẻo. Hoa dạy ta biết trân trọng khoảnh khắc, bởi dù rực rỡ đến đâu, chúng cũng sẽ tàn phai – giống như cuộc đời con người, ngắn ngủi nhưng đầy ý nghĩa. Có lẽ chính vì vậy mà hoa luôn mang trong mình một sức sống kỳ diệu: dù mùa đông có lạnh giá, chúng vẫn âm thầm chờ đến xuân để nở rộ, mang sắc hương đến cho đời.

Hoa không chỉ là biểu tượng của cái đẹp, mà còn là bài học về sự kiên cường, về vòng tuần hoàn của tự nhiên và ý nghĩa của sự sống. Nhìn hoa, ta học được cách sống thanh thản, yêu thương và biết ơn cuộc đời. Dẫu chỉ là một phần nhỏ bé trong thế giới rộng lớn, hoa vẫn đủ sức làm con người rung động – bởi vẻ đẹp ấy, chân thành và giản dị, đã chạm đến trái tim của mỗi chúng ta.
""",
    "max_sent": 2
}

print(len(data['text'].split(' ')))
res = requests.post(url, json=data)
try:
    res.raise_for_status()
    result = res.json()
    print("Tóm tắt:", result["summary"])
    print("len_tom_tat : ", len(result["summary"].split(' ')))
    print("Độ tin cậy trung bình:", result["avg_confidence"])
    print("Điểm từng câu:")
    for sent, score in result["sentence_scores"].items():
        print(f" - {sent[:80]}... → {score:.4f}")
except requests.exceptions.HTTPError:
    print("Lỗi server:", res.status_code)
    print("Chi tiết lỗi:", res.text)
