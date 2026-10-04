# Password Strength Analyzer

A beginner-friendly, browser-only password analyzer. It gives immediate feedback about a password's length and character mix, offers suggestions, and can generate and copy a strong password. The password is not sent to a server or saved by this project.

## Features

- Live strength label, score, and visual meter
- Checklist for length, uppercase, lowercase, numbers, and special characters
- Suggestions for improving a password
- Local warnings for a short list of common passwords and excessive repetition
- Show/hide password control
- Strong password generator and copy button
- Responsive layout and keyboard-accessible controls

## Technologies

- HTML5 for the page structure
- CSS3 for layout, styling, responsive behavior, and transitions
- Vanilla JavaScript for analysis and interactions
- Web Crypto API for random values used by the password generator

No framework, backend, or third-party library is needed.

## How the analyzer works

As you type, JavaScript checks the password in the page and updates the checklist, suggestions, common-password warning, strength label, and score. The analysis stays in the browser tab. A small list of common passwords is included in `script.js`; this is only a basic warning list, not a complete or frequently updated password database.

The score is an educational heuristic, not a security guarantee:

- Up to 40 points for length: 2 points per character, up to 20 characters.
- 10 points for each of four character groups: uppercase, lowercase, number, and special character.
- 20 bonus points for passwords at least 12 characters long without excessive repetition.
- 60 points are subtracted for a password in the common-password list; 20 points are subtracted for excessive repetition.
- The final value is clamped between 0 and 100.

Labels use these score bands: Very Weak (0-19), Weak (20-39), Medium (40-59), Strong (60-79), and Very Strong (80-100). A score is only a rough guide; longer, unique passwords and a password manager are recommended.

## Run in VS Code

1. Open this project folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Open `index.html`, then choose **Go Live** in the VS Code status bar (or right-click the file and choose **Open with Live Server**).
4. The page opens in your browser. Enter a test password or select **Generate strong password**.

The project also works by opening `index.html` directly, but clipboard access is most reliable when using Live Server or another secure local origin.

## Security and privacy

- Password analysis and generation happen locally in the browser. There are no network requests in this project.
- Passwords are not written to localStorage, cookies, or any file.
- The password remains in the page's memory until you clear it, close the tab, or navigate away. Avoid using this demonstration with passwords you rely on for real accounts.
- Reuse across other websites cannot be detected without comparing against information from those sites. This project deliberately does not store real passwords; it only warns about entries in its small local common-password list.
- The score does not check leaked-password databases and cannot guarantee that a password is safe.

## Future enhancements

- Add a larger, maintained common-password dictionary that is still checked locally.
- Add passphrase suggestions and password-manager guidance.
- Add optional strength explanations for each score component.
- Add automated browser tests and localization.