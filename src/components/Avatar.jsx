import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useControls, button } from "leva";
import {
    facialExpressions,
    lipsync_mapping,
    lerpMorphTarget,
} from "../utils/avatarUtils";
import { useAvatarAnimations } from "../hooks/useAvatarAnimations";
import { useBlink } from "../hooks/useBlink";
import { useFacialExpressionsControls } from "../hooks/useFacialExpressionControls";
import { useMorphTargetControls } from "../hooks/useMorphTargetControls";
import { useChat } from "../hooks/useChat";
import * as THREE from "three";

let setupMode = false;
export function Avatar(props) {
    const { nodes, materials, scene } = useGLTF("/models/boy.glb");
    const { message, onMessagePlayed } = useChat();
    const [lipsync, setLipsync] = useState();

    useEffect(() => {
        console.log(message);
        if (!message) {
            setAnimation("Idle");
            return;
        }
        setAnimation(message.animation);
        setFacialExpression(message.facialExpression);
        setLipsync(message.lipsync);
        const audio = new Audio("data:audio/mp3;base64," + message.audio);
        audio.play();
        setAudio(audio);
        audio.onended = onMessagePlayed;
    }, [message]);

    const group = useRef();
    const { animations, animation, setAnimation } = useAvatarAnimations(group);
    const [winkLeft, setWinkLeft] = useState(false);
    const [winkRight, setWinkRight] = useState(false);
    const [facialExpression, setFacialExpression] = useState("");
    const [audio, setAudio] = useState();
    const [setupMode, setSetupMode] = useState(false);
    useFacialExpressionsControls(
        // setupMode,
        setSetupMode,
        setWinkLeft,
        setWinkRight,
        facialExpressions,
        setFacialExpression,
        animation,
        animations,
        setAnimation,
        nodes
    );

    const { set } = useMorphTargetControls(scene, nodes, setupMode);

    useFrame(() => {
        !setupMode &&
            Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
                const mapping = facialExpressions[facialExpression];
                if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
                    return; // eyes wink/blink are handled separately
                }
                if (mapping && mapping[key]) {
                    lerpMorphTarget(
                        scene,
                        key,
                        mapping[key],
                        0.1,
                        setupMode,
                        set
                    );
                } else {
                    lerpMorphTarget(scene, key, 0, 0.1, setupMode, set);
                }
            });

        lerpMorphTarget(
            scene,
            "eyeBlinkLeft",
            blink || winkLeft ? 1 : 0,
            0.5,
            setupMode,
            set
        );
        lerpMorphTarget(
            scene,
            "eyeBlinkRight",
            blink || winkRight ? 1 : 0,
            0.5,
            setupMode,
            set
        );

        if (setupMode) {
            return;
        }

        // Lipsync
        const appliedMorphTargets = [];
        if (lipsync) {
            const currentAudioTime = audio.currentTime;
            for (let i = 0; i < lipsync.mouthCues.length; i++) {
                const mouthCue = lipsync.mouthCues[i];
                if (
                    currentAudioTime >= mouthCue.start &&
                    currentAudioTime <= mouthCue.end
                ) {
                    appliedMorphTargets.push(lipsync_mapping[mouthCue.value]);
                    lerpMorphTarget(
                        scene,
                        lipsync_mapping[mouthCue.value],
                        1,
                        0.2,
                        setupMode,
                        set
                    );
                    break;
                }
            }
        }

        Object.values(lipsync_mapping).forEach((value) => {
            if (appliedMorphTargets.includes(value)) {
                return;
            }
            lerpMorphTarget(scene, value, 0, 0.1, setupMode, set);
        });
    });

    // useControls("FacialExpressions", {
    //     // chat: button(() => chat()),
    //     winkLeft: button(() => {
    //         setWinkLeft(true);
    //         setTimeout(() => setWinkLeft(false), 300);
    //     }),
    //     winkRight: button(() => {
    //         setWinkRight(true);
    //         setTimeout(() => setWinkRight(false), 300);
    //     }),
    //     animation: {
    //         value: animation,
    //         options: animations.map((a) => a.name),
    //         onChange: (value) => setAnimation(value),
    //     },
    //     facialExpression: {
    //         options: Object.keys(facialExpressions),
    //         onChange: (value) => setFacialExpression(value),
    //     },
    //     enableSetupMode: button(() => {
    //         // setSetupMode(true);
    //         setupMode = true;
    //     }),
    //     disableSetupMode: button(() => {
    //         // setSetupMode(false);
    //         setupMode = false;
    //     }),
    //     logMorphTargetValues: button(() => {
    //         const emotionValues = {};
    //         Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
    //             if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
    //                 return; // eyes wink/blink are handled separately
    //             }
    //             const value =
    //                 nodes.EyeLeft.morphTargetInfluences[
    //                     nodes.EyeLeft.morphTargetDictionary[key]
    //                 ];
    //             if (value > 0.01) {
    //                 emotionValues[key] = value;
    //             }
    //         });
    //         console.log(JSON.stringify(emotionValues, null, 2));
    //     }),
    // });
    // const lerpMorphTarget = (target, value, speed = 0.1) => {
    //     scene.traverse((child) => {
    //         if (child.isSkinnedMesh && child.morphTargetDictionary) {
    //             const index = child.morphTargetDictionary[target];
    //             if (
    //                 index === undefined ||
    //                 child.morphTargetInfluences[index] === undefined
    //             ) {
    //                 return;
    //             }
    //             child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
    //                 child.morphTargetInfluences[index],
    //                 value,
    //                 speed
    //             );

    //             if (!setupMode) {
    //                 try {
    //                     set({
    //                         [target]: value,
    //                     });
    //                 } catch (e) {}
    //             }
    //         }
    //     });
    // };
    // const [, set] = useControls("MorphTarget", () =>
    //     Object.assign(
    //         {},
    //         ...Object.keys(nodes.EyeLeft.morphTargetDictionary).map((key) => {
    //             return {
    //                 [key]: {
    //                     label: key,
    //                     value: 0,
    //                     min: nodes.EyeLeft.morphTargetInfluences[
    //                         nodes.EyeLeft.morphTargetDictionary[key]
    //                     ],
    //                     max: 1,
    //                     onChange: (val) => {
    //                         if (setupMode) {
    //                             lerpMorphTarget(key, val, 1);
    //                         }
    //                     },
    //                 },
    //             };
    //         })
    //     )
    // );
    const { blink } = useBlink();

    return (
        <group {...props} dispose={null} ref={group}>
            <primitive object={nodes.Hips} />
            <skinnedMesh
                name="EyeLeft"
                geometry={nodes.EyeLeft.geometry}
                material={materials.Wolf3D_Eye}
                skeleton={nodes.EyeLeft.skeleton}
                morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
                morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
            />
            <skinnedMesh
                name="EyeRight"
                geometry={nodes.EyeRight.geometry}
                material={materials.Wolf3D_Eye}
                skeleton={nodes.EyeRight.skeleton}
                morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
                morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
            />
            <skinnedMesh
                name="Wolf3D_Head"
                geometry={nodes.Wolf3D_Head.geometry}
                material={materials.Wolf3D_Skin}
                skeleton={nodes.Wolf3D_Head.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
            />
            <skinnedMesh
                name="Wolf3D_Teeth"
                geometry={nodes.Wolf3D_Teeth.geometry}
                material={materials.Wolf3D_Teeth}
                skeleton={nodes.Wolf3D_Teeth.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
            />
            <skinnedMesh
                geometry={nodes.Wolf3D_Glasses.geometry}
                material={materials.Wolf3D_Glasses}
                skeleton={nodes.Wolf3D_Glasses.skeleton}
            />
            <skinnedMesh
                geometry={nodes.Wolf3D_Headwear.geometry}
                material={materials.Wolf3D_Headwear}
                skeleton={nodes.Wolf3D_Headwear.skeleton}
            />
            <skinnedMesh
                name="Wolf3D_Outfit_Top"
                geometry={nodes.Wolf3D_Outfit_Top.geometry}
                material={materials.Wolf3D_Outfit_Top}
                skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
                morphTargetDictionary={
                    nodes.Wolf3D_Outfit_Top.morphTargetDictionary
                }
                morphTargetInfluences={
                    nodes.Wolf3D_Outfit_Top.morphTargetInfluences
                }
            />
            <skinnedMesh
                name="Wolf3D_Outfit_Bottom"
                geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
                material={materials.Wolf3D_Outfit_Bottom}
                skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
                morphTargetDictionary={
                    nodes.Wolf3D_Outfit_Bottom.morphTargetDictionary
                }
                morphTargetInfluences={
                    nodes.Wolf3D_Outfit_Bottom.morphTargetInfluences
                }
            />
            <skinnedMesh
                name="Wolf3D_Outfit_Footwear"
                geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
                material={materials.Wolf3D_Outfit_Footwear}
                skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
                morphTargetDictionary={
                    nodes.Wolf3D_Outfit_Footwear.morphTargetDictionary
                }
                morphTargetInfluences={
                    nodes.Wolf3D_Outfit_Footwear.morphTargetInfluences
                }
            />
            <skinnedMesh
                name="Wolf3D_Body"
                geometry={nodes.Wolf3D_Body.geometry}
                material={materials.Wolf3D_Body}
                skeleton={nodes.Wolf3D_Body.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Body.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Body.morphTargetInfluences}
            />
        </group>
    );
}

useGLTF.preload("/models/boy.glb");
