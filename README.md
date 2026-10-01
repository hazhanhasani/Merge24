# Merge24 🎮

**Merge24** یک بازی فکری موبایل‌محور با صفحه‌ی **۴×۶ (۲۴ خانه)** است. هدف ساده است: اعداد مساوی را کنار هم ادغام کن، برای مهره‌های بعدی جا باز نگه دار و بیشترین امتیاز ممکن را ثبت کن.

## قوانین نسخه MVP

- بازی با **دو مهره‌ی ۱ کنار هم** شروع می‌شود.
- هر مهره فقط به یکی از چهار خانه‌ی مجاور بالا، پایین، چپ یا راست منتقل می‌شود.
- کشیدن مهره به خانه‌ی خالی باعث **جابه‌جایی** می‌شود.
- کشیدن مهره روی عدد مساوی باعث **ادغام** می‌شود:
  - `1 + 1 = 2`
  - `2 + 2 = 4`
  - `4 + 4 = 8`
  - و به همین ترتیب.
- بعد از هر حرکت معتبر، یک مهره‌ی جدید وارد یکی از خانه‌های خالی می‌شود.
- امتیاز هر Merge برابر عدد جدید ساخته‌شده است.
- وقتی هر ۲۴ خانه پر باشند و هیچ دو عدد مساوی به‌صورت افقی یا عمودی کنار هم نباشند، بازی **Game Over** می‌شود.

## امکانات فعلی

- رابط کاربری Mobile First و Responsive
- Drag & Drop لمسی
- کنترل جایگزین با Tap برای دسترس‌پذیری
- امتیاز، رکورد محلی، تعداد حرکت و بالاترین Tile
- ذخیره Best Score در مرورگر
- Game Over خودکار مطابق قانون صفحه‌ی ۲۴ خانه‌ای
- PWA manifest و Service Worker برای اجرای مستقل/آفلاین
- Game Engine مستقل از UI
- تست واحد برای قوانین اصلی بازی
- GitHub Actions برای Test و Production Build

## اجرای پروژه

نیازمندی: **Node.js 22+**

```bash
npm install
npm run dev
```

برای تست و Build:

```bash
npm test
npm run build
```

## ساختار پروژه

```text
Merge24/
├── public/
│   ├── icon.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── src/
│   ├── game/
│   │   ├── engine.ts
│   │   └── engine.test.ts
│   ├── main.ts
│   └── style.css
├── .github/workflows/ci.yml
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Roadmap

مرحله‌های بعدی می‌توانند شامل Combo، Daily Challenge، حالت زمان‌دار، Achievement، Leaderboard آنلاین، تم‌ها، صدا و Haptic Feedback، حساب کاربری و حالت رقابتی باشند.

---

Built as the foundation for **Merge24**.


## Android

Merge24 ships with a Capacitor Android wrapper.

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

GitHub Actions also builds and publishes `Merge24-0.2.0-debug.apk` as a workflow artifact.
