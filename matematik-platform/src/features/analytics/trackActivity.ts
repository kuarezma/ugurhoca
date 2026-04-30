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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    const isUuidEntityId = entityId ? UUID_PATTERN.test(entityId) : false;
    const eventMetadata =
      entityId && !isUuidEntityId ? { ...metadata, entity_id: entityId } : metadata;

    const { error } = await supabase.from('student_activity_events').insert({
      entity_id: isUuidEntityId ? entityId : null,
      entity_type: entityType || null,
      event_type: eventType,
      metadata: eventMetadata,
      user_id: resolvedUserId,
    });

    if (error && !isMissingSchemaError(error)) {
      console.warn('Activity event kaydedilemedi', error);
    }
  } catch (error) {
    console.warn('Activity event kaydedilemedi', error);
  }
};
