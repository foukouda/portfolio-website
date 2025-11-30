import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFrame } from '@react-three/fiber';
import { useCursor, Image, Html } from '@react-three/drei';
import { useRoute } from 'wouter';
import { easing } from 'maath';
import * as THREE from 'three';
import getUuid from 'uuid-by-string';
import Project from './Project.js';

const GOLDENRATIO = 1.61803398875;

function Frame({ url, title, subtitle, year, tags = [], videoUrl, onOpenVideo, ...props }) {
  const image = useRef();
  const frame = useRef();
  const [, params] = useRoute('/item/:id');
  const [hovered, hover] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const name = getUuid(url);
  const isActive = params?.id === name;

  useEffect(() => {
        if (isActive) {
      const delayDuration = 600;
      const timer = setTimeout(() => {
        if (videoUrl) {
          setShowVideo(true);
          if (onOpenVideo) onOpenVideo(videoUrl);
        } else {
          setTextVisible(true);
        }
      }, delayDuration);
      return () => clearTimeout(timer);
    } else {
      setTextVisible(false);
      setShowVideo(false);
    }
  }, [isActive, videoUrl]);

  // Prevent background scroll when modal is open and close on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowVideo(false);
    };
    if (showVideo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKeyDown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showVideo]);

  useCursor(hovered);

  useFrame((state, dt) => {
    if (!image.current) return;
    const targetScale = isActive ? 1.15 : hovered ? 1.05 : 1;
    easing.damp3(image.current.scale, [targetScale, targetScale, 1], 0.12, dt);
  });

  return (
    <>
      <group {...props}>
        <mesh
          name={name}
          onPointerOver={(e) => (e.stopPropagation(), hover(true))}
          onPointerOut={() => hover(false)}
          scale={[1, GOLDENRATIO, 0.05]}
          position={[0, GOLDENRATIO / 2, 0]}
          castShadow
          receiveShadow
        >
          {/* Cadre principal */}
          <boxGeometry />
          <meshStandardMaterial
            color={isActive ? '#ffb300' : hovered ? '#303030' : '#151515'}
            metalness={0.7}
            roughness={0.4}
            envMapIntensity={2}
          />

          {/* Bordure intérieure */}
          <mesh ref={frame} raycast={() => null} scale={[0.92, 0.95, 0.9]} position={[0, 0, 0.18]}>
            <boxGeometry />
            <meshStandardMaterial
              color="#000000"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>

          {/* Image */}
          <Image
            raycast={() => null}
            ref={image}
            position={[0, 0, 0.7]}
            url={url}
          />

          {/* Panneau de projet 2D */}
          {isActive && textVisible && (
            <Html fullscreen zIndexRange={[10, 20]}>
              <Project
                title={title}
                subtitle={subtitle}
                year={year}
                tags={tags}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </Html>
          )}
        </mesh>
      </group>
    </>
  );
}

export default Frame;
