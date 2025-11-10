import gc

import torch
from torch.utils.data import Dataset
import os
import pickle
from tqdm import tqdm
from Summary_content.model_summary_contents.summarization_utils import optimal_sentence_split, generate_soft_label, generate_greedy_oracle_labels


# === PHẦN 1: DATASET GỐC ĐỂ TẠO CACHE BAN ĐẦU (Đã sửa) ===
class VietnameseSummarizationDataset(Dataset):
    def __init__(self, contents, summaries, tokenizer, rouge, max_content_length=96, cache_file=None):
        self.tokenizer = tokenizer
        self.max_content_length = max_content_length
        
        # self.embed_model = embed_model
        # self.top_n = top_n
        self.rouge = rouge  # Thêm rouge
        
        if cache_file and os.path.exists(cache_file):
            print(f"Tải dữ liệu từ cache: {cache_file}")
            with open(cache_file, 'rb') as f:
                self.data = pickle.load(f)
        else:
            self.data = []
            for content, summary in tqdm(zip(contents, summaries), total=len(contents), desc="Preprocessing (Greedy Oracle)"):
                content = str(content)
                summary = str(summary)
                
                # Bỏ qua nếu nội dung hoặc tóm tắt rỗng
                if not content.strip() or not summary.strip():
                    continue
                
                sentences = optimal_sentence_split(content, tokenizer, max_length=max_content_length)
                if not sentences:
                    sentences = [content]  # Xử lý trường hợp không chia được câu
                
                # Sửa: Sử dụng hàm gán nhãn Greedy Oracle mới
                labels = generate_greedy_oracle_labels(sentences, summary, self.rouge)
                
                encoding = tokenizer(
                    sentences,
                    max_length=max_content_length,
                    padding='max_length',
                    truncation=True,
                    return_tensors='pt'
                )
                
                # Sửa: Thêm 'gold_summary' vào cache
                self.data.append({
                    'input_ids': encoding['input_ids'],
                    'attention_mask': encoding['attention_mask'],
                    'labels': torch.tensor(labels, dtype=torch.float),
                    'gold_summary': summary  # <-- THÊM DÒNG NÀY
                })
                del encoding, labels, sentences
                gc.collect()
            
            if cache_file:
                print(f"Lưu dữ liệu vào cache: {cache_file}")
                os.makedirs(os.path.dirname(cache_file), exist_ok=True)
                with open(cache_file, 'wb') as f:
                    pickle.dump(self.data, f)
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        return self.data[idx]
