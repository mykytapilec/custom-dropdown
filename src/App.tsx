
import { useState } from 'react'
import {
  CustomDropdown,
  type DropdownOption,
} from './components/CustomDropdown/CustomDropdown'
import './App.css'

const options: DropdownOption[] = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'solid', disabled: true },
]

function App() {
  const [selectedValue, setSelectedValue] = useState('')

  return (
    <main className="app">
      <section className="app__content">
        <p className="app__eyebrow">Custom component</p>
        <h1>Custom Dropdown</h1>
        <p className="app__description">
          Select a framework from the list below.
        </p>

        <CustomDropdown
          ariaLabel="Framework"
          options={options}
          placeholder="Choose a framework"
          value={selectedValue}
          onChange={setSelectedValue}
        />

        <p className="app__selection" aria-live="polite">
          Selected value:{' '}
          <strong>{selectedValue || 'None'}</strong>
        </p>
      </section>
    </main>
  )
}

export default App
