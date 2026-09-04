import { renderHook, waitFor } from '@testing-library/react';
import { useNavbarNotifications } from './useNavbarNotifications';
import { useNavbarMessages } from './useNavbarMessages';
import { supabase } from '@/lib/supabase/client';

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockIn = vi.fn();
const mockFrom = vi.fn();
const mockChannel = vi.fn();
const mockRemoveChannel = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(),
    from: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

describe('Navbar Stores Singleton & Caching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (globalThis as Record<string, unknown>).__ugurhoca_notification_stores__;
    delete (globalThis as Record<string, unknown>).__ugurhoca_message_stores__;

    const dummyChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    };
    mockChannel.mockReturnValue(dummyChannel);
    mockRemoveChannel.mockResolvedValue('ok');

    mockLimit.mockResolvedValue({ data: [] });
    mockIn.mockReturnValue({
      order: vi.fn().mockReturnValue({ limit: mockLimit }),
    });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockEq.mockReturnValue({ in: mockIn, order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(supabase.channel).mockImplementation(mockChannel as never);
    vi.mocked(supabase.removeChannel).mockImplementation(mockRemoveChannel as never);
    vi.mocked(supabase.from).mockImplementation(mockFrom as never);
  });

  it('shares singleton store between multiple useNavbarNotifications instances', async () => {
    const { result: r1 } = renderHook(() => useNavbarNotifications('user-test-1'));
    const { result: r2 } = renderHook(() => useNavbarNotifications('user-test-1'));

    await waitFor(() => {
      expect(r1.current.loading).toBe(false);
      expect(r2.current.loading).toBe(false);
    });

    // Supabase channel should be created once for this user
    expect(mockChannel).toHaveBeenCalledTimes(1);
    // Notification select query should only be called once, not twice
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it('shares singleton store between multiple useNavbarMessages instances', async () => {
    const { result: r1 } = renderHook(() => useNavbarMessages('user-test-2'));
    const { result: r2 } = renderHook(() => useNavbarMessages('user-test-2'));

    await waitFor(() => {
      expect(r1.current.loading).toBe(false);
      expect(r2.current.loading).toBe(false);
    });

    // Supabase channel should be created once for this user
    expect(mockChannel).toHaveBeenCalledTimes(1);
    // Message query should only be called once, not twice
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });
});
