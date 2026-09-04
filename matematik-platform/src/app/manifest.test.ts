import { describe, expect, it } from 'vitest';
import manifest from './manifest';

describe('Web App Manifest', () => {
  it('returns valid PWA manifest configuration', () => {
    const config = manifest();
    expect(config.name).toBe('Uğur Hoca Matematik Platformu');
    expect(config.short_name).toBe('Uğur Hoca');
    expect(config.display).toBe('standalone');
    expect(config.start_url).toBe('/');
    expect(config.icons).toBeDefined();
    expect(config.icons?.length).toBeGreaterThanOrEqual(2);
  });
});
