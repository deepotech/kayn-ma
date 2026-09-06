# خطة تنفيذ نظام إدارة وكالات كراء السيارات داخل Cayn.ma
# (Implementation Plan for Car Rental Agency Management System)

تاريخ الإعداد: سبتمبر 2026  
المشروع: Cayn.ma (Next.js 14 App Router + Prisma + PostgreSQL + Firebase Auth + Next-Intl)

---

## 1. ما هو موجود حاليًا في المشروع (Current State)

1. **قاعدة البيانات (Prisma & PostgreSQL):**
   - يوجد نموذج `Business` يمثل وكالات كراء السيارات (يحتوي على: `id`, `name`, `slug`, `cityId`, `address`, `phone`, `website`, `lat`, `lng`, `rating`, `reviewsCount`, `photos`, `source`, `status`, `claimed`, `mixedServices`, `noDeposit`, `priceLevel`, `openingHours`).
   - يوجد نموذج `City` و `Category` و `BusinessCategory` و `Review` و `SeoPage`.
   - يوجد نموذج `Listing` مخصص لإعلانات بيع وكراء السيارات العادية للأفراد والمعارض.
   - يوجد نموذج `User` مرتبط بـ Firebase Auth (`firebaseUid`, `email`, `displayName`, `role`, `isBanned`).

2. **صفحات الوكالات الحالية:**
   - `/[locale]/rent-agencies`: الصفحة الرئيسية لدليل الوكالات.
   - `/[locale]/rent-agencies/[city]`: دليل الوكالات حسب المدينة، مع فلاتر وصفحات Intent لـ SEO.
   - `/[locale]/rent-agencies/[city]/[slug]`: صفحة تفاصيل الوكالة (تعرض الصور، العنوان، الهاتف، التقييمات، ساعات العمل، الخريطة، الوكالات المشابهة).

3. **لوحة التحكم والمصادقة:**
   - نظام المصادقة يعتمد على Firebase Auth في العميل و Session Cookie في الخادم مع مزامنة المستخدم إلى جدول `User` في قاعدة بيانات PostgreSQL عبر `src/lib/auth.ts` و `src/lib/server-auth.ts`.
   - لوحة تحكم المستخدم `/[locale]/dashboard` تحتوي على إعلاناتي، المفضلة، المتابعون، والإعدادات.
   - لوحة الإدارة `/[locale]/admin/agencies` تعرض جدول الوكالات وحالتها.

4. **الصور والتخزين:**
   - مسار `/api/upload` يرفع الصور إلى Cloudinary بجودة تلقائية وتحديد أبعاد آمن، ويعيد الرابط و `publicId`.
   - مكون `ImageUploader` جاهز للرفع والمعاينة.

5. **البيانات الثابتة والقواميس:**
   - قوائم الماركات والموديلات وأنواع الهيكل والوقود وناقل الحركة والمدن متوفرة وجاهزة في `@/constants/data` و `@/constants/car-brands-models`.

---

## 2. ما الذي يمكن إعادة استخدامه (Reusable Assets)

- **النموذج الأساسي:** توسيع نموذج `Business` في Prisma ليصبح الكيان المركزي للوكالة وربطه بالمستخدم المالك (`User`) وأسطول السيارات.
- **تخزين الصور:** استخدام مسار `/api/upload` عبر Cloudinary مع معالجة الصور وضغطها في المتصفح.
- **مكونات الرفع والإدخال:** استخدام وتخصيص `ImageUploader` لاختيار الصورة الرئيسية، الحذف، والترتيب.
- **القوائم المرجعية:** إعادة استخدام `BRANDS` و `CITIES` و `FUEL_TYPES` و `TRANSMISSIONS` و `BODY_TYPES` و `YEARS`.
- **نظام التدويل:** ملفات الترجمة `src/messages/ar.json` و `src/messages/fr.json` مع دعم اتجاه النص `dir="rtl"` و `dir="ltr"`.
- **نظام الأمان:** الاعتماد على `getCurrentUser()` و `verifyAuth()` للتحقق من هوية صاحب الوكالة في الـ API وفي الخادم.

---

