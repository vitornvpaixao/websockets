import { useState } from "react";

function useDraggable(){
    const [drag, setDrag] = useState(false);
    const [offSetX, setOffSetX] = useState(0);
    const [offSetY, setOffSetY] = useState(0);

    const beginDrag = (e: React.PointerEvent<HTMLDivElement>): void => {
        const target = e.target as HTMLElement;

        setDrag(true);
        setOffSetX(e.clientX - target.getBoundingClientRect().left);
        setOffSetY(e.clientY - target.getBoundingClientRect().top);
        target.setPointerCapture(e.pointerId);
    }

    const dragging = (e: React.PointerEvent<HTMLDivElement>): void => {
        if (!drag) return;
        const target = e.target as HTMLElement;
        const x = e.clientX - offSetX;
        const y = e.clientY - offSetY;

        target.style.transform = `translate(${x}px, ${y}px)`
    }

    const endDragging = (e: React.PointerEvent<HTMLDivElement>): void => {
        setDrag(false);
    }

    return { beginDrag, dragging, endDragging }
}

export default useDraggable;
