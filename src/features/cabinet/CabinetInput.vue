<script setup lang="ts">
import CabinetPicker from '@/features/cabinet/CabinetPicker.vue'
</script>

<template>
  <section class="cabinet">
    <h2>Your cabinet</h2>
    <p class="cabinet__hint">Select up to 2 ingredients for each shake.</p>
    <CabinetPicker />
  </section>
</template>

<style scoped>
.cabinet__hint {
  font-size: 0.9rem;
  margin-bottom: var(--space-md);
}
</style>
