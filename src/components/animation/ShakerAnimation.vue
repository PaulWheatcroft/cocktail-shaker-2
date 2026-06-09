<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="shaker" role="status" :aria-label="label ?? 'Shaking cocktails'">
    <div class="shaker__figure" aria-hidden="true">
      <svg
        class="shaker__svg"
        viewBox="0 0 34.229424 75.545822"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <linearGradient id="shaker-grad-body">
            <stop offset="0" stop-color="#696969" />
            <stop offset="0.499" stop-color="#ffffff" />
            <stop offset="1" stop-color="#7a7a7a" />
          </linearGradient>
          <linearGradient id="shaker-grad-mid">
            <stop offset="0" stop-color="#5c5c5c" />
            <stop offset="0.489" stop-color="#ffffff" />
            <stop offset="1" stop-color="#555555" />
          </linearGradient>
          <linearGradient id="shaker-grad-cap">
            <stop offset="0" stop-color="#7e7e7e" />
            <stop offset="0.483" stop-color="#ffffff" />
            <stop offset="1" stop-color="#727272" />
          </linearGradient>
          <linearGradient id="shaker-grad-base">
            <stop offset="0.063" stop-color="#7f7f7f" />
            <stop offset="0.498" stop-color="#ffffff" />
            <stop offset="0.937" stop-color="#838383" />
          </linearGradient>
        </defs>
        <g transform="translate(-41.161612,-115.40419)">
          <g transform="matrix(0.04359764,0,0,0.04359764,0.07916603,105.91244)">
            <g class="shaker__body">
              <path
                fill="url(#shaker-grad-base)"
                d="m 1727.43,733.67 v 3.41 c 0,3.756 -3.05,6.806 -6.794,6.806 H 949.103 c -3.744,0 -6.794,-3.05 -6.794,-6.806 v -3.41 c 0,-3.744 3.05,-6.794 6.794,-6.794 h 771.533 c 3.744,0 6.794,3.05 6.794,6.794 z"
              />
              <path
                fill="url(#shaker-grad-mid)"
                d="m 958.618,714.483 c 1.487,-4.798 4.116,-9.187 7.773,-12.832 l 0.111,-0.111 c 10.798,-10.736 18.014,-23.804 20.865,-37.813 l 13.501,-66.353 c 16.774,-82.457 90.032,-142.313 174.188,-142.313 h 319.612 c 84.144,0 157.401,59.856 174.188,142.313 l 13.501,66.353 c 2.901,14.245 10.054,27.263 20.704,37.652 3.794,3.694 6.534,8.183 8.046,13.104 -250.8342,3.27228 -501.9615,-13.55722 -752.489,0 z"
              />
              <path
                fill="url(#shaker-grad-body)"
                d="m 1560.848,1915.261 -7.538,35.247 h -436.882 l -7.513,-35.098 C 1027.971,1537.28 944.286,1146.369 955.902,756.288 h 757.896 c 11.642,390.031 -72.03,780.881 -152.95,1158.973 z"
              />
            </g>
            <g class="shaker__cap">
              <path
                fill="url(#shaker-grad-cap)"
                d="m 1467.744,217.712 h -265.782 c -18.82,0 -34.131,15.311 -34.131,34.131 v 190.825 h 334.043 V 251.843 c 10e-4,-18.82 -15.31,-34.131 -34.13,-34.131 z m -243.813,222.191 h 15.535 z"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
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

.shaker__figure {
  width: min(9rem, 42vw);
  animation: shakerBob 0.55s ease-in-out infinite;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.35));
}

.shaker__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.shaker__body,
.shaker__cap {
  transform-box: fill-box;
  transform-origin: 50% 88%;
}

.shaker__body {
  animation: shakerRock 0.42s ease-in-out infinite alternate;
}

.shaker__cap {
  animation: shakerCapLag 0.38s ease-in-out 0.05s infinite alternate;
}

.shaker__label {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--color-accent);
  text-align: center;
}

@keyframes shakerRock {
  from {
    transform: rotate(-7deg);
  }
  to {
    transform: rotate(7deg);
  }
}

@keyframes shakerCapLag {
  from {
    transform: rotate(4deg);
  }
  to {
    transform: rotate(-4deg);
  }
}

@keyframes shakerBob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shaker__figure,
  .shaker__body,
  .shaker__cap {
    animation: none;
  }
}
</style>
