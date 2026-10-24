import { useState } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  CustomDropdown,
  type DropdownOption,
} from './CustomDropdown';

const options: DropdownOption[] = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Solid', value: 'solid', disabled: true },
  { label: 'Svelte', value: 'svelte' },
];

describe('CustomDropdown', () => {
  it('renders the placeholder when no value is selected', () => {
    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
        placeholder="Choose a framework"
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Framework' }),
    ).toHaveTextContent('Choose a framework');
  });

  it('opens and closes the options list', async () => {
    const user = userEvent.setup();

    render(
      <CustomDropdown ariaLabel="Framework" options={options} />,
    );

    const trigger = screen.getByRole('button', {
      name: 'Framework',
    });

    await user.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('selects an option and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Framework' }));
    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(onChange).toHaveBeenCalledWith('vue');
    expect(
      screen.getByRole('button', { name: 'Framework' }),
    ).toHaveTextContent('Vue');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports controlled values', async () => {
    const user = userEvent.setup();

    function ControlledDropdown() {
      const [value, setValue] = useState('react');

      return (
        <>
          <CustomDropdown
            ariaLabel="Framework"
            options={options}
            value={value}
            onChange={setValue}
          />
          <output>{value}</output>
        </>
      );
    }

    render(<ControlledDropdown />);

    expect(
      screen.getByRole('button', { name: 'Framework' }),
    ).toHaveTextContent('React');

    await user.click(screen.getByRole('button', { name: 'Framework' }));
    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(
      screen.getByRole('button', { name: 'Framework' }),
    ).toHaveTextContent('Vue');
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('supports defaultValue for uncontrolled usage', () => {
    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
        defaultValue="vue"
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Framework' }),
    ).toHaveTextContent('Vue');
  });

  it('does not select disabled options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Framework' }));
    await user.click(screen.getByRole('option', { name: 'Solid' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <>
        <CustomDropdown
          ariaLabel="Framework"
          options={options}
        />
        <button type="button">Outside</button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Framework' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('shows a message when there are no options', async () => {
    const user = userEvent.setup();

    render(
      <CustomDropdown ariaLabel="Framework" options={[]} />,
    );

    await user.click(screen.getByRole('button', { name: 'Framework' }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();

    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
        disabled
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Framework' });

    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on an outside mouse event', () => {
    render(
      <>
        <CustomDropdown
          ariaLabel="Framework"
          options={options}
        />
        <button type="button">Outside</button>
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Framework' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens with ArrowDown and selects an option with Enter', () => {
    const onChange = vi.fn();

    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Framework' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('react');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('skips disabled options during keyboard navigation', () => {
    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Framework' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(trigger).toHaveTextContent('Svelte');
  });

  it('closes with Escape and restores focus to the trigger', () => {
    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Framework' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('supports Home and End keys while open', () => {
    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Framework' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'End' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(trigger).toHaveTextContent('Svelte');
  });

  it('keeps the active option separate from the selected option', async () => {
    const user = userEvent.setup();

    render(
      <CustomDropdown
        ariaLabel="Framework"
        options={options}
        value="react"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Framework' }));

    const reactOption = screen.getByRole('option', { name: 'React' });
    const vueOption = screen.getByRole('option', { name: 'Vue' });

    expect(reactOption).toHaveAttribute('aria-selected', 'true');
    expect(vueOption).toHaveAttribute('aria-selected', 'false');

    fireEvent.mouseMove(vueOption);

    expect(vueOption).toHaveClass('custom-dropdown__option--active');
    expect(reactOption).not.toHaveClass('custom-dropdown__option--active');
    expect(reactOption).toHaveAttribute('aria-selected', 'true');
  });

    it('assigns unique listbox IDs to multiple dropdown instances', async () => {
    const user = userEvent.setup();

    render(
      <>
        <CustomDropdown options={options} ariaLabel="First dropdown" />
        <CustomDropdown options={options} ariaLabel="Second dropdown" />
      </>,
    );

    const firstTrigger = screen.getByRole('button', {
      name: 'First dropdown',
    });
    const secondTrigger = screen.getByRole('button', {
      name: 'Second dropdown',
    });

    const firstListboxId = firstTrigger.getAttribute('aria-controls');
    const secondListboxId = secondTrigger.getAttribute('aria-controls');

    expect(firstListboxId).toBeTruthy();
    expect(secondListboxId).toBeTruthy();
    expect(firstListboxId).not.toBe(secondListboxId);

    await user.click(firstTrigger);

    expect(document.getElementById(firstListboxId!)).toHaveAttribute(
      'role',
      'listbox',
    );

    await user.click(secondTrigger);

    expect(document.getElementById(firstListboxId!)).not.toBeInTheDocument();
    expect(document.getElementById(secondListboxId!)).toHaveAttribute(
      'role',
      'listbox',
    );
  });
});
