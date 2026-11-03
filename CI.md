# CI/CD and Store Publishing Guide

This document describes the automated CI/CD pipeline for **Random Album for YouTube Music™**, the required secrets and environment variables, and step-by-step instructions on how to obtain credentials for each browser store.

---

## Workflows Overview

The repository contains two GitHub Actions workflows:

1. **[CI Checks](.github/workflows/ci.yml)**:
   * **Triggers**: Pull requests and pushes to `main`.
   * **Purpose**: Runs pre-flight checks ([`bin/preflight_check.py`](file:///Users/cgarst/code/random-album-for-youtube-music/bin/preflight_check.py)) and unit tests ([`tests/test_preflight.py`](file:///Users/cgarst/code/random-album-for-youtube-music/tests/test_preflight.py)) to ensure manifest JSON syntax, file integrity, and version synchronization between Chromium and Firefox manifests.

2. **[Publish Extension Updates](.github/workflows/publish.yml)**:
   * **Triggers**: Publishing a GitHub Release (`vX.Y`), or manual trigger via `workflow_dispatch`.
   * **Pre-flight Gate**: Verifies manifest versions match each other and the release tag, ensures the version is strictly incremented over previous releases, builds and verifies package contents.
   * **Store Publishing**: Submits packages to Google Chrome Web Store, Mozilla Firefox Add-ons (AMO), and Microsoft Edge Add-ons in parallel. Attaches `.zip` and `.xpi` archives to the GitHub Release.

---

## Secrets Reference Table

Add these secrets in GitHub under **Settings > Secrets and variables > Actions > Repository secrets**:

| Secret Name | Target Store | Description |
| :--- | :--- | :--- |
| `CHROME_EXTENSION_ID` | Chrome | Extension ID: `obkkkldnmaoahhpkhomdmdpjldcpihph` |
| `CHROME_PUBLISHER_ID` | Chrome | Unique Publisher ID from Chrome Developer Dashboard |
| `CHROME_CLIENT_ID` | Chrome | Google Cloud OAuth 2.0 Client ID |
| `CHROME_CLIENT_SECRET` | Chrome | Google Cloud OAuth 2.0 Client Secret |
| `CHROME_REFRESH_TOKEN` | Chrome | OAuth Refresh Token generated for Chrome Web Store API |
| `FIREFOX_JWT_ISSUER` | Firefox | AMO API Key (JWT Issuer) |
| `FIREFOX_JWT_SECRET` | Firefox | AMO API Secret (JWT Secret) |
| `EDGE_PRODUCT_ID` | Edge | Partner Center Product ID (GUID) |
| `EDGE_CLIENT_ID` | Edge | Microsoft Entra ID (Azure AD) App Client ID |
| `EDGE_API_KEY` | Edge | Microsoft Partner Center / Entra ID Client Secret |

> [!NOTE]
> `GITHUB_TOKEN` is automatically provided by GitHub Actions and does not need to be configured manually.

---

## 1. Google Chrome Web Store Setup

### Prerequisites
* Your extension is already published: ID `obkkkldnmaoahhpkhomdmdpjldcpihph`.
* A Google Developer account with access to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

### Step 1: Get `CHROME_PUBLISHER_ID`
1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click **Account** in the left sidebar menu.
3. Under **Developer details**, copy your **Publisher ID**.

### Step 2: Enable Chrome Web Store API in Google Cloud
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select an existing project or click **Create Project** (e.g. `extension-publishing`).
3. In the search bar at the top, search for **Chrome Web Store API** and click **Enable**.

### Step 3: Configure the OAuth Consent Screen
1. In the Google Cloud Console, navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in the required fields (App name, User support email, Developer contact email).
4. Under **Scopes**, click **Add or Remove Scopes**, add `https://www.googleapis.com/auth/chromewebstore`, and click **Update**.
5. Save and continue.
6. Under **Publishing status**, click **Publish App** to switch the status from *Testing* to **In Production**.

> [!IMPORTANT]
> If your OAuth app remains in **Testing** status, your refresh token will expire after **7 days**, causing future workflow runs to fail. Setting it to **In Production** grants indefinite validity.

### Step 4: Create OAuth 2.0 Credentials
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select **Desktop app** (or **Web application** with redirect URI `https://oauth.pstmn.io/v1/callback` or `urn:ietf:wg:oauth:2.0:oob`).
4. Name it (e.g., `GitHub Actions Publisher`) and click **Create**.
5. Copy your **Client ID** (`CHROME_CLIENT_ID`) and **Client Secret** (`CHROME_CLIENT_SECRET`).

### Step 5: Generate `CHROME_REFRESH_TOKEN`
You need to complete a one-time OAuth consent flow to obtain a refresh token.

#### Quick Method (CLI helper):
Run the open-source key generator helper:
```bash
npx chrome-webstore-upload-keys
```
Enter your Client ID and Client Secret when prompted, open the displayed URL in your browser, log in with your Chrome Web Store account, and paste the authorization code back into the terminal. It will output the `refreshToken`.

#### Manual Method:
1. Open this URL in your browser (replace `<CLIENT_ID>`):
   ```
   https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=<CLIENT_ID>&redirect_uri=urn:ietf:wg:oauth:2.0:oob
   ```
2. Authorize with your developer account and copy the authorization `CODE`.
3. Exchange the code for a refresh token via `curl`:
   ```bash
   curl -X POST "https://oauth2.googleapis.com/token" \
     -d "client_id=<CLIENT_ID>" \
     -d "client_secret=<CLIENT_SECRET>" \
     -d "code=<CODE>" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
   ```
4. Copy the `refresh_token` field from the JSON response.

---

## 2. Mozilla Firefox Add-ons (AMO) Setup

### Prerequisites
* Your add-on is already published: GUID `{33c481aa-0754-44de-b3a5-8f92416d22d4}`.
* A developer account on [addons.mozilla.org](https://addons.mozilla.org/).

### Generating Credentials
1. Log in to the [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/).
2. Click your user menu in the top right and select **Manage API Credentials** (or visit [https://addons.mozilla.org/developers/addon/api/key/](https://addons.mozilla.org/developers/addon/api/key/)).
3. If no key exists, click **Generate new credentials**.
4. You will receive:
   * **JWT issuer** (e.g. `user:12345678:999`): Save as `FIREFOX_JWT_ISSUER`.
   * **JWT secret** (64-character hex string): Save as `FIREFOX_JWT_SECRET`.

> [!NOTE]
> Firefox AMO does not expire JWT keys unless manually revoked or regenerated.

---

## 3. Microsoft Edge Add-ons Setup

### Prerequisites
* Your extension is already published on Microsoft Edge Add-ons.
* Access to the [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview).

### Step 1: Get `EDGE_PRODUCT_ID`
1. Go to the [Microsoft Partner Center Developer Dashboard](https://partner.microsoft.com/dashboard/microsoftedge/overview).
2. Click on **Random Album for YouTube Music™**.
3. In the left navigation, click **Product overview** (or check the browser URL: `https://partner.microsoft.com/dashboard/microsoftedge/<PRODUCT_ID>/...`).
4. Copy the Product ID (a GUID format such as `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). Save as `EDGE_PRODUCT_ID`.

### Step 2: Set Up API Access (Entra ID App)
1. In the Partner Center, click the **Settings** gear icon in the top right > **Account settings**.
2. In the left menu, select **API access** (or **Access management** / **Azure AD Applications**).
3. Click **Create Azure AD Application** (or link an existing application).
4. Once created, note the **Client ID** (Application ID). Save as `EDGE_CLIENT_ID`.
5. Under **Keys**, click **Add key** to generate a client secret / API Key. Copy the generated key value immediately. Save as `EDGE_API_KEY`.

---

## Adding Secrets to GitHub

1. Open your repository on GitHub: [`https://github.com/cgarst/random-album-for-youtube-music`](https://github.com/cgarst/random-album-for-youtube-music).
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add each secret name and value as listed in the reference table above.

---

## Testing & Verifying Credentials

### Dry-Run Locally
Before publishing, ensure the pre-flight check passes:
```bash
# Verify unit tests
python3 tests/test_preflight.py

# Verify manifest versions and packaging
./bin/preflight_check.py --allow-equal-version
```

### Dry-Run on GitHub Actions
1. Go to the **Actions** tab on GitHub.
2. Select **Publish Extension Updates**.
3. Click **Run workflow**:
   * Set **Target store(s)** to a single store (e.g. `chrome`, `firefox`, or `edge`) to verify individual credentials.
   * Enable **Allow publishing version equal to existing tag** for testing without bumping the version number.
4. Verify that the pre-flight check and store authentication step succeed.
