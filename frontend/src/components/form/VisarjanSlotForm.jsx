import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SAMPLE_GHATS } from '../../data/sampleGhatData';
import { CheckCircle2, ChevronRight, ChevronLeft, Printer, AlertCircle, Sparkles, Download } from 'lucide-react';

export const VisarjanSlotForm = ({ preFillData }) => {
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    applicantName: '',
    phone: '',
    address: '',
    idolType: 'shhadu',
    idolSize: 'small',
    ghatId: 'bairagarh-kund',
    visarjanDate: '2026-10-20',
    timeSlot: '16:00 - 18:00'
  });

  React.useEffect(() => {
    if (preFillData) {
      setFormData(prev => ({ ...prev, ...preFillData }));
    }
  }, [preFillData]);

  const [errors, setErrors] = useState({});
  const [generatedPass, setGeneratedPass] = useState(null);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.applicantName.trim()) {
        newErrors.applicantName = t('form.error_required');
      }
      if (!formData.phone.trim()) {
        newErrors.phone = t('form.error_required');
      } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
        newErrors.phone = t('form.error_phone');
      }
      if (!formData.address.trim()) {
        newErrors.address = t('form.error_required');
      }
    } else if (step === 2) {
      if (!formData.idolType) {
        newErrors.idolType = t('form.error_select');
      }
      if (!formData.idolSize) {
        newErrors.idolSize = t('form.error_select');
      }
    } else if (step === 3) {
      if (!formData.ghatId) {
        newErrors.ghatId = t('form.error_select');
      }
      if (!formData.visarjanDate) {
        newErrors.visarjanDate = t('form.error_required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      // Generate unique token reference
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const passId = `BMC-VIS-2026-${randomNum}`;
      setGeneratedPass({
        ...formData,
        passId,
        ghatName: SAMPLE_GHATS.find(g => g.id === formData.ghatId)?.name || 'Designated BMC Kund',
        bookingTime: new Date().toLocaleString()
      });
      setCurrentStep(4);
    }
  };

  const resetForm = () => {
    setFormData({
      applicantName: '',
      phone: '',
      address: '',
      idolType: 'shhadu',
      idolSize: 'small',
      ghatId: 'bairagarh-kund',
      visarjanDate: '2026-10-20',
      timeSlot: '16:00 - 18:00'
    });
    setGeneratedPass(null);
    setCurrentStep(1);
    setErrors({});
  };

  return (
    <section id="booking-slide" className="slide-section section" aria-labelledby="form-heading">
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem auto' }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 mb-3">
            <Sparkles size={14} />
            <span>Slide 6: Citizen Visarjan Registration & Digital QR E-Pass</span>
          </div>
          <h2 id="form-heading" className="font-display" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('form.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('form.subtitle')}
          </p>
        </div>

        <div className="card" style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem' }}>
          {/* Stepper Progress Bar */}
          <div className="stepper" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4}>
            <div className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
              <span>{t('form.step1')}</span>
            </div>
            <div className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 2 ? '✓' : '2'}</div>
              <span>{t('form.step2')}</span>
            </div>
            <div className={`step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 3 ? '✓' : '3'}</div>
              <span>{t('form.step3')}</span>
            </div>
            <div className={`step-item ${currentStep === 4 ? 'completed' : ''}`}>
              <div className="step-circle">4</div>
              <span>{t('form.step4')}</span>
            </div>
          </div>

          {/* Form Content */}
          {currentStep === 1 && (
            <fieldset style={{ border: 'none' }}>
              <legend style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gov-navy-800)', marginBottom: '1.25rem' }}>
                {t('form.step1')}
              </legend>

              <div className="form-group">
                <label className="form-label" htmlFor="applicantName">
                  {t('form.name_label')} *
                </label>
                <input
                  id="applicantName"
                  type="text"
                  className="form-input"
                  placeholder={t('form.name_placeholder')}
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  aria-invalid={!!errors.applicantName}
                  aria-describedby={errors.applicantName ? 'name-error' : undefined}
                />
                {errors.applicantName && (
                  <div id="name-error" className="form-error">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{errors.applicantName}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  {t('form.phone_label')} *
                </label>
                <input
                  id="phone"
                  type="tel"
                  maxLength="10"
                  className="form-input"
                  placeholder={t('form.phone_placeholder')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <div id="phone-error" className="form-error">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  {t('form.address_label')} *
                </label>
                <input
                  id="address"
                  type="text"
                  className="form-input"
                  placeholder={t('form.address_placeholder')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? 'address-error' : undefined}
                />
                {errors.address && (
                  <div id="address-error" className="form-error">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{errors.address}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  <span>{t('form.next_btn')}</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </fieldset>
          )}

          {currentStep === 2 && (
            <fieldset style={{ border: 'none' }}>
              <legend style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gov-navy-800)', marginBottom: '1.25rem' }}>
                {t('form.step2')}
              </legend>

              <div className="form-group">
                <label className="form-label" htmlFor="idolType">
                  {t('form.idol_type_label')} *
                </label>
                <select
                  id="idolType"
                  className="form-select"
                  value={formData.idolType}
                  onChange={(e) => setFormData({ ...formData, idolType: e.target.value })}
                >
                  <option value="shhadu">{t('form.idol_type_shhadu')}</option>
                  <option value="pop">{t('form.idol_type_pop')}</option>
                  <option value="other">{t('form.idol_type_other')}</option>
                </select>
                {formData.idolType === 'pop' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--status-warning)', marginTop: '0.35rem' }}>
                    Note: POP idols are directed exclusively to heavy-duty artificial tanks with sludge settling.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="idolSize">
                  {t('form.idol_size_label')} *
                </label>
                <select
                  id="idolSize"
                  className="form-select"
                  value={formData.idolSize}
                  onChange={(e) => setFormData({ ...formData, idolSize: e.target.value })}
                >
                  <option value="small">{t('form.size_small')}</option>
                  <option value="medium">{t('form.size_medium')}</option>
                  <option value="large">{t('form.size_large')}</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleBack}>
                  <ChevronLeft size={18} aria-hidden="true" />
                  <span>{t('form.back_btn')}</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  <span>{t('form.next_btn')}</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </fieldset>
          )}

          {currentStep === 3 && (
            <fieldset style={{ border: 'none' }}>
              <legend style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gov-navy-800)', marginBottom: '1.25rem' }}>
                {t('form.step3')}
              </legend>

              <div className="form-group">
                <label className="form-label" htmlFor="ghatId">
                  {t('form.ghat_label')} *
                </label>
                <select
                  id="ghatId"
                  className="form-select"
                  value={formData.ghatId}
                  onChange={(e) => setFormData({ ...formData, ghatId: e.target.value })}
                >
                  {SAMPLE_GHATS.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.waterBody})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="visarjanDate">
                  {t('form.date_label')} *
                </label>
                <input
                  id="visarjanDate"
                  type="date"
                  className="form-input"
                  value={formData.visarjanDate}
                  min="2026-10-15"
                  max="2026-10-25"
                  onChange={(e) => setFormData({ ...formData, visarjanDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="timeSlot">
                  {t('form.time_label')} *
                </label>
                <select
                  id="timeSlot"
                  className="form-select"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                >
                  <option value="10:00 - 12:00">10:00 AM - 12:00 PM (Morning Slot)</option>
                  <option value="12:00 - 14:00">12:00 PM - 02:00 PM (Afternoon Slot)</option>
                  <option value="14:00 - 16:00">02:00 PM - 04:00 PM (Late Afternoon)</option>
                  <option value="16:00 - 18:00">04:00 PM - 06:00 PM (Sunset Peak Slot)</option>
                  <option value="18:00 - 20:00">06:00 PM - 08:00 PM (Evening Slot)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleBack}>
                  <ChevronLeft size={18} aria-hidden="true" />
                  <span>{t('form.back_btn')}</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                  <span>{t('form.submit_btn')}</span>
                  <CheckCircle2 size={18} aria-hidden="true" />
                </button>
              </div>
            </fieldset>
          )}

          {/* Step 4: Digital Confirmation Pass */}
          {currentStep === 4 && generatedPass && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'var(--status-success-bg)', 
                  color: 'var(--status-success)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem auto' 
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gov-navy-800)', marginBottom: '0.4rem' }}>
                {t('form.success_title')}
              </h3>

              {/* Printable Official E-Pass Card */}
              <div 
                id="digital-visarjan-pass"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '2px dashed var(--gov-saffron)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  maxWidth: '560px',
                  margin: '1.5rem auto',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-saffron)' }}>BHOPAL MUNICIPAL CORPORATION</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gov-navy-900)' }}>VISARJAN E-PASS 2026</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token ID</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gov-navy-900)', letterSpacing: '0.5px' }}>
                      {generatedPass.passId}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Applicant / Samiti:</span>
                    <strong>{generatedPass.applicantName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Contact Phone:</span>
                    <strong>{generatedPass.phone}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Designated Ghat / Kund:</span>
                    <strong style={{ color: 'var(--gov-navy-700)' }}>{generatedPass.ghatName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Scheduled Date & Time:</span>
                    <strong>{generatedPass.visarjanDate} &bull; {generatedPass.timeSlot}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Please show this digital pass on your phone or printed copy at the Ghat Entry Checkpoint.
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.print()}
                >
                  <Printer size={16} aria-hidden="true" />
                  <span>{t('form.download_btn')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  <span>{t('form.book_another')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
