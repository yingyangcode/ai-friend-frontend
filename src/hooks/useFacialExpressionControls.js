import { useControls, button } from "leva";
import { useCallback, useState } from "react";

export const useFacialExpressionsControls = (
    // setupMode,
    setSetupMode,
    onWinkLeft,
    onWinkRight,
    facialExpressions,
    onFacialExpression,
    animation,
    animations,
    onAnimation,
    nodes
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

        enableSetupMode: button(() => {
            setSetupMode(true);
            // setupMode = true;
        }),
        disableSetupMode: button(() => {
            setSetupMode(false);
            // setupMode = false;
        }),
        logMorphTargetValues: button(() => {
            const emotionValues = {};
            Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
                if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
                    return; // eyes wink/blink are handled separately
                }
                const value =
                    nodes.EyeLeft.morphTargetInfluences[
                        nodes.EyeLeft.morphTargetDictionary[key]
                    ];
                if (value > 0.01) {
                    emotionValues[key] = value;
                }
            });
            console.log(JSON.stringify(emotionValues, null, 2));
        }),
    });
};
