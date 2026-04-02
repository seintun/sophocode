import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SettingsPanel } from '../SettingsPanel';

describe('SettingsPanel', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads existing preferences and saves updated values', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          theme: 'DARK',
          fontSize: 'LARGE',
          keybindingScheme: 'VIM',
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          theme: 'LIGHT',
          fontSize: 'SMALL',
          keybindingScheme: 'EMACS',
        }),
      } as Response);

    const onClose = vi.fn();
    render(<SettingsPanel open onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Theme')).toHaveValue('DARK');
    });

    fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'LIGHT' } });
    fireEvent.change(screen.getByLabelText('Editor Font Size'), { target: { value: 'SMALL' } });
    fireEvent.change(screen.getByLabelText('Keybindings'), { target: { value: 'EMACS' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });

    expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/user/profile', { cache: 'no-store' });
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'LIGHT', fontSize: 'SMALL', keybindingScheme: 'EMACS' }),
    });
  });

  it('shows save error and keeps panel open', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          theme: 'SYSTEM',
          fontSize: 'MEDIUM',
          keybindingScheme: 'VSCODE',
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid settings' }),
      } as Response);

    const onClose = vi.fn();
    render(<SettingsPanel open onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Theme')).toHaveValue('SYSTEM');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid settings')).toBeInTheDocument();
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
