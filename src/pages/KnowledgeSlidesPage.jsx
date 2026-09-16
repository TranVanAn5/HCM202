import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Expand,
  Flag,
  Lightbulb,
  Quote,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { knowledgeSlides } from '../data/knowledgeSlides'
import './KnowledgeSlidesPage.css'

function SlideContent({ slide, index }) {
  if (slide.type === 'cover' || slide.type === 'end') {
    return (
      <div className="presentation-cover">
        <span className="cover-icon"><Sparkles size={26} /></span>
        <p className="slide-period">{slide.period}</p>
        <h1>{slide.title}</h1>
        <p className="slide-lead">{slide.lead}</p>
        <span className="cover-label">{slide.label}</span>
      </div>
    )
  }

  if (slide.type === 'overview') {
    return (
      <div className="overview-slide">
        <p className="slide-period">{slide.period}</p>
        <h1>{slide.title}</h1>
        <div className="stage-list">
          {slide.stages.map(([number, date, text]) => (
            <article key={number}>
              <b>{number}</b>
              <div><span>{date}</span><p>{text}</p></div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="knowledge-slide-content">
      <div className="slide-heading">
        <div>
          <p className="slide-period">{slide.period}</p>
          <h1>{slide.title}</h1>
        </div>
        <span className="slide-index">{String(index + 1).padStart(2, '0')}</span>
      </div>

      {slide.lead && <p className="slide-lead">{slide.lead}</p>}

      {slide.columns && (
        <div className={'slide-columns columns-' + slide.columns.length}>
          {slide.columns.map((column) => (
            <article className="knowledge-card" key={column.heading}>
              <h2><Lightbulb size={17} />{column.heading}</h2>
              <ul>{column.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      )}

      {slide.points && (
        <div className="point-grid">
          {slide.points.map((point, pointIndex) => (
            <article key={point}>
              <CheckCircle2 size={17} />
              <span>{point}</span>
              <b>{String(pointIndex + 1).padStart(2, '0')}</b>
            </article>
          ))}
        </div>
      )}

      {slide.facts && (
        <div className="fact-grid">
          {slide.facts.map(([value, description]) => (
            <article key={value}><strong>{value}</strong><p>{description}</p></article>
          ))}
        </div>
      )}

      {slide.timeline && (
        <div className="knowledge-timeline">
          {slide.timeline.map(([date, event]) => (
            <article key={date}>
              <span>{date}</span>
              <i />
              <p>{event}</p>
            </article>
          ))}
        </div>
      )}

      {slide.quote && (
        <blockquote className="slide-quote">
          <Quote size={21} />
          <p>{slide.quote}</p>
        </blockquote>
      )}
    </div>
  )
}

export default function KnowledgeSlidesPage() {
  const [slideIndex, setSlideIndex] = useState(0)
  const [direction, setDirection] = useState('forward')
  const stageRef = useRef(null)
  const slide = knowledgeSlides[slideIndex]

  const goToSlide = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= knowledgeSlides.length || nextIndex === slideIndex) return
    setDirection(nextIndex > slideIndex ? 'forward' : 'backward')
    setSlideIndex(nextIndex)
  }

  const previous = () => goToSlide(slideIndex - 1)
  const next = () => goToSlide(slideIndex + 1)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) stageRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') previous()
      if (event.key === 'ArrowRight' || event.key === ' ') next()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <main className="slides-page">
      <header className="slides-header">
        <div>
          <p className="eyebrow"><Flag size={14} /> NỘI DUNG THUYẾT TRÌNH</p>
          <h1>Hành trình tư tưởng Hồ Chí Minh</h1>
        </div>
        <div className="slides-status">
          <CalendarDays size={16} />
          <span>{slideIndex + 1} / {knowledgeSlides.length}</span>
          <button onClick={toggleFullscreen} title="Trình chiếu toàn màn hình"><Expand size={17} /></button>
        </div>
      </header>

      <section className="presentation-stage" ref={stageRef}>
        <div key={slideIndex} className={'presentation-slide slide-' + direction + ' ' + (slide.type || 'content')}>
          <div className="slide-decoration decoration-one" />
          <div className="slide-decoration decoration-two" />
          <SlideContent slide={slide} index={slideIndex} />
          <footer>
            <span>HỒ SƠ THỜI GIAN</span>
            <i />
            <b>{String(slideIndex + 1).padStart(2, '0')}</b>
          </footer>
        </div>

        <button className="slide-edge previous" disabled={slideIndex === 0} onClick={previous} aria-label="Slide trước">
          <ArrowLeft />
        </button>
        <button className="slide-edge next" disabled={slideIndex === knowledgeSlides.length - 1} onClick={next} aria-label="Slide sau">
          <ArrowRight />
        </button>
      </section>

      <div className="slide-navigator">
        <button className="nav-arrow" disabled={slideIndex === 0} onClick={previous}><ArrowLeft size={16} /> Trước</button>
        <div className="slide-progress">
          {knowledgeSlides.map((item, index) => (
            <button
              key={item.title}
              className={index === slideIndex ? 'active' : ''}
              onClick={() => goToSlide(index)}
              title={item.title}
            />
          ))}
        </div>
        <button className="nav-arrow" disabled={slideIndex === knowledgeSlides.length - 1} onClick={next}>Sau <ArrowRight size={16} /></button>
      </div>
      <p className="slide-keyboard-tip">Dùng phím ← → hoặc Space để chuyển slide</p>
    </main>
  )
}
