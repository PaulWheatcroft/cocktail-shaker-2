<script setup lang="ts">
defineProps<{
  label?: string
}>()

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (!img.src.endsWith('/shaker.png')) {
    img.src = '/images/shaker.png'
  }
}
</script>

<template>
  <div class="shaker" role="status" :aria-label="label ?? 'Shaking cocktails'">
    <img
      src="/images/shaker.svg"
      alt=""
      class="shaker__img"
      aria-hidden="true"
      @error="onImgError"
    />
    <p v-if="label" class="shaker__label">{{ label }}</p>
  </div>
</template>

<style scoped>
.shaker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl) 0;
}

.shaker__img {
  display: block;
  width: min(8rem, 40vw);
  height: auto;
  transform-origin: center bottom;
  animation: shake 2s ease-in-out infinite;
}

.shaker__label {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--color-accent);
  text-align: center;
}

/* 0–50%: side to side (1s); 50–100%: up and down (1s) */
@keyframes shake {
  0%,
  50%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  5% {
    transform: translate(-5px, 0) rotate(-5deg);
  }
  10% {
    transform: translate(5px, 0) rotate(5deg);
  }
  15% {
    transform: translate(-5px, 0) rotate(-5deg);
  }
  20% {
    transform: translate(5px, 0) rotate(5deg);
  }
  25% {
    transform: translate(-5px, 0) rotate(-5deg);
  }
  30% {
    transform: translate(5px, 0) rotate(5deg);
  }
  35% {
    transform: translate(-5px, 0) rotate(-5deg);
  }
  40% {
    transform: translate(5px, 0) rotate(5deg);
  }
  45% {
    transform: translate(-5px, 0) rotate(-5deg);
  }
  55% {
    transform: translate(0, -4px) rotate(0deg);
  }
  60% {
    transform: translate(0, 3px) rotate(0deg);
  }
  65% {
    transform: translate(0, -4px) rotate(0deg);
  }
  70% {
    transform: translate(0, 3px) rotate(0deg);
  }
  75% {
    transform: translate(0, -4px) rotate(0deg);
  }
  80% {
    transform: translate(0, 3px) rotate(0deg);
  }
  85% {
    transform: translate(0, -4px) rotate(0deg);
  }
  90% {
    transform: translate(0, 3px) rotate(0deg);
  }
  95% {
    transform: translate(0, -4px) rotate(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shaker__img {
    animation: none;
  }
}
</style>
