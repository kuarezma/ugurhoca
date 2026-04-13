'use client';

import type { SharedDocumentAssignment } from '@/types';
import { HomeAssignmentCard } from '@/features/home/components/assignments/HomeAssignmentCard';

type HomeAssignmentsListProps = {
  assignments: SharedDocumentAssignment[];
  isLight: boolean;
  onDismissAssignment: (assignment: SharedDocumentAssignment) => void;
};

export function HomeAssignmentsList({
  assignments,
  isLight,
  onDismissAssignment,
}: HomeAssignmentsListProps) {
  return (
    <div className="space-y-3">
      {assignments.slice(0, 3).map((assignment, index) => (
        <HomeAssignmentCard
          key={assignment.id}
          assignment={assignment}
          index={index}
          isLight={isLight}
          onDismiss={onDismissAssignment}
        />
      ))}
    </div>
  );
}
