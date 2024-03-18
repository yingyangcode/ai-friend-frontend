import { useCallback, useState } from "react";
import { useControls, button } from "leva";

export const useFacialExpressionsControls = (
    onWinkLeft,
    onWinkRight,
    facialExpressions,
    onFacialExpression,
    animation,
    animations,
    onAnimation
) => {
    useControls("FacialExpressions", {
        winkLeft: button(() => {
            onWinkLeft(true);
            setTimeout(() => onWinkLeft(false), 300);
        }),
        winkRight: button(() => {
            onWinkRight(true);
            setTimeout(() => onWinkRight(false), 300);
        }),
        facialExpression: {
            options: Object.keys(facialExpressions),
            onChange: (value) => onFacialExpression(value),
        },
        animation: {
            value: animation,
            options: animations.map((a) => a.name),
            onChange: (value) => onAnimation(value),
        },
    });
};
