import { useEffect, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";

export function useAvatarAnimations(groupRef) {
  const { animations } = useGLTF("/models/animations.glb");
  const { actions, mixer } = useAnimations(animations, groupRef);
  const [animation, setAnimation] = useState(
    animations.find((a) => a.name === "Idle") ? "Idle" : animations[0].name
  );

  useEffect(() => {
    actions[animation]
      .reset()
      .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
      .play();

    return () => actions[animation].fadeOut(0.5);
  }, [animation, actions, mixer]);

  return { animations, animation, setAnimation };
}
