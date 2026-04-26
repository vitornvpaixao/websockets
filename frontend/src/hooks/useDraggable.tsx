import { useState } from "react";

interface dragState {
    isDragging: boolean;
    offSetX: number;
    offSetY: number;
}

function useDraggable(){
    const [dragState, setDragState] = useState<dragState>({isDragging: false, offSetX: 0, offSetY: 0});

    const beginDrag = (e: React.PointerEvent<HTMLDivElement>): void => {
        const target = e.currentTarget as HTMLElement;

        setDragState({
            isDragging: true,
            offSetX: e.clientX - target.getBoundingClientRect().left,
            offSetY: e.clientY - target.getBoundingClientRect().top
        })
        target.setPointerCapture(e.pointerId);
    }

    const dragging = (e: React.PointerEvent<HTMLDivElement>): void => {
        if (!dragState.isDragging) return;
        const target = e.currentTarget as HTMLElement;
        const x = e.clientX - dragState.offSetX;
        const y = e.clientY - dragState.offSetY;

        target.style.transform = `translate(${x}px, ${y}px)`
    }

    const endDragging = (): void => {
        setDragState(prev => ({...prev, isDragging: false}));
    }

    return { beginDrag, dragging, endDragging }
}

export default useDraggable;
