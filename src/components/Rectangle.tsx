import useDraggable from "../hooks/useDraggable";

export default function Rectangle() {
  const { beginDrag, dragging, endDragging } = useDraggable();
  
  return (
      <div
        className="red-rectangle"
        onPointerDown={beginDrag}
        onPointerMove={dragging}
        onPointerUp={endDragging}
      />
  )
}