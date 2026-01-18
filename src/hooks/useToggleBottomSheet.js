import { useCallback } from "react";

export const useToggleBottomSheet = ({
    bottomSheetRef,
    isSheetOpen,
    setIsSheetOpen,
}) => {
    const toggleMenu = useCallback(() => {
        if (isSheetOpen) {
            bottomSheetRef.current?.close();
            setIsSheetOpen(false);
        } else {
            bottomSheetRef.current?.expand();
            setIsSheetOpen(true);
        }
    }, [isSheetOpen]);
    return toggleMenu;
}