## 3. النماذج التي تحتاج إلى تعديل (Prisma Schema Changes)

### أ) تعديل نموذج `Business`:
إضافة حقول الملكية والتحقق والتواصل:
- `ownerId String?` (مع علاقة اختيارية إلى `User`)
- `verificationStatus String @default("UNVERIFIED")` (القيم: `UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`)
- `claimedAt DateTime?`
- `verifiedAt DateTime?`
- `verificationMethod String?` ('phone', 'whatsapp', 'admin_manual')
- `claimPhone String?`
- `claimNotes String?`
- `whatsapp String?`
- `email String?`
- `description String? @db.Text`
- `logo String?`
- `coverPhoto String?`
- `views Int @default(0)`
- `whatsappClicks Int @default(0)`
- `callClicks Int @default(0)`
- إضافة علاقة العكس: `vehicles AgencyVehicle[]`

### ب) تعديل نموذج `User`:
- إضافة علاقة العكس: `businesses Business[]`

### ج) إنشاء نموذج جديد `AgencyVehicle` (أسطول سيارات الوكالة):
هذا النموذج يفصل أسطول كراء الوكالات عن إعلانات البيع الفردية في `Listing` لتفادي أي تعارض في المنطق والصلاحيات:
- `id String @id @default(uuid())`
- `agencyId String`
- `agency Business @relation(...)`
- `brand String`
- `brandSlug String`
- `model String`
- `modelSlug String`
- `year Int`
- `category String` (e.g. economy, suv, luxury, compact)
- `bodyType String` (sedan, suv, hatchback, etc.)
- `transmission String` (Manual, Automatic)
- `fuel String` (Diesel, Petrol, Hybrid, Electric)
- `seats Int @default(5)`
- `doors Int @default(4)`
- `luggage Int @default(2)`
- `color String?`
- `description String? @db.Text`
- `images Json` (مصفوفة `{url: string, publicId?: string}`)
- `featuredImage String?`
- **نظام الأسعار:**
  - `dailyPrice Float` (السعر اليومي - إجباري)
  - `weeklyPrice Float?` (السعر الأسبوعي)
  - `monthlyPrice Float?` (السعر الشهري)
  - `securityDeposit Float?` (مبلغ الضمان/التأمين)
  - `minRentalDays Int @default(1)` (الحد الأدنى للأيام)
  - `mileagePerDay Int?` (الكيلومترات اليومية المشمولة)
  - `extraMileagePrice Float?` (سعر الكيلومتر الإضافي)
  - `deliveryFee Float?` (رسوم التوصيل)
  - `airportDeliveryFee Float?` (رسوم التوصيل للمطار)
  - `priceNotes String?` (ملاحظات السعر)
  - `seasonPricing Json?` (دعم مواسم الأسعار مستقبلاً)
- **حالة التوفر:**
  - `status String @default("AVAILABLE")` (AVAILABLE, RENTED, MAINTENANCE, HIDDEN)
  - `lastConfirmedAt DateTime @default(now())`
- **SEO والروابط:**
  - `slug String @unique` (توليد slug نظيف ومميز للسيارة)
  - `views Int @default(0)`
  - `whatsappClicks Int @default(0)`
  - `callClicks Int @default(0)`
  - `order Int @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`

---

## 4. الملفات التي ستُنشأ (Files to Create)

### أ) API Routes:
1. `src/app/api/agency/claim/route.ts` - تقديم طلب المطالبة بملكية وكالة موجودة.
2. `src/app/api/agency/me/route.ts` - جلب وكالة المستخدم المسجل وملخص بياناتها.
3. `src/app/api/agency/profile/route.ts` - تعديل بيانات الوكالة (الاسم، الوصف، التواصل، الشعار، الغلاف، ساعات العمل).
4. `src/app/api/agency/vehicles/route.ts` - جلب سيارات الوكالة للمالك وإضافة سيارة جديدة.
5. `src/app/api/agency/vehicles/[id]/route.ts` - جلب، تعديل، وحذف سيارة محددة.
6. `src/app/api/agency/vehicles/[id]/status/route.ts` - تغيير سريع لحالة توفر السيارة (`AVAILABLE`, `RENTED`, `MAINTENANCE`, `HIDDEN`).
7. `src/app/api/agency/stats/click/route.ts` - تسجيل نقرات الهاتف والواتساب وزيارات السيارات.
8. `src/app/api/admin/agency-claims/route.ts` - مسار خاص بالإدارة لقبول أو رفض طلبات الملكية وتعديل التحقق.

