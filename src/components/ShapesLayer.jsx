import React from 'react';

// Layer for shapes: SVG for rect/arrow (background), divs for textbox (foreground)
export default function ShapesLayer({ shapes = [], onShapeContext }) {
  const width = 4000;
  const height = 3000;

  // Séparer les shapes en arrière-plan (rect/arrow) et avant-plan (textbox)
  const backgroundShapes = shapes.filter(s => s && (s.type === 'rect' || s.type === 'arrow'));
  const textboxShapes = shapes.filter(s => s && s.type === 'textbox');
  const oldTextShapes = shapes.filter(s => s && s.type === 'text'); // backward compatibility

  return (
    <>
      {/* SVG Layer for rectangles and arrows (background) */}
      <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 1 }}>
        {backgroundShapes.map((s) => {
          if (s.type === 'rect') {
            const x = Math.min(s.x1, s.x2);
            const y = Math.min(s.y1, s.y2);
            const w = Math.abs(s.x2 - s.x1);
            const h = Math.abs(s.y2 - s.y1);
            return (
              <rect
                key={s.id}
                x={x}
                y={y}
                width={w}
                height={h}
                fill="rgba(43,108,223,0.06)"
                stroke={s.stroke || '#2b6cdf'}
                strokeWidth={2}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onShapeContext) onShapeContext(s, e);
                }}
              />
            );
          }
          if (s.type === 'arrow') {
            const x1 = s.x1;
            const y1 = s.y1;
            const x2 = s.x2;
            const y2 = s.y2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx*dx+dy*dy) || 1;
            const ux = dx/len;
            const uy = dy/len;
            const headLen = 12;
            const hx = x2 - ux*headLen;
            const hy = y2 - uy*headLen;
            const leftx = hx + (-uy)*6;
            const lefty = hy + (ux)*6;
            const rightx = hx + (uy)*6;
            const righty = hy + (-ux)*6;
            return (
              <g
                key={s.id}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onShapeContext) onShapeContext(s, e);
                }}
              >
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={s.stroke || '#2b6cdf'} strokeWidth={2} />
                <polygon points={`${x2},${y2} ${leftx},${lefty} ${rightx},${righty}`} fill={s.stroke || '#2b6cdf'} />
              </g>
            );
          }
          return null;
        })}
        {/* Old text shapes in SVG for backward compatibility */}
        {oldTextShapes.map((s) => {
          const x = s.x1 || s.x || 0;
          const y = s.y1 || s.y || 0;
          return (
            <text
              key={s.id}
              x={x}
              y={y}
              fontSize={s.fontSize || 14}
              fill={s.fill || '#111'}
              style={{ pointerEvents: 'auto', cursor: 'pointer', userSelect: 'none' }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onShapeContext) onShapeContext(s, e);
              }}
            >
              {s.text}
            </text>
          );
        })}
      </svg>

      {/* Textbox layer (foreground) - rendered as divs */}
      {textboxShapes.map((s) => {
        const x = s.x1 || s.x || 0;
        const y = s.y1 || s.y || 0;
        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              backgroundColor: '#fff',
              border: '2px solid #2b6cdf',
              borderRadius: 4,
              padding: '6px 10px',
              fontSize: 14,
              fontWeight: '500',
              color: '#111',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 100,
              pointerEvents: 'auto',
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onShapeContext) onShapeContext(s, e);
            }}
          >
            {s.text}
          </div>
        );
      })}
    </>
  );
}
