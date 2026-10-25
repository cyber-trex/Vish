# Vish Player — GitHub Pages + Android APK

## 1. Upload to GitHub
1. Create a new GitHub repository, for example `vish-player`.
2. Upload all files in this folder (including the hidden `.github` folder) to the repository's `main` branch.
3. Open **Settings → Actions → General** and ensure Actions are allowed.
4. Open **Settings → Pages** and set the source to **GitHub Actions**.
5. The `Deploy website to GitHub Pages` workflow will publish the site after a push to `main`.

## 2. Build the APK
1. Open the repository's **Actions** tab.
2. Select **Build Android APK** and press **Run workflow**, or push a new commit to `main`.
3. When it finishes, open that workflow run and download the `vish-player-debug-apk` artifact.
4. Extract the downloaded ZIP to get `app-debug.apk`, then install it on your Android device.

## Notes
- This workflow produces a **debug APK** for testing, not a Play Store release.
- GitHub Pages and APK builds run separately. The APK bundles the web app into the Android app; it does not need to load the GitHub Pages site at runtime.
- If the app later needs private API keys, do not put them in frontend code or commit them to GitHub.
