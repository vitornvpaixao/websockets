import { useState } from "react";
import { type movedObject } from "../types";

interface dragState {
    isDragging: boolean;
    offSetX: number;
    offSetY: number;
    releasePointer: Function | null
}

function useDraggable(elemREF: any, elemID: number | string, onPositionChange: Function){
    // Should i change this to ref instead state ??
    const [dragState, setDragState] = useState<dragState>({isDragging: false, offSetX: 0, offSetY: 0, releasePointer: null});
    
    const beginDrag = (e: React.PointerEvent<HTMLDivElement>): void => {
        const target = e.currentTarget as HTMLElement;
        const pointerID = e.pointerId;

        setDragState({
            isDragging: true,
            offSetX: e.clientX - target.getBoundingClientRect().left,
            offSetY: e.clientY - target.getBoundingClientRect().top,
            releasePointer: () => target.releasePointerCapture(pointerID)
        })

        target.setPointerCapture(pointerID);
    }

    const dragging = (e: React.PointerEvent<HTMLDivElement>): string | void => {
        if (!dragState.isDragging) return;
        const newX = e.clientX - dragState.offSetX;
        const newY = e.clientY - dragState.offSetY;
        // Sendmsg to ws with movement information
        const movedObject: movedObject = {
            id: elemID,
            x: newX,
            y: newY 
        }

        applyPosition(newX, newY);
        onPositionChange(movedObject);
    }

    const endDragging = (): void => {
        setDragState(prev => ({...prev, isDragging: false}));
        
        if (!dragState.releasePointer) return;
        dragState.releasePointer();
    }

    const applyPosition = (x: number, y: number): void => {
        if (!elemREF.current) return;
        const elem = elemREF.current as HTMLElement;

        elem.style.transform = `translate(${x}px, ${y}px)`
    }

    return { beginDrag, dragging, endDragging, applyPosition }
}

export default useDraggable;
