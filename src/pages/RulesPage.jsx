import { HelpCircle, Play } from 'lucide-react'

const rules = [
  ['01', 'Lập đội điều tra', 'Chia lớp thành 3–6 đội. Mỗi đội chọn tên, đội trưởng và nhận các bảng A, B, C, D.'],
  ['02', 'Giải mã hồ sơ', 'MC đọc câu hỏi, các đội có 10 giây thảo luận. Khi có hiệu lệnh, tất cả đội cùng giơ đáp án.'],
  ['03', 'Tính điểm', 'Đúng được 10 điểm. Đội trả lời đúng nhanh nhất được cộng thêm 5 điểm. Sai không bị trừ điểm.'],
  ['04', 'Quyền trợ giúp', 'Mỗi đội có 2 quyền trong cả game: Mở hồ sơ lịch sử và Loại trừ. Mỗi quyền chỉ được dùng một lần.'],
  ['05', 'Khôi phục thời gian', 'Sau 5 chặng, MC có thể dùng câu hỏi phụ để chốt top 4 hoặc vào thẳng chung kết. Các đội vào chung kết sắp xếp 5 sự kiện theo trình tự thời gian.'],
]

export default function RulesPage({ onStart }) {
  return <main className="rules-page"><header className="page-heading"><p className="eyebrow">HƯỚNG DẪN VỤ ÁN</p><h1>Luật chơi</h1><p>Thi đấu đồng thời, trao đổi cùng đồng đội và giải mã các dấu mốc lịch sử.</p></header>
    <div className="rule-grid">{rules.map(([number, title, description]) => <article className="rule-card" key={number}><span>{number}</span><h2>{title}</h2><p>{description}</p></article>)}</div>
    <section className="aid-box"><div><HelpCircle size={25} /><h2>Hai quyền trợ giúp</h2><p>Mỗi đội được dùng hai quyền trong toàn bộ năm chặng. Mỗi quyền chỉ được dùng một lần và sẽ tự động bị khóa sau khi sử dụng.</p></div><ul><li><b>Mở hồ sơ lịch sử</b><span>Hiển thị một dữ kiện gợi ý cho câu hỏi hiện tại.</span></li><li><b>Loại trừ</b><span>Khóa hai trong ba phương án sai trên màn hình.</span></li></ul></section>
    <button className="primary centered" onClick={onStart}><Play size={18} fill="currentColor" /> Bắt đầu game</button>
  </main>
}
