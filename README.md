# Sentinel — Credit Card Fraud Detection

Sentinel is a real-time credit card fraud detection console. A Flask API serves three
trained machine learning models (Logistic Regression, Random Forest, XGBoost) trained on
a real-world, severely imbalanced transaction dataset, and a Next.js/TypeScript frontend
provides a dark, glassmorphic UI for scoring transactions one at a time or in bulk via CSV.

## Live Demo

| | URL |
|---|---|
| Console (frontend) | https://sentinel-fraud-console-dun.vercel.app |
| Inference API | https://sentinel-fraud-api.vercel.app |

Quick check: [`/health`](https://sentinel-fraud-api.vercel.app/health) returns the list of
models the API has loaded.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Dataset](#dataset)
- [Problem Statement](#problem-statement)
- [Preprocessing](#preprocessing)
- [Models](#models)
- [Results](#results)
- [Visualisations](#visualisations)
- [Key Findings](#key-findings)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project tackles one of the most common and critical problems in the financial
industry — detecting fraudulent credit card transactions. Using a real-world dataset from
Kaggle, three machine learning models were built and compared to identify fraud accurately
on a severely imbalanced dataset where only 0.17% of transactions are fraudulent. The
trained models are served behind a REST API and consumed by a dedicated web console.

## Features

- **Manual transaction scoring** — enter `Time`, `Amount`, and the 28 PCA-transformed
  features (`V1`–`V28`) and get an instant fraud/legitimate prediction with a probability
  score. One-click "sample legitimate" / "sample fraud-like" buttons fill in illustrative
  values for quick testing.
- **Batch scoring via CSV** — upload a CSV of transactions, validate its columns client-side,
  run predictions on all rows, view a summary (total / legitimate / fraudulent) and a
  results table, and download the annotated results as a new CSV.
- **Model selection** — switch between Logistic Regression, Random Forest, and XGBoost;
  only models the backend actually loaded successfully are selectable.
- **Live backend health monitoring** — a status indicator polls the API's `/health`
  endpoint, shows which models are loaded (hover for details), and the UI gracefully
  disables prediction actions with an explanatory banner if the API is unreachable.
- **Model performance panel** — accuracy/precision/recall/F1/ROC AUC for each model,
  benchmarked on a held-out test split, displayed with a distinct visual identity per model.
- **Futuristic UI** — a dark glassmorphic design system with an animated 3D intro sequence,
  an animated 3D hero background, and Framer Motion micro-interactions, built with
  Three.js / React Three Fiber.
- **Resilient UX** — themed 404 and error pages, loading states, and inline validation for
  missing/empty CSV data.

## Tech Stack

**Backend**
- Python 3.12, [Flask](https://flask.palletsprojects.com/) + [flask-cors](https://flask-cors.readthedocs.io/)
- [scikit-learn](https://scikit-learn.org/) (Logistic Regression, Random Forest), [XGBoost](https://xgboost.readthedocs.io/)
- pandas, numpy, joblib (model/scaler persistence)
- [Gunicorn](https://gunicorn.org/) as the production WSGI server

**Frontend** (`frontend/`)
- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (base-ui primitives)
- [Three.js](https://threejs.org/) + [React Three Fiber](https://r3f.docs.pmnd.rs/) + drei
- [Motion](https://motion.dev/) (Framer Motion) for animation
- lucide-react for icons

**Notebooks / modeling** (repo root)
- `preprocessing.ipynb`, `LogisticRegression.ipynb`, `randomForest.ipynb`, `XGBoost.ipynb`,
  `Visualization.ipynb` — the exploratory/training notebooks used to produce the artifacts
  in `Saved Model/` and `Preprocessed datasets/`.

## Project Structure

```
.
├── api.py                         # Flask REST API serving the trained models
├── server/index.py                # Vercel serverless entrypoint (re-exports api.app)
├── vercel.json                    # Vercel build/route config for the API
├── requirements.txt               # API runtime dependencies (pinned)
├── requirements-notebooks.txt     # The above plus matplotlib/seaborn for the notebooks
├── Procfile                       # Production start command (gunicorn) for PaaS deploys
├── Saved Model/                   # Trained model artifacts (.pkl)
│   ├── LogisticRegression.pkl
│   ├── RandomForest.pkl
│   └── XGBoost.pkl
├── Preprocessed datasets/
│   └── scaler.pkl                 # Fitted StandardScaler for Time/Amount
├── plots/                         # Exported evaluation charts used in this README
├── *.ipynb                        # Preprocessing / training / evaluation notebooks
└── frontend/                      # Next.js web console ("Sentinel")
    ├── src/
    │   ├── app/                   # App Router: layout, page, not-found, error, icon
    │   ├── components/            # UI components (dashboard, forms, 3D scenes, ui/*)
    │   ├── hooks/                 # use-health (backend status polling)
    │   └── lib/                   # api client, constants, csv helpers, model metadata
    ├── public/
    ├── .env.local                 # Local env config (not committed)
    ├── .env.local.example         # Template for required env vars
    └── package.json
```

## Dataset

The dataset contains 284,807 transactions collected from European cardholders over two
days in September 2013. After removing duplicate rows, the final dataset has 283,726
transactions — 283,253 legitimate and 473 fraudulent. All features except Time and Amount
have been PCA-transformed to protect cardholder privacy, resulting in 28 anonymised
components labelled V1 through V28.

The dataset is sourced from [Kaggle — Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud).
It is not included in this repository (see `.gitignore`) — download it from Kaggle if you
want to re-run the notebooks.

## Problem Statement

The core challenge in this project is not building a model — it is building one that works
correctly on severely imbalanced data. A naive model that predicts every transaction as
legitimate achieves 99.83% accuracy while catching zero fraud. Standard accuracy is
therefore meaningless here. The focus was on maximising fraud detection while keeping false
alarms at a manageable level, using Precision, Recall, F1 Score, and ROC AUC as the primary
evaluation metrics.

## Preprocessing

The raw dataset was first checked for missing values — none were found. Duplicate rows were
identified and removed. The Time and Amount columns were scaled using StandardScaler since
they operate on a different scale compared to the PCA-transformed features. The dataset was
then split into training and testing sets using an 80/20 stratified split to preserve the
original class ratio in both sets. All preprocessed arrays and the scaler were saved as
pickle files for use across model notebooks and by the API at inference time.

## Models

Three models were trained and evaluated, each chosen for a specific reason. Logistic
Regression was used as a baseline model to establish a minimum performance benchmark.
Random Forest was chosen as an ensemble method that tends to perform well on structured
tabular data. XGBoost was included for its ability to handle class imbalance natively
through the `scale_pos_weight` parameter. Class imbalance was addressed using
`class_weight='balanced'` for Logistic Regression and Random Forest, and `scale_pos_weight`
for XGBoost.

## Results

| Model | Accuracy | Precision | Recall | F1 Score | ROC AUC |
|-------|----------|-----------|--------|----------|---------|
| Logistic Regression | 97.58% | 6% | 87% | 11% | 96.55% |
| Random Forest | 99.94% | 89% | 75% | 81% | 96.50% |
| XGBoost | 99.87% | 59% | 80% | 68% | 97.34% |

Logistic Regression catches the highest number of fraud cases with an 87% recall rate but
generates a large number of false alarms — legitimate transactions wrongly flagged as
fraud. This makes it too noisy for real production use. Random Forest achieves the best
balance with 89% precision and an F1 score of 81%, meaning it catches most fraud while
keeping false alarms very low. XGBoost achieves the highest ROC AUC of 97.34% and a strong
recall of 80% with fewer false alarms than Logistic Regression. For a real-world
deployment, Random Forest would be the preferred model based on its F1 score and precision.

## Visualisations

### Class Distribution
![Class Distribution](plots/01_class_distribution.png)

### Transaction Amount — Fraud vs Legitimate
![Amount Distribution](plots/02_amount_distribution.png)

### Confusion Matrices
![Confusion Matrices](plots/03_confusion_matrices.png)

### ROC Curves
![ROC Curves](plots/04_roc_curves.png)

### Precision-Recall Curves
![Precision Recall](plots/05_precision_recall_curves.png)

### Model Performance Comparison
![Model Comparison](plots/06_model_comparison.png)

### XGBoost Feature Importance
![Feature Importance](plots/07_feature_importance.png)

## Key Findings

V14 stands out as by far the most important feature with an importance score of 0.45 —
nearly ten times higher than the next feature. This suggests one particular anonymised
transaction pattern is the strongest signal for fraud in this dataset. Transaction Amount
also appears in the top 15 features, which aligns with real-world fraud behaviour where
amount is a natural risk indicator.

Precision-Recall curves were prioritised over ROC-AUC for model evaluation because ROC can
appear artificially strong on imbalanced datasets. The Precision-Recall AUC gives a more
honest assessment of how well each model identifies the minority fraud class specifically.

---

## Getting Started

### Prerequisites

- Python 3.10+ (developed/tested on 3.12)
- Node.js 20.9+ and npm
- macOS users: `brew install libomp` if XGBoost fails to load (see
  [Troubleshooting](#troubleshooting))

### Backend setup

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt          # API only
# pip install -r requirements-notebooks.txt   # ...or this, to also run the notebooks
```

Versions in `requirements.txt` are pinned deliberately: the committed `.pkl` artifacts were
trained with scikit-learn 1.8.0, and unpickling them under a different minor version raises
`InconsistentVersionWarning` and is not guaranteed to stay correct.

### Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # adjust NEXT_PUBLIC_API_URL if needed
```

## Environment Variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `PORT` | backend (`api.py`) | `5001` | Port the Flask API listens on |
| `ALLOWED_ORIGINS` | backend (`api.py`) | `*` | Comma-separated origins allowed by CORS. Leave unset locally; set to your frontend origin in production |
| `NEXT_PUBLIC_API_URL` | frontend (`frontend/.env.local`) | `http://127.0.0.1:5001` | Base URL the frontend calls for `/health`, `/predict`, `/predict_batch` |

`NEXT_PUBLIC_*` variables are inlined at build time, so changing `NEXT_PUBLIC_API_URL` on
Vercel requires a **redeploy** — updating the variable alone will not change a built site.

`frontend/.env.local` is git-ignored; `frontend/.env.local.example` documents the expected
shape and is safe to commit.

## Running Locally

Run the backend and frontend in two separate terminals (backend first).

**1. Backend (Flask API)**

```bash
source venv/bin/activate
python api.py
```

Starts on `http://127.0.0.1:5001` by default. macOS reserves port 5000 for AirPlay
Receiver, which is why this project defaults to 5001.

Endpoints:
- `GET /health` — status, which models loaded, whether the scaler loaded
- `GET /models` — list of available model keys
- `POST /predict` — `{ "model": "random_forest", "features": { "Time": 0, "V1": ..., "Amount": 149.62 } }`
- `POST /predict_batch` — multipart form: `model` (text) + `file` (CSV)

**2. Frontend (Next.js)**

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Production Build

**Frontend**

```bash
cd frontend
npm run build
npm run start
```

`npm run build` runs the full TypeScript + ESLint + Next.js production build. `npm run
start` serves the optimized production build.

**Backend**

The Flask development server (`python api.py`) is not suitable for production — it will
print a warning to that effect. Use Gunicorn instead:

```bash
gunicorn api:app --bind 0.0.0.0:$PORT
```

This is also codified in the root `Procfile` for platforms that read it automatically
(Heroku-style buildpacks, Render, etc.).

## Deployment

Both halves run on Vercel as two separate projects against this one repo.

| Project | What it serves | Deploy from |
|---|---|---|
| `sentinel-fraud-console` | Next.js console | `frontend/` |
| `sentinel-fraud-api` | Flask API as a Python function | repo root |

### Backend (`sentinel-fraud-api`)

`vercel.json` builds `server/index.py` with `@vercel/python`, routes every path to it, and
uses `includeFiles` to ship `Saved Model/**` and `Preprocessed datasets/**` into the bundle.
`server/index.py` only puts the repo root on `sys.path` and re-exports `api.app`, so
`python api.py` and `gunicorn api:app` keep working unchanged.

Two constraints worth knowing before changing `requirements.txt`:

- **Bundle size.** A Vercel function is capped at 250 MB unzipped. The default `xgboost`
  wheel bundles GPU support (~58 MB compressed) and pushes the bundle over the cap, so
  Linux installs use `xgboost-cpu` via an environment marker. `matplotlib`/`seaborn` are
  notebook-only and deliberately kept out of `requirements.txt` for the same reason.
- **Cold starts.** Importing scikit-learn and loading the Random Forest takes a second or
  so on a cold function; warm requests return in well under a second.

Set `ALLOWED_ORIGINS` on the project to your console's origin, then deploy:

```bash
cd <repo root>
vercel deploy --prod
```

The API is not tied to Vercel — it is a plain WSGI app. Any host that can run
`gunicorn api:app --bind 0.0.0.0:$PORT` (Render, Railway, Fly.io, a VPS) works, and the
root `Procfile` already codifies that command.

### Frontend (`sentinel-fraud-console`)

Set `NEXT_PUBLIC_API_URL` to the API's URL, then deploy **from `frontend/`**:

```bash
cd frontend
vercel deploy --prod
```

> **Deploy from `frontend/`, not the repo root.** The Vercel CLI reads `vercel.json` from
> the directory you invoke it in. Running `vercel` at the repo root picks up the *API's*
> `vercel.json` and routes the whole site to the Python function, which serves 404s for
> every page. The console project is therefore configured with an empty Root Directory.

### Connecting Git (optional)

Neither project is linked to GitHub yet, so deploys are manual. To get a deploy on every
push, install the [Vercel GitHub App](https://github.com/apps/vercel) on the repo and run
`vercel git connect` in each project. When you do, set the console project's **Root
Directory** to `frontend` in its settings — with Git, Vercel resolves `vercel.json`
relative to the Root Directory, so the two projects stop colliding.

## Troubleshooting

- **XGBoost fails to load on macOS** (`libomp.dylib` error): run `brew install libomp`.
- **Port 5000 already in use on macOS**: that's AirPlay Receiver — this project already
  defaults the API to port 5001 to avoid the conflict.
- **Frontend shows "API offline"**: locally, confirm the backend is running and that
  `NEXT_PUBLIC_API_URL` in `frontend/.env.local` matches its actual address/port. On a
  deployed site, check three things in order: that `NEXT_PUBLIC_API_URL` is set on the
  project *and the site was redeployed afterwards* (the value is inlined at build time);
  that the API's `ALLOWED_ORIGINS` includes the console's origin, otherwise the browser
  blocks the response even though the request succeeds; and that the API URL is `https`,
  since an `https` page cannot call an `http` API.
- **Every frontend route 404s after a deploy**: you deployed from the repo root instead of
  `frontend/`, so the API's `vercel.json` took over. Redeploy from `frontend/`.
