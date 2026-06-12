/**
 * Settings Page — Aap-SC
 */

import { Settings as SettingsIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import LanguageSettings from '../components/settings/LanguageSettings';
import ThemeSettings from '../components/settings/ThemeSettings';
import DarkModeSettings from '../components/settings/DarkModeSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import ImportExportPanel from '../components/settings/ImportExportPanel';
import ResetDataSection from '../components/settings/ResetDataSection';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white pb-40 lg:ml-64 md:pb-0">
      <PageHeader icon={SettingsIcon} titleKey="settings.title" />

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        <ProfileSettings />
        <LanguageSettings />
        <ThemeSettings />
        <DarkModeSettings />
        <ImportExportPanel />
        <ResetDataSection />
      </div>
    </div>
  );
}
