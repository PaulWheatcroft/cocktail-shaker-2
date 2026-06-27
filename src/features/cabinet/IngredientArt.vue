<script setup lang="ts">
import { computed, ref } from 'vue'
import IngredientGraphic from './IngredientGraphic.vue'
import { categoryFor } from './ingredientGraphics'
import { categoryImageSrc } from './categoryImages'

const props = defineProps<{
  name: string
}>()

const imageFailed = ref(false)

const imageSrc = computed(() => categoryImageSrc(props.name))
const showImage = computed(() => Boolean(imageSrc.value) && !imageFailed.value)
const icon = computed(() => categoryFor(props.name))

function onImageError() {
  imageFailed.value = true
}
</script>

<template>
  <img
    v-if="showImage"
    class="ingredient-art__image"
    :src="imageSrc!"
    :alt="name"
    loading="lazy"
    decoding="async"
    @error="onImageError"
  />
  <IngredientGraphic v-else :icon="icon" class="ingredient-art__graphic" />
</template>

<style scoped>
.ingredient-art__image,
.ingredient-art__graphic {
  display: block;
  width: 100%;
  height: 100%;
}

.ingredient-art__image {
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}
</style>
