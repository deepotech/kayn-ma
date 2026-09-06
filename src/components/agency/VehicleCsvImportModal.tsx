'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { X, Upload, Check, AlertCircle, FileText, Loader2 } from 'lucide-react';

interface VehicleCsvImportModalProps {
    onClose: () => void;
    onSuccess: (count: number) => void;
}

interface ParsedVehicle {
    brand: string;
    model: string;
    year: number;
    dailyPrice: number;
    weeklyPrice?: number;
    monthlyPrice?: number;
    images?: { url: string }[];
    status?: string;
    isValid: boolean;
    error?: string;
}

export default function VehicleCsvImportModal({ onClose, onSuccess }: VehicleCsvImportModalProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedVehicle[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            parseCsv(selected);
        }
    };

    const parseCsv = (file: File) => {
        setLoading(true);
        setGeneralError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    setGeneralError(isRtl ? 'الملف فارغ أو لا يحتوي على أسطر كافية.' : 'Le fichier est vide.');
                    setLoading(false);
                    return;
                }

                // Headers
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                const brandIdx = headers.indexOf('brand');
                const modelIdx = headers.indexOf('model');
                const yearIdx = headers.indexOf('year');
                const priceIdx = headers.indexOf('dailyprice') !== -1 ? headers.indexOf('dailyprice') : headers.indexOf('price');
                const weeklyIdx = headers.indexOf('weeklyprice');
                const monthlyIdx = headers.indexOf('monthlyprice');
                const imgIdx = headers.indexOf('images') !== -1 ? headers.indexOf('images') : headers.indexOf('image');

                if (brandIdx === -1 || modelIdx === -1 || priceIdx === -1) {
                    setGeneralError(
                        isRtl
                            ? 'يجب أن يحتوي ملف CSV على الأعمدة: brand, model, dailyPrice على الأقل.'
                            : 'Le CSV doit contenir au minimum les colonnes: brand, model, dailyPrice.'
                    );
                    setLoading(false);
                    return;
                }

                const parsed: ParsedVehicle[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const cols = line.split(',').map(c => c.trim());

                    const brandVal = cols[brandIdx] || '';
                    const modelVal = cols[modelIdx] || '';
                    const yearVal = yearIdx !== -1 ? parseInt(cols[yearIdx], 10) : new Date().getFullYear();
                    const dailyVal = parseFloat(cols[priceIdx]);
                    const weeklyVal = weeklyIdx !== -1 && cols[weeklyIdx] ? parseFloat(cols[weeklyIdx]) : undefined;
                    const monthlyVal = monthlyIdx !== -1 && cols[monthlyIdx] ? parseFloat(cols[monthlyIdx]) : undefined;
                    const imgUrl = imgIdx !== -1 && cols[imgIdx] ? cols[imgIdx] : '';

                    let isValid = true;
                    let error = '';

                    if (!brandVal) {
                        isValid = false;
                        error = 'Missing brand';
                    } else if (!modelVal) {
                        isValid = false;
                        error = 'Missing model';
                    } else if (isNaN(dailyVal) || dailyVal <= 0) {
                        isValid = false;
                        error = 'Invalid daily price';
                    }

                    parsed.push({
                        brand: brandVal,
                        model: modelVal,
                        year: isNaN(yearVal) ? new Date().getFullYear() : yearVal,
                        dailyPrice: isNaN(dailyVal) ? 0 : dailyVal,
                        weeklyPrice: weeklyVal,
                        monthlyPrice: monthlyVal,
                        images: imgUrl ? [{ url: imgUrl }] : [],
                        status: 'AVAILABLE',
                        isValid,
                        error
                    });
                }

                setParsedRows(parsed);
            } catch (err) {
                setGeneralError('Failed to parse CSV file.');
            } finally {
                setLoading(false);
            }
        };

        reader.readAsText(file);
    };

    const handleImportSubmit = async () => {
        const validVehicles = parsedRows.filter(r => r.isValid);
        if (validVehicles.length === 0) return;

        setImporting(true);
        let imported = 0;

        try {
            for (const v of validVehicles) {
                const res = await fetch('/api/agency/vehicles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        brand: v.brand,
                        model: v.model,
                        year: v.year,
                        dailyPrice: v.dailyPrice,
                        weeklyPrice: v.weeklyPrice,
                        monthlyPrice: v.monthlyPrice,
                        images: v.images,
                        status: 'AVAILABLE'
                    })
                });
                if (res.ok) imported++;
            }

            onSuccess(imported);
        } catch (e) {
            setGeneralError('An error occurred while importing some rows.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-zinc-800 relative max-h-[90vh] flex flex-col">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 end-5 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                            {isRtl ? 'استيراد جماعي للسيارات عبر CSV' : 'Importation en masse via CSV'}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {isRtl
                                ? 'ارفع ملف CSV يحتوي على أسطول سياراتك مع الأسعار وصور الروابط.'
                                : 'Téléversez un fichier CSV avec les colonnes requises.'}
                        </p>
                    </div>
                </div>

                {generalError && (
                    <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{generalError}</span>
                    </div>
                )}

                {/* File picker */}
                {!file ? (
                    <label className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-zinc-800/20 transition-all my-4">
                        <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                        <Upload className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {isRtl ? 'اختر ملف CSV من جهازك' : 'Sélectionner un fichier CSV'}
                        </p>
                        <span className="text-xs text-slate-400 mt-1">
                            Columns: brand, model, year, dailyPrice, weeklyPrice, monthlyPrice, images
                        </span>
                    </label>
                ) : (
                    /* Preview table */
                    <div className="flex-1 overflow-y-auto my-4 border border-slate-200 dark:border-zinc-800 rounded-xl">
                        <table className="w-full text-xs text-left rtl:text-right">
                            <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 border-b border-slate-200 dark:border-zinc-700">
                                <tr>
                                    <th className="p-3">{isRtl ? 'الحالة' : 'État'}</th>
                                    <th className="p-3">{isRtl ? 'الماركة' : 'Marque'}</th>
                                    <th className="p-3">{isRtl ? 'الموديل' : 'Modèle'}</th>
                                    <th className="p-3">{isRtl ? 'السنة' : 'Année'}</th>
                                    <th className="p-3">{isRtl ? 'السعر' : 'Prix'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {parsedRows.map((row, idx) => (
                                    <tr key={idx} className={row.isValid ? '' : 'bg-red-50/40 dark:bg-red-950/20 text-red-600'}>
                                        <td className="p-3">
                                            {row.isValid ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>OK</span>
                                                </span>
                                            ) : (
                                                <span className="text-red-500 font-medium">{row.error}</span>
                                            )}
                                        </td>
                                        <td className="p-3 font-semibold">{row.brand}</td>
                                        <td className="p-3">{row.model}</td>
                                        <td className="p-3">{row.year}</td>
                                        <td className="p-3 font-bold">{row.dailyPrice} DH</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                    {file && (
                        <button
                            type="button"
                            onClick={() => {
                                setFile(null);
                                setParsedRows([]);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                            {isRtl ? 'اختيار ملف آخر' : 'Changer de fichier'}
                        </button>
                    )}

                    <div className="flex items-center gap-3 ms-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            {isRtl ? 'إلغاء' : 'Fermer'}
                        </button>
                        {file && (
                            <button
                                type="button"
                                disabled={importing || parsedRows.filter(r => r.isValid).length === 0}
                                onClick={handleImportSubmit}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                            >
                                {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>
                                    {isRtl
                                        ? `استيراد ${parsedRows.filter(r => r.isValid).length} سيارات صالحة`
                                        : `Importer ${parsedRows.filter(r => r.isValid).length} véhicules`}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
