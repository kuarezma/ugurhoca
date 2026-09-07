/**
 * LiveKit katılımcı kimliği türetimi. Hem istemci (RoomExperience — bağlantı
 * kurulmadan önce iyimser kimliği hesaplar) hem sunucu (token/approval
 * rotaları — yetki kararlarının dayandığı gerçek kimlik) aynı formülü
 * kullanmalı; aksi halde onay eşleşmesi asla tutmaz. node: bağımlılığı
 * içermez, istemci paketine güvenle girer.
 */
export function deriveLiveKitIdentity(
  role: 'teacher' | 'student',
  userId: string,
): string {
  return `${role}_${userId.slice(0, 24)}`;
}
