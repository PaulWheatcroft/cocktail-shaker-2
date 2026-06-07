<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="shaker" role="status" :aria-label="label ?? 'Shaking cocktails'">
    <img
      src="/images/shaker.png"
      alt=""
      class="shaker__img"
      aria-hidden="true"
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
  width: min(8rem, 40vw);
  height: auto;
  animation: shake 0.45s ease-in-out infinite;
  transform-origin: center bottom;
}

.shaker__label {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--color-accent);
  text-align: center;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(-8deg) translateY(0);
  }
  25% {
    transform: rotate(10deg) translateY(-4px);
  }
  50% {
    transform: rotate(-6deg) translateY(2px);
  }
  75% {
    transform: rotate(8deg) translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shaker__img {
    animation: none;
  }
}
</style>
