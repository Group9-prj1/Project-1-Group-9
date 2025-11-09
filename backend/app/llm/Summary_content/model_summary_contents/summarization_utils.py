import re
import psutil
import numpy as np
from sentence_transformers import SentenceTransformer, util as st_util
from underthesea import sent_tokenize
from transformers import AutoTokenizer
import torch
from rouge import Rouge


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def print_memory_usage(step=""):
    """In thông tin sử dụng RAM và VRAM."""
    ram = psutil.virtual_memory()
    print(f"{step} RAM used: {ram.used / 1024 ** 3:.2f} GB / {ram.total / 1024 ** 3:.2f} GB")
    if torch.cuda.is_available():
        vram = torch.cuda.memory_allocated() / 1024 ** 3
        vram_total = torch.cuda.get_device_properties(0).total_memory / 1024 ** 3
        print(f"{step} VRAM used: {vram:.2f} GB / {vram_total:.2f} GB")

def optimal_sentence_split(content, tokenizer, max_length=96, stride=32):
    sentences = sent_tokenize(content)
    # print("sentences : ", sentences)
    new_sentences = []
    for sent in sentences:
        tokens = tokenizer.encode(sent, add_special_tokens=False)
        
        if len(tokens) <= max_length:
            new_sentences.append(sent.strip())
        else:
            sub_sents = re.split(r'[;,]', sent)
            for sub in sub_sents:
                sub = sub.strip()
                if not sub:
                    continue
                tokens_sub = tokenizer.encode(sub, add_special_tokens=False)
                if len(tokens_sub) <= max_length:
                    new_sentences.append(sub)
                else:
                    for i in range(0, len(tokens_sub), max_length - stride):
                        chunk = tokens_sub[i: i + max_length]
                        chunk_text = tokenizer.decode(chunk)
                        new_sentences.append(chunk_text.strip())
    result = [s for s in new_sentences if s.strip()]
    return result if result else [content.strip()]

def generate_soft_label(sentences, summaries, embed_model, top_n=3, threshold=None, batch_size=4):
    if not sentences:
        return [0], [0]
    sent_embeddings = []
    for i in range(0, len(sentences), batch_size):
        batch = sentences[i: i + batch_size]
        with torch.no_grad():
            emb = embed_model.encode(batch, convert_to_tensor=True, device=embed_model.device)
            sent_embeddings.append(emb)
    emb_sent = torch.cat(sent_embeddings, dim=0)
    
    summary_embeddings = []
    for i in range(0, len(summaries), batch_size):
        batch = summaries[i: i + batch_size]
        with torch.no_grad():
            emb = embed_model.encode(batch, convert_to_tensor=True, device=embed_model.device)
            summary_embeddings.append(emb)
    emb_sum = torch.cat(summary_embeddings, dim=0) if len(summary_embeddings) > 1 else summary_embeddings[0]
    
    similarity_matrix = st_util.cos_sim(emb_sent, emb_sum)
    scores = similarity_matrix.max(dim=1).values.cpu().numpy()
    
    if threshold is not None:
        labels = [1 if s >= threshold else 0 for s in scores]
    else:
        idx = np.argsort(scores)[-top_n:]
        labels = [1 if i in idx else 0 for i in range(len(scores))]
    return labels, scores.tolist()

def generate_greedy_oracle_labels(sentences, gold_summary, rouge, max_sentences=3):
    """
    Tạo nhãn trích xuất bằng phương pháp Greedy Oracle dựa trên ROUGE-1 F-score.
    """
    if not sentences or not gold_summary:
        return [0] * len(sentences)
    
    selected_indices = []
    selected_text = ""
    best_rouge_f = 0.0
    
    # Lọc các câu rỗng
    valid_sentences = [(i, sent) for i, sent in enumerate(sentences) if sent.strip()]
    
    # Bản đồ từ chỉ số hợp lệ về chỉ số gốc
    original_indices = [i for i, sent in enumerate(sentences) if sent.strip()]
    
    # Nếu không có câu hợp lệ
    if not valid_sentences:
        return [0] * len(sentences)
    
    for _ in range(max_sentences):
        best_local_index = -1
        best_local_score = best_rouge_f
        
        # Thử thêm từng câu chưa được chọn
        for i, (original_idx, sentence) in enumerate(valid_sentences):
            if original_idx in selected_indices:
                continue
            
            # Thử kết hợp
            current_text_try = (selected_text + " " + sentence).strip()
            
            try:
                scores = rouge.get_scores(current_text_try, gold_summary)
                if not scores:  # Xử lý trường hợp rouge trả về rỗng
                    continue
                f_score = scores[0]['rouge-1']['f']
            except Exception as e:
                # Bỏ qua nếu có lỗi (ví dụ: chuỗi rỗng)
                continue
            
            if f_score > best_local_score:
                best_local_score = f_score
                best_local_index = original_idx
                best_local_text = current_text_try  # Lưu lại văn bản tốt nhất
        
        # Nếu tìm thấy câu tốt hơn
        if best_local_index != -1 and best_local_score > best_rouge_f:
            selected_indices.append(best_local_index)
            best_rouge_f = best_local_score
            selected_text = best_local_text
        else:
            # Nếu không có câu nào cải thiện điểm, dừng lại
            break
    
    # Tạo nhãn cuối cùng
    labels = [1 if i in selected_indices else 0 for i in range(len(sentences))]
    return labels

#
# content = ("Theo đại biểu Quốc hội, quy định về thuế suất đối với cơ quan báo chí cho thấy sự mâu thuẫn giữa "
#            "thực tiễn hoạt động báo chí và chính sách thuế. Báo điện tử đang trở thành phương thức chủ đạo,"
#            " trong khi báo in ngày càng giảm sút. Tuy nhiên, báo in lại được hưởng mức thuế ưu đãi 10, trong "
#            "khi báo điện tử phải chịu mức thuế 20...")
#
# sentences = optimal_sentence_split(content, tokenizer)
# labels, _ = generate_soft_label(sentences, "", embed_model)
