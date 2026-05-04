import { useRef } from "react";
import useDraggable from "../hooks/useDraggable";

export default function Rectangle(props: any) {
  const translate = useRef<string | undefined>(undefined);
  const { beginDrag, dragging, endDragging } = useDraggable(props.id, props.onPositionChange);
  
  // To improve - apply position received from ws
  if (props.newPosition.isActive && props.newPosition.id === props.id) {
    translate.current = `translate(${props.newPosition.x}px, ${props.newPosition.y}px)`;
  }

  return (
      <div
        id={props.id}
        className={props.className}
        onPointerDown={beginDrag}
        onPointerMove={dragging}
        onPointerUp={endDragging}
        style= {{ transform: translate.current }}
      />
  )
}
