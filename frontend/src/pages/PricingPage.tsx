import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  HelpCircle,
  Sparkles,
  X,
} from 'lucide-react';

type BillingCycle = 'monthly' | 'yearly';

const planDefinitions = [
  {
    id: 'free',
    monthly: 0,
    featureCount: 4,
  },
  {
    id: 'studio',
    monthly: 199000,
    featured: true,
    featureCount: 5,
  },
  {
    id: 'gallery',
    monthly: 599000,
    featureCount: 5,
  },
];

const comparisonDefinitions = [
  {
    title: 'Quản lý tác phẩm',
    rows: [
      ['Số lượng tác phẩm', '10', 'Không giới hạn', 'Không giới hạn'],
      ['Quản lý bộ sưu tập', false, true, true],
      ['Chứng nhận tác phẩm số', true, true, true],
      ['Xuất nhãn tác phẩm', false, true, true],
    ],
  },
  {
    title: 'Bán hàng & khách hàng',
    rows: [
      ['Nhận yêu cầu mua', true, true, true],
      ['Thanh toán trực tuyến', false, true, true],
      ['CRM nhà sưu tầm', false, true, true],
      ['Mã ưu đãi & hoá đơn', false, true, true],
    ],
  },
  {
    title: 'Hiện diện trực tuyến',
    rows: [
      ['Hồ sơ nghệ sĩ', true, true, true],
      ['Tên miền tuỳ chỉnh', false, false, true],
      ['Quản lý nhiều nghệ sĩ', false, false, true],
    ],
  },
];

const formatPrice = (price: number, language: string) => new Intl.NumberFormat(language === 'en' ? 'en-US' : 'vi-VN').format(price);

function ComparisonValue({ value, yesLabel, noLabel }: { value: string | boolean; yesLabel: string; noLabel: string }) {
  if (value === true) return <Check size={17} strokeWidth={2.5} className="mx-auto text-blue-300" aria-label={yesLabel} />;
  if (value === false) return <X size={16} strokeWidth={2.25} className="mx-auto text-slate-600" aria-label={noLabel} />;
  return <span className="text-xs font-medium text-slate-200">{value}</span>;
}

