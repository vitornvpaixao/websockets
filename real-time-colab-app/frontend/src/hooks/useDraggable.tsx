import { useState, useRef } from "react";
import { type movedObject } from "../types";

interface dragState {
    isDragging: boolean;
    offSetX: number;
    offSetY: number;
}

function useDraggable(elemId: string, onPositionChange: Function){
    const [ dragState, setDragState ] = useState<dragState>({isDragging: false, offSetX: 0, offSetY: 0});
    const pointerReleaseRef = useRef<() => void | null>(null);

    const beginDrag = (e: React.PointerEvent<HTMLDivElement>): void => {
        const target = e.currentTarget as HTMLElement;
        const pointerId = e.pointerId;

        setDragState({
            isDragging: true,
            offSetX: e.clientX - target.getBoundingClientRect().left,
            offSetY: e.clientY - target.getBoundingClientRect().top,
        })

        pointerReleaseRef.current = () => target.releasePointerCapture(pointerId)
        target.setPointerCapture(pointerId);
    }

    const dragging = (e: React.PointerEvent<HTMLDivElement>): string | void => {
        if (!dragState.isDragging) return;
        const newX = e.clientX - dragState.offSetX;
        const newY = e.clientY - dragState.offSetY;
        
        // Send message to WebSocket with movement information
        const movedObject: movedObject = {
            id: elemId,
            x: newX,
            y: newY 
        }

        onPositionChange(movedObject);
    }

    const endDragging = (): void => {
        setDragState(prev => ({...prev, isDragging: false}));
        pointerReleaseRef.current?.();
    }

    return { beginDrag, dragging, endDragging }
}

export default useDraggable;
