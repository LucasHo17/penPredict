import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from imblearn.over_sampling import RandomOverSampler
from xgboost import XGBClassifier

# 1. Load & initial clean
df = pd.read_csv("WorldCupShootouts.csv")
# Drop any rows missing essential columns, including high pressure
df = df.dropna(subset=["Zone", "Foot", "Keeper", "OnTarget", "Goal", "Elimination"])
# 2. Cast types & map
df[["Zone", "OnTarget", "Goal", "Elimination"]] = df[["Zone", "OnTarget", "Goal", "Elimination"]].astype(int)
df["Foot"] = df["Foot"].map({"L": 0, "R": 1})
df["Keeper"] = df["Keeper"].str.upper()
df["Keeper_Zone"] = df["Keeper"].map({"L": 0, "C": 1, "R": 2})
# 3. One-hot encode categorical features
#   - Shot Zone (1–9)
#   - Penalty order
#   - Teams
for col, prefix in [("Zone", "Zone"), ("Penalty_Number", "PN"), ("Team", "Team")]:
    df = pd.get_dummies(df, columns=[col], prefix=prefix)
# 4. Split & balance
X = df.drop(columns=["Game_id","Keeper", "Keeper_Zone"])
y = df["Keeper_Zone"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, stratify=y, test_size=0.2, random_state=42
)
ros = RandomOverSampler(random_state=42)
X_train_res, y_train_res = ros.fit_resample(X_train, y_train)
print(f"Training set: {X_train_res.shape}, Test set: {X_test.shape}")

# 5. Random Forest baseline + GridSearch
rf_grid = {
    "n_estimators": [100, 200],
    "max_depth": [None, 5, 10],
    "min_samples_split": [2, 5]
}
rf = GridSearchCV(
    RandomForestClassifier(random_state=42),
    rf_grid, cv=3, scoring="f1_macro", n_jobs=-1
)
rf.fit(X_train_res, y_train_res)
best_rf = rf.best_estimator_
print("RF best params:", rf.best_params_)

scores = cross_val_score(best_rf, X_train_res, y_train_res, cv=5, scoring="accuracy", n_jobs=-1)
print(f"RF CV accuracy: {scores.mean():.3f} ± {scores.std():.3f}")

# Evaluate RF on test set
y_rf = best_rf.predict(X_test)
print("\nRF Test Accuracy:", accuracy_score(y_test, y_rf))
print(confusion_matrix(y_test, y_rf))
print(classification_report(y_test, y_rf, target_names=["Left","Center","Right"]))

feature_names = list(X.columns)
joblib.dump(feature_names, "feature_names.joblib")
print("✅ Saved feature list to feature_names.joblib")
joblib.dump(best_rf, "keeper_dive_rf.joblib")
print("✅ Saved Random Forest model to keeper_dive_rf.joblib")





"""""
# 6. XGBoost baseline
xgb = XGBClassifier(eval_metric="mlogloss", random_state=42)
xgb.fit(X_train_res, y_train_res)
y_xgb = xgb.predict(X_test)
print("\nXGB Test Accuracy:", accuracy_score(y_test, y_xgb))
print(confusion_matrix(y_test, y_xgb))
print(classification_report(y_test, y_xgb, target_names=["Left","Center","Right"]))

# 7. XGBoost hyperparameter tuning with RandomizedSearchCV
xgb_param_dist = {
    "n_estimators": [100, 200, 300, 500],
    "learning_rate": [0.01, 0.05, 0.1, 0.2],
    "max_depth": [3, 5, 7, 10],
    "subsample": [0.6, 0.8, 1.0],
    "colsample_bytree": [0.6, 0.8, 1.0],
    "gamma": [0, 1, 5]
}
rand_xgb = RandomizedSearchCV(
    XGBClassifier(eval_metric="mlogloss", random_state=42),
    xgb_param_dist,
    n_iter=20, cv=3, scoring="f1_macro", n_jobs=-1, verbose=1, random_state=42
)
rand_xgb.fit(X_train_res, y_train_res)
best_xgb = rand_xgb.best_estimator_
print("XGB best params:", rand_xgb.best_params_)

# Evaluate tuned XGB
y_tuned = best_xgb.predict(X_test)
print("\nTuned XGB Test Accuracy:", accuracy_score(y_test, y_tuned))
print(confusion_matrix(y_test, y_tuned))
print(classification_report(y_test, y_tuned, target_names=["Left","Center","Right"]))
"""""