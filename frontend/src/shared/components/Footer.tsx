import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-white transition-opacity hover:opacity-75" aria-label="Artium home">
              <BrandLogo markClassName="h-7 w-7" textClassName="text-lg font-bold tracking-[-0.06em]" />
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/artworks" className="text-sm hover:text-white transition-colors">
                  {t('nav.artworks')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm hover:text-white transition-colors">
                  {t('nav.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer.community')}</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-white">Instagram</a></li>
              <li><a href="#" className="text-sm hover:text-white">Facebook</a></li>
              <li><a href="#" className="text-sm hover:text-white">Twitter / X</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer.policies')}</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-white">{t('footer.terms')}</a></li>
              <li><a href="#" className="text-sm hover:text-white">{t('footer.privacy')}</a></li>
              <li><a href="#" className="text-sm hover:text-white">{t('footer.refund')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
