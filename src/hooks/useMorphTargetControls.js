import { useEffect, useRef } from "react";
import { useControls, button } from "leva";
import * as THREE from "three";
import { lerpMorphTarget } from "../utils/avatarUtils";

export const useMorphTargetControls = (scene, nodes, setupMode) => {
    // Use a ref to track the current value of setupMode
    const setupModeRef = useRef(setupMode);

    // Update the ref when the setupMode state changes
    useEffect(() => {
        setupModeRef.current = setupMode;
    }, [setupMode]);

    const [, set] = useControls("MorphTarget", () =>
        Object.assign(
            {},
            ...Object.keys(nodes.EyeLeft.morphTargetDictionary).map((key) => ({
                [key]: {
                    label: key,
                    value: 0,
                    min: nodes.EyeLeft.morphTargetInfluences[
                        nodes.EyeLeft.morphTargetDictionary[key]
                    ],
                    max: 1,
                    onChange: (val) => {
                        console.log(setupModeRef.current);
                        if (setupModeRef.current) {
                            lerpMorphTarget(
                                scene,
                                key,
                                val,
                                1,
                                setupModeRef.current,
                                set
                            );
                        }
                    },
                },
            }))
        )
    );
    return { set };
};
