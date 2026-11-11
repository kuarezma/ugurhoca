import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ScratchpadModal from './ScratchpadModal';

vi.mock('./ProtractorOverlay', () => ({ default: () => null }));

afterEach(() => vi.restoreAllMocks());

describe('ScratchpadModal document workspace', () => {
  it('toggles native fullscreen and reports unsupported browsers', async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const exit = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    const { unmount } = render(
      <ScratchpadModal
        isOpen
        onClose={vi.fn()}
        documentContext={{ title: 'Tam ekran testi' }}
      />,
    );
    const dialog = screen.getByRole('dialog');
    Object.defineProperty(dialog, 'requestFullscreen', {
      configurable: true,
      value: request,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exit,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tam ekran aç' }));
    await waitFor(() => expect(request).toHaveBeenCalledOnce());
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: dialog,
    });
    act(() => document.dispatchEvent(new Event('fullscreenchange')));
    fireEvent.click(screen.getByRole('button', { name: 'Tam ekrandan çık' }));
    await waitFor(() => expect(exit).toHaveBeenCalledOnce());
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: null,
    });
    act(() => document.dispatchEvent(new Event('fullscreenchange')));
    Object.defineProperty(dialog, 'requestFullscreen', { value: undefined });
    fireEvent.click(screen.getByRole('button', { name: 'Tam ekran aç' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Bu tarayıcı tam ekranı desteklemiyor',
    );
    unmount();
    delete (document as Partial<Document>).exitFullscreen;
    Reflect.deleteProperty(document, 'fullscreenElement');
    vi.unstubAllGlobals();
  });

  it('restores the right document drawing after resize and reopen without leaking to another document', async () => {
    const image = {
      width: 600,
      height: 400,
      data: new Uint8ClampedArray(),
    } as ImageData;
    const ctx = {
      scale: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      getImageData: vi.fn(() => image),
      putImageData: vi.fn(),
      drawImage: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(
      HTMLCanvasElement.prototype,
      'getBoundingClientRect',
    ).mockReturnValue({ width: 600, height: 400, left: 0, top: 0 } as DOMRect);
    Object.defineProperty(HTMLCanvasElement.prototype, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'hasPointerCapture', {
      configurable: true,
      value: () => false,
    });
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      documentContext: { documentId: 'cache-test-a', title: 'A' },
    };
    const view = render(<ScratchpadModal {...props} />);
    await waitFor(() => expect(ctx.getImageData).toHaveBeenCalled());
    const canvas = screen.getByLabelText('İşlem tahtası çizim alanı');
    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 40, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    fireEvent(window, new Event('resize'));
    expect(ctx.drawImage).toHaveBeenCalled();
    view.unmount();
    ctx.drawImage.mockClear();
    ctx.putImageData.mockClear();
    const reopened = render(<ScratchpadModal {...props} />);
    await waitFor(() =>
      expect(ctx.putImageData).toHaveBeenCalledWith(image, 0, 0),
    );
    reopened.unmount();
    ctx.drawImage.mockClear();
    const other = render(
      <ScratchpadModal
        {...props}
        documentContext={{ documentId: 'cache-test-b', title: 'B' }}
      />,
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 90));
    });
    expect(ctx.drawImage).not.toHaveBeenCalled();
    other.unmount();
    delete (HTMLCanvasElement.prototype as Partial<HTMLCanvasElement>)
      .setPointerCapture;
    delete (HTMLCanvasElement.prototype as Partial<HTMLCanvasElement>)
      .hasPointerCapture;
  });
});
