import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node, et il ne faut pas les y ajouter pour du code navigateur.
import source from './PlayerSetupModal.vue?raw'
import { mount } from '@vue/test-utils'
import PlayerSetupModal from './PlayerSetupModal.vue'
import AlphaKeyboard from './AlphaKeyboard.vue'
import NumericPad from './NumericPad.vue'

function mountModal(
  overrides: Partial<{ color: 'white' | 'yellow'; name: string; targetScore: number }> = {},
) {
  return mount(PlayerSetupModal, {
    props: { color: 'white', name: '', targetScore: 0, ...overrides },
  })
}

type Wrapper = ReturnType<typeof mountModal>

async function press(wrapper: Wrapper, testids: string[]) {
  for (const testid of testids) {
    await wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
  }
}

async function confirmed(wrapper: Wrapper) {
  await wrapper.find('[data-testid="setup-confirm-button"]').trigger('pointerdown')
  return wrapper.emitted('confirm')?.[0]?.[0]
}

const nameOf = (w: Wrapper) => w.find('[data-testid="name-value"]').text()
const distanceOf = (w: Wrapper) => w.find('[data-testid="distance-value"]').text()

describe('PlayerSetupModal', () => {
  it('opens on the name field with the letter keyboard up', () => {
    const wrapper = mountModal()

    expect(wrapper.findComponent(AlphaKeyboard).exists()).toBe(true)
    expect(wrapper.findComponent(NumericPad).exists()).toBe(false)
    expect(nameOf(wrapper)).toBe('JOUEUR')
    expect(distanceOf(wrapper)).toBe('0')
  })

  // Le cœur de la demande : un seul emplacement, le clavier s'adapte au champ touché.
  it('swaps the letter keyboard for the numeric pad when the handicap field is tapped', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['distance-field'])

    expect(wrapper.findComponent(NumericPad).exists()).toBe(true)
    expect(wrapper.findComponent(AlphaKeyboard).exists()).toBe(false)

    await press(wrapper, ['name-field'])

    expect(wrapper.findComponent(AlphaKeyboard).exists()).toBe(true)
    expect(wrapper.findComponent(NumericPad).exists()).toBe(false)
  })

  it('types a name letter by letter and returns it on confirm', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['key-M', 'key-I', 'key-C', 'key-H', 'key-E', 'key-L'])

    expect(nameOf(wrapper)).toBe('MICHEL')
    expect(await confirmed(wrapper)).toEqual({ name: 'MICHEL', targetScore: 0 })
  })

  it('accepts digits inside a name', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['key-M', 'key-space', 'key-2'])

    expect(nameOf(wrapper)).toBe('M 2')
  })

  it('deletes the last character on backspace', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['key-A', 'key-B', 'key-backspace'])

    expect(nameOf(wrapper)).toBe('A')
  })

  it('caps the name at 20 characters', async () => {
    const wrapper = mountModal()

    await press(wrapper, Array.from({ length: 25 }, () => 'key-A'))

    expect(nameOf(wrapper)).toHaveLength(20)
  })

  // `nameOf()` lit un libellé d'attente qu'un joueur peut lui-même taper : on prouve le
  // refus par la valeur émise, seule à distinguer « vide » de « le mot JOUEUR ».
  it('refuses a leading space', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['key-space'])

    expect(await confirmed(wrapper)).toEqual({ name: '', targetScore: 0 })
  })

  it('refuses consecutive spaces instead of letting them eat the 20-character cap', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['key-M', 'key-space', 'key-space', 'key-space', 'key-A'])

    expect(await confirmed(wrapper)).toEqual({ name: 'M A', targetScore: 0 })
  })

  // Le plafond porte sur le nom utile : un espace de fin ne doit pas condamner la frappe.
  it('keeps accepting letters when a trailing space is pending', async () => {
    const wrapper = mountModal()

    await press(wrapper, [...'MICHEL'].map((c) => `key-${c}`))
    await press(wrapper, ['key-space', 'key-D'])

    expect(nameOf(wrapper)).toBe('MICHEL D')
  })

  it('builds the distance on the numeric pad and returns it on confirm', async () => {
    const wrapper = mountModal({ name: 'MICHEL' })

    await press(wrapper, ['distance-field', 'digit-1', 'digit-0', 'digit-0'])

    expect(distanceOf(wrapper)).toBe('100')
    expect(await confirmed(wrapper)).toEqual({ name: 'MICHEL', targetScore: 100 })
  })

  it('ignores a fourth digit instead of overflowing', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['distance-field', 'digit-9', 'digit-9', 'digit-9', 'digit-5'])

    expect(distanceOf(wrapper)).toBe('999')
  })

  // Pas de zéros de tête : un 0 saisi sur un buffer vide laisse la distance LIBRE.
  it('keeps a leading zero from producing a padded distance', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['distance-field', 'digit-0', 'digit-0', 'digit-5'])

    expect(distanceOf(wrapper)).toBe('5')
  })

  it('clears the distance back to zero', async () => {
    const wrapper = mountModal({ targetScore: 100 })

    await press(wrapper, ['distance-field', 'clear-button'])

    expect(distanceOf(wrapper)).toBe('0')
  })

  it('deletes the last digit only on backspace', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['distance-field', 'digit-1', 'digit-2', 'digit-3', 'backspace-button'])

    expect(distanceOf(wrapper)).toBe('12')
  })

  // Le libellé d'effacement suit l'état du champ, comme sur la calculatrice iOS.
  it('reads AC on an empty distance and C once a digit is entered', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['distance-field'])
    expect(wrapper.find('[data-testid="clear-button"]').text()).toBe('AC')

    await press(wrapper, ['digit-4'])
    expect(wrapper.find('[data-testid="clear-button"]').text()).toBe('C')
  })

  it('names the distance field DISTANCE, never HANDICAP', () => {
    const wrapper = mountModal()

    expect(wrapper.find('[data-testid="distance-field"]').text()).toContain('DISTANCE')
    expect(wrapper.text()).not.toContain('HANDICAP')
  })

  it('opens on the values already set for this player', () => {
    const wrapper = mountModal({ name: 'ANDRE', targetScore: 80 })

    expect(nameOf(wrapper)).toBe('ANDRE')
    expect(distanceOf(wrapper)).toBe('80')
  })

  it('names the yellow ball when it is the one being set up', () => {
    expect(mountModal({ color: 'yellow' }).text()).toContain('BILLE JAUNE')
  })

  // Une vraie pop-up : la croix ferme, un tap en dehors de la carte ferme aussi.
  it('closes on the top-left cross without returning any value', async () => {
    const wrapper = mountModal()

    await press(wrapper, ['key-A', 'modal-close-button'])

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  // Le voile est la SEULE exception à AR8 : il ferme au relâchement. Fermer au contact
  // jetait toute la saisie dès qu'une paume d'appui effleurait le fond.
  it('closes when the backdrop around the card is released', async () => {
    const wrapper = mountModal()

    await wrapper.find('[data-testid="modal-backdrop"]').trigger('pointerup')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('does not close on mere contact with the backdrop', async () => {
    const wrapper = mountModal()

    await wrapper.find('[data-testid="modal-backdrop"]').trigger('pointerdown')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // Sans ce test, supprimer entièrement `border-turn-active` laissait la suite verte.
  it('moves the focus ring to whichever field receives the keystrokes', async () => {
    const wrapper = mountModal()
    const nameField = () => wrapper.find('[data-testid="name-field"]')
    const distanceField = () => wrapper.find('[data-testid="distance-field"]')

    expect(nameField().classes()).toContain('border-turn-active')
    expect(distanceField().classes()).not.toContain('border-turn-active')

    await press(wrapper, ['distance-field'])

    expect(nameField().classes()).not.toContain('border-turn-active')
    expect(distanceField().classes()).toContain('border-turn-active')
  })

  // Task 5.4 : le caret suit le champ visé, sur les DEUX champs.
  it('blinks a caret on the focused field, whichever it is', async () => {
    const wrapper = mountModal()

    expect(wrapper.find('[data-testid="name-caret"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="distance-caret"]').exists()).toBe(false)

    await press(wrapper, ['distance-field'])

    expect(wrapper.find('[data-testid="name-caret"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="distance-caret"]').exists()).toBe(true)
  })

  // D3 : une distance déjà réglée à 3 chiffres doit rester modifiable. Sans le
  // remplacement à la première frappe, le plafond rendait tout le pavé inerte.
  it('lets a three-digit distance be retyped instead of freezing the pad', async () => {
    const wrapper = mountModal({ targetScore: 100 })

    await press(wrapper, ['distance-field'])
    expect(distanceOf(wrapper)).toBe('100')

    await press(wrapper, ['digit-8', 'digit-0'])

    expect(distanceOf(wrapper)).toBe('80')
    expect(await confirmed(wrapper)).toEqual({ name: '', targetScore: 80 })
  })

  // ... mais taper DANS la carte ne doit surtout pas la refermer.
  it('stays open when the card itself is tapped', async () => {
    const wrapper = mountModal()

    await wrapper.find('[data-testid="modal-card"]').trigger('pointerdown')
    await press(wrapper, ['name-field'])

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('blurs the page behind instead of hiding it', () => {
    const backdrop = mountModal().find('[data-testid="modal-backdrop"]')

    expect(backdrop.classes()).toContain('backdrop-blur-md')
    expect(backdrop.classes()).toContain('fixed')
    expect(backdrop.classes()).toContain('inset-0')
  })

  // L'écran est une borne : aucune saisie ne doit pouvoir appeler le clavier du système.
  it('holds no native input the system keyboard could attach to', () => {
    const wrapper = mountModal()

    expect(wrapper.findAll('input')).toHaveLength(0)
    expect(wrapper.findAll('textarea')).toHaveLength(0)
    expect(source).not.toContain('<input')
  })

  // UX-DR3 : l'action primaire porte l'accent système, jamais une couleur joueur.
  it('gives the confirm control the system accent and a touch-sized target', () => {
    const confirm = mountModal().find('[data-testid="setup-confirm-button"]')

    expect(confirm.classes()).toContain('bg-accent')
    expect(confirm.classes()).toContain('text-on-accent')
    expect(confirm.classes()).toContain('min-h-[var(--size-touch-target)]')
    // Pleine largeur de la modale : c'est l'action de sortie, elle ne se cherche pas.
    expect(confirm.classes()).toContain('w-full')
  })

  // AR8 : `@pointerdown` seul, jamais `@click`.
  it('binds pointerdown only, never click', () => {
    expect(source).toContain('@pointerdown')
    expect(source).not.toContain('@click')
  })
})
