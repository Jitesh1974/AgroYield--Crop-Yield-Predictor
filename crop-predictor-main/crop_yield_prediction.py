# crop_yield_prediction.py
# -*- coding: utf-8 -*-
"""
Crop yield training script rewritten WITHOUT pandas.
Reads CSV via csv.DictReader, builds numeric + categorical feature lists,
constructs sklearn ColumnTransformer pipelines, fits RandomForest and
GradientBoosting, evaluates, saves best model with joblib, and plots results.

Adjust CSV_PATH and OUTPUT_MODEL_PATH as needed.
"""
import os
import csv
import joblib
import numpy as np
import matplotlib.pyplot as plt
from collections import defaultdict, Counter
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# ------------ USER CONFIG ------------
# Set local path to your CSV (example: "Final_Dataset_with_Yield.csv")
CSV_PATH = "combined.csv"
OUTPUT_MODEL_PATH = "Model_Yield_Predict.joblib"
SAMPLE_FRACTION = 1.0     # use 1.0 for full dataset, <1.0 for sampling
RANDOM_STATE = 42
RF_N_ESTIMATORS = 200
GBR_N_ESTIMATORS = 200
TARGET_COLUMN = "Yield"   # exact header name in CSV
# -------------------------------------

def read_csv_as_dicts(path):
    """Return (header_list, list_of_dict_rows)."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"CSV not found: {path}")
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        rows = [row for row in reader]
    return headers, rows

def is_numeric_value(s):
    """Return True if s convertible to float (non-empty)."""
    if s is None:
        return False
    s = str(s).strip()
    if s == "":
        return False
    try:
        float(s)
        return True
    except Exception:
        return False

def detect_column_types(headers, rows, target_col):
    """
    Detect numeric vs categorical columns heuristically:
    - If >80% of non-empty values parse as float -> numeric
    - Else categorical
    Excludes target_col (handled separately).
    """
    numeric_cols = []
    categorical_cols = []
    for col in headers:
        if col == target_col:
            continue
        non_empty = [r[col] for r in rows if r.get(col, "") not in (None, "", "NA", "N/A", "nan")]
        if not non_empty:
            # no data -> treat as categorical for safety
            categorical_cols.append(col)
            continue
        num_parsable = sum(1 for v in non_empty if is_numeric_value(v))
        frac = num_parsable / len(non_empty)
        # numeric threshold (80%)
        if frac >= 0.8:
            numeric_cols.append(col)
        else:
            categorical_cols.append(col)
    return numeric_cols, categorical_cols

def build_feature_matrix(headers, rows, numeric_cols, categorical_cols, target_col):
    """
    Build X (list of dicts) and y (list) in same order.
    Missing numeric values will be left as empty strings (SimpleImputer handles).
    Categorical missing values use empty string.
    Returns: X_rows (list of dict), y (np.array), feature_col_order (list)
    """
    X_dicts = []
    y = []
    for r in rows:
        # handle target
        y_val = r.get(target_col, "")
        if y_val is None or str(y_val).strip() == "":
            # skip rows with missing target
            continue
        # try parse numeric target
        try:
            yf = float(str(y_val).strip())
        except Exception:
            # skip if cannot convert
            continue
        # build dict for columns we will use
        row_dict = {}
        for c in numeric_cols + categorical_cols:
            v = r.get(c, "")
            # normalize empty-like strings
            if v is None:
                v = ""
            v = str(v).strip()
            row_dict[c] = v
        X_dicts.append(row_dict)
        y.append(yf)
    if not X_dicts:
        raise ValueError("No rows available after filtering missing target.")
    return X_dicts, np.array(y, dtype=float)

def dicts_to_matrix(X_dicts, numeric_cols, categorical_cols):
    """
    Converts list of dicts to numpy arrays for ColumnTransformer.
    Returns:
      X_numeric: np.array shape (n, len(numeric_cols))
      X_categorical: list of lists (n, len(categorical_cols)) - left as list-of-lists because
                     ColumnTransformer expects array-like; we will pass them as numpy arrays.
    """
    n = len(X_dicts)
    X_num = np.empty((n, len(numeric_cols)), dtype=float)
    X_cat = []
    for i, row in enumerate(X_dicts):
        for j, col in enumerate(numeric_cols):
            val = row.get(col, "")
            if is_numeric_value(val):
                try:
                    X_num[i, j] = float(val)
                except:
                    X_num[i, j] = np.nan
            else:
                X_num[i, j] = np.nan
        # categorical row list
        cat_row = [row.get(col, "") for col in categorical_cols]
        X_cat.append(cat_row)
    X_cat = np.array(X_cat, dtype=object)
    return X_num, X_cat

def build_and_train(X_train_full, X_test_full, y_train, y_test, numeric_cols, categorical_cols):
    """
    Build ColumnTransformer and pipelines, train RF and GBR, evaluate.
    X_train_full and X_test_full are dicts converted into numeric+cat arrays.
    """
    # numeric transformer: impute median, then scale
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    # categorical transformer: impute most frequent, then one-hot encode (sparse=False to match original)
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent', fill_value="")),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ('num', numeric_transformer, list(range(len(numeric_cols)))),  # we will feed numeric cols array
        ('cat', categorical_transformer, list(range(len(numeric_cols), len(numeric_cols) + len(categorical_cols))))
    ], remainder='drop')

    # We need to combine numeric and categorical arrays horizontally for ColumnTransformer index addressing.
    # Create wrapper function to horizontally stack numeric and categorical arrays.
    def stack_X(X_num, X_cat):
        if X_cat.size == 0:
            return X_num
        if X_num.size == 0:
            # convert X_cat to object array
            return X_cat
        return np.hstack([X_num, X_cat.astype(object)])

    # Prepare stacked matrices
    X_train = stack_X(*X_train_full)
    X_test = stack_X(*X_test_full)

    # Pipelines with models
    rf_pipe = Pipeline(steps=[('preprocessor', preprocessor),
                              ('model', RandomForestRegressor(n_estimators=RF_N_ESTIMATORS,
                                                              random_state=RANDOM_STATE, n_jobs=-1))])

    gbr_pipe = Pipeline(steps=[('preprocessor', preprocessor),
                               ('model', GradientBoostingRegressor(n_estimators=GBR_N_ESTIMATORS,
                                                                   random_state=RANDOM_STATE))])

    # Fit
    print("Fitting RandomForest...")
    rf_pipe.fit(X_train, y_train)
    print("Fitting GradientBoosting...")
    gbr_pipe.fit(X_train, y_train)

    # Eval helper
    def eval_pipe(pipe, X_test, y_test):
        preds = pipe.predict(X_test)
        mse = mean_squared_error(y_test, preds)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, preds)
        r2 = r2_score(y_test, preds)
        return {"rmse": rmse, "mae": mae, "r2": r2, "preds": preds}

    rf_res = eval_pipe(rf_pipe, X_test, y_test)
    gbr_res = eval_pipe(gbr_pipe, X_test, y_test)

    print("RandomForest -> RMSE: {:.4f}, MAE: {:.4f}, R2: {:.4f}".format(rf_res['rmse'], rf_res['mae'], rf_res['r2']))
    print("GradientBoosting -> RMSE: {:.4f}, MAE: {:.4f}, R2: {:.4f}".format(gbr_res['rmse'], gbr_res['mae'], gbr_res['r2']))

    best_pipe = rf_pipe if rf_res['rmse'] <= gbr_res['rmse'] else gbr_pipe
    best_name = "RandomForest" if best_pipe is rf_pipe else "GradientBoosting"
    print("Best model selected:", best_name)

    return best_pipe, best_name, rf_res, gbr_res

def plot_results(y_test, preds, title):
    plt.figure(figsize=(8,6))
    plt.scatter(y_test, preds, alpha=0.6)
    minv = min(float(np.min(y_test)), float(np.min(preds)))
    maxv = max(float(np.max(y_test)), float(np.max(preds)))
    plt.plot([minv, maxv], [minv, maxv], 'r--')
    plt.xlabel("True Yield")
    plt.ylabel("Predicted Yield")
    plt.title(title)
    plt.grid(True)
    plt.show()

def main():
    print("Loading CSV:", CSV_PATH)
    headers, rows = read_csv_as_dicts(CSV_PATH)
    if TARGET_COLUMN not in headers:
        raise KeyError(f"Target column '{TARGET_COLUMN}' not present in CSV headers: {headers}")

    # Detect numeric and categorical columns
    numeric_cols, categorical_cols = detect_column_types(headers, rows, TARGET_COLUMN)
    print("Detected numeric columns:", numeric_cols)
    print("Detected categorical columns:", categorical_cols)

    # Build X dicts and y
    X_dicts, y = build_feature_matrix(headers, rows, numeric_cols, categorical_cols, TARGET_COLUMN)
    print("Total usable rows for modeling:", len(y))

    # Optional sampling
    if SAMPLE_FRACTION < 1.0:
        rng = np.random.default_rng(RANDOM_STATE)
        idx = np.arange(len(y))
        chosen = rng.choice(idx, size=int(len(idx)*SAMPLE_FRACTION), replace=False)
        X_dicts = [X_dicts[i] for i in chosen]
        y = y[chosen]
        print("After sampling rows:", len(y))

    # Convert to numeric & categorical arrays
    X_num, X_cat = dicts_to_matrix(X_dicts, numeric_cols, categorical_cols)

    # Train/test split (use stacked arrays)
    # We'll prepare full stacked arrays inside build_and_train to avoid re-implementing ColumnTransformer indexing
    X_train_num, X_test_num, X_train_cat, X_test_cat, y_train, y_test = train_test_split(
        X_num, X_cat, y, test_size=0.20, random_state=RANDOM_STATE
    )

    print("Train/test sizes:", len(y_train), len(y_test))

    best_pipe, best_name, rf_res, gbr_res = build_and_train(
        (X_train_num, X_train_cat),
        (X_test_num, X_test_cat),
        y_train, y_test,
        numeric_cols, categorical_cols
    )

    # Save model
    joblib.dump(best_pipe, OUTPUT_MODEL_PATH)
    print("Saved best model to:", OUTPUT_MODEL_PATH)

    # Choose preds for best model to plot
    preds = best_pipe.predict(np.hstack([X_test_num, X_test_cat.astype(object) if X_test_cat.size else X_test_num]))
    plot_results(y_test, preds, f"True vs Predicted ({best_name})")

    # Residuals histogram
    residuals = y_test - preds
    plt.figure(figsize=(8,5))
    plt.hist(residuals, bins=50)
    plt.xlabel("Residual (True - Predicted)")
    plt.title(f"Residuals histogram ({best_name})")
    plt.grid(True)
    plt.show()

    # Optional: if RandomForest provide feature importances (we need feature names)
    # Build feature names: numeric_cols + expanded one-hot categorical names (approx)
    if best_name == "RandomForest":
        try:
            pre = best_pipe.named_steps['preprocessor']
            # numeric names are numeric_cols
            feature_names = []
            if len(numeric_cols) > 0:
                feature_names += numeric_cols
            if len(categorical_cols) > 0:
                # Attempt to get onehot names
                ohe = pre.named_transformers_['cat'].named_steps['onehot']
                cat_names = ohe.get_feature_names_out(categorical_cols).tolist()
                feature_names += cat_names
            importances = best_pipe.named_steps['model'].feature_importances_
            # If feature_importances length mismatch, skip plotting names
            if len(importances) == len(feature_names):
                importances = np.array(importances)
                idxs = np.argsort(importances)[-30:][::-1]
                top_feats = [feature_names[i] for i in idxs]
                top_vals = importances[idxs]
                plt.figure(figsize=(8,8))
                plt.barh(range(len(top_vals))[::-1], top_vals, tick_label=top_feats)
                plt.title("Top feature importances")
                plt.tight_layout()
                plt.show()
        except Exception as e:
            print("Could not compute feature importances plot:", e)

    # Final results summary
    results = {
        "RandomForest": {"rmse": rf_res['rmse'], "mae": rf_res['mae'], "r2": rf_res['r2']},
        "GradientBoosting": {"rmse": gbr_res['rmse'], "mae": gbr_res['mae'], "r2": gbr_res['r2']}
    }
    print("Results summary:", results)

if __name__ == "__main__":
    main()
