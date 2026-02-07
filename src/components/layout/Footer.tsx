'use client';

import { Car } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { CITIES, getCityName } from '@/constants/cities';

// Top 6 cities to display in footer
const FOOTER_CITIES = CITIES.slice(0, 6);

export default function Footer() {
    const t = useTranslations('Footer');
    const tCategories = useTranslations('Categories');
    const locale = useLocale();

    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                            <Car className="h-6 w-6 text-blue-500" />
                            <span>Cayn.ma</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">{t('categories')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/cars?purpose=sale" className="hover:text-blue-400 transition-colors">{tCategories('carsForSale')}</Link>
                            </li>
                            <li>
                                <Link href="/cars?condition=used" className="hover:text-blue-400 transition-colors">{tCategories('usedCars')}</Link>
                            </li>
                            <li>
                                <Link href="/cars?sellerType=agency" className="hover:text-blue-400 transition-colors">{tCategories('agencies')}</Link>
                            </li>
                            <li>
                                <Link href="/cars?purpose=rent" className="hover:text-blue-400 transition-colors">{tCategories('rental')}</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Cities */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">{t('cities')}</h3>
                        <ul className="space-y-2 text-sm">
                            {FOOTER_CITIES.map(city => (
                                <li key={city.slug}>
                                    <Link href={`/cars?city=${city.slug}`} className="hover:text-blue-400 transition-colors">
                                        {getCityName(city, locale)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">{t('about')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms" className="hover:text-blue-400 transition-colors">{t('terms')}</Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-blue-400 transition-colors">{t('privacy')}</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-blue-400 transition-colors">{t('contact')}</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Cayn.ma. {t('copyright')}
                    </div>
                    <div className="flex gap-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <svg width="24" height="24" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <svg width="24" height="24" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C8.736.002 8.314.012 7.053.06 5.791.108 4.937.278 4.166.525a5.925 5.925 0 0 0-2.14 1.395A5.926 5.926 0 0 0 .63 4.06C.384 4.831.214 5.685.166 6.947.118 8.207.11 8.629.11 11.912c0 3.283.01 3.704.057 4.966.048 1.26.218 2.114.465 2.884a5.928 5.928 0 0 0 1.395 2.14 5.926 5.926 0 0 0 2.14 1.396c.77.247 1.624.417 2.885.465 1.26.048 1.682.058 4.964.058 3.283 0 3.704-.01 4.966-.058 1.26-.048 2.115-.218 2.885-.465a5.926 5.926 0 0 0 2.14-1.395 5.925 5.925 0 0 0 1.396-2.14c.247-.77.419-1.625.467-2.886.048-1.262.056-1.683.056-4.965 0-3.283-.01-3.705-.058-4.966-.048-1.26-.22-2.115-.467-2.886a5.925 5.925 0 0 0-1.395-2.14 5.926 5.926 0 0 0-2.14-1.395c-.77-.247-1.626-.417-2.887-.465C15.722.01 15.3 0 12.017 0zm0 2.16c3.228 0 3.609.01 4.882.07 1.178.054 1.818.25 2.244.415.564.22.967.482 1.39.905.423.423.686.826.905 1.39.165.426.361 1.066.415 2.244.06 1.273.07 1.654.07 4.882 0 3.228-.01 3.609-.07 4.882-.054 1.178-.25 1.818-.415 2.244-.22.564-.482.967-.905 1.39-.423-.423-.826.686-1.39.905-.426.165-1.066.361-2.244.415-1.273.06-1.654.07-4.882.07-3.228 0-3.609-.01-4.882-.07-1.178-.054-1.818-.25-2.244-.415-.564-.22-.967-.482-1.39-.905-.423-.423-.686-.826-.905-1.39-.165-.426-.361-1.066-.415-2.244-.06-1.273-.07-1.654-.07-4.882 0-3.228.01-3.609.07-4.882.054-1.178.25-1.818.415-2.244.22-.564.482-.967.905-1.39.423-.423.826-.686 1.39-.905.426-.165 1.066-.361 2.244-.415 1.273-.06 1.654-.07 4.882-.07zm0 3.676a6.076 6.076 0 1 0 0 12.152 6.076 6.076 0 0 0 0-12.152zM12.017 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-10.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
