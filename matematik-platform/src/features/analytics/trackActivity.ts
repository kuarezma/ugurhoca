import { supabase } from '@/lib/supabase/client';

type ActivityEventInput = {
  entityId?: string | null;
  entityType?: string | null;
  eventType: string;
  metadata?: Record<string, unknown>;
  userId?: string | null;
};

const isMissingSchemaError = (error: { code?: string } | null) =>
  error?.code === 'PGRST202' || error?.code === 'PGRST205';

export const trackStudentActivityEvent = async ({
  entityId,
  entityType,
  eventType,
  metadata = {},
  userId,
}: ActivityEventInput) => {
  try {
    let resolvedUserId = userId ?? null;

    if (!resolvedUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      resolvedUserId = user?.id ?? null;
    }

    if (!resolvedUserId) {
      return;
    }

    const { error } = await supabase.from('student_activity_events').insert({
      entity_id: entityId || null,
      entity_type: entityType || null,
      event_type: eventType,
      metadata,
      user_id: resolvedUserId,
    });

    if (error && !isMissingSchemaError(error)) {
      console.warn('Activity event kaydedilemedi', error);
    }
  } catch (error) {
    console.warn('Activity event kaydedilemedi', error);
  }
};
