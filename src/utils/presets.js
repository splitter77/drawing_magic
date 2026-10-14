// Built-in hand-drawn mentalism prediction presets
export const PRESETS = [
  { id: 'star', name: 'Étoile', icon: '⭐️' },
  { id: 'heart', name: 'Cœur', icon: '❤️' },
  { id: 'house', name: 'Maison', icon: '🏠' },
  { id: 'sailboat', name: 'Bateau', icon: '⛵' },
  { id: 'lightbulb', name: 'Ampoule', icon: '💡' },
  { id: 'tree', name: 'Arbre', icon: '🌳' },
  { id: 'car', name: 'Voiture', icon: '🚗' },
  { id: 'cat', name: 'Chat', icon: '🐱' },
  { id: 'clock', name: 'Horloge (3h)', icon: '🕒' },
];

/**
 * Render a preset drawing with natural hand-drawn stroke aesthetics
 */
export function drawPresetToCanvas(ctx, width, height, presetId, strokeColor = '#1e293b') {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = strokeColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = width / 2;
  const cy = height / 2;
  const s = Math.min(width, height) * 0.38; // scale

  ctx.beginPath();

  switch (presetId) {
    case 'star': {
      // 5-pointed star
      const points = 5;
      const outerR = s;
      const innerR = s * 0.42;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'heart': {
      // Hand-drawn heart
      const topCurveHeight = s * 0.35;
      ctx.moveTo(cx, cy + s * 0.65);
      // Left curve
      ctx.bezierCurveTo(
        cx - s, cy + s * 0.1,
        cx - s * 0.9, cy - s * 0.65,
        cx, cy - s * 0.25
      );
      // Right curve
      ctx.bezierCurveTo(
        cx + s * 0.9, cy - s * 0.65,
        cx + s, cy + s * 0.1,
        cx, cy + s * 0.65
      );
      ctx.stroke();
      break;
    }

    case 'house': {
      // House base
      const w = s * 1.1;
      const h = s * 0.85;
      ctx.strokeRect(cx - w / 2, cy - h / 3, w, h);
      // Roof triangle
      ctx.beginPath();
      ctx.moveTo(cx - w / 2 - 10, cy - h / 3);
      ctx.lineTo(cx, cy - h - 10);
      ctx.lineTo(cx + w / 2 + 10, cy - h / 3);
      ctx.stroke();
      // Door
      ctx.strokeRect(cx - w * 0.16, cy + h * 0.12, w * 0.32, h * 0.4);
      // Window
      ctx.strokeRect(cx + w * 0.2, cy - h * 0.15, w * 0.2, w * 0.2);
      // Chimney
      ctx.beginPath();
      ctx.moveTo(cx + w * 0.25, cy - h * 0.65);
      ctx.lineTo(cx + w * 0.25, cy - h * 0.9);
      ctx.lineTo(cx + w * 0.38, cy - h * 0.9);
      ctx.lineTo(cx + w * 0.38, cy - h * 0.45);
      ctx.stroke();
      break;
    }

    case 'sailboat': {
      // Boat hull
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.9, cy + s * 0.3);
      ctx.lineTo(cx - s * 0.65, cy + s * 0.65);
      ctx.lineTo(cx + s * 0.65, cy + s * 0.65);
      ctx.lineTo(cx + s * 0.9, cy + s * 0.3);
      ctx.closePath();
      ctx.stroke();
      // Mast
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.3);
      ctx.lineTo(cx, cy - s * 0.8);
      ctx.stroke();
      // Main Sail (Right)
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - s * 0.75);
      ctx.lineTo(cx + s * 0.7, cy + s * 0.2);
      ctx.lineTo(cx + 4, cy + s * 0.2);
      ctx.closePath();
      ctx.stroke();
      // Small Sail (Left)
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - s * 0.65);
      ctx.lineTo(cx - s * 0.55, cy + s * 0.2);
      ctx.lineTo(cx - 4, cy + s * 0.2);
      ctx.closePath();
      ctx.stroke();
      // Water waves
      ctx.beginPath();
      for (let x = cx - s * 1.1; x <= cx + s * 1.1; x += 25) {
        ctx.arc(x + 12, cy + s * 0.8, 12, Math.PI, 0, true);
      }
      ctx.stroke();
      break;
    }

    case 'lightbulb': {
      // Bulb circle
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.2, s * 0.55, 0.25 * Math.PI, 0.75 * Math.PI, true);
      ctx.lineTo(cx - s * 0.25, cy + s * 0.4);
      ctx.lineTo(cx + s * 0.25, cy + s * 0.4);
      ctx.closePath();
      ctx.stroke();
      // Base screw threads
      for (let y = cy + s * 0.48; y <= cy + s * 0.68; y += 10) {
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.2, y);
        ctx.lineTo(cx + s * 0.2, y);
        ctx.stroke();
      }
      // Filament inside
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + s * 0.35);
      ctx.lineTo(cx - 10, cy - s * 0.1);
      ctx.lineTo(cx, cy - s * 0.25);
      ctx.lineTo(cx + 10, cy - s * 0.1);
      ctx.lineTo(cx + 15, cy + s * 0.35);
      ctx.stroke();
      // Glow rays
      const rays = 8;
      for (let i = 0; i < rays; i++) {
        const angle = (i * 2 * Math.PI) / rays;
        if (angle > 0.4 * Math.PI && angle < 0.6 * Math.PI) continue; // skip bottom
        const r1 = s * 0.75;
        const r2 = s * 0.95;
        ctx.beginPath();
        ctx.moveTo(cx + r1 * Math.cos(angle), (cy - s * 0.2) + r1 * Math.sin(angle));
        ctx.lineTo(cx + r2 * Math.cos(angle), (cy - s * 0.2) + r2 * Math.sin(angle));
        ctx.stroke();
      }
      break;
    }

    case 'tree': {
      // Trunk
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.15, cy + s * 0.8);
      ctx.lineTo(cx - s * 0.1, cy + s * 0.1);
      ctx.lineTo(cx + s * 0.1, cy + s * 0.1);
      ctx.lineTo(cx + s * 0.15, cy + s * 0.8);
      ctx.stroke();
      // Leaves cloud
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.3, s * 0.4, 0, Math.PI * 2);
      ctx.arc(cx - s * 0.35, cy - s * 0.1, s * 0.3, 0, Math.PI * 2);
      ctx.arc(cx + s * 0.35, cy - s * 0.1, s * 0.3, 0, Math.PI * 2);
      ctx.arc(cx - s * 0.25, cy - s * 0.45, s * 0.28, 0, Math.PI * 2);
      ctx.arc(cx + s * 0.25, cy - s * 0.45, s * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'car': {
      // Car body
      const w = s * 1.5;
      const h = s * 0.45;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, cy + h * 0.3);
      ctx.lineTo(cx - w / 2, cy - h * 0.2);
      ctx.lineTo(cx - w * 0.25, cy - h * 0.2);
      ctx.lineTo(cx - w * 0.1, cy - h * 0.9);
      ctx.lineTo(cx + w * 0.25, cy - h * 0.9);
      ctx.lineTo(cx + w * 0.4, cy - h * 0.2);
      ctx.lineTo(cx + w / 2, cy - h * 0.2);
      ctx.lineTo(cx + w / 2, cy + h * 0.3);
      ctx.closePath();
      ctx.stroke();
      // Wheels
      ctx.beginPath();
      ctx.arc(cx - w * 0.28, cy + h * 0.35, s * 0.2, 0, Math.PI * 2);
      ctx.arc(cx + w * 0.28, cy + h * 0.35, s * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      // Window
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.06, cy - h * 0.8);
      ctx.lineTo(cx - w * 0.18, cy - h * 0.25);
      ctx.lineTo(cx + w * 0.2, cy - h * 0.25);
      ctx.lineTo(cx + w * 0.18, cy - h * 0.8);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'cat': {
      // Cat head
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      // Left ear
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.4, cy - s * 0.25);
      ctx.lineTo(cx - s * 0.5, cy - s * 0.7);
      ctx.lineTo(cx - s * 0.15, cy - s * 0.45);
      ctx.stroke();
      // Right ear
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.15, cy - s * 0.45);
      ctx.lineTo(cx + s * 0.5, cy - s * 0.7);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.25);
      ctx.stroke();
      // Eyes
      ctx.beginPath();
      ctx.arc(cx - s * 0.18, cy - s * 0.08, 6, 0, Math.PI * 2);
      ctx.arc(cx + s * 0.18, cy - s * 0.08, 6, 0, Math.PI * 2);
      ctx.fill();
      // Nose & mouth
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + s * 0.1);
      ctx.lineTo(cx + 6, cy + s * 0.1);
      ctx.lineTo(cx, cy + s * 0.16);
      ctx.closePath();
      ctx.fill();
      // Whiskers
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.15, cy + s * 0.12);
      ctx.lineTo(cx - s * 0.55, cy + s * 0.08);
      ctx.moveTo(cx - s * 0.15, cy + s * 0.18);
      ctx.lineTo(cx - s * 0.55, cy + s * 0.24);
      ctx.moveTo(cx + s * 0.15, cy + s * 0.12);
      ctx.lineTo(cx + s * 0.55, cy + s * 0.08);
      ctx.moveTo(cx + s * 0.15, cy + s * 0.18);
      ctx.lineTo(cx + s * 0.55, cy + s * 0.24);
      ctx.stroke();
      break;
    }

    case 'clock': {
      // Clock face
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      // Hour marks
      for (let h = 1; h <= 12; h++) {
        const angle = (h * Math.PI) / 6 - Math.PI / 2;
        const r1 = s * 0.52;
        const r2 = s * 0.6;
        ctx.beginPath();
        ctx.moveTo(cx + r1 * Math.cos(angle), cy + r1 * Math.sin(angle));
        ctx.lineTo(cx + r2 * Math.cos(angle), cy + r2 * Math.sin(angle));
        ctx.stroke();
      }
      // Clock hands pointing to 3:00 (Classic mentalist prediction: 3:00 or 15h)
      // Hour hand to 3
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + s * 0.35, cy);
      ctx.stroke();
      // Minute hand to 12
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - s * 0.48);
      ctx.stroke();
      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    default:
      break;
  }

  ctx.restore();
}
