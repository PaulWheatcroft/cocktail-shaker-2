<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="shaker" role="status" :aria-label="label ?? 'Shaking cocktails'">
    <div class="shaker__figure" aria-hidden="true">
      <div class="shaker__rig">
        <img
          class="shaker__image"
          src="/images/shaker.webp"
          alt=""
          width="1024"
          height="1024"
          decoding="async"
        />
      </div>
    </div>
    <h1 v-if="label" class="shaker__headline">{{ label }}</h1>
  </div>
</template>

<style scoped>
.shaker {
  --shaker-stroke: 0.24s;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl) 0;
}

.shaker__figure {
  position: relative;
  width: min(6.5rem, 28vw);
  overflow: visible;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.35));
}

.shaker__figure::before {
  content: '';
  position: absolute;
  inset: -40%;
  z-index: 0;
  background: radial-gradient(
    ellipse at 50% 45%,
    rgba(201, 169, 98, 0.08) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* The rig carries the bartender's diagonal "over the shoulder" thrust: a
   piston-like push back and forth along the shaker's long axis. */
.shaker__rig {
  position: relative;
  z-index: 1;
  width: 100%;
  animation: shakerThrust var(--shaker-stroke) cubic-bezier(0.4, 0, 0.6, 1) infinite alternate;
}

/* The shaker itself is a sealed, rigid unit held at a tilt; the wrist snaps
   it slightly steeper/shallower at each end of the stroke. */
.shaker__image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  transform-origin: 50% 78%;
  animation: shakerSnap var(--shaker-stroke) ease-in-out infinite alternate;
}

.shaker__headline {
  margin: 0;
  max-width: 28rem;
  color: var(--color-accent);
  line-height: 1.35;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

@keyframes shakerThrust {
  from {
    transform: translate(22%, 19%);
  }
  to {
    transform: translate(-22%, -19%);
  }
}

@keyframes shakerSnap {
  from {
    transform: rotate(-23deg);
  }
  to {
    transform: rotate(-33deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shaker__rig,
  .shaker__image {
    animation: none;
  }

  .shaker__image {
    transform: rotate(-28deg);
  }
}
</style>
