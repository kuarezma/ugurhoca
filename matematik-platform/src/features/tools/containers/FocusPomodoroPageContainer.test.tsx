import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FocusPomodoroPageContainer } from "./FocusPomodoroPageContainer";

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/odak-pomodoro",
}));

vi.mock("@/lib/auth-client", () => ({
  getCurrentUserProfile: vi.fn().mockResolvedValue(null),
  signOutClient: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/games/utils/gameAudio", () => ({
  gameAudio: {
    levelUp: vi.fn(),
    isMuted: vi.fn().mockReturnValue(false),
    setMuted: vi.fn(),
    toggleMuted: vi.fn().mockReturnValue(false),
  },
  isSoundMuted: vi.fn().mockReturnValue(false),
  setSoundMuted: vi.fn(),
  toggleSoundMuted: vi.fn().mockReturnValue(false),
}));

vi.mock("@/features/games/utils/ambientAudio", () => ({
  ambientAudio: {
    play: vi.fn(),
    stop: vi.fn(),
    setVolume: vi.fn(),
  },
  AMBIENT_SOUND_OPTIONS: [
    { id: 'pink', name: 'Pembe Gürültü', description: 'Dingin yağmur ritmi', icon: '🌧️' },
    { id: 'brown', name: 'Kahverengi Gürültü', description: 'Derin şelale uğultusu', icon: '🌊' },
  ],
}));

describe("FocusPomodoroPageContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the focus timer and all mode buttons", () => {
    render(<FocusPomodoroPageContainer />);

    expect(screen.getByText(/Odak & Pomodoro/i)).toBeInTheDocument();
    expect(screen.getByText('Ana Sayfaya Dön')).toBeInTheDocument();

    // Default mode is 25m focus
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText(/25 Dk Odak/i)).toBeInTheDocument();
    expect(screen.getByText(/50 Dk Derin Odak/i)).toBeInTheDocument();
    expect(screen.getByText(/5 Dk Mola/i)).toBeInTheDocument();
    expect(screen.getByText(/10 Dk Uzun Mola/i)).toBeInTheDocument();
  });

  it("switches timer mode when mode button is clicked", () => {
    render(<FocusPomodoroPageContainer />);

    const break5Btn = screen.getByRole("button", { name: /5 Dk Mola/i });
    fireEvent.click(break5Btn);

    expect(screen.getByText("05:00")).toBeInTheDocument();
  });

  it("toggles timer play and pause", () => {
    render(<FocusPomodoroPageContainer />);

    const playBtn = screen.getByRole("button", { name: /Başlat/i });
    fireEvent.click(playBtn);

    expect(screen.getByRole("button", { name: /Duraklat/i })).toBeInTheDocument();

    const pauseBtn = screen.getByRole("button", { name: /Duraklat/i });
    fireEvent.click(pauseBtn);

    expect(screen.getByRole("button", { name: /Başlat|Devam Et/i })).toBeInTheDocument();
  });
});
