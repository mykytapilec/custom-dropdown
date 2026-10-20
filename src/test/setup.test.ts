
import { describe, expect, it } from 'vitest'

describe('Test environment', () => {
  it('supports DOM matchers', () => {
    const element = document.createElement('button')

    element.textContent = 'Open menu'
    document.body.appendChild(element)

    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Open menu')
  })
})
