import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CabinetCarousel from '@/features/cabinet/CabinetCarousel.vue'
import { useCabinetStore } from '@/stores/cabinetStore'

// vuedraggable relies on real drag events that jsdom cannot simulate, so we
// stub it with a plain list that still renders the #item scoped slot.
const DraggableStub = {
  name: 'draggable',
  props: { list: { type: Array, default: null }, modelValue: { type: Array, default: null } },
  template: `
    <div class="draggable-stub">
      <template v-for="(element, index) in (list || modelValue || [])" :key="index">
        <slot name="item" :element="element" :index="index" />
      </template>
    </div>
  `,
}

function mountCarousel() {
  return mount(CabinetCarousel, {
    global: {
      stubs: { draggable: DraggableStub },
    },
  })
}

describe('CabinetCarousel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('shows the empty state when the cabinet has no items', () => {
    const wrapper = mountCarousel()
    expect(wrapper.find('.cabinet-carousel__empty').exists()).toBe(true)
    expect(wrapper.findAll('.shelf-card')).toHaveLength(0)
  })

  it('renders a graphic card per owned item', () => {
    const cabinet = useCabinetStore()
    cabinet.items = ['Gin', 'Lime Juice', 'Mint']
    cabinet.activeForShake = []

    const wrapper = mountCarousel()
    const cards = wrapper.findAll('.shelf-card')
    expect(cards).toHaveLength(3)
    // Gin uses a category image; others fall back to SVG
    const artNodes = wrapper.findAll('.shelf-card__art img, .shelf-card__art svg')
    expect(artNodes).toHaveLength(3)
  })

  it('moves active items to the bar and out of the shelf', () => {
    const cabinet = useCabinetStore()
    cabinet.items = ['Gin', 'Tonic']
    cabinet.activeForShake = ['Gin']

    const wrapper = mountCarousel()

    const shelfLabels = wrapper
      .findAll('.cabinet-carousel__shelf .shelf-card__label')
      .map((n) => n.text())
    expect(shelfLabels).toEqual(['Tonic'])

    const barLabels = wrapper
      .findAll('.cabinet-bar__drop .shelf-card__label')
      .map((n) => n.text())
    expect(barLabels).toEqual(['Gin'])
  })

  it('renders an empty slot outline for each unused bar slot', () => {
    const cabinet = useCabinetStore()
    cabinet.items = ['Gin', 'Tonic']
    cabinet.activeForShake = ['Gin']

    const wrapper = mountCarousel()
    expect(wrapper.findAll('.bar-slot--empty')).toHaveLength(1)
  })

  it('removes an item from the cabinet', async () => {
    const cabinet = useCabinetStore()
    cabinet.items = ['Gin', 'Tonic']
    cabinet.activeForShake = []

    const wrapper = mountCarousel()
    await wrapper.findAll('.shelf-card__remove')[0].trigger('click')
    expect(cabinet.items).toEqual(['Tonic'])
  })
})
