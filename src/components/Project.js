import { useState, useEffect, useRef } from 'react';

function MiniRunner() {
  const [playerLane, setPlayerLane] = useState(1); // 0 = gauche, 1 = centre, 2 = droite
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const jumpTimeoutRef = useRef(null);
  const slideTimeoutRef = useRef(null);
  const lanesX = ['20%', '50%', '80%'];

  // Gestion du clavier (flèches)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }
      e.preventDefault();

      // On lance la partie au premier input
      if (!running && !gameOver) {
        setRunning(true);
      }

      if (e.key === 'ArrowLeft') {
        setPlayerLane((lane) => Math.max(0, lane - 1));
      } else if (e.key === 'ArrowRight') {
        setPlayerLane((lane) => Math.min(2, lane + 1));
      } else if (e.key === 'ArrowUp') {
        if (!isJumping) {
          setIsJumping(true);
          if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
          jumpTimeoutRef.current = setTimeout(() => {
            setIsJumping(false);
          }, 400);
        }
      } else if (e.key === 'ArrowDown') {
        if (!isSliding) {
          setIsSliding(true);
          if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
          slideTimeoutRef.current = setTimeout(() => {
            setIsSliding(false);
          }, 400);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [running, gameOver, isJumping, isSliding]);

  // Boucle de jeu : obstacles qui descendent, collisions, score
  useEffect(() => {
    if (!running || gameOver) return;

    const interval = setInterval(() => {
      setObstacles((prev) => {
        let next = prev.map((o) => ({ ...o, y: o.y + 0.04 })); // avance vers le bas
        // supprime ceux qui sortent de l'écran
        next = next.filter((o) => o.y < 1.25);

        // spawn aléatoire
        if (Math.random() < 0.18) {
          const lane = Math.floor(Math.random() * 3);
          const typeRand = Math.random();
          const type = typeRand < 0.33 ? 'low' : typeRand < 0.66 ? 'high' : 'solid';
          next.push({
            id: Date.now() + Math.random(),
            lane,
            y: -0.1,
            type,
          });
        }

        // collision
        let hit = false;
        for (const o of next) {
          if (o.y > 0.7 && o.y < 0.9 && o.lane === playerLane) {
            if (o.type === 'solid') {
              hit = true;
              break;
            }
            if (o.type === 'low' && !isJumping) {
              hit = true;
              break;
            }
            if (o.type === 'high' && !isSliding) {
              hit = true;
              break;
            }
          }
        }

        if (hit) {
          setGameOver(true);
          setRunning(false);
        }

        return next;
      });

      setScore((s) => s + 1);
    }, 60);

    return () => clearInterval(interval);
  }, [running, gameOver, playerLane, isJumping, isSliding]);

  const handleRestart = () => {
    setPlayerLane(1);
    setIsJumping(false);
    setIsSliding(false);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setRunning(false);
  };

  return (
    <div className="runner-container">
      <div className="runner-header">
        <div>
          <div className="runner-title">Mini-jeu · Subway-runner</div>
          <div className="runner-instructions">
            Flèches ⬅➡ pour changer de voie · ⬆ pour sauter · ⬇ pour glisser
          </div>
        </div>
        <div className="runner-hud">
          <span className="runner-score">Score : {score}</span>
          {gameOver && (
            <button className="runner-restart-btn" onClick={handleRestart}>
              Rejouer
            </button>
          )}
        </div>
      </div>

      <div className="runner-game">
        {/* traits de séparation */}
        <div className="runner-lane-divider" />
        <div className="runner-lane-divider runner-lane-divider-right" />

        {/* joueur */}
        <div
          className={
            'runner-player' +
            (isJumping ? ' runner-player-jump' : '') +
            (isSliding ? ' runner-player-slide' : '')
          }
          style={{
            left: lanesX[playerLane],
            top: '80%',
          }}
        >
          <div className="runner-player-head" />
        </div>

        {/* obstacles */}
        {obstacles.map((o) => (
          <div
            key={o.id}
            className={
              'runner-obstacle ' +
              (o.type === 'low'
                ? 'runner-obstacle-low'
                : o.type === 'high'
                ? 'runner-obstacle-high'
                : 'runner-obstacle-solid')
            }
            style={{
              left: lanesX[o.lane],
              top: `${o.y * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Project({ title, subtitle, year, tags = [], onPointerDown }) {
  return (
    <div className="project-panel" onPointerDown={onPointerDown}>
      <p className="project-pill">
        {year ? `Projet · ${year}` : 'Projet'}
      </p>
      <h2 className="project-title">
        {title || "Projet d'exemple"}
      </h2>
      {subtitle && <p className="project-subtitle">{subtitle}</p>}

      {tags.length > 0 && (
        <div className="project-tags">
          {tags.map((t) => (
            <span key={t} className="project-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Mini-jeu type Subway Surfer */}
      <MiniRunner />

      <h3 className="project-section-title">À propos de Dimitry</h3>
      <p className="project-section-text">
        Je suis Dimitry, creative technologist entre deux mondes : la
        stratégie digitale (SEO, SEA, e-retail media, data) et le hardware
        (impression 3D, lattices, soft-robotics, R&amp;D). J’aime travailler sur
        des problèmes difficiles, à l’intersection de l’ingénierie, du produit
        et du marketing.
      </p>

      <h3 className="project-section-title">Ce que montre ce projet</h3>
      <p className="project-section-text">
        Ce projet illustre ma manière de travailler : partir d’un concept
        ambitieux, poser un cadre stratégique clair, puis itérer entre
        expérimentation, data et retours terrain. J’essaie toujours de garder
        un équilibre entre :
      </p>
      <ul className="project-section-text" style={{ paddingLeft: '18px', marginTop: 4 }}>
        <li>la vision long terme (produit, marque, communauté),</li>
        <li>la rigueur des chiffres (tests, mesures, performance),</li>
        <li>et l’exécution très concrète (POC, maquettes, contenu, campagnes).</li>
      </ul>

      <h3 className="project-section-title">Compétences mobilisées</h3>
      <p className="project-section-text">
        Selon le projet sélectionné, cela peut mélanger :
      </p>
      <ul className="project-section-text" style={{ paddingLeft: '18px', marginTop: 4 }}>
        <li>SEO / SEA / e-retail media (Amazon, Carrefour, etc.)</li>
        <li>Analyses data &amp; dashboards (Excel, Power BI, SQL, GA4)</li>
        <li>Conception hardware et matériaux (TPU, lattices, tests mécaniques)</li>
        <li>Prototypage 3D et itérations rapides (SLS, MJF, Fablab)</li>
        <li>Création de contenu et pédagogie (YouTube, LinkedIn, communautés)</li>
      </ul>

      <div className="project-contact" id="contact">
        Envie d’en discuter ou de construire quelque chose ensemble ?<br />
        Écris-moi sur{' '}
        <a href="mailto:siebert.dimitry@gmail.com">siebert.dimitry@gmail.com</a>{' '}
        ou sur LinkedIn.
      </div>
    </div>
  );
}

export default Project;
