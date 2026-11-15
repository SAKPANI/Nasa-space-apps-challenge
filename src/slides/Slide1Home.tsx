import React from 'react';
import { useTheme } from '../design/ThemeProvider';
import './Slide.css';

/**
 * Slide 1 – Accueil (version statique, sans globe 3D)
 * -------------------------------------------------
 * • Fond d’image NASA Nightlights (public/nasa/night.png) – réel, crédité.
 * • Titre « TERRA SONORA », slogan, bouton d’entrée.
 * • Pas de canvas 3D – on utilise uniquement du CSS (glassmorphism).
 * • Le bouton d’entrée redirige vers la première slide d’exploration (#explorer).
 */
export const Slide1Home: React.FC = () => {
  const theme = useTheme();
  const handleEnter = () => {
    // Change hash to go to the next slide (explorer).
    window.location.hash = '#explorer';
  };
  return (
    <section
      className="slide slide-home"
      style={{
        backgroundColor: theme.colors.background,
        backgroundImage: 'url(/nasa/night.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay with glassmorphism */}
      <div className="overlay">
        <h1
          className="title"
          style={{
            color: theme.colors.white,
            fontFamily: theme.typography.fontFamilyTitle,
          }}
        >
          TERRA SONORA
        </h1>
        <p
          className="slogan"
          style={{
            color: theme.colors.white,
            fontFamily: theme.typography.fontFamilyBody,
          }}
        >
          Quand la Terre se fait entendre
        </p>
        <button
          className="enter-btn"
          onClick={handleEnter}
          style={{
            backgroundColor: theme.colors.accent,
            color: '#000',
            borderRadius: theme.radius.md,
            boxShadow: theme.shadow.glow,
          }}
        >
          Entrer dans Terra Sonora
        </button>
        {/* Crédit NASA */}
        <p
          className="credit"
          style={{
            marginTop: '1rem',
            fontSize: '0.75rem',
            color: theme.colors.white,
            opacity: 0.8,
          }}
        >
          Données et images : NASA – Nightlights 2012‑2023 (SVS #5475)
        </p>
      </div>
    </section>
  );
};
