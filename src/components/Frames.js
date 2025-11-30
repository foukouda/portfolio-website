import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { easing } from 'maath';
import Frame from './Frame.js';
import * as THREE from 'three';

const GOLDENRATIO = 1.61803398875;

const tempPos = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const tiltQuat = new THREE.Quaternion();
const tiltEuler = new THREE.Euler();

function Frames({
  images,
  onSelect,
  onOpenVideo,
  quaternion = new THREE.Quaternion(),
  position = new THREE.Vector3(),
}) {
  const ref = useRef();
  const clicked = useRef();
  const [, params] = useRoute('/item/:id');
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!ref.current) return;

    clicked.current = ref.current.getObjectByName(params?.id);
    if (clicked.current) {
      clicked.current.parent.updateWorldMatrix(true, true);
      clicked.current.parent.localToWorld(position.set(0, GOLDENRATIO / 2, 1.8));
      clicked.current.parent.getWorldQuaternion(quaternion);
    } else {
      position.set(0, 0.6, 8.5);
      quaternion.identity();
    }
  });

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();

    tempPos.copy(position);

    if (!clicked.current) {
      const radius = 0.8;
      tempPos.x += Math.sin(t * 0.25) * radius;
      tempPos.z += Math.cos(t * 0.25) * radius * 0.6;
      tempPos.y += Math.sin(t * 0.8) * 0.25;
    } else {
      tempPos.y += Math.sin(t * 1.2) * 0.08;
    }

    easing.damp3(state.camera.position, tempPos, 0.4, dt);

    tempQuat.copy(quaternion);

    const maxTilt = 0.15;
    tiltEuler.set(
      state.pointer.y * maxTilt,
      -state.pointer.x * maxTilt,
      0
    );
    tiltQuat.setFromEuler(tiltEuler);
    tempQuat.multiply(tiltQuat);

    easing.dampQ(state.camera.quaternion, tempQuat, 0.4, dt);

    if (ref.current && !clicked.current) {
      ref.current.rotation.y += dt * 0.18;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    const name = e.object.name;
    const isAlreadyActive = params?.id === name;
    const newId = isAlreadyActive ? null : name;

    if (newId) {
      setLocation('/item/' + newId);
    } else {
      setLocation('/');
    }

    if (onSelect) onSelect(newId);
  };

  const handlePointerMissed = () => {
    setLocation('/');
    if (onSelect) onSelect(null);
  };

  return (
    <group
      ref={ref}
      onClick={handleClick}
      onPointerMissed={handlePointerMissed}
    >
      {images.map((props) => (
        <Frame key={props.url} {...props} onOpenVideo={onOpenVideo} />
      ))}
    </group>
  );
}

export default Frames;
