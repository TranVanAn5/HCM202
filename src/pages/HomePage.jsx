import { ArrowRight, ChevronRight, Clock3, Play, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react'
import { rounds } from '../data/gameData'

export default function HomePage({ onStart, onRules }) {
  return (
    <main className="home">
      <div className="orb orb-one" /><div className="orb orb-two" />
      <section className="hero">
        <p className="eyebrow"><Sparkles size={15} /> TRÒ CHƠI TƯƠNG TÁC THEO ĐỘI</p>
        <h1>Hồ sơ thời gian<br /><em>Giải mã hành trình</em><br />Hồ Chí Minh</h1>
        <p className="hero-copy">Cùng đồng đội khôi phục những dấu mốc làm nên hành trình tư tưởng Hồ Chí Minh — từ lòng yêu nước đến khát vọng độc lập dân tộc.</p>
        <div className="hero-actions">
          <button className="primary" onClick={onStart}><Play size={18} fill="currentColor" /> Bắt đầu chuyên án</button>
          <button className="secondary" onClick={onRules}>Xem luật chơi <ArrowRight size={17} /></button>
        </div>
        <div className="hero-meta">
          <span><Users size={16} /> 3–6 đội cùng chơi</span><span><Clock3 size={16} /> 15–20 phút</span><span><Trophy size={16} /> 5 mảnh hồ sơ</span>
        </div>
      </section>
      <section className="case-preview">
        <div className="case-top"><span>HỒ SƠ MẬT</span><span>1911 — 1969</span></div>
        <div className="case-seal"><ShieldCheck size={42} /><b>CHUYÊN ÁN<br />LỊCH SỬ</b></div>
        <div className="case-list">{rounds.map((round, index) => <div key={round.era}><i>{String(index + 1).padStart(2, '0')}</i><span>{round.era}</span><ChevronRight size={16} /></div>)}</div>
      </section>
    </main>
  )
}