### ب) مكونات الواجهة (UI Components):
1. `src/components/agency/AgencyClaimModal.tsx` - نافذة وبانر "هل أنت صاحب هذه الوكالة؟".
2. `src/components/agency/AgencyVehicleCard.tsx` - بطاقة عرض سيارة الوكالة للعامة (تعرض السعر ابتداءً من، المواصفات، شارة التوفر، آخر تحديث، وأزرار التواصل).
3. `src/components/agency/AgencyFleetManager.tsx` - لوحة تحكم أسطول السيارات (إضافة، تعديل، إخفاء، تبديل الحالة، وتحديث السعر).
4. `src/components/agency/AgencyVehicleForm.tsx` - نموذج إضافة وتعديل السيارة مقسم إلى خطوات منظمة (البيانات، المواصفات، الصور، الأسعار، التوفر).
5. `src/components/agency/AgencyProfileEditor.tsx` - مكون تعديل بيانات ومعلومات الوكالة في لوحة التحكم.
6. `src/components/agency/VehicleDetailView.tsx` - واجهة صفحة تفاصيل السيارة العامة.
7. `src/components/agency/VehicleCsvImportModal.tsx` - استيراد أولي لأسطول السيارات عبر CSV مع فحص مسبق.

### ج) صفحات الموقع (Pages):
1. `src/app/[locale]/dashboard/agency/page.tsx` - لوحة تحكم الوكالة المدمجة للمستخدم.
2. `src/app/[locale]/dashboard/agency/vehicles/new/page.tsx` - صفحة إضافة سيارة جديدة للوكالة.
3. `src/app/[locale]/dashboard/agency/vehicles/[id]/edit/page.tsx` - صفحة تعديل سيارة موجودة.
4. `src/app/[locale]/register-agency/page.tsx` - صفحة تسجيل وكالة جديدة لأصحاب الوكالات.
5. `src/app/[locale]/rent-agencies/[city]/[slug]/[vehicleSlug]/page.tsx` - صفحة تفاصيل السيارة العامة الـ SEO-friendly.

---

## 5. الملفات التي ستُعدل (Files to Modify)

1. `prisma/schema.prisma`:
   - إضافة الحقول والعلاقات المذكورة، وتشغيل `npx prisma db push` و `npx prisma generate`.
2. `src/lib/db.ts`:
   - توفير دالة توافقية `dbConnect` وإصلاح استدعاءات `await dbConnect()` المتبقية لمنع أخطاء TypeScript في الملفات السابقة.
3. `src/lib/rent-agencies/normalize.ts`:
   - تحديث نموذج `Agency` ليشمل شارات التحقق `verificationStatus`, `ownerId`, وعلاقة السيارات.
4. `src/lib/rent-agencies/getAgenciesByCity.ts`:
   - تضمين السيارات المتاحة (`status != 'HIDDEN'`) عند جلب تفاصيل الوكالة.
5. `src/app/[locale]/rent-agencies/[city]/[slug]/page.tsx`:
   - إعادة ترتيب الصفحة وفق المتطلبات:
     1. صورة الغلاف واسم الوكالة وشارة التحقق.
     2. العنوان والمدينة.
     3. أزرار الاتصال وواتساب.
     4. زر وبانر المطالبة بالملكية (إذا لم تكن موثقة أو إذا كان المستخدم زائرًا).
     5. قسم **"سيارات هذه الوكالة"** يعرض أسطول السيارات المنشورة.
     6. Empty state احترافي مخصص (إذا كان صاحب الوكالة: زر إضافة سيارة، وإذا كان زائرًا: دعوة للمطالبة بالملكية).
     7. معلومات الوكالة، الخريطة، ساعات العمل، التقييمات، ثم الوكالات المشابهة.
