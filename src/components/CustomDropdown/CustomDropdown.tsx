
import { useEffect, useRef, useState } from 'react'
import './CustomDropdown.css'

export interface DropdownOption {
  label: string
  value: string
  disabled?: boolean
}

export interface CustomDropdownProps {
  options: DropdownOption[]
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  ariaLabel?: string
  disabled?: boolean
}

export function CustomDropdown({
  options,
  placeholder = 'Select an option',
  value,
  defaultValue,
  onChange,
  ariaLabel = 'Dropdown',
  disabled = false,
}: CustomDropdownProps) {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? '',
  )
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : internalValue

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  )

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  function handleSelect(option: DropdownOption) {
    if (option.disabled) {
      return
    }

    if (!isControlled) {
      setInternalValue(option.value)
    }

    onChange?.(option.value)
    setIsOpen(false)
  }

  function handleToggle() {
    if (!disabled) {
      setIsOpen((current) => !current)
    }
  }

  return (
    <div className="custom-dropdown" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="custom-dropdown__trigger"
        disabled={disabled}
        onClick={handleToggle}
        type="button"
      >
        <span>
          {selectedOption?.label ?? placeholder}
        </span>
        <span
          aria-hidden="true"
          className={`custom-dropdown__arrow${isOpen ? ' custom-dropdown__arrow--open' : ''}`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <ul
          aria-label={`${ariaLabel} options`}
          className="custom-dropdown__list"
          role="listbox"
        >
          {options.length > 0 ? (
            options.map((option) => (
              <li
                aria-selected={option.value === selectedValue}
                className={[
                  'custom-dropdown__option',
                  option.value === selectedValue
                    ? 'custom-dropdown__option--selected'
                    : '',
                  option.disabled
                    ? 'custom-dropdown__option--disabled'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={option.value}
                onClick={() => handleSelect(option)}
                role="option"
                aria-disabled={option.disabled || undefined}
              >
                <span>{option.label}</span>
                {option.value === selectedValue && (
                  <span aria-hidden="true">✓</span>
                )}
              </li>
            ))
          ) : (
            <li className="custom-dropdown__empty">
              No options available
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
