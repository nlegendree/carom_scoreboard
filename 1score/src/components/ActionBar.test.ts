import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionBar from './ActionBar.vue'

describe('ActionBar', () => {
  it('labels the back control RETOUR by default', () => {
    const wrapper = mount(ActionBar)

    expect(wrapper.find('[data-testid="back-button"]').text()).toContain('RETOUR')
  })

  it('uses the provided back label', () => {
    const wrapper = mount(ActionBar, { props: { backLabel: 'QUITTER' } })

    expect(wrapper.find('[data-testid="back-button"]').text()).toContain('QUITTER')
  })

  it('emits back when the control is pressed', async () => {
    const wrapper = mount(ActionBar)

    await wrapper.find('[data-testid="back-button"]').trigger('pointerdown')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('hides the back control when showBack is false', () => {
    const wrapper = mount(ActionBar, { props: { showBack: false } })

    expect(wrapper.find('[data-testid="back-button"]').exists()).toBe(false)
  })

  it('renders the actions slot', () => {
    const wrapper = mount(ActionBar, {
      slots: { actions: '<button data-testid="cta">DÉMARRER</button>' },
    })

    expect(wrapper.find('[data-testid="cta"]').exists()).toBe(true)
  })
})
