import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input component', () => {
  it('renders input field', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Email" />);
    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
  });

  it('connects label to input via id', () => {
    render(<Input label="Username" />);
    const label = screen.getByText('Username');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('id', 'username');
  });

  it('uses provided id over generated one', () => {
    render(<Input label="Email" id="custom-email" />);
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', 'custom-email');
    expect(input).toHaveAttribute('id', 'custom-email');
  });

  it('renders with placeholder text', () => {
    render(<Input placeholder="Enter your email" />);
    const input = screen.getByPlaceholderText('Enter your email');
    expect(input).toBeInTheDocument();
  });

  it('renders error state', () => {
    const { container } = render(<Input error="This field is required" />);
    const input = container.querySelector('input') as HTMLInputElement;
    const style = input.getAttribute('style');
    expect(style).toContain('var(--color-error, #DC2626)');
  });

  it('renders helper text', () => {
    render(<Input helperText="Must be a valid email" />);
    const helperText = screen.getByText('Must be a valid email');
    expect(helperText).toBeInTheDocument();
  });

  it('allows typing in input', async () => {
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId('test-input') as HTMLInputElement;

    await userEvent.type(input, 'test value');
    expect(input.value).toBe('test value');
  });

  it('supports different input types', () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'password');
  });

  it('supports HTML attributes', () => {
    render(
      <Input
        required
        minLength={5}
        maxLength={50}
        disabled
        data-testid="custom-input"
      />
    );
    const input = screen.getByTestId('custom-input') as HTMLInputElement;
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('minlength', '5');
    expect(input).toHaveAttribute('maxlength', '50');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Input className="custom-class" />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref to input element', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles change events', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await userEvent.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles focus event', async () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input')!;

    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it('handles blur event', async () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input')!;

    input.focus();
    input.blur();
    expect(document.activeElement).not.toBe(input);
  });

  it('preserves error state on focus', () => {
    const { container } = render(<Input error="Error message" />);
    const input = container.querySelector('input') as HTMLInputElement;

    input.focus();
    // Error styling should persist
    const style = input.getAttribute('style');
    expect(style).toContain('var(--color-error, #DC2626)');
  });

  it('renders with specific value attribute', () => {
    render(<Input value="initial value" readOnly />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial value');
  });

  it('label is uppercase and styled', () => {
    const { container } = render(<Input label="Name" />);
    const label = container.querySelector('label');
    expect(label).toHaveStyle({
      textTransform: 'uppercase',
      fontWeight: '700',
    });
  });
});
