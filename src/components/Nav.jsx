import { BookOpen, History, Home, LibraryBig, Play } from 'lucide-react'

export default function Nav({ page, onNavigate, onStart }) {
  return (
    <nav className="topbar">
      <button className="brand" onClick={() => onNavigate('home')}>
        <span className="brand-mark"><History size={19} /></span>
        <span><b>HỒ SƠ THỜI GIAN</b><small>Hành trình Hồ Chí Minh</small></span>
      </button>
      <div className="nav-links">
        <button className={page === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}><Home size={16} /> Trang chủ</button>
        <button className={page === 'rules' ? 'active' : ''} onClick={() => onNavigate('rules')}><BookOpen size={16} /> Luật chơi</button>
        <button className={page === 'knowledge' ? 'active' : ''} onClick={() => onNavigate('knowledge')}><LibraryBig size={16} /> Kiến thức</button>
        <button className="nav-play" onClick={onStart}><Play size={15} /> Vào game</button>
      </div>
    </nav>
  )
}