6. `src/components/dashboard/Sidebar.tsx`:
   - إضافة رابط "وكالتي" (`/dashboard/agency`) في القائمة الجانبية للوحة التحكم.
7. `src/components/layout/Header.tsx`:
   - إضافة خيار لوحة الوكالة أو تسجيل الوكالة في قائمة المستخدم.
8. `src/app/[locale]/admin/agencies/page.tsx` و `src/components/admin/AgenciesTable.tsx`:
   - عرض حالة التحقق، طلبات الملكية، إمكانية التحقق الفوري، وتعيين المالك.
9. `src/messages/ar.json` و `src/messages/fr.json`:
   - إضافة كافة النصوص والترجمات العربية والفرنسية لجميع المراحل (لوحة التحكم، النماذج، الحالات، رسائل الأخطاء، والـ SEO).
10. `src/lib/sitemap-utils.ts`:
    - إضافة سيارات الوكالات العامة المنشورة للـ Sitemap.

---

## 6. مخاطر التوافق والحلول (Compatibility Risks & Mitigations)

| الخطر | طريقة الحل والتفادي |
|---|---|
| كسر نظام الإعلانات العادية `Listing` | إنشاء نموذج `AgencyVehicle` مستقل بالكامل عن `Listing` مع الحفاظ على كل وظائف `Listing` دون مساس. |
| استدعاءات `await dbConnect()` في مسارات قديمة تتسبب في فشل TypeScript | تصدير دالة `export const dbConnect = async () => prisma;` في `src/lib/db.ts` لضمان التوافق التام مع الشفرة القديمة. |
| كسر صفحات الوكالات الحالية أو روابط الـ SEO | الحفاظ على نفس بنية الروابط `/[locale]/rent-agencies/[city]/[slug]`، وإضافة مسار متوافق ومخصص للسيارات `/[locale]/rent-agencies/[city]/[slug]/[vehicleSlug]`. |
| رفع صور ضخمة أو غير صالحة | ضغط الصور قبل الرفع في العميل إلى أقصى عرض/ارتفاع 1200x900 بصيغة JPEG بجودة 85%، مع فحص الحجم والنوع في المتصفح والـ API. |
| التلاعب بـ `ownerId` في الـ API | الاعتماد الحصري على التوكن الموثق من Firebase / Session في الخادم، ورفض أي طلب تعديل لوكالة أو سيارة لا يملكها المستخدم. |
| أخطاء الترجمة وفقدان المفاتيح بين اللغتين | إضافة كل المفاتيح في `ar.json` و `fr.json` بشكل متطابق مع عدم وضع نصوص صلبة داخل المكونات. |

---

## 7. خطة الاختبار والتحقق (Test Plan)

1. **فحص الأنواع والبناء:**
   - تشغيل `npx tsc --noEmit` والتأكد من خلو المشروع من أخطاء TypeScript تمامًا دون استخدام `any` أو `@ts-ignore`.
   - تشغيل `npm run build` للتأكد من نجاح توليد كل المسارات والصفحات.
2. **اختبار السيناريوهات العملية (Live Verification):**
   - تسجيل حساب وإنشاء وكالة جديدة أو المطالبة بوكالة موجودة.
   - الدخول إلى لوحة تحكم الوكالة `/dashboard/agency`.
   - إضافة سيارتين بصور، مواصفات، أسعار يومية/أسبوعية/شهرية، ومبلغ تأمين.
   - فتح صفحة الوكالة العامة في المتصفح، والتأكد من ظهور السيارات المنشورة مباشرة قبل الوكالات المشابهة.
   - النقر على إحدى السيارات للانتقال إلى صفحة تفاصيلها والتحقق من الـ Breadcrumbs و Schema وواتساب.
   - تعديل سعر إحدى السيارات من لوحة التحكم وملاحظة التحديث الفوري في الواجهة العامة.
   - تحويل حالة السيارة الثانية إلى `HIDDEN` والتأكد من اختفائها التام من العرض العام وعدم إمكانية الوصول لها.
   - اختبار التبديل بين اللغتين العربية (RTL) والفرنسية (LTR).
   - تجربة الواجهة وأزرار الاتصال على قياس شاشات الهواتف المحمولة.
