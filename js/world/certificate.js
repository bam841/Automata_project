/* certificate.js: Canvas-rendered pixel-art diploma, credits, and export engine. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let modalEl = null;

  function getModal() {
    if (!modalEl && typeof document !== 'undefined') {
      modalEl = document.getElementById('cert-modal');
    }
    return modalEl;
  }

  function drawCertificate(canvas, score = 8, total = 8) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Parchment Background
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, w, h);

    // Subtle paper texture gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#faf6eb');
    grad.addColorStop(1, '#f3ebd4');
    ctx.fillStyle = grad;
    ctx.fillRect(10, 10, w - 20, h - 20);

    // 2. Borders
    ctx.strokeStyle = '#1e293b'; // Slate outer border
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    ctx.strokeStyle = '#d97706'; // Gold inner border
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, w - 52, h - 52);

    // Corner Ornaments
    const cornerSize = 18;
    const corners = [
      [26, 26],
      [w - 26, 26],
      [26, h - 26],
      [w - 26, h - 26]
    ];
    ctx.fillStyle = '#b45309';
    for (const [cx, cy] of corners) {
      ctx.fillRect(cx - 6, cy - 6, 12, 12);
    }

    // 3. Header & Academy Title
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AUTOMATA CITY · ACADEMY OF FORMAL LANGUAGES', w / 2, 60);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('CERTIFICATE OF THEORETICAL MASTERY', w / 2, 95);

    // Decorative emblem line
    ctx.fillStyle = '#d97706';
    ctx.font = '16px serif';
    ctx.fillText('★  Σ  ·  U  ·  BST  ·  DFA  ·  Δ  ★', w / 2, 125);

    // 4. Recipient Section
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillText('This honor is officially awarded to', w / 2, 165);

    const progress = AC.progress ? AC.progress.get() : {};
    const rawName = (progress.name && progress.name.trim()) ? progress.name.trim() : 'Delta Scholar';
    const playerName = AC.util ? AC.util.esc(rawName) : rawName;

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText(playerName, w / 2, 210);

    // Name underline
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 180, 222);
    ctx.lineTo(w / 2 + 180, 222);
    ctx.stroke();

    // 5. Achievement Description
    ctx.fillStyle = '#334155';
    ctx.font = '14px Georgia, serif';
    ctx.fillText('for successfully navigating all four theory districts of Automata City and passing', w / 2, 255);
    ctx.fillText('the comprehensive Final Examination with exceptional distinction.', w / 2, 278);

    // 6. Score & Honors Badge
    const pct = Math.round((score / total) * 100);
    ctx.fillStyle = '#065f46';
    ctx.fillRect(w / 2 - 140, 310, 280, 38);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 140, 310, 280, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText(`FINAL EXAM SCORE: ${score} / ${total} (${pct}%)`, w / 2, 334);

    // 7. Date & Signatures
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    // Left Signature
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(100, 430);
    ctx.lineTo(280, 430);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('Professor Delta', 190, 448);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('City Provost & Guide', 190, 464);

    // Center Date & Seal
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(w / 2, 420, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('AC', w / 2, 425);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText(`DATE: ${dateStr}`, w / 2, 464);

    // Right Signature
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(w - 280, 430);
    ctx.lineTo(w - 100, 430);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('Doc. Jayson Guia', w - 190, 448);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('Course Professor (ACE)', w - 190, 464);

    // 8. Footer Accreditation & Authors
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('Course: ACE - Automata Theory and Formal Languages', w / 2, 515);
    ctx.fillText('Developers: Brix Martin Pana · Irwin Huey Geron · John Abrahm Zapico', w / 2, 532);
  }

  AC.certificate = {
    isOpen() {
      const modal = getModal();
      return modal && modal.classList.contains('active');
    },

    open(score, total = 8) {
      const modal = getModal();
      if (!modal) return;

      const progress = AC.progress ? AC.progress.get() : {};
      const finalScore = score !== undefined ? score : ((progress.exam && progress.exam.best) || 8);

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      if (AC.setState) {
        AC.setState('certificate');
      }

      modal.innerHTML = `
        <div class="cert-modal-dialog">
          <div class="cert-toolbar no-print">
            <span class="cert-title">🎓 Official Automata City Diploma</span>
            <div class="cert-actions">
              <button class="btn btn-primary" data-act="cert-download">💾 Download PNG</button>
              <button class="btn btn-secondary" data-act="cert-print">🖨 Print</button>
              <button class="btn btn-secondary" data-act="cert-close">Close ×</button>
            </div>
          </div>
          <div class="cert-canvas-wrapper">
            <canvas id="diploma-canvas" width="760" height="560"></canvas>
          </div>
        </div>
      `;

      const canvas = document.getElementById('diploma-canvas');
      if (canvas) {
        drawCertificate(canvas, finalScore, total);
      }
    },

    downloadPNG() {
      const canvas = document.getElementById('diploma-canvas');
      if (!canvas) return;

      try {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'Automata_City_Certificate.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.warn('Canvas export error:', err);
      }
    },

    print() {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
      }
    },

    close() {
      const modal = getModal();
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = '';
      }
      if (AC.setState) {
        AC.setState('world');
      }
      const canvas = document.getElementById('game');
      if (canvas) canvas.focus();
    },

    initEvents() {
      const modal = getModal();
      if (!modal) return;

      modal.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;

        const act = btn.getAttribute('data-act');
        if (act === 'cert-close') {
          this.close();
        } else if (act === 'cert-download') {
          this.downloadPNG();
        } else if (act === 'cert-print') {
          this.print();
        }
      });
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => AC.certificate.initEvents());
    } else {
      AC.certificate.initEvents();
    }
  }

})(typeof globalThis !== 'undefined' ? globalThis : window);
