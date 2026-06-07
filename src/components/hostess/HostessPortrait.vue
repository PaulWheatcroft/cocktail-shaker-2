<script setup lang="ts">
defineProps<{
  variant: 'welcome' | 'cabinet' | 'reveal'
  alt?: string
}>()

const sources: Record<'welcome' | 'cabinet' | 'reveal', string> = {
  welcome: '/images/hostess/welcome.png',
  cabinet: '/images/hostess/cabinet.png',
  reveal: '/images/hostess/reveal.png',
}
</script>

<template>
  <figure class="hostess-portrait">
    <img
      :src="sources[variant]"
      :alt="alt ?? 'The hostess'"
      class="hostess-portrait__img"
      loading="lazy"
    />
  </figure>
</template>

<style scoped>
.hostess-portrait {
  margin: 0;
  display: flex;
  justify-content: center;
}

.hostess-portrait__img {
  max-height: min(42vh, 22rem);
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 1.5rem rgba(201, 169, 98, 0.35));
}
</style>
