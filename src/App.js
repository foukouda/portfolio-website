import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import Frames from './components/Frames.js';
import * as THREE from 'three';

// Liste des GIFs popups
const GIF_URLS = [
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb203cnVzcWN1OWZkeHJsYzNtaHR5dW44MnB6NmRmZXV5b3V1NTdwciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3pluvSE3EL3nVQA1mm/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjRkeWl2b2VjbWJweG8wcGI5ZmdtZzM0MnNjem1mMzI5M3NyM3NseiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PmpA5ohOUl1xC/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjN6dXdnOGlkems3bzF5MmY5dzVhNDExOGx0ZDA0bXB1cHB6cDYzNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Nda9GjMZ6BQpa/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmhhMWpzNDgwYnhlam1tdHBmeWhieTBsZWNncmV3eXA3dWltODI3cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WoTqb0vq0xrx42Sj8s/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXkwYnRoaTRzbDV4MmFid3BoaHVtbWgzdG8ybmozOThsNTYza3RqZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1bJhBLADGSpkxitN49/giphy.gif',
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXA0MDdmOGMyc3BhOWVjNnpsZnY2a3pmb2RwYWdsZWVhbXNzcjE2cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/G5Ed9LJqPKfew/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDQzZmx1NDVucmp4eHFma2wxajhwcmF1c3M1d213OWU3ZjQ1bnlueiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RLJxQtX8Hs7XytaoyX/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2Y3d21mZ2l6NGFraDQ3eDZqdmtueWdveThzcWZucGwwbDloeHM2YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RBIwm8rlA2Fy1CG5xa/giphy.gif',
];

// Soleil qui tourne autour de la scène (un peu ralenti)
const Sun = () => {
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.25; // plus lent
    const radius = 30;
    if (!group.current) return;

    group.current.position.set(
      Math.cos(t) * radius,
      18 + Math.sin(t * 2) * 2,
      Math.sin(t) * radius
    );
  });

  return (
    <group ref={group}>
      <directionalLight
        intensity={1.5}
        color="#ffd27f"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-near={5}
      />
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#ffcc80" />
      </mesh>
    </group>
  );
};

// Sol de base (terrain)
const Ground = () => (
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    receiveShadow
    position={[0, -0.5, 0]}
  >
    <planeGeometry args={[80, 80]} />
    <meshStandardMaterial color="#34521a" roughness={1} metalness={0} />
  </mesh>
);

