/* audio.js: WebAudio synthesized sound effects engine without audio files. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let audioCtx = null;
  let masterGain = null;
  let isMuted = false;
  const MASTER_VOL = 0.18; // Clamped <= 0.2 per ASSETS.md

  function getAudioContext() {
    if (audioCtx) return audioCtx;
    const AudioContextClass = root.AudioContext || root.webkitAudioContext;
    if (!AudioContextClass) return null;

    try {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : MASTER_VOL, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    } catch (_) {
      audioCtx = null;
    }
    return audioCtx;
  }

  function resumeContext() {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  // Setup gesture listener for browser audio autoplay policy
  if (typeof root.addEventListener !== 'undefined') {
    const unlock = () => {
      resumeContext();
      root.removeEventListener('click', unlock);
      root.removeEventListener('keydown', unlock);
    };
    root.addEventListener('click', unlock, { once: true });
    root.addEventListener('keydown', unlock, { once: true });
  }

  AC.audio = {
    init() {
      if (AC.progress) {
        const prog = AC.progress.get();
        if (prog && prog.settings && typeof prog.settings.muted === 'boolean') {
          isMuted = prog.settings.muted;
        }
      }

      // Connect to bus events
      if (AC.bus && typeof AC.bus.on === 'function') {
        AC.bus.on('lecture:open', () => this.play('open'));
        AC.bus.on('lecture:close', () => this.play('close'));
        AC.bus.on('shard', () => this.play('collect'));
        AC.bus.on('stamp', () => this.play('stamp'));
      }
    },

    setMuted(muted) {
      isMuted = Boolean(muted);
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(isMuted ? 0 : MASTER_VOL, audioCtx.currentTime);
      }
      if (AC.progress) {
        const p = AC.progress.get();
        if (p && p.settings) {
          p.settings.muted = isMuted;
          AC.progress.save();
        }
      }
    },

    isMuted() {
      return isMuted;
    },

    toggleMute() {
      this.setMuted(!isMuted);
      return isMuted;
    },

    play(name) {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;

      switch (name) {
        case 'select': {
          // square 660 Hz 50 ms
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(660, now);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'open': {
          // sine sweep 220 -> 440 Hz 150 ms
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
          gain.gain.setValueAtTime(0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'close': {
          // sweep 440 -> 220 Hz 120 ms
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'collect': {
          // square sweep 880 -> 1320 Hz 80 ms
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'stamp': {
          // triangle arpeggio C5-E5-G5-C6, 80 ms/note
          const freqs = [523.25, 659.25, 783.99, 1046.50];
          freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + i * 0.08;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.6, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.075);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.08);
          });
          break;
        }

        case 'error': {
          // sawtooth 140 Hz 150 ms
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'step': {
          // low-volume noise / click burst 30 ms
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.03);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }
      }
    }
  };

  // Auto-init
  AC.audio.init();

})(typeof globalThis !== 'undefined' ? globalThis : window);
