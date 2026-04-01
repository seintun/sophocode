import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Select } from '../Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

describe('Select', () => {
  it('renders trigger with selected label', () => {
    render(<Select options={options} onChange={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('calls onChange with value string when option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('option', { name: /Option B/i }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('shows placeholder label when provided', () => {
    render(<Select options={options} placeholder="Pick one" onChange={() => {}} />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('closes listbox when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Select options={options} onChange={() => {}} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Select options={options} onChange={() => {}} className="custom-sel" />);
    const root = screen.getByRole('button').parentElement;
    expect(root?.className).toContain('custom-sel');
    expect(root?.className).toContain('w-full');
  });
});
