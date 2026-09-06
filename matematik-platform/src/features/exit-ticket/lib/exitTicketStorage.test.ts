import { describe, it, expect, beforeEach } from 'vitest';
import {
  createExitTicketSession,
  generateTicketCode,
  submitExitTicketResponse,
  calculateDistribution,
  getSessionByCode,
} from './exitTicketStorage';
import { EXIT_TICKET_TEMPLATES } from './exitTicketTemplates';

describe('exitTicketStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates a 6-digit numeric ticket code', () => {
    const code = generateTicketCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('creates an exit ticket session and retrieves it by code', () => {
    const template = EXIT_TICKET_TEMPLATES[0];
    const session = createExitTicketSession(
      template.title,
      template.grade,
      template.questions,
    );

    expect(session.id).toBeDefined();
    expect(session.code).toHaveLength(6);
    expect(session.questions).toHaveLength(3);

    const found = getSessionByCode(session.code);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(session.id);
  });

  it('records student responses and updates distribution percentages accurately', () => {
    const template = EXIT_TICKET_TEMPLATES[0]; // Soru 0: correctIndex = 1 (B)
    const session = createExitTicketSession('Test Oturumu', 6, template.questions);

    // 4 öğrenci cevap veriyor: 3 kişi B (doğru), 1 kişi A (yanlış)
    submitExitTicketResponse(session.id, 0, 'Ahmet', 1);
    submitExitTicketResponse(session.id, 0, 'Ayşe', 1);
    submitExitTicketResponse(session.id, 0, 'Mehmet', 1);
    const updated = submitExitTicketResponse(session.id, 0, 'Fatma', 0);

    expect(updated).not.toBeNull();
    if (!updated) return;

    const dist = calculateDistribution(updated, 0);
    expect(dist.totalResponses).toBe(4);
    expect(dist.counts[0]).toBe(1); // A şıkkı: 1 kişi
    expect(dist.counts[1]).toBe(3); // B şıkkı: 3 kişi
    expect(dist.percentages[0]).toBe(25); // %25
    expect(dist.percentages[1]).toBe(75); // %75
    expect(dist.correctCount).toBe(3);
    expect(dist.correctPercentage).toBe(75);
  });
});