// Herbe réaliste
const GrassField = () => {
  const group = useRef();

  const tufts = useMemo(
    () =>
      Array.from({ length: 260 }, () => ({
        x: (Math.random() - 0.5) * 32,
        z: (Math.random() - 0.5) * 32,
        height: 0.7 + Math.random() * 1.3,
        width: 0.07 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
        yaw: Math.random() * Math.PI * 2,
        hueVariant: Math.floor(Math.random() * 3),
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() * 0.7;
    group.current.children.forEach((tuft, i) => {
      const data = tufts[i];
      tuft.rotation.x = Math.sin(t * 1.2 + data.phase) * 0.22;
      tuft.rotation.z = Math.cos(t * 0.9 + data.phase) * 0.16;
    });
  });

  return (
    <group ref={group}>
      {tufts.map((b, i) => {
        const baseColor =
          b.hueVariant === 0 ? '#4caf50' : b.hueVariant === 1 ? '#66bb6a' : '#2e7d32';

        const materialProps = {
          color: baseColor,
          roughness: 1,
          metalness: 0,
          side: THREE.DoubleSide,
        };

        const bladeCount = 3;

        return (
          <group
            key={i}
            position={[b.x, -0.5, b.z]}
            rotation={[0, b.yaw, 0]}
          >
            {Array.from({ length: bladeCount }).map((_, j) => {
              const angle = (j / bladeCount) * Math.PI;
              return (
                <mesh
                  key={j}
                  position={[0, b.height / 2, 0]}
                  rotation={[0, angle, 0]}
                  castShadow
                  receiveShadow
                >
                  <planeGeometry args={[b.width, b.height, 1, 3]} />
                  <meshStandardMaterial {...materialProps} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

// Arbres colorés
const Trees = () => {
  const group = useRef();

  const trees = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        x: (Math.random() - 0.5) * 50,
        z: (Math.random() - 0.5) * 50,
        scale: 1.2 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2,
        variant: i % 4,
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() * 0.5;
    group.current.children.forEach((tree, i) => {
      const tr = trees[i];
      tree.rotation.z = Math.sin(t + tr.phase) * 0.1;
    });
  });

  return (
    <group ref={group}>
      {trees.map((t, i) => {
        const foliageColors = ['#a5d6a7', '#ffcc80', '#ce93d8', '#ff8a80'];
        const leafColor = foliageColors[t.variant];

        return (
          <group
            key={i}
            position={[t.x, -0.5, t.z]}
            scale={[t.scale, t.scale, t.scale]}
          >
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.12, 0.18, 1.6, 8]} />
              <meshStandardMaterial color="#6d4c41" roughness={1} />
            </mesh>
            <mesh position={[0, 1.7, 0]} castShadow>
              <sphereGeometry args={[0.7, 16, 16]} />
              <meshStandardMaterial color={leafColor} roughness={0.8} />
            </mesh>
            <mesh position={[0.4, 1.4, -0.2]} castShadow>
              <sphereGeometry args={[0.45, 16, 16]} />
              <meshStandardMaterial color={leafColor} roughness={0.8} />
            </mesh>
            <mesh position={[-0.35, 1.45, 0.3]} castShadow>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color={leafColor} roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Fleurs
const Flowers = () => {
  const group = useRef();

  const flowers = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        x: (Math.random() - 0.5) * 18,
        z: (Math.random() - 0.5) * 18,
        phase: Math.random() * Math.PI * 2,
        color: ['#ffeb3b', '#f48fb1', '#ffab91', '#b39ddb'][
          Math.floor(Math.random() * 4)
        ],
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() * 0.7;
    group.current.children.forEach((fl, i) => {
      const f = flowers[i];
      fl.position.y = -0.35 + Math.sin(t * 2.0 + f.phase) * 0.04;
      fl.rotation.z = Math.sin(t * 1.3 + f.phase) * 0.08;
    });
  });

  return (
    <group ref={group}>
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, -0.35, f.z]}>
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 6]} />
            <meshStandardMaterial color="#2e7d32" roughness={1} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color={f.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Nuages
const Clouds = () => {
  const group = useRef();

  const clouds = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        baseX: (Math.random() - 0.5) * 60,
        z: -20 - Math.random() * 20,
        y: 10 + Math.random() * 6,
        speed: 0.6 + Math.random() * 0.6,
        scale: 2 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() * 0.5;
    group.current.children.forEach((cloud, i) => {
      const c = clouds[i];
      const span = 140;
      cloud.position.x =
        ((c.baseX + t * c.speed + span / 2) % span) - span / 2;
      cloud.position.y = c.y + Math.sin(t * 0.7 + c.phase) * 0.3;
      cloud.position.z = c.z;
    });
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group
          key={i}
          position={[c.baseX, c.y, c.z]}
          scale={[c.scale, c.scale, c.scale]}
        >
          <mesh>
            <sphereGeometry args={[0.9, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[1, 0.2, 0]}>
            <sphereGeometry args={[0.7, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.9, 0.1, 0]}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Chats
const Cats = () => {
  const group = useRef();

  const cats = useMemo(
    () => [
      { x: -2.2, z: 2.4, color: '#ffab91', y: -0.35 },
      { x: 2.5, z: 1.8, color: '#90caf9', y: -0.35 },
      { x: -1.5, z: -1.8, color: '#f48fb1', y: -0.35 },
      { x: 1.2, z: -2.3, color: '#fff59d', y: -0.35 },
    ],
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() * 0.6;
    group.current.children.forEach((cat, i) => {
      const c = cats[i];
      const radius = 0.4;
      const angle = t + i;
      cat.position.x = c.x + Math.cos(angle) * radius;
      cat.position.z = c.z + Math.sin(angle) * radius;
      cat.position.y = c.y + Math.sin(t * 2.0 + i) * 0.1;
      cat.rotation.y = Math.sin(t * 1.8 + i) * 0.8;
    });
  });

  return (
    <group ref={group}>
      {cats.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={[0.5, 0.5, 0.5]}>
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.3, 0.9]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
          <mesh position={[0, 0.45, 0.25]} castShadow>
            <boxGeometry args={[0.4, 0.35, 0.35]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
          <mesh position={[-0.12, 0.63, 0.3]} castShadow>
            <boxGeometry args={[0.1, 0.12, 0.1]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
          <mesh position={[0.12, 0.63, 0.3]} castShadow>
            <boxGeometry args={[0.1, 0.12, 0.1]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
          <mesh position={[0, 0.3, -0.5]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Étang
const Pond = () => {
  const waterRef = useRef();

  useFrame((state) => {
    if (!waterRef.current) return;
    const t = state.clock.getElapsedTime() * 0.6;
    waterRef.current.position.y = 0.02 + Math.sin(t) * 0.03;
  });

  return (
    <group position={[3, -0.5, -3]}>
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <circleGeometry args={[2.4, 32]} />
        <meshStandardMaterial
          color="#4fc3f7"
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[2.4, 2.7, 32]} />
        <meshStandardMaterial color="#5d4037" roughness={1} />
      </mesh>
    </group>
  );
};

// Grenouilles
const Frogs = () => {
  const group = useRef();

  const frogs = useMemo(
    () => [
      { x: 2.1, z: -2.1, y: -0.46, phase: 0 },
      { x: 3.6, z: -3.8, y: -0.46, phase: 1.3 },
      { x: 3.4, z: -2.3, y: -0.46, phase: 2.2 },
    ],
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() * 0.8;
    group.current.children.forEach((frog, i) => {
      const f = frogs[i];
      frog.position.x = f.x;
      frog.position.z = f.z;
      frog.position.y = f.y + Math.sin(t * 1.4 + f.phase) * 0.03;
      frog.rotation.y = Math.sin(t * 0.8 + f.phase) * 0.5;
    });
  });

  return (
    <group ref={group}>
      {frogs.map((f, i) => (
        <group key={i} position={[f.x, f.y, f.z]} scale={[0.35, 0.35, 0.35]}>
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.14, 14, 14]} />
            <meshStandardMaterial color="#43a047" />
          </mesh>
          <mesh position={[0, 0.13, 0.12]} castShadow>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#43a047" />
          </mesh>
          <mesh position={[-0.05, 0.17, 0.18]} castShadow>
            <sphereGeometry args={[0.03, 10, 10]} />
            <meshStandardMaterial color="#c5e1a5" />
          </mesh>
          <mesh position={[0.05, 0.17, 0.18]} castShadow>
            <sphereGeometry args={[0.03, 10, 10]} />
            <meshStandardMaterial color="#c5e1a5" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Canards
const Ducks = () => {
  const group = useRef();

  const ducks = useMemo(
    () => [
      { cx: 3, cz: -3, radius: 1.1, speed: 0.4, phase: 0 },
      { cx: 3, cz: -3, radius: 1.6, speed: 0.35, phase: Math.PI },
    ],
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() * 0.4;
    group.current.children.forEach((duck, i) => {
      const d = ducks[i];
      const angle = t * d.speed + d.phase;
      const x = d.cx + Math.cos(angle) * d.radius;
      const z = d.cz + Math.sin(angle) * d.radius;

      duck.position.x = x;
      duck.position.z = z;
      duck.position.y = -0.46 + Math.sin(t * 1.2 + d.phase) * 0.02;
      duck.rotation.y = -angle + Math.PI / 2;
    });
  });

  return (
    <group ref={group}>
      {ducks.map((d, i) => (
        <group key={i} position={[d.cx + d.radius, -0.46, d.cz]} scale={[0.55, 0.55, 0.55]}>
          <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#ffeb3b" />
          </mesh>
          <mesh position={[0, 0.13, 0.18]} castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#fffde7" />
          </mesh>
          <mesh position={[0, 0.11, 0.28]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.08]} />
            <meshStandardMaterial color="#ffb300" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const App = ({ images }) => {
  const [activeItem, setActiveItem] = useState(null);
  const [hasSeenScream, setHasSeenScream] = useState(false);
  const [showScream, setShowScream] = useState(false);
  const [modalVideoUrl, setModalVideoUrl] = useState(null);

  // compteur pour garder le 2e clic = cryptomineur
  const [frameClickCount, setFrameClickCount] = useState(0);

  // popup "crypto mineur"
  const [showMiner, setShowMiner] = useState(false);
  const [minerPos, setMinerPos] = useState({ x: 50, y: 40 }); // en %
  const [minerEscape, setMinerEscape] = useState(false);
  const [minerProgress, setMinerProgress] = useState(0);

  // GIF popups & tempête
  const [gifPopups, setGifPopups] = useState([]);
  const [gifStormActive, setGifStormActive] = useState(false);

  const screamAudioRef = useRef(null);
  const bgMusicRef = useRef(null);
  const popupSoundRef = useRef(null); // précharge le son, même si on utilise new Audio()

  const handleSelect = (itemId) => {
    setActiveItem(itemId);

    // 1er clic : scream (une seule fois)
    if (!hasSeenScream && itemId) {
      setHasSeenScream(true);
      setShowScream(true);
    }

    // 2e clic : popup cryptomineur
    setFrameClickCount((prev) => {
      const next = prev + 1;
      if (next === 2 && itemId && !showMiner) {
        setShowMiner(true);
      }
      return next;
    });
  };

  const handleOpenVideo = (url) => {
    setModalVideoUrl(url || null);
  };

  // Gestion du scream (volume qui baisse)
  useEffect(() => {
    const audio = screamAudioRef.current;
    if (!showScream || !audio) return;

    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().catch(() => {});

    let volume = 1;
    const step = 0.05;
    const interval = setInterval(() => {
      volume -= step;
      if (volume <= 0) {
        volume = 0;
        audio.volume = 0;
        clearInterval(interval);
        audio.pause();
        setShowScream(false);
        return;
      }
      audio.volume = volume;
    }, 200);

    return () => clearInterval(interval);
  }, [showScream]);

  // Musique de fond principale : démarre au 1er clic / touche
  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.8;

    const playOnInteraction = () => {
      audio.play().catch(() => {});
      window.removeEventListener('pointerdown', playOnInteraction);
      window.removeEventListener('keydown', playOnInteraction);
    };

    window.addEventListener('pointerdown', playOnInteraction);
    window.addEventListener('keydown', playOnInteraction);

    return () => {
      window.removeEventListener('pointerdown', playOnInteraction);
      window.removeEventListener('keydown', playOnInteraction);
    };
  }, []);

  // Logique de la popup cryptomineur (version rapide ~5s)
  useEffect(() => {
    if (!showMiner) return;

    setMinerPos({ x: 50, y: 40 });
    setMinerEscape(true);
    setMinerProgress(0);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5; // 5% toutes les 100 ms => ~5 s
      if (progress > 100) progress = 100;
      setMinerProgress(progress);
      if (progress === 100) {
        clearInterval(progressInterval);
      }
    }, 100);

    const escapeTimeout = setTimeout(() => {
      setMinerEscape(false); // après ~5 s, elle arrête de fuir
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(escapeTimeout);
    };
  }, [showMiner]);

  const handleMinerMouseMove = (e) => {
    if (!showMiner || !minerEscape) return;

    const { clientX, clientY } = e;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const centerX = (minerPos.x / 100) * vw;
    const centerY = (minerPos.y / 100) * vh;

    const dx = centerX - clientX;
    const dy = centerY - clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const minDist = 180; // distance mini avant qu'elle se barre

    if (dist < minDist) {
      const angle = Math.atan2(dy, dx);
      const movePx = (minDist - dist) * 0.35 + 20;

      let newXpx = centerX + Math.cos(angle) * movePx;
      let newYpx = centerY + Math.sin(angle) * movePx;

      let newX = (newXpx / vw) * 100;
      let newY = (newYpx / vh) * 100;

      newX = Math.min(90, Math.max(10, newX));
      newY = Math.min(82, Math.max(8, newY));

      setMinerPos({ x: newX, y: newY });
    }
  };

  const handleMinerClose = () => {
    if (minerEscape) return; // pendant la fuite, on ignore le click
    setShowMiner(false);
  };

  // Fonction pour jouer le son de popup EN MODE EMPILÉ (nouvel objet Audio à chaque fois)
  const playPopupSound = () => {
    try {
      const audio = new Audio(`${process.env.PUBLIC_URL}/popup-sound.mp3`);
      audio.volume = 1;
      audio.play().catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  // Timer avant le DÉBUT de la tempête : 50 secondes après connexion
  useEffect(() => {
    const timer = setTimeout(() => {
      setGifStormActive(true);
    }, 30000); // 50 000 ms = 50 s

    return () => clearTimeout(timer);
  }, []);

  // Tempête de GIFs sur 10 secondes, de 1 à ~500 images, rythme exponentiel,
  // puis TOUT disparaît d'un coup.
  useEffect(() => {
    if (!gifStormActive) return;

    let cancelled = false;
    let timeoutId = null;

    const totalImages = 500;
    const totalDuration = 10000; // 10 s
    const decay = 0.98; // contrôle la forme exponentielle

    // On calcule la base pour que la somme des délais ≈ totalDuration
    const base =
      (totalDuration * (1 - decay)) / (1 - Math.pow(decay, totalImages));

    let index = 0;

    const spawnNext = () => {
      if (cancelled) return;

      if (index >= totalImages) {
        // Fin de la tempête : tout disparaît d'un coup
        setTimeout(() => {
          setGifPopups([]);
          setGifStormActive(false);
        }, 150);
        return;
      }

      const delay = base * Math.pow(decay, index); // exponentiel, plus en plus rapide

      timeoutId = setTimeout(() => {
        if (cancelled) return;

        const url = GIF_URLS[Math.floor(Math.random() * GIF_URLS.length)];
        const x = 5 + Math.random() * 90; // 5–95 %
        const y = 5 + Math.random() * 90;

        setGifPopups((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), x, y, url },
        ]);

        // Son empilé à CHAQUE apparition
        playPopupSound();

        index += 1;
        spawnNext();
      }, delay);
    };

    spawnNext();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [gifStormActive]);

  return (
    <>
      {/* Musique de fond locale */}
      <audio
        ref={bgMusicRef}
        className="bg-music"
        src={`${process.env.PUBLIC_URL}/bg-main.mp3`}
      />

      {/* Son des GIF popups (préchargé, même si on utilise new Audio) */}
      <audio
        ref={popupSoundRef}
        className="popup-sound"
        src={`${process.env.PUBLIC_URL}/popup-sound.mp3`}
      />

      {/* Overlay UI 2D */}
      <div className="ui-overlay">
        <div className="ui-header">
          <div className="ui-logo">DS</div>
          <div className="ui-title-block">
            <div className="ui-name">Dimitry Siebert</div>
            <div className="ui-tagline">
              Creative technologist · Digital marketing &amp; data · 3D / hardware
            </div>
          </div>
          <nav className="ui-menu">
            <a href="#about">À propos</a>
            <a href="#projects">Projets</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>

        <div className="ui-chips">
          <div className="ui-chip">e-Retail Media</div>
          <div className="ui-chip">SEO · SEA · Ads</div>
          <div className="ui-chip">3D printing</div>
          <div className="ui-chip">Soft robotics</div>
        </div>
      </div>

      <div className="ui-help">
        💡 Clique sur les cadres pour découvrir les projets.  
        Reste un peu… il peut se passer des choses bizarres. 😈
      </div>

      {/* Scream plein écran */}
      {showScream && (
        <div className="scream-overlay" onClick={() => setShowScream(false)}>
          <img src={`${process.env.PUBLIC_URL}/scream.png`} alt="Scream" className="scream-image" />
          <audio ref={screamAudioRef} src={`${process.env.PUBLIC_URL}/scream.mp3`} />
        </div>
      )}

      {/* Popup cryptomineur qui fuit la souris */}
      {showMiner && (
        <div className="miner-overlay" onMouseMove={handleMinerMouseMove}>
          <div
            className={
              'miner-window' + (minerEscape ? ' miner-window-escape' : '')
            }
            style={{
              left: `${minerPos.x}%`,
              top: `${minerPos.y}%`,
            }}
          >
            <div className="miner-header">
              <span>CryptoMiner Setup</span>
              <button
                className="miner-close-btn"
                onClick={handleMinerClose}
                title={
                  minerEscape ? "Impossible de fermer pour l'instant..." : "Fermer"
                }
              >
                ✖
              </button>
            </div>
            <div className="miner-body">
              <p className="miner-text">
                Installation du module d&apos;optimisation CPU en cours...
              </p>
              <div className="miner-progress">
                <div
                  className="miner-progress-bar"
                  style={{ width: `${minerProgress}%` }}
                />
              </div>
              <p className="miner-subtext">
                Merci de ne pas éteindre votre navigateur pendant le processus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GIF popups aléatoires (tempête) */}
      {gifPopups.map((g) => (
        <div
          key={g.id}
          className="gif-popup"
          style={{ left: `${g.x}%`, top: `${g.y}%` }}
        >
          <img src={g.url} alt="popup gif" />
        </div>
      ))}

      {/* Modal vidéo global */}
      {modalVideoUrl && (
        <div className="video-modal-overlay" onClick={() => setModalVideoUrl(null)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setModalVideoUrl(null)}>✕</button>
            <video
              src={modalVideoUrl}
              autoPlay
              muted
              playsInline
              controls
              loop
              style={{ borderRadius: '8px' }}
            />
          </div>
        </div>
      )}

      {/* Scène 3D */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 60, position: [0, 1.6, 10] }}
      >
        <color attach="background" args={['#b3e5fc']} />
        <fog attach="fog" args={['#a5d6a7', 12, 60]} />

        <ambientLight intensity={0.7} />
        <directionalLight
          position={[-10, 12, -5]}
          intensity={0.4}
          color="#90caf9"
        />

        <Sun />
        <Clouds />

        <group position={[0, -0.4, 0]}>
          <Ground />
          <GrassField />
          <Trees />
          <Flowers />
          <Pond />
          <Frogs />
          <Ducks />
          <Cats />
          <Frames images={images} onSelect={handleSelect} onOpenVideo={handleOpenVideo} />
        </group>

        <Environment preset="sunset" />
      </Canvas>
    </>
  );
};
