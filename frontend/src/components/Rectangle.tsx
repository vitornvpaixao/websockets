import { useRef } from "react";
import useDraggable from "../hooks/useDraggable";

export default function Rectangle(props: any) {
  const elementRef = useRef(null);
  const { beginDrag, dragging, endDragging, applyPosition } = useDraggable(elementRef, props.id, props.onPositionChange);

  // To improve - apply position received from ws
  if (props.newPosition.isActive) {
    applyPosition(props.newPosition.x, props.newPosition.y);
  }

  return (
      <div
        ref={elementRef}
        id={props.id}
        className={props.className}
        onPointerDown={beginDrag}
        onPointerMove={dragging}
        onPointerUp={endDragging}
      />
  )
}
