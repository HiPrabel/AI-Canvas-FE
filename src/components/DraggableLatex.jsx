import { useRef } from 'react';
import Draggable from 'react-draggable';

export default function DraggableLatex({ latex, defaultPosition, onStop, darkMode }) {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={defaultPosition}
      onStop={onStop}
    >
      <div
        ref={nodeRef}
        className={`absolute p-2 rounded-md text-sm break-words
          ${darkMode ? 'text-white' : 'text-black'}
        `}
        style={{ width: '200px' }}
      >
        <div className="latex-content">{latex}</div>
      </div>
    </Draggable>
  );
}
