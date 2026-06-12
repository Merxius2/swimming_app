import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import { recognizeSwimScreenshot } from '../../lib/ocrService';
import { EMPTY_METRICS } from '../../lib/swimConstants';
import {
  formatDuration,
  formatPace,
  parseDurationSec,
  parseDistanceM,
  parsePaceSecPer100m,
} from '../../lib/swimFormatters';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import { buildPersonalFeedback } from '../../lib/swimAnalysis';
import { fetchAiCoachFeedback } from '../../lib/aiCoach';
import { findDuplicateSession } from '../../lib/swimDuplicates';
import { formatDateShort } from '../../lib/swimFormatters';
import SessionFeedback from '../swim/SessionFeedback';
import ConfirmModal from '../ConfirmModal';

const emptyForm = () => ({
  date: '',
  duration: '',
  distance: '',
  pace: '',
  activeKcal: '',
  totalKcal: '',
  avgHeartRate: '',
  laps: '',
  poolLength: '25',
  goal: '',
  location: '',
  timeRange: '',
  mixed: '',
  breaststroke: '',
  freestyle: '',
  backstroke: '',
  butterfly: '',
});

const fieldsToForm = (fields) => ({
  date: fields.date || '',
  duration: fields.durationSec != null ? formatDuration(fields.durationSec) : '',
  distance: fields.distanceM != null ? String(fields.distanceM) : '',
  pace: fields.paceSecPer100m != null ? formatPace(fields.paceSecPer100m).replace('/100m', '') : '',
  activeKcal: fields.activeKcal != null ? String(fields.activeKcal) : '',
  totalKcal: fields.totalKcal != null ? String(fields.totalKcal) : '',
  avgHeartRate: fields.avgHeartRate != null ? String(fields.avgHeartRate) : '',
  laps: fields.laps != null ? String(fields.laps) : '',
  poolLength: String(fields.poolLengthM || 25),
  goal: fields.goalM != null ? String(fields.goalM) : '',
  location: fields.location || '',
  timeRange: fields.timeRange || '',
  mixed: fields.strokes?.mixedM != null ? String(fields.strokes.mixedM) : '',
  breaststroke: fields.strokes?.breaststrokeM != null ? String(fields.strokes.breaststrokeM) : '',
  freestyle: fields.strokes?.freestyleM != null ? String(fields.strokes.freestyleM) : '',
  backstroke: fields.strokes?.backstrokeM != null ? String(fields.strokes.backstrokeM) : '',
  butterfly: fields.strokes?.butterflyM != null ? String(fields.strokes.butterflyM) : '',
});

const formToMetrics = (form) => ({
  ...EMPTY_METRICS,
  durationSec: parseDurationSec(form.duration),
  distanceM: parseDistanceM(form.distance),
  activeKcal: form.activeKcal ? parseInt(form.activeKcal, 10) : null,
  totalKcal: form.totalKcal ? parseInt(form.totalKcal, 10) : null,
  paceSecPer100m: parsePaceSecPer100m(form.pace),
  avgHeartRate: form.avgHeartRate ? parseInt(form.avgHeartRate, 10) : null,
  laps: form.laps ? parseInt(form.laps, 10) : null,
  poolLengthM: form.poolLength ? parseInt(form.poolLength, 10) : 25,
  goalM: form.goal ? parseDistanceM(form.goal) : null,
  location: form.location,
  timeRange: form.timeRange,
  strokes: {
    mixedM: form.mixed ? parseDistanceM(form.mixed) : null,
    breaststrokeM: form.breaststroke ? parseDistanceM(form.breaststroke) : null,
    freestyleM: form.freestyle ? parseDistanceM(form.freestyle) : null,
    backstrokeM: form.backstroke ? parseDistanceM(form.backstroke) : null,
    butterflyM: form.butterfly ? parseDistanceM(form.butterfly) : null,
  },
});

