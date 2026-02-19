# Contributing to Crescent Studio

Thank you for your interest in contributing! Please read this guide before opening a pull request.

## Code of Conduct

Be respectful. Harassment or discriminatory language will not be tolerated.

## Development Setup

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **ElevenLabs API Key** — [Get one here](https://elevenlabs.io/)

### Fork & Clone

```bash
git clone https://github.com/<your-username>/crescent-studio.git
cd crescent-studio
```

### Install Dependencies

**Backend:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install flake8 black    # linting tools
```

**Frontend:**

```bash
cd frontend
npm install
```

## Git Workflow

1. Create a feature branch from `master`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes.
3. Commit using conventional commit messages:
   ```
   feat: add waveform zoom control
   fix: resolve stem loading race condition
   docs: update API endpoint table
   ```
4. Push and open a pull request against `master`.

## Code Style

### Frontend (JavaScript / React)

- All linting is enforced by **ESLint** (`npm run lint`).
- Use functional components and React hooks.
- Keep components small and focused.
- Use Tailwind CSS utility classes; avoid inline styles.

### Backend (Python)

- Follow **PEP 8** — enforced by **flake8** (max line length 127).
- Format code with **black** before committing.
- Use type hints on all function signatures.

## Running Checks Locally

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd backend
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
black --check .
```

All checks must pass before your PR can be merged.

## Pull Request Process

1. Fill out the PR template completely.
2. Ensure the CI workflows pass (Frontend CI, Backend CI).
3. Request a review from a maintainer.
4. Address any review comments.
5. A maintainer will merge once approved.

## Reporting Bugs

Use the **Bug Report** issue template. Include reproduction steps and your environment details.

## Requesting Features

Use the **Feature Request** issue template. Describe the problem the feature solves and your proposed solution.
