import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CustomProblemModal } from '../CustomProblemModal';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('CustomProblemModal', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing when closed', () => {
    render(<CustomProblemModal open={false} onClose={vi.fn()} isPremium={true} />);

    expect(screen.queryByText('Generate Practice Problem')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<CustomProblemModal open onClose={onClose} isPremium={true} />);

    fireEvent.click(screen.getByLabelText('Close custom problem generator'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('posts selected pattern and difficulty, then renders generated problem', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        requestId: 'req-1',
        title: 'Custom Two Sum',
        statement: 'Solve this custom two sum variant.',
        starterCode: 'def solve(): pass',
        problem: { id: 'p1', slug: 'custom-two-sum', title: 'Custom Two Sum' },
      }),
    } as Response);

    render(<CustomProblemModal open onClose={vi.fn()} isPremium={true} />);

    fireEvent.change(screen.getByLabelText('Pattern'), { target: { value: 'HASH_MAPS' } });
    fireEvent.change(screen.getByLabelText('Difficulty'), { target: { value: 'HARD' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      expect(screen.getByText('Custom Two Sum')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/ai/generate-problem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern: 'HASH_MAPS', difficulty: 'HARD' }),
    });
    const startLink = screen.getByRole('link', { name: 'Start This Problem' });
    expect(startLink).toHaveAttribute('href', '/practice/custom-two-sum');
  });

  it('shows request error from API payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'token_limit_exceeded' }),
    } as Response);

    render(<CustomProblemModal open onClose={vi.fn()} isPremium={true} />);

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      expect(screen.getByText('token_limit_exceeded')).toBeInTheDocument();
    });
  });
});
