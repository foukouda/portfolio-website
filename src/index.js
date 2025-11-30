import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './App';

// Supprime complètement l'erreur ResizeObserver
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0]?.message?.includes?.('ResizeObserver') ||
    args[0]?.includes?.('ResizeObserver') ||
    (typeof args[0] === 'string' && args[0].includes('ResizeObserver'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

window.addEventListener('error', (event) => {
  if (event.message?.includes('ResizeObserver')) {
    event.preventDefault();
    return false;
  }
});

const pexel = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`;

// Tu peux remplacer les URLs par tes propres visuels produit / projet.
// Chaque entrée = un cadre dans la galerie.
const images = [
  // Front – hero project
  {
    position: [0, 0, 1.5],
    rotation: [0, 0, 0],
    url: pexel(1103970),
    title: 'Inflatable Smart Wing — Drone à aile gonflable',
    subtitle: 'Projet de R&D en soft robotics pour UAV, basé sur un profil NACA et TPU 3D.',
    year: '2024',
    tags: ['Soft robotics', 'UAV', 'R&D', 'TPU 90A LT'],
  },

  // Back row
  {
    position: [-0.8, 0, -0.6],
    rotation: [0, 0, 0],
    url: pexel(416430),
    title: 'Lattices balistiques 3D',
    subtitle:
      'Mousses lattices imprimées en 3D pour pads anti-trauma et casques balistiques.',
    year: '2025',
    tags: ['Ballistique', 'Lattice', 'Additive manufacturing'],
  },
  {
    position: [0.8, 0, -0.6],
    rotation: [0, 0, 0],
    url: pexel(310452),
    title: 'Inside e-Retail Media',
    subtitle:
      'Frameworks et cas d\'usage autour des publicités Amazon, Carrefour, Leclerc…',
    year: '2024',
    tags: ['Amazon Ads', 'Retail media', 'Strategy'],
    videoUrl: `${process.env.PUBLIC_URL}/akira.mp4`,
  },

  // Left wall
  {
    position: [-1.75, 0, 0.25],
    rotation: [0, Math.PI / 2.5, 0],
    url: pexel(327482),
    title: 'Consulting SEO / SEA pour e-commerce',
    subtitle:
      'Accompagnement de marques et d’amis entrepreneurs sur la stratégie search & social.',
    year: '2023',
    tags: ['SEO', 'SEA', 'Growth'],
  },
  {
    position: [-2.15, 0, 1.5],
    rotation: [0, Math.PI / 2.5, 0],
    url: pexel(325185),
    title: 'Hive Robotics — logistique intelligente',
    subtitle:
      'Support hardware / R&D pour une start-up de robots logistiques en environnement réel.',
    year: '2024',
    tags: ['Robotics', 'Embedded', 'Product'],
  },
  {
    position: [-2, 0, 2.75],
    rotation: [0, Math.PI / 2.5, 0],
    url: pexel(358574),
    title: 'Alexandrie Circle',
    subtitle:
      'Communauté sélective autour du marketing digital, de la data et de l’IA appliquée.',
    year: '2024',
    tags: ['Community', 'Mentoring', 'Marketing'],
  },

  // Right wall
  {
    position: [1.75, 0, 0.25],
    rotation: [0, -Math.PI / 2.5, 0],
    url: pexel(227675),
    title: 'UNGAE & ONG',
    subtitle:
      'Mise en valeur de projets à impact via la data, le contenu et le search.',
    year: '2023',
    tags: ['ONG', 'Impact', 'Data'],
  },
  {
    position: [2.15, 0, 1.5],
    rotation: [0, -Math.PI / 2.5, 0],
    url: pexel(911738),
    title: 'YouTube & contenu éducatif',
    subtitle:
      'Vulgarisation de sujets marketing, data, IA et entrepreneuriat pour les créateurs.',
    year: '2025',
    tags: ['YouTube', 'Education', 'Content'],
  },
  {
    position: [2, 0, 2.75],
    rotation: [0, -Math.PI / 2.5, 0],
    url: pexel(1738986),
    title: 'Warhammer & worldbuilding',
    subtitle:
      'Univers personnalisés, storytelling et design d’armées comme laboratoire créatif.',
    year: '2022',
    tags: ['Créativité', 'Lore', 'Design'],
  },
];

createRoot(document.getElementById('root')).render(<App images={images} />);
