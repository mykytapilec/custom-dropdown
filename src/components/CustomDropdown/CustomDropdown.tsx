import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import './CustomDropdown.css';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

type OpenDirection = 'first' | 'last';

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  ariaLabel = 'Select an option',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState(value ?? '');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedValue = value === undefined ? internalValue : value;
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  const enabledOptions = options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  function openDropdown(direction: OpenDirection = 'first') {
    if (disabled) {
      return;
    }

    setIsOpen(true);

    if (enabledOptions.length === 0) {
      setActiveIndex(-1);
      return;
    }

    const selectedEnabledOption = enabledOptions.find(
      ({ option }) => option.value === selectedValue,
    );

    if (direction === 'last') {
      setActiveIndex(enabledOptions[enabledOptions.length - 1].index);
      return;
    }

    setActiveIndex(
      selectedEnabledOption?.index ?? enabledOptions[0].index,
    );
  }

  function closeDropdown(restoreFocus = false) {
    setIsOpen(false);
    setActiveIndex(-1);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  function selectOption(option: DropdownOption) {
    if (option.disabled) {
      return;
    }

    if (value === undefined) {
      setInternalValue(option.value);
    }

    onChange?.(option.value);
    closeDropdown(true);
  }

  function moveActiveOption(direction: 1 | -1) {
    if (enabledOptions.length === 0) {
      setActiveIndex(-1);
      return;
    }

    const currentPosition = enabledOptions.findIndex(
      ({ index }) => index === activeIndex,
    );

    const nextPosition =
      currentPosition === -1
        ? direction === 1
          ? 0
          : enabledOptions.length - 1
        : (currentPosition + direction + enabledOptions.length) %
          enabledOptions.length;

    setActiveIndex(enabledOptions[nextPosition].index);
  }

  function moveActiveOptionToBoundary(boundary: OpenDirection) {
    if (enabledOptions.length === 0) {
      setActiveIndex(-1);
      return;
    }

    const target =
      boundary === 'first'
        ? enabledOptions[0]
        : enabledOptions[enabledOptions.length - 1];

    setActiveIndex(target.index);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();

        if (!isOpen) {
          openDropdown('first');
        } else {
          moveActiveOption(1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();

        if (!isOpen) {
          openDropdown('last');
        } else {
          moveActiveOption(-1);
        }
        break;

      case 'Home':
        event.preventDefault();

        if (!isOpen) {
          openDropdown('first');
          moveActiveOptionToBoundary('first');
        } else {
          moveActiveOptionToBoundary('first');
        }
        break;

      case 'End':
        event.preventDefault();

        if (!isOpen) {
          openDropdown('last');
          moveActiveOptionToBoundary('last');
        } else {
          moveActiveOptionToBoundary('last');
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();

        if (!isOpen) {
          openDropdown();
        } else {
          const activeOption = options[activeIndex];

          if (activeOption && !activeOption.disabled) {
            selectOption(activeOption);
          }
        }
        break;

      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          closeDropdown(true);
        }
        break;

      case 'Tab':
        if (isOpen) {
          closeDropdown();
        }
        break;

      default:
        break;
    }
  }

  return (
    <div className="custom-dropdown" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="custom-dropdown__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="custom-dropdown-listbox"
        aria-activedescendant={
          isOpen && activeIndex >= 0
            ? `custom-dropdown-option-${activeIndex}`
            : undefined
        }
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            closeDropdown();
          } else {
            openDropdown();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span
          className={`custom-dropdown__arrow ${
            isOpen ? 'custom-dropdown__arrow--open' : ''
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <ul
          id="custom-dropdown-listbox"
          className="custom-dropdown__list"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.length === 0 ? (
            <li className="custom-dropdown__empty" role="presentation">
              No options available
            </li>
          ) : (
            options.map((option, index) => (
              <li
                id={`custom-dropdown-option-${index}`}
                key={option.value}
                className={[
                  'custom-dropdown__option',
                  index === activeIndex
                    ? 'custom-dropdown__option--active'
                    : '',
                  option.disabled
                    ? 'custom-dropdown__option--disabled'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="option"
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled || undefined}
                onClick={() => selectOption(option)}
                onMouseMove={() => {
                  if (!option.disabled) {
                    setActiveIndex(index);
                  }
                }}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
