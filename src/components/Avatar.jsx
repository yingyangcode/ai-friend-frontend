import React, { useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";

import {
    facialExpressions,
    lipsync_mapping,
    lerpMorphTarget,
} from "../utils/avatarUtils";
import { useFacialExpressionsControls } from "../hooks/useFacialExpressionControls";
import { useAvatarAnimations } from "../hooks/useAvatarAnimations";
import { useBlink } from "../hooks/useBlink";
import { useChat } from "../hooks/useChat";

export function Avatar(props) {
    const group = useRef();
    const { nodes, materials, scene } = useGLTF("/models/boy.glb");
    const { message, onMessagePlayed } = useChat();
    const [audio, setAudio] = useState();
    const [lipsync, setLipsync] = useState();
    const { animations, animation, setAnimation } = useAvatarAnimations(group);
    const [winkLeft, setWinkLeft] = useState(false);
    const [winkRight, setWinkRight] = useState(false);
    const [facialExpression, setFacialExpression] = useState("default");
    const { blink } = useBlink();

    useFacialExpressionsControls(
        setWinkLeft,
        setWinkRight,
        facialExpressions,
        setFacialExpression,
        animation,
        animations,
        setAnimation
    );

    useEffect(() => {
        console.log(message);
        if (!message) {
            setAnimation("Idle");
            setFacialExpression("default");
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

    useFrame(() => {
        Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
            const mapping = facialExpressions[facialExpression];
            if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
                return; // eyes wink/blink are handled separately
            }
            if (mapping && mapping[key]) {
                lerpMorphTarget(scene, key, mapping[key], 0.1);
            } else {
                lerpMorphTarget(scene, key, 0, 0.1);
            }
        });

        lerpMorphTarget(scene, "eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
        lerpMorphTarget(
            scene,
            "eyeBlinkRight",
            blink || winkRight ? 1 : 0,
            0.5
        );

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
                        0.2
                    );
                    break;
                }
            }
        }

        Object.values(lipsync_mapping).forEach((value) => {
            if (appliedMorphTargets.includes(value)) {
                return;
            }
            lerpMorphTarget(scene, value, 0, 0.1);
        });
    });

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
