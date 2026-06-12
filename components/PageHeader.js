/**
 * PageHeader — large inline display title for each screen.
 *
 * Adds the small numbered eyebrow ("Audit · 01" / "Calculator · 04" / "Setup")
 * above the heading, matching the mockup. The eyebrow is auto-derived from
 * `titleKey` so the existing pages don't need to pass anything new.
 */

import { useLanguage } from '../context/UserPreferencesContext';
import { ThemedPageIcon } from './ThemedIcon';

// titleKey → small label that sits above the heading
const EYEBROW = {
  'progress.title': 'Swim · 01',
  'upload.title': 'Swim · 02',
  'history.title': 'Swim · 03',
  'benchmark.title': 'Swim · 04',
  'settings.title': 'Setup',
};

export default function PageHeader({ icon: IconComponent, titleKey, eyebrow }) {
  const { t } = useLanguage();
  const label = eyebrow || EYEBROW[titleKey];

  return (
    <div className="px-4 md:px-8 pt-5 md:pt-7 pb-2 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        {IconComponent && <ThemedPageIcon icon={IconComponent} />}
        <h1 className="display-2 text-[32px] md:text-[40px] text-ink dark:text-[#FAFAFA]">
          {t(titleKey)}
        </h1>
      </div>
    </div>
  );
}
