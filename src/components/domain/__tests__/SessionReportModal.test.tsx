import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionReportModal } from '../SessionReportModal';

describe('SessionReportModal', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads and renders report content when opened', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          report: {
            strengths: 'Solid debugging and iteration speed.',
            areasToImprove: 'Edge-case handling for empty inputs.',
            nextSteps: 'Practice 2 hash map drills.',
            complexityNote: 'Current approach is O(n).',
          },
        }),
    } as Response);

    render(<SessionReportModal open sessionId="session-123" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Solid debugging and iteration speed.')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/sessions/session-123/report', {
      cache: 'no-store',
    });
    expect(screen.getByText('Edge-case handling for empty inputs.')).toBeInTheDocument();
    expect(screen.getByText('Practice 2 hash map drills.')).toBeInTheDocument();
  });

  it('shows API error message on failed response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ error: 'report_unavailable' }),
    } as Response);

    render(<SessionReportModal open sessionId="session-123" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('report_unavailable')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is pressed', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ report: null }),
    } as Response);
    const onClose = vi.fn();

    render(<SessionReportModal open sessionId="session-123" onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close session report'));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
