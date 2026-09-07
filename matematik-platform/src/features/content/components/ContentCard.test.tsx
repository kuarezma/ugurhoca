import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentCard } from './ContentCard';
import type { ContentDocument } from '@/types';

const mockContent: ContentDocument = {
  id: 'doc-123',
  title: '5. Sınıf Doğal Sayılar ve İşlemler Yaprak Test',
  description: 'Temel kavramlar ve yeni nesil sorular',
  grade: [5],
  type: 'yaprak-test',
  file_url: 'https://example.com/test.pdf',
  solution_url: 'https://example.com/solution.pdf',
  created_at: '2026-05-25T10:00:00Z',
  views: 42,
  likes: 12,
  downloads: 8,
  comments_count: 3,
  isNew: true,
  author: 'Uğur Hoca',
};

describe('ContentCard', () => {
  it('renders grid view correctly with title, metadata, stats, and action buttons', () => {
    const onPreview = vi.fn();
    const onDownload = vi.fn();
    const onToggleFavorite = vi.fn();
    const onToggleLike = vi.fn();
    const onToggleCompleted = vi.fn();
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    const onOpenComments = vi.fn();

    render(
      <ContentCard
        content={mockContent}
        index={0}
        viewMode="grid"
        isFavorite={false}
        isLiked={false}
        isCompleted={false}
        onPreview={onPreview}
        onDownload={onDownload}
        onToggleFavorite={onToggleFavorite}
        onToggleLike={onToggleLike}
        onToggleCompleted={onToggleCompleted}
        onDelete={onDelete}
        onEdit={onEdit}
        onOpenComments={onOpenComments}
        user={null}
      />,
    );

    // Title and description
    expect(
      screen.getByText('5. Sınıf Doğal Sayılar ve İşlemler Yaprak Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Temel kavramlar ve yeni nesil sorular'),
    ).toBeInTheDocument();

    // Badges
    expect(screen.getByText('Yeni')).toBeInTheDocument();
    expect(screen.getByText('ÇÖZÜMLÜ')).toBeInTheDocument();
    expect(screen.getByText('5. Sınıf')).toBeInTheDocument();

    // Primary Actions
    const previewBtn = screen.getByRole('button', { name: /Önizle/i });
    fireEvent.click(previewBtn);
    expect(onPreview).toHaveBeenCalledWith(mockContent);

    const downloadBtn = screen.getByRole('button', { name: /İndir/i });
    fireEvent.click(downloadBtn);
    expect(onDownload).toHaveBeenCalledWith(mockContent);

    // Utility actions
    const favBtn = screen.getByTitle('Favori');
    fireEvent.click(favBtn);
    expect(onToggleFavorite).toHaveBeenCalledWith('doc-123');

    const completeBtn = screen.getByTitle('Çözüldü olarak işaretle');
    fireEvent.click(completeBtn);
    expect(onToggleCompleted).toHaveBeenCalledWith(mockContent);

    const likeBtn = screen.getByTitle('Beğen');
    fireEvent.click(likeBtn);
    expect(onToggleLike).toHaveBeenCalledWith(mockContent);

    // Admin buttons should not exist for non-admin
    expect(screen.queryByTitle('Düzenle')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Sil')).not.toBeInTheDocument();
  });

  it('renders admin buttons when user is admin', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <ContentCard
        content={mockContent}
        index={0}
        viewMode="grid"
        isFavorite={true}
        isLiked={true}
        isCompleted={true}
        onPreview={vi.fn()}
        onDownload={vi.fn()}
        onToggleFavorite={vi.fn()}
        onToggleLike={vi.fn()}
        onDelete={onDelete}
        onEdit={onEdit}
        onOpenComments={vi.fn()}
        user={{
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin',
          grade: 8,
          isAdmin: true,
        }}
      />,
    );

    const editBtn = screen.getByTitle('Düzenle');
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockContent);

    const deleteBtn = screen.getByTitle('Sil');
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockContent);
  });

  it('renders list view without crashing', () => {
    render(
      <ContentCard
        content={mockContent}
        index={0}
        viewMode="list"
        isFavorite={false}
        isLiked={false}
        isCompleted={true}
        onPreview={vi.fn()}
        onDownload={vi.fn()}
        onToggleFavorite={vi.fn()}
        onToggleLike={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onOpenComments={vi.fn()}
        user={null}
      />,
    );

    expect(
      screen.getByText('5. Sınıf Doğal Sayılar ve İşlemler Yaprak Test'),
    ).toBeInTheDocument();
    expect(screen.getByText('Çözüldü')).toBeInTheDocument();
  });
});
