import type { AppUser, ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { FolderOpen } from 'lucide-react';
import ContentCard from '@/features/content/components/ContentCard';
import { EmptyState } from '@/components/ui/EmptyState';

import { type ContentViewMode } from '@/features/content/components/ContentFilterBar';
import ContentTopicPacks from '@/features/content/components/ContentTopicPacks';
import { useContentCompletion } from '@/features/content/hooks/useContentCompletion';
import { useCloudFavorites } from '@/features/content/hooks/useCloudFavorites';

import type { ContentSortOrder } from '@/features/content/types';

import { WorksheetGradeSelection } from './helpers';
import { WorksheetOutcomeFilters } from './WorksheetOutcomeFilters';
type WorksheetResultsProps = {
  worksheetOutcomeEntries: {
    catalogItem: {
      index: number;
      code: string;
      full: string;
      label: string;
    } | null;
    count: number;
    documents: ContentDocument[];
    outcome: string;
  }[];
  setSelectedWorksheetOutcome: Dispatch<SetStateAction<string | null>>;
  updateWorksheetBrowserUrl: (
    grade: WorksheetGradeSelection | null,
    outcome?: string | null,
  ) => void;
  selectedWorksheetGrade: WorksheetGradeSelection;
  selectedWorksheetOutcome: string | null;
  matchingWorksheetDocuments: ContentDocument[];
  searchTerm: string;
  filteredWorksheetTests: ContentDocument[];
  viewMode: ContentViewMode;
  isCompleted: ReturnType<typeof useContentCompletion>['isCompleted'];
  isFavorite: ReturnType<typeof useCloudFavorites>['isFavorite'];
  likedDocs: Set<string>;
  handleDeleteDocument: (content: ContentDocument) => void;
  handleDownloadDocument: (content: ContentDocument) => Promise<void>;
  handleOpenEdit: (content: ContentDocument) => void;
  handleOpenComments: (content: ContentDocument) => Promise<void>;
  handleOpenPreview: (content: ContentDocument) => void;
  toggleCompleted: ReturnType<typeof useContentCompletion>['toggleCompleted'];
  toggleFavorite: ReturnType<typeof useCloudFavorites>['toggleFavorite'];
  handleToggleLike: (content: ContentDocument) => Promise<void>;
  worksheetSortBy: ContentSortOrder;
  user: AppUser | null;
  worksheetGradeLabel: string | null;
};

export function WorksheetResults({
  worksheetOutcomeEntries,
  setSelectedWorksheetOutcome,
  updateWorksheetBrowserUrl,
  selectedWorksheetGrade,
  selectedWorksheetOutcome,
  matchingWorksheetDocuments,
  searchTerm,
  filteredWorksheetTests,
  viewMode,
  isCompleted,
  isFavorite,
  likedDocs,
  handleDeleteDocument,
  handleDownloadDocument,
  handleOpenEdit,
  handleOpenComments,
  handleOpenPreview,
  toggleCompleted,
  toggleFavorite,
  handleToggleLike,
  worksheetSortBy,
  user,
  worksheetGradeLabel,
}: WorksheetResultsProps) {
  return (
    <div className="space-y-6">
      {/* Kazanım Hızlı Filtre Çipleri */}
      {worksheetOutcomeEntries.length > 0 && (
        <WorksheetOutcomeFilters
          setSelectedWorksheetOutcome={setSelectedWorksheetOutcome}
          updateWorksheetBrowserUrl={updateWorksheetBrowserUrl}
          selectedWorksheetGrade={selectedWorksheetGrade}
          selectedWorksheetOutcome={selectedWorksheetOutcome}
          matchingWorksheetDocuments={matchingWorksheetDocuments}
          worksheetOutcomeEntries={worksheetOutcomeEntries}
          searchTerm={searchTerm}
        />
      )}

      {/* İçerik Listesi */}
      {filteredWorksheetTests.length > 0 ? (
        viewMode === 'packs' ? (
          <ContentTopicPacks
            documents={filteredWorksheetTests}
            isCompleted={isCompleted}
            isFavorite={isFavorite}
            isLiked={(id) => likedDocs.has(id)}
            onDelete={handleDeleteDocument}
            onDownload={handleDownloadDocument}
            onEdit={handleOpenEdit}
            onOpenComments={handleOpenComments}
            onPreview={handleOpenPreview}
            onToggleCompleted={toggleCompleted}
            onToggleFavorite={toggleFavorite}
            onToggleLike={handleToggleLike}
            sortBy={worksheetSortBy}
            user={user}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredWorksheetTests.map((content, index) => (
              <ContentCard
                key={content.id}
                content={content}
                index={index}
                isCompleted={isCompleted(content.id)}
                isFavorite={isFavorite(content.id)}
                isLiked={likedDocs.has(content.id)}
                onDelete={handleDeleteDocument}
                onDownload={handleDownloadDocument}
                onEdit={handleOpenEdit}
                onOpenComments={handleOpenComments}
                onPreview={handleOpenPreview}
                onToggleCompleted={toggleCompleted}
                onToggleFavorite={toggleFavorite}
                onToggleLike={handleToggleLike}
                user={user}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorksheetTests.map((content, index) => (
              <ContentCard
                key={content.id}
                content={content}
                index={index}
                isCompleted={isCompleted(content.id)}
                isFavorite={isFavorite(content.id)}
                isLiked={likedDocs.has(content.id)}
                onDelete={handleDeleteDocument}
                onDownload={handleDownloadDocument}
                onEdit={handleOpenEdit}
                onOpenComments={handleOpenComments}
                onPreview={handleOpenPreview}
                onToggleCompleted={toggleCompleted}
                onToggleFavorite={toggleFavorite}
                onToggleLike={handleToggleLike}
                user={user}
                viewMode="list"
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          tone="soft"
          icon={<FolderOpen className="h-6 w-6" aria-hidden="true" />}
          title={
            selectedWorksheetOutcome
              ? 'Bu kazanımda test bulunamadı'
              : `${worksheetGradeLabel} için içerik bulunamadı`
          }
          description={
            selectedWorksheetOutcome
              ? 'Tüm içerikleri görmek için "Tüm İçerikler" filtresine tıklayabilirsiniz.'
              : 'Bu sınıf düzeyine henüz yaprak test yüklenmemiş.'
          }
        />
      )}
    </div>
  );
}