export default function PricingPage() {
  const { t, language } = useI18n();
  const [billing, setBilling] = useState<BillingCycle>('yearly');
  const [openFaq, setOpenFaq] = useState(0);

  const priceFor = (monthly: number) => billing === 'yearly' ? Math.round(monthly * 0.8) : monthly;
  const plans = planDefinitions.map((plan) => ({
    ...plan,
    name: t(`pricing.plans.${plan.id}.name`),
    kicker: t(`pricing.plans.${plan.id}.kicker`),
    description: t(`pricing.plans.${plan.id}.description`),
    button: t(`pricing.plans.${plan.id}.button`),
    features: Array.from({ length: plan.featureCount }, (_, index) => t(`pricing.plans.${plan.id}.features.${index}`)),
  }));
  const comparisonGroups = comparisonDefinitions.map((group) => ({
    title: t(`pricing.comparison.${group.title}`),
    rows: group.rows.map(([label, ...values]) => [t(`pricing.comparison.${label}`), ...values.map((value) => value === 'Không giới hạn' ? t('pricing.unlimited') : value)]),
  }));
  const faqs = [0, 1, 2].map((index) => ({
    question: t(`pricing.faqs.${index}.question`),
    answer: t(`pricing.faqs.${index}.answer`),
  }));
  const services = ['migration', 'storefront', 'consulting'].map((id) => ({
    id,
    title: t(`pricing.services.items.${id}.title`),
    price: t(`pricing.services.items.${id}.price`),
    description: t(`pricing.services.items.${id}.description`),
  }));

  return (
    <div className="overflow-hidden bg-white font-sans text-gray-900 antialiased">
      <section className="relative isolate border-b border-gray-100 px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="absolute inset-x-0 top-0 -z-10 h-[470px] overflow-hidden bg-gradient-to-b from-blue-50 via-gray-50 to-white">
          <div className="absolute -left-28 top-0 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute right-0 top-8 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.5),transparent_42%,rgba(255,255,255,.38))]" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-blue-600">
            <Sparkles size={14} />
            {t('pricing.eyebrow')}
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            {t('pricing.hero.titleLine1')}<br />
            <span className="text-blue-600">{t('pricing.hero.titleLine2')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            {t('pricing.hero.description')}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/90 p-1.5 shadow-sm ring-1 ring-gray-200">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${billing === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {t('pricing.billing.monthly')}
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${billing === 'yearly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {t('pricing.billing.yearly')} <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700">{t('pricing.billing.save')}</span>
            </button>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">{t('pricing.billing.trial')}</p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto -mt-6 grid max-w-6xl gap-4 md:-mt-8 md:grid-cols-3 md:gap-5">
          {plans.map((plan) => {
            const price = priceFor(plan.monthly);
            return (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7 ${plan.featured ? 'border-blue-600 bg-blue-600 text-white shadow-blue-200/80' : 'border-gray-200 bg-white text-gray-900'}`}
              >
                {plan.featured && <div className="absolute -top-3 left-6 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-blue-700">{t('pricing.mostPopular')}</div>}
                <p className={`text-[11px] font-extrabold uppercase tracking-[.14em] ${plan.featured ? 'text-blue-100' : 'text-blue-600'}`}>{plan.kicker}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">{plan.name}</h2>
                <p className={`mt-3 min-h-12 text-sm leading-6 ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}>{plan.description}</p>
                <div className="mt-7 flex items-end gap-1">
                  <span className="text-4xl font-black tracking-[-.05em]">{price === 0 ? t('pricing.free') : `${formatPrice(price, language)}${t('pricing.currency')}`}</span>
                  {price > 0 && <span className={`mb-1 text-xs ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>{t('pricing.perMonth')}</span>}
                </div>
                {billing === 'yearly' && price > 0 && <p className={`mt-1 text-xs font-semibold ${plan.featured ? 'text-blue-100' : 'text-blue-600'}`}>{t('pricing.paidAnnually', { price: `${formatPrice(price * 12, language)}${t('pricing.currency')}` })}</p>}
                <Link
                  to="/register"
                  className={`mt-7 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${plan.featured ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {plan.button}<ArrowRight size={16} />
                </Link>
                <div className={`my-7 border-t ${plan.featured ? 'border-white/20' : 'border-gray-100'}`} />
                <p className={`text-xs font-bold ${plan.featured ? 'text-white' : 'text-gray-800'}`}>{t('pricing.includes')}</p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2.5 text-sm ${plan.featured ? 'text-blue-50' : 'text-gray-600'}`}>
                      <Check size={16} strokeWidth={2.75} className={`mt-0.5 shrink-0 ${plan.featured ? 'text-white' : 'text-blue-600'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-950 px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-blue-300">{t('pricing.comparison.eyebrow')}</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">{t('pricing.comparison.titleLine1')}<br className="hidden sm:block" /> {t('pricing.comparison.titleLine2')}</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-gray-400">{t('pricing.comparison.description')}</p>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-gray-900">
            <div className="grid grid-cols-[minmax(155px,1.4fr)_repeat(3,minmax(90px,1fr))] border-b border-white/10 bg-white/[.03] text-xs font-bold sm:text-sm">
              <div className="p-4 sm:p-5">{t('pricing.comparison.feature')}</div>
              {plans.map((plan) => <div key={plan.name} className="p-4 text-center sm:p-5">{plan.name}</div>)}
            </div>
            {comparisonGroups.map((group) => (
              <div key={group.title}>
                <div className="bg-black/20 px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] text-blue-300 sm:px-5">{group.title}</div>
                {group.rows.map(([label, ...values]) => (
                  <div key={String(label)} className="grid grid-cols-[minmax(155px,1.4fr)_repeat(3,minmax(90px,1fr))] border-t border-white/[.07] text-xs sm:text-sm">
                    <div className="p-4 text-slate-300 sm:p-5">{label}</div>
                    {values.map((value, index) => <div key={index} className="flex items-center justify-center px-2 py-4 text-center sm:py-5"><ComparisonValue value={value as string | boolean} yesLabel={t('pricing.yes')} noLabel={t('pricing.no')} /></div>)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-blue-600">{t('pricing.services.eyebrow')}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">{t('pricing.services.titleLine1')}<br />{t('pricing.services.titleLine2')}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{t('pricing.services.description')}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><CircleCheck size={20} /></div>
                <h3 className="mt-5 text-lg font-black">{service.title}</h3>
                <p className="mt-2 text-sm font-bold text-blue-600">{service.price}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{service.description}</p>
                <button type="button" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-gray-900 hover:text-blue-600">{t('pricing.learnMore')} <ArrowRight size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[.85fr_1.15fr]">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-blue-300"><HelpCircle size={22} /></div>
            <h2 className="mt-5 text-4xl font-black tracking-[-.045em]">{t('pricing.faq.titleLine1')}<br />{t('pricing.faq.titleLine2')}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-500">{t('pricing.faq.description')}</p>
            <a href="mailto:hello@artium.vn" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">hello@artium.vn <ArrowRight size={15} /></a>
          </div>
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-bold text-slate-900">
                    {faq.question}
                    <ChevronDown size={19} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
                  </button>
                  {isOpen && <p className="-mt-1 pb-5 pr-8 text-sm leading-6 text-slate-600">{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-blue-600 px-7 py-12 text-center sm:px-16 sm:py-16">
          <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-blue-100">{t('pricing.cta.eyebrow')}</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">{t('pricing.cta.title')}</h2>
          <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50">{t('pricing.cta.button')} <ArrowRight size={17} /></Link>
        </div>
      </section>
    </div>
  );
}