export default function UploadFlow() {
  const { t, language } = useLanguage();
  const { sessions, addSession, profile } = useSwim();
  const fileRef = useRef(null);

  const [step, setStep] = useState('drop');
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [confidence, setConfidence] = useState(0);
  const [showDateModal, setShowDateModal] = useState(false);
  const [pendingDate, setPendingDate] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const processFile = useCallback(async (file) => {
    if (!file?.type?.startsWith('image/')) return;
    setError('');
    setAnalyzing(true);
    setStep('analyzing');
    try {
      const result = await recognizeSwimScreenshot(file);
      if (!result.isSwimWorkout) {
        const sport = result.detectedSport || 'unknown';
        const sportKey = `upload.notSwim.${sport}`;
        setError(t(sportKey) !== sportKey ? t(sportKey) : t('upload.notSwim.unknown'));
        setForm(emptyForm());
        setConfidence(0);
        setStep('drop');
        return;
      }
      setConfidence(result.confidence);
      const nextForm = fieldsToForm(result.fields);
      setForm(nextForm);
      if (result.missingDate) {
        setShowDateModal(true);
        setPendingDate('');
      }
      setStep('review');
    } catch (err) {
      setError(t('upload.ocrFailed'));
      setForm(emptyForm());
      setStep('review');
    } finally {
      setAnalyzing(false);
    }
  }, [t]);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const confirmDate = () => {
    if (!pendingDate) return;
    setForm((prev) => ({ ...prev, date: pendingDate }));
    setShowDateModal(false);
  };

  const handleSave = async () => {
    if (!form.date) {
      setShowDateModal(true);
      return;
    }
    const metrics = formToMetrics(form);
    const duplicate = findDuplicateSession(sessions, { date: form.date, metrics });
    if (duplicate) return;

    const session = addSession({ date: form.date, metrics });
    const allWithNew = [...sessions, session];
    const localFeedback = buildPersonalFeedback(session, allWithNew, t, profile);

    setStep('done');
    setSavedFeedback({ ...localFeedback, aiEnhanced: false });
    setFeedbackLoading(Boolean(profile.aiApiKey?.trim()));

    if (profile.aiApiKey?.trim()) {
      try {
        const aiResult = await fetchAiCoachFeedback({
          apiKey: profile.aiApiKey,
          language,
          session,
          sessions: allWithNew,
          profile,
          localFeedback,
        });
        if (aiResult) {
          setSavedFeedback({
            ...localFeedback,
            coachMessage: aiResult.coachMessage || localFeedback.coachMessage,
            motivation: aiResult.motivation || localFeedback.motivation,
            aiEnhanced: true,
          });
        }
      } catch (aiErr) {
        setSavedFeedback({
          ...localFeedback,
          insights: [...localFeedback.insights, t('feedback.aiFailed')],
          aiEnhanced: false,
        });
      } finally {
        setFeedbackLoading(false);
      }
    }
  };

  const reset = () => {
    setStep('drop');
    setForm(emptyForm());
    setSavedFeedback(null);
    setFeedbackLoading(false);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm';

  const duplicateMatch = step === 'review' && form.date
    ? findDuplicateSession(sessions, { date: form.date, metrics: formToMetrics(form) })
    : null;

  if (step === 'done') {
    return (
      <div className="space-y-6">
        <SessionFeedback
          insights={savedFeedback?.insights || []}
          badges={savedFeedback?.badges || []}
          coachMessage={savedFeedback?.coachMessage}
          motivation={savedFeedback?.motivation}
          aiEnhanced={savedFeedback?.aiEnhanced}
          loading={feedbackLoading}
        />
        <button
          type="button"
          onClick={reset}
          className="w-full py-3 rounded-lg text-white font-semibold shadow-pill-tint"
          style={{ background: 'linear-gradient(135deg,#3B5BFF 0%, #7B5BFF 100%)' }}
        >
          {t('upload.uploadAnother')}
        </button>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <>
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold">{t('upload.reviewTitle')}</h2>
            <p className="text-sm text-ink-soft">{t('upload.reviewDesc')}</p>
            {confidence > 0 && (
              <p className="text-xs text-ink-faint mt-1">{t('upload.confidence')}: {confidence}%</p>
            )}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            {duplicateMatch && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 px-4 py-3"
              >
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {t('upload.duplicateTitle')}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  {t('upload.duplicateMessage').replace('{date}', formatDateShort(duplicateMatch.date))}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.date')}</span>
              <input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.duration')}</span>
              <input value={form.duration} onChange={(e) => updateField('duration', e.target.value)} placeholder="0:54:27" className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.distance')}</span>
              <input value={form.distance} onChange={(e) => updateField('distance', e.target.value)} placeholder="2550" className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.pace')}</span>
              <input value={form.pace} onChange={(e) => updateField('pace', e.target.value)} placeholder={"2'10\""} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.activeKcal')}</span>
              <input value={form.activeKcal} onChange={(e) => updateField('activeKcal', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.totalKcal')}</span>
              <input value={form.totalKcal} onChange={(e) => updateField('totalKcal', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.heartRate')}</span>
              <input value={form.avgHeartRate} onChange={(e) => updateField('avgHeartRate', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.laps')}</span>
              <input value={form.laps} onChange={(e) => updateField('laps', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.poolLength')}</span>
              <input value={form.poolLength} onChange={(e) => updateField('poolLength', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.goal')}</span>
              <input value={form.goal} onChange={(e) => updateField('goal', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.location')}</span>
              <input value={form.location} onChange={(e) => updateField('location', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.timeRange')}</span>
              <input value={form.timeRange} onChange={(e) => updateField('timeRange', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.mixed')}</span>
              <input value={form.mixed} onChange={(e) => updateField('mixed', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.breaststroke')}</span>
              <input value={form.breaststroke} onChange={(e) => updateField('breaststroke', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">{t('upload.fields.freestyle')}</span>
              <input value={form.freestyle} onChange={(e) => updateField('freestyle', e.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={reset} className="flex-1 py-3 rounded-lg border font-medium">
              {t('upload.cancel')}
            </button>
            <button type="button" onClick={handleSave} disabled={!!duplicateMatch} className="flex-1 py-3 rounded-lg bg-brand text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              {t('upload.saveSession')}
            </button>
          </div>
        </div>

        {showDateModal && (
          <ConfirmModal
            title={t('upload.dateRequired')}
            message={t('upload.dateRequiredDesc')}
            confirmLabel={t('upload.confirmDate')}
            cancelLabel={t('upload.cancel')}
            onConfirm={confirmDate}
            onCancel={() => setShowDateModal(false)}
          >
            <input
              type="date"
              value={pendingDate}
              onChange={(e) => setPendingDate(e.target.value)}
              className={`${inputClass} mt-4`}
            />
          </ConfirmModal>
        )}
      </>
    );
  }

  return (
    <div
      className="card p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center cursor-pointer hover:border-brand transition"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {analyzing || step === 'analyzing' ? (
        <div className="py-8">
          <Loader2 size={40} className="mx-auto animate-spin text-brand mb-4" />
          <p className="text-ink-soft">{t('upload.analyzing')}</p>
        </div>
      ) : (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tint-soft mb-4">
            {step === 'drop' ? <Upload size={28} className="text-brand" /> : <ImageIcon size={28} className="text-brand" />}
          </div>
          <p className="text-lg font-semibold text-ink">{t('upload.dropzone')}</p>
          <p className="text-sm text-ink-soft mt-1">{t('upload.dropzoneHint')}</p>
          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </>
      )}
    </div>
  );
}
