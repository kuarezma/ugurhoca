"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { isAdminEmail } from "@/lib/admin";
import {
  applyAdminModerationAction,
  deleteAdminNotification,
  markAdminNotificationAsRead,
  sendAdminNotificationReply,
} from "@/features/admin/queries";
import type {
  AdminNotification,
  AdminUser,
  ModerationPayload,
} from "@/features/admin/types";

type SenderActionStatus = {
  blocked: boolean;
  expires_at: string | null;
  muted: boolean;
};

type UseAdminNotificationsOptions = {
  currentUserId?: string;
  loadData: (adminUserId?: string | null) => Promise<void>;
  notifications: AdminNotification[];
  setNotifications: Dispatch<SetStateAction<AdminNotification[]>>;
  users: AdminUser[];
};

export function useAdminNotifications({
  currentUserId,
  loadData,
  notifications,
  setNotifications,
  users,
}: UseAdminNotificationsOptions) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotification | null>(null);
  const [replyText, setReplyText] = useState("");

  const parseMessagePayload = (
    notification: AdminNotification | null,
  ): ModerationPayload | null => {
    if (!notification) {
      return null;
    }

    try {
      const parsed = JSON.parse(notification.message);
      if (parsed && typeof parsed === "object" && parsed.text) {
        return parsed as ModerationPayload;
      }
    } catch {}

    return null;
  };

  const parseModerationPayload = (
    notification: AdminNotification | null,
  ): ModerationPayload | null => {
    if (!notification || notification.type !== "moderation") {
      return null;
    }

    try {
      const parsed = JSON.parse(notification.message);
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.sender_id &&
        parsed.action
      ) {
        return parsed as ModerationPayload;
      }
    } catch {}

    return null;
  };

  const adminTargetIds = useMemo(
    () =>
      new Set(
        [currentUserId, ...users.filter((user) => isAdminEmail(user.email)).map((user) => user.id)]
          .filter(Boolean),
      ),
    [currentUserId, users],
  );

  const isIncomingAdminMessage = (notification: AdminNotification) => {
    if (notification.type !== "message") {
      return false;
    }

    if (!adminTargetIds.has(notification.user_id)) {
      return false;
    }

    return !!parseMessagePayload(notification);
  };

  const unreadNotifications = notifications.filter(
    (notification) => isIncomingAdminMessage(notification) && !notification.is_read,
  );

  const formatRelativeTime = (dateStr: string | Date | number) => {
    if (!dateStr) {
      return "";
    }

    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) {
      return "Az önce";
    }

    if (diffInMinutes < 60) {
      return `${diffInMinutes} dk önce`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return "Dün";
    }

    if (diffInDays < 7) {
      return `${diffInDays} gün önce`;
    }

    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  const getNotificationBody = (notification: AdminNotification | null) => {
    const payload = parseMessagePayload(notification);
    return payload?.text || notification?.message || "";
  };

  const getMetadataText = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : "unknown";

  const getSenderActionStatus = (
    senderId?: string,
  ): SenderActionStatus => {
    if (!senderId) {
      return { blocked: false, expires_at: null, muted: false };
    }

    for (const notification of notifications) {
      const moderation = parseModerationPayload(notification);
      if (!moderation || moderation.sender_id !== senderId) {
        continue;
      }

      if (moderation.action === "block") {
        return { blocked: true, expires_at: null, muted: false };
      }

      if (
        moderation.action === "mute" &&
        moderation.expires_at &&
        new Date(moderation.expires_at).getTime() > Date.now()
      ) {
        return {
          blocked: false,
          expires_at: moderation.expires_at,
          muted: true,
        };
      }
    }

    return { blocked: false, expires_at: null, muted: false };
  };

  const selectedNotificationPayload = parseMessagePayload(selectedNotification);
  const selectedNotificationStatus = getSenderActionStatus(
    selectedNotificationPayload?.sender_id,
  );

  const markNotificationAsRead = async (notification: AdminNotification) => {
    if (!notification.is_read) {
      const payload = parseMessagePayload(notification);
      await markAdminNotificationAsRead(notification, payload?.sender_id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      );
    }

    setSelectedNotification(notification);
    setShowNotifications(false);
    setReplyText("");
  };

  const applyModerationAction = async (
    action: "block" | "mute" | "report",
  ) => {
    const payload = parseMessagePayload(selectedNotification);
    if (!selectedNotification || !payload?.sender_id || !currentUserId) {
      return;
    }

    const reason =
      prompt(
        action === "report"
          ? "Rapor notu (opsiyonel)"
          : action === "mute"
            ? "Sessize alma nedeni (opsiyonel)"
            : "Engelleme nedeni (opsiyonel)",
        "",
      ) || "";

    await applyAdminModerationAction({
      action,
      adminUserId: currentUserId,
      reason,
      selectedNotificationId: selectedNotification.id,
      senderEmail: payload.sender_email,
      senderId: payload.sender_id,
      senderName: payload.sender_name,
    });

    await loadData(currentUserId);
    alert(
      action === "report"
        ? "Mesaj raporlandı."
        : action === "mute"
          ? "Öğrenci 7 gün sessize alındı."
          : "Öğrenci engellendi.",
    );
  };

  const sendReply = async () => {
    const payload = parseMessagePayload(selectedNotification);
    if (!selectedNotification || !payload?.sender_id || !replyText.trim()) {
      return;
    }

    await sendAdminNotificationReply(payload.sender_id, replyText);
    setReplyText("");
    alert("Cevap gönderildi.");
  };

  const deleteMessage = async (notificationId: string) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
      return;
    }

    const { error } = await deleteAdminNotification(notificationId);
    if (error) {
      alert("Mesaj silinemedi: " + error.message);
      return;
    }

    setNotifications((current) =>
      current.filter((notification) => notification.id !== notificationId),
    );

    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  return {
    applyModerationAction,
    deleteMessage,
    formatRelativeTime,
    getMetadataText,
    getNotificationBody,
    isIncomingAdminMessage,
    markNotificationAsRead,
    replyText,
    selectedNotification,
    selectedNotificationPayload,
    selectedNotificationStatus,
    sendReply,
    setReplyText,
    setSelectedNotification,
    setShowNotifications,
    showNotifications,
    unreadNotifications,
  };
}
