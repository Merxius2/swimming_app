import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BarChart3, Coins } from 'lucide-react';
import { getPageIconKey, resolveStorePageIconPath } from '../../lib/storePageIcons.js';

describe('storePageIcons', () => {
  it('maps lucide page header components to icon keys', () => {
    assert.equal(getPageIconKey(BarChart3), 'progress');
    assert.equal(getPageIconKey(Coins), 'coins');
  });

  it('resolves store page icon paths for owned icon sets', () => {
    assert.equal(
      resolveStorePageIconPath('icon:gold-medal', 'progress', ['icon:gold-medal']),
      '/icons/store/page-icons/gold-medal/progress.svg'
    );
    assert.equal(resolveStorePageIconPath(null, 'progress', []), null);
    assert.equal(resolveStorePageIconPath('icon:gold-medal', 'progress', []), null);
  });
});
