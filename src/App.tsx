import { Board } from './components/Board'
import './App.css'

const SHAPES = [
  { className: 'shape shape-circle shape-pink', style: { top: '12%', left: '5%' } },
  { className: 'shape shape-square shape-yellow', style: { top: '65%', left: '8%' } },
  { className: 'shape shape-circle shape-blue', style: { top: '30%', right: '4%' } },
  { className: 'shape shape-square shape-green', style: { top: '75%', right: '6%' } },
  { className: 'shape shape-diamond shape-orange', style: { top: '45%', left: '3%' } },
  { className: 'shape shape-circle shape-lilac', style: { top: '85%', left: '50%' } },
  { className: 'shape shape-square shape-pink', style: { top: '15%', right: '12%' } },
  { className: 'shape shape-diamond shape-yellow', style: { top: '55%', right: '2%' } },
  { className: 'shape shape-cross shape-blue', style: { top: '8%', left: '45%' } },
  { className: 'shape shape-cross shape-green', style: { top: '90%', right: '30%' } },
]

export default function App() {
  return (
    <div className="app">
      <div className="bg-shapes" aria-hidden>
        {SHAPES.map((s, i) => (
          <div
            key={i}
            className={s.className}
            style={{ ...s.style, animationDelay: `${i * -1.7}s` }}
          />
        ))}
      </div>
      <Board />
    </div>
  )
}
