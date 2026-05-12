'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const LOGO_SRC = '/eman-bakery-logo.svg';

export default function ComplaintForm() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [showIntro, setShowIntro] = useState(true);
  const [shopName, setShopName] = useState('');
  const [mobile, setMobile] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  const t = {
    ar: {
      title: 'بوابة شكاوى إيمان بيكري',
      subtitle: 'نحن هنا لخدمتك — يرجى تعبئة النموذج أدناه',
      intro: 'بوابة تسجيل الشكاوى',
      introSub: 'Eman Bakery',
      shopName: 'اسم المتجر',
      shopPlaceholder: 'أدخل اسم متجرك',
      mobile: 'رقم الجوال',
      mobilePlaceholder: 'مثال: 05xxxxxxxx',
      description: 'وصف الشكوى',
      descPlaceholder: 'اشرح المشكلة بالتفصيل...',
      photo: 'صورة (اختياري)',
      submit: 'إرسال الشكوى',
      submitting: 'جاري الإرسال...',
      successTitle: 'تم إرسال شكواك بنجاح',
      successMsg: 'شكراً لتواصلك معنا. سيقوم فريق إيمان بيكري بمراجعة الشكوى والتواصل معك قريباً.',
      newComplaint: 'تقديم شكوى جديدة',
      required: 'يرجى تعبئة اسم المتجر ورقم الجوال ووصف الشكوى',
      lang: 'English',
    },
    en: {
      title: 'Eman Bakery Complaint Portal',
      subtitle: 'We are here to help — please fill in the form below',
      intro: 'Complaint Registration Portal',
      introSub: 'Eman Bakery',
      shopName: 'Shop Name',
      shopPlaceholder: 'Enter your shop name',
      mobile: 'Mobile Number',
      mobilePlaceholder: 'e.g. 05xxxxxxxx',
      description: 'Complaint Description',
      descPlaceholder: 'Describe the issue in detail...',
      photo: 'Photo (optional)',
      submit: 'Submit Complaint',
      submitting: 'Submitting...',
      successTitle: 'Complaint submitted successfully',
      successMsg: 'Thank you for contacting us. The Eman Bakery team will review your complaint and contact you soon.',
      newComplaint: 'Submit another complaint',
      required: 'Please fill in shop name, mobile number, and complaint description',
      lang: 'عربي',
    },
  }[lang];

  const resetForm = () => {
    setShopName('');
    setMobile('');
    setDescription('');
    setPhoto(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!shopName.trim() || !mobile.trim() || !description.trim()) {
      setError(t.required);
      return;
    }
    setLoading(true);
    try {
      let photoUrl: string | null = null;
      if (photo) {
        const ext = photo.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('complaint-photos')
          .upload(fileName, photo);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from('complaint-photos')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
      const { error: insertErr } = await supabase.from('complaints').insert({
        shop_name: shopName,
        mobile,
        description,
        photo_url: photoUrl,
      });
      if (insertErr) throw insertErr;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showIntro) {
    return (
      <main className="brand-shell min-h-screen flex items-center justify-center p-6">
        <section className="relative flex min-h-[360px] w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-[28px] border border-gold/30 bg-white/85 px-8 py-10 text-center shadow-2xl">
          <img src={LOGO_SRC} alt="Eman Bakery" className="absolute inset-0 m-auto h-64 w-64 object-contain opacity-50" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="brand-spinner mb-8" aria-label="Loading" />
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-eman-red">{t.introSub}</p>
            <h1 className="mt-2 text-2xl font-bold text-brand-dark">{t.intro}</h1>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="brand-shell min-h-screen flex items-center justify-center p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="card relative max-w-lg w-full overflow-hidden">
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-52 w-52 opacity-[0.08]">
          <img src={LOGO_SRC} alt="" className="h-full w-full object-contain" />
        </div>

        <div className="relative flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <img src={LOGO_SRC} alt="Eman Bakery" className="h-20 w-20 shrink-0 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-brand-dark leading-tight">{t.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="rounded-full border border-gold bg-white px-3 py-1 text-sm font-bold text-brand-dark shadow-sm transition-colors hover:bg-gold hover:text-white"
          >
            {t.lang}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">{t.shopName}</label>
            <input className="input-field" placeholder={t.shopPlaceholder} value={shopName} onChange={e => setShopName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">{t.mobile}</label>
            <input className="input-field" type="tel" placeholder={t.mobilePlaceholder} value={mobile} onChange={e => setMobile(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">{t.description}</label>
            <textarea className="input-field min-h-[120px] resize-none" placeholder={t.descPlaceholder} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">{t.photo}</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="w-full cursor-pointer text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gold-light file:px-4 file:py-2 file:font-bold file:text-brand-dark hover:file:bg-gold/30"
              onChange={e => setPhoto(e.target.files?.[0] ?? null)}
            />
          </div>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-eman-red">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <span className="submit-spinner" aria-hidden="true" />}
            {loading ? t.submitting : t.submit}
          </button>
        </form>
      </div>

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gold/40 bg-white p-7 text-center shadow-2xl">
            <img src={LOGO_SRC} alt="" className="pointer-events-none absolute inset-0 m-auto h-72 w-72 object-contain opacity-10" />
            <div className="relative">
              <img src={LOGO_SRC} alt="Eman Bakery" className="mx-auto mb-3 h-24 w-24 object-contain" />
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-3xl font-bold text-brand-dark">✓</div>
              <h2 className="text-2xl font-bold text-brand-dark">{t.successTitle}</h2>
              <p className="mt-3 text-gray-600">{t.successMsg}</p>
              <button className="btn-primary mt-6 w-full" onClick={resetForm}>{t.newComplaint}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
