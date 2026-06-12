/**
 * Settings Page — Aap-SC
 */

import { Settings as SettingsIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SecretAppIcon from '../components/SecretAppIcon';
import LanguageSettings from '../components/settings/LanguageSettings';
import ThemeSettings from '../components/settings/ThemeSettings';
import DarkModeSettings from '../components/settings/DarkModeSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import AiSettings from '../components/settings/AiSettings';
import ImportExportPanel from '../components/settings/ImportExportPanel';
import ResetDataSection from '../components/settings/ResetDataSection';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white pb-40 lg:ml-64 md:pb-0">
      <div className="lg:hidden px-4 pt-5 pb-1 max-w-7xl mx-auto pr-14">
        <div className="flex items-center gap-3">
          <SecretAppIcon size={40} />
          <div>
            <span className="font-semibold text-[17px] tracking-tight block text-ink">Aap-SC</span>
            <span className="text-[10px] text-ink-faint uppercase tracking-wider">Swim Coach</span>
          </div>
        </div>
      </div>

      <PageHeader icon={SettingsIcon} titleKey="settings.title" />

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        <ProfileSettings />
        <AiSettings />
        <LanguageSettings />
        <ThemeSettings />
        <DarkModeSettings />
        <ImportExportPanel />
        <ResetDataSection />
      </div>
    </div>
  );
}
