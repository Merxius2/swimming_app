import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPageIconKey,
  resolveStorePageIconPath,
  __testing,
} from '../../lib/storePageIcons.js';

const progressIcon = [...__testing.LUCIDE_PAGE_ICON_MAP.keys()].find(
  (icon) => __testing.LUCIDE_PAGE_ICON_MAP.get(icon) === 'progress'
);
const coinsIcon = [...__testing.LUCIDE_PAGE_ICON_MAP.keys()].find(
  (icon) => __testing.LUCIDE_PAGE_ICON_MAP.get(icon) === 'coins'
);

describe('storePageIcons', () => {
  it('maps lucide page header components to icon keys', () => {
    assert.equal(getPageIconKey(progressIcon), 'progress');
    assert.equal(getPageIconKey(coinsIcon), 'coins');
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
