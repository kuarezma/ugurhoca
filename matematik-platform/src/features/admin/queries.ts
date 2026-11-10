/**
 * Admin Veri Sorguları (Queries)
 *
 * Modüler yapı:
 * - ./queries/shared: Sınırlar, logger, sayfalama ve ortak tipler
 * - ./queries/worksheets: Yıllık plan, çalışma yaprağı adayları ve Google Drive
 * - ./queries/students: Öğrenci profilleri, etkinlikler, haftalık planlar ve durumlar
 * - ./queries/entities: Quiz, ödev, duyuru, doküman, teslim ve moderasyon
 * - ./queries/dashboard: Admin kimlik doğrulama ve ana pano verisi
 */

export * from './queries/shared';
export * from './queries/worksheets';
export * from './queries/students';
export * from './queries/entities';
export * from './queries/dashboard';
