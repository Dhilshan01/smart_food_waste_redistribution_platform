# FoodFlow System Reference

## Roles

- Donor/business: create donations or sales, purchase stock, and view waste analytics.
- Charity: filter donations, receive ranked matches, claim food, and complete collections.
- Administrator: manage users, listings and claims, and inspect platform analytics.

## Research algorithms

Safety is the percentage of shelf life remaining, adjusted by storage (`+5` refrigerated, `+10` frozen, `-5` room temperature) and clamped to 0–100. Safe is 80–100, Moderate Risk is 50–79, and Unsafe is 0–49.

Match score is `location × .30 + safety × .25 + urgency × .25 + category preference × .20`. Same-city location scores 100 (otherwise 30), urgency rises near expiry, and preferences come from prior claims. The API exposes every factor.

## Main API

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Authenticated | Current user |
| POST | `/api/listings` | Donor | Create listing |
| GET | `/api/listings/available` | Charity/Admin | Donations |
| GET | `/api/listings/marketplace` | Donor | Sales |
| GET | `/api/listings/matched` | Charity | Ranked matches |
| POST | `/api/claims` | Charity | Claim donation |
| PATCH | `/api/claims/:id/collect` | Charity | Complete collection |
| POST | `/api/transactions` | Donor | Purchase |
| GET | `/api/analytics/my-stats` | Donor | Business analytics |
| GET | `/api/admin/analytics` | Admin | Platform analytics |

## ER summary

Users own food listings. Charities create claims; buyers and sellers create transactions. Listings own safety logs and generate waste-analytics outcomes. Users receive notifications and donor users may have one business profile. Child records use foreign keys.
