'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ComplaintForm() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [shopName, setShopName] = useState('');
  const [mobile, setMobile] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const t = {
    ar: {
      title: 'تقديم شكوى',
      subtitle: 'نحن هنا لمساعدتك — يرجى ملء النموذج أدناه',
      shopName: 'اسم المتجر',
      shopPlaceholder: 'أدخل اسم متجرك',
      mobile: 'رقم الجوال',
      mobilePlaceholder: 'مثال: 05xxxxxxxx',
      description: 'وصف الشكوى',
      descPlaceholder: 'اشرح المشكلة بالتفصيل...',
      photo: 'صورة (اختياري)',
      submit: 'إرسال الشكوى',
      submitting: 'جاري الإرسال...',
      successTitle: 'تم إرسال شكواك بنجاح!',
      successMsg: 'سيتواصل معك فريقنا قريباً.',
      newComplaint: 'تقديم شكوى جديدة',
      required: 'هذا الحقل مطلوب',
      lang: 'English',
    },
    en: {
      title: 'Submit a Complaint',
      subtitle: 'We are here to help — please fill in the form below',
      shopName: 'Shop Name',
      shopPlaceholder: 'Enter your shop name',
      mobile: 'Mobile Number',
      mobilePlaceholder: 'e.g. 05xxxxxxxx',
      description: 'Complaint Description',
      descPlaceholder: 'Describe the issue in detail...',
      photo: 'Photo (optional)',
      submit: 'Submit Complaint',
      submitting: 'Submitting...',
      successTitle: 'Complaint submitted successfully!',
      successMsg: 'Our team will contact you soon.',
      newComplaint: 'Submit another complaint',
      required: 'This field is required',
      lang: 'عربي',
    },
  }[lang];

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

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">{t.successTitle}</h1>
          <p className="text-gray-600 mb-6">{t.successMsg}</p>
          <button className="btn-primary" onClick={() => { setSuccess(false); setShopName(''); setMobile(''); setDescription(''); setPhoto(null); }}>
            {t.newComplaint}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brand">{t.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="text-sm border border-brand text-brand px-3 py-1 rounded-full hover:bg-brand hover:text-white transition-colors"
          >
            {t.lang}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.shopName}</label>
            <input className="input-field" placeholder={t.shopPlaceholder} value={shopName} onChange={e => setShopName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.mobile}</label>
            <input className="input-field" type="tel" placeholder={t.mobilePlaceholder} value={mobile} onChange={e => setMobile(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.description}</label>
            <textarea className="input-field min-h-[120px] resize-none" placeholder={t.descPlaceholder} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.photo}</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-amber-100 file:text-brand hover:file:bg-amber-200 cursor-pointer"
              onChange={e => setPhoto(e.target.files?.[0] ?? null)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
