import { Suspense } from 'react';
import { Filter, Layers3 } from 'lucide-react';
import ContentCard from '@/features/content/components/ContentCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

import ContentTopicPacks from '@/features/content/components/ContentTopicPacks';

import { WORKSHEET_GRADE_CARD_STYLES, ContentUrlFilters } from './helpers';
import { ContentDeleteConfirmModal } from './lazy';
import { ContentNavigation } from './ContentNavigation';
import { ContentHeading } from './ContentHeading';
import { ContentFilters } from './ContentFilters';
import { WorksheetBreadcrumbs } from './WorksheetBreadcrumbs';
import { WorksheetResults } from './WorksheetResults';
import { ContentPreview } from './ContentPreview';
import { ContentEditor } from './ContentEditor';
import { ContentQuickAdd } from './ContentQuickAdd';
import { ContentComments } from './ContentComments';
import type { ContentsViewProps } from './view-types';

export function ContentsView({ loadMoreRef, ...props }: ContentsViewProps) {
  return (
    <main className="page-surface icerikler-page min-h-screen gradient-bg pb-[max(6rem,calc(env(safe-area-inset-bottom)+5.5rem))] relative">
      <Suspense fallback={null}>
        <ContentUrlFilters onChange={props.setSearchParams} />
      </Suspense>
      <ContentNavigation profileHref={props.profileHref} user={props.user} />

      <div className="pt-[calc(5.25rem+env(safe-area-inset-top))] sm:pt-24 px-4 sm:px-6 xl:px-8">
        <div className="max-w-[1760px] mx-auto">
          <ContentHeading
            selectedType={props.selectedType}
            selectedGrade={props.selectedGrade}
            user={props.user}
            handleQuickAddOpen={props.handleQuickAddOpen}
          />

          <ContentFilters
            contentLoadError={props.contentLoadError}
            isWorksheetBrowser={props.isWorksheetBrowser}
            selectedWorksheetGrade={props.selectedWorksheetGrade}
            loadWorksheetGradeDocuments={props.loadWorksheetGradeDocuments}
            loadDocuments={props.loadDocuments}
            selectedGrade={props.selectedGrade}
            selectedType={props.selectedType}
            quickFilter={props.quickFilter}
            debouncedSearch={props.debouncedSearch}
            sortBy={props.sortBy}
            setSearchTerm={props.setSearchTerm}
            setQuickFilter={props.setQuickFilter}
            setWorksheetSortBy={props.setWorksheetSortBy}
            setSortBy={props.setSortBy}
            setViewMode={props.setViewMode}
            searchPlaceholder={props.searchPlaceholder}
            searchTerm={props.searchTerm}
            worksheetSortBy={props.worksheetSortBy}
            activeTotalResults={props.activeTotalResults}
            viewMode={props.viewMode}
            resetWorksheetHierarchy={props.resetWorksheetHierarchy}
            updateWorksheetBrowserUrl={props.updateWorksheetBrowserUrl}
            setSelectedGrade={props.setSelectedGrade}
            handleTypeChange={props.handleTypeChange}
          />

          {props.isWorksheetBrowser && (
            <WorksheetBreadcrumbs
              resetWorksheetHierarchy={props.resetWorksheetHierarchy}
              updateWorksheetBrowserUrl={props.updateWorksheetBrowserUrl}
              setSearchTerm={props.setSearchTerm}
              selectedWorksheetGrade={props.selectedWorksheetGrade}
              worksheetGradeLabel={props.worksheetGradeLabel}
              setSelectedWorksheetOutcome={props.setSelectedWorksheetOutcome}
              selectedWorksheetOutcome={props.selectedWorksheetOutcome}
              setWorksheetSortBy={props.setWorksheetSortBy}
              worksheetSortBy={props.worksheetSortBy}
            />
          )}

          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-secondary" />
            {props.loading ||
            props.isFeedSwitching ||
            props.worksheetLoading ||
            props.worksheetCatalogLoading ? (
              <span className="text-secondary">Yükleniyor...</span>
            ) : (
              <span className="text-secondary">{props.resultLabel}</span>
            )}
          </div>

          {props.isWorksheetBrowser ? (
            !props.selectedWorksheetGrade ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
                {props.filteredWorksheetGrades.map((grade) => (
                  <button
                    key={String(grade)}
                    type="button"
                    onClick={() => {
                      props.updateWorksheetBrowserUrl(grade);
                      void props.loadWorksheetGradeDocuments(grade);
                    }}
                    className={`rounded-3xl border p-5 text-center transition-transform duration-200 hover:-translate-y-1 sm:p-6 backdrop-blur-xl ${WORKSHEET_GRADE_CARD_STYLES[grade].border} ${WORKSHEET_GRADE_CARD_STYLES[grade].surface}`}
                  >
                    <div
                      className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${WORKSHEET_GRADE_CARD_STYLES[grade].folder}`}
                    >
                      <Layers3 className="h-7 w-7 text-primary dark:text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-primary">
                      {grade === 'Mezun' ? grade : `${grade}. Sınıf`}
                    </h3>
                  </button>
                ))}
              </div>
            ) : props.worksheetLoading ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7"
                aria-busy="true"
                aria-live="polite"
              >
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl overflow-hidden border border-border-default bg-surface-1 p-4 sm:p-6 space-y-4"
                  >
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <WorksheetResults
                worksheetOutcomeEntries={props.worksheetOutcomeEntries}
                setSelectedWorksheetOutcome={props.setSelectedWorksheetOutcome}
                updateWorksheetBrowserUrl={props.updateWorksheetBrowserUrl}
                selectedWorksheetGrade={props.selectedWorksheetGrade}
                selectedWorksheetOutcome={props.selectedWorksheetOutcome}
                matchingWorksheetDocuments={props.matchingWorksheetDocuments}
                searchTerm={props.searchTerm}
                filteredWorksheetTests={props.filteredWorksheetTests}
                viewMode={props.viewMode}
                isCompleted={props.isCompleted}
                isFavorite={props.isFavorite}
                likedDocs={props.likedDocs}
                handleDeleteDocument={props.handleDeleteDocument}
                handleDownloadDocument={props.handleDownloadDocument}
                handleOpenEdit={props.handleOpenEdit}
                handleOpenComments={props.handleOpenComments}
                handleOpenPreview={props.handleOpenPreview}
                toggleCompleted={props.toggleCompleted}
                toggleFavorite={props.toggleFavorite}
                handleToggleLike={props.handleToggleLike}
                worksheetSortBy={props.worksheetSortBy}
                user={props.user}
                worksheetGradeLabel={props.worksheetGradeLabel}
              />
            )
          ) : props.isFeedSwitching ||
            (props.loading && props.documents.length === 0) ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7"
              aria-busy="true"
              aria-live="polite"
            >
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-surface-1 rounded-3xl overflow-hidden border border-border-default p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : props.filteredContents.length === 0 ? (
            <EmptyState
              icon={<Filter className="h-6 w-6" aria-hidden="true" />}
              title="Aradığın kriterlerde içerik yok"
              description="Farklı bir sınıf seviyesi, tür ya da anahtar kelime dene."
              action={
                props.searchTerm ? (
                  <Button
                    variant="secondary"
                    onClick={() => props.setSearchTerm('')}
                  >
                    Aramayı temizle
                  </Button>
                ) : props.selectedGrade !== 'all' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      props.setQuickFilter('all');
                      props.setSelectedGrade('all');
                    }}
                  >
                    Tüm sınıflardaki içerikleri göster
                  </Button>
                ) : undefined
              }
            />
          ) : props.viewMode === 'packs' ? (
            <ContentTopicPacks
              documents={props.filteredContents}
              isCompleted={props.isCompleted}
              isFavorite={props.isFavorite}
              isLiked={(id) => props.likedDocs.has(id)}
              onDelete={props.handleDeleteDocument}
              onDownload={props.handleDownloadDocument}
              onEdit={props.handleOpenEdit}
              onOpenComments={props.handleOpenComments}
              onPreview={props.handleOpenPreview}
              onToggleCompleted={props.toggleCompleted}
              onToggleFavorite={props.toggleFavorite}
              onToggleLike={props.handleToggleLike}
              sortBy={props.sortBy}
              user={props.user}
            />
          ) : props.viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {props.filteredContents.map((content, index) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  index={index}
                  isCompleted={props.isCompleted(content.id)}
                  isFavorite={props.isFavorite(content.id)}
                  isLiked={props.likedDocs.has(content.id)}
                  onDelete={props.handleDeleteDocument}
                  onDownload={props.handleDownloadDocument}
                  onEdit={props.handleOpenEdit}
                  onOpenComments={props.handleOpenComments}
                  onPreview={props.handleOpenPreview}
                  onToggleCompleted={props.toggleCompleted}
                  onToggleFavorite={props.toggleFavorite}
                  onToggleLike={props.handleToggleLike}
                  user={props.user}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {props.filteredContents.map((content, index) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  index={index}
                  isCompleted={props.isCompleted(content.id)}
                  isFavorite={props.isFavorite(content.id)}
                  isLiked={props.likedDocs.has(content.id)}
                  onDelete={props.handleDeleteDocument}
                  onDownload={props.handleDownloadDocument}
                  onEdit={props.handleOpenEdit}
                  onOpenComments={props.handleOpenComments}
                  onPreview={props.handleOpenPreview}
                  onToggleCompleted={props.toggleCompleted}
                  onToggleFavorite={props.toggleFavorite}
                  onToggleLike={props.handleToggleLike}
                  user={props.user}
                  viewMode="list"
                />
              ))}
            </div>
          )}

          {!props.isWorksheetBrowser &&
            props.loading &&
            props.documents.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-tone-info-border border-t-transparent rounded-full animate-spin" />
              </div>
            )}

          {!props.isWorksheetBrowser &&
            !props.hasMore &&
            props.documents.length > 0 && (
              <p className="text-center text-tertiary py-8">
                Tüm içerikler yüklendi ({props.totalCount} içerik)
              </p>
            )}

          {!props.isWorksheetBrowser && (
            <div ref={loadMoreRef} className="h-10" />
          )}
        </div>
      </div>

      <ContentPreview
        previewDoc={props.previewDoc}
        isCompleted={props.isCompleted}
        handleClosePreview={props.handleClosePreview}
        handleDownloadDocument={props.handleDownloadDocument}
        setShowAnswerKey={props.setShowAnswerKey}
        toggleCompleted={props.toggleCompleted}
        showAnswerKey={props.showAnswerKey}
      />

      <ContentEditor
        editDoc={props.editDoc}
        editFormData={props.editFormData}
        editSuccess={props.editSuccess}
        isEditing={props.isEditing}
        handleEditChange={props.handleEditChange}
        setEditDoc={props.setEditDoc}
        setEditSuccess={props.setEditSuccess}
        handleEditFileUpload={props.handleEditFileUpload}
        handleEditSubmit={props.handleEditSubmit}
      />

      <ContentQuickAdd
        showModal={props.showModal}
        user={props.user}
        formData={props.formData}
        isSubmitting={props.isSubmitting}
        handleQuickAddChange={props.handleQuickAddChange}
        setShowModal={props.setShowModal}
        setSuccess={props.setSuccess}
        handleQuickAddFileUpload={props.handleQuickAddFileUpload}
        handleQuickAddSubmit={props.handleQuickAddSubmit}
        success={props.success}
      />

      <ContentComments
        showComments={props.showComments}
        comments={props.comments}
        newComment={props.newComment}
        handleCloseComments={props.handleCloseComments}
        setNewComment={props.setNewComment}
        handleCommentSubmit={props.handleCommentSubmit}
        user={props.user}
      />

      {props.deleteCandidate && (
        <ContentDeleteConfirmModal
          deleting={props.deleting}
          deleteCandidate={props.deleteCandidate}
          onCancel={() => props.setDeleteCandidate(null)}
          onConfirm={props.confirmDeleteDocument}
        />
      )}
    </main>
  );
}
