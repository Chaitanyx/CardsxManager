# CardXManager

CardXManager is a local-first credit card manager built with Next.js, TypeScript, and Tailwind CSS. It helps you track card spends, billing cycles, rewards, shared limits, and analytics in one place with a clean liquid-glass UI.

## Project Illustration

The app is designed around a visual card-first experience:

- Large illustrated card faces on the dashboard
- Bank-specific branding and card variant previews
- Add Card and Add Spend flows with graphical selection panels
- Rewards, statement, and analytics views with category icons and charts

## Main Steps

1. Open the dashboard.
2. Click Add Card to launch the full-screen card setup flow.
3. Choose a bank, then pick the card from the illustrated preview grid.
4. Select the network, sub-network, statement date, due date, limit, and reward type.
5. Add spends from the card detail page with merchant, category, amount, date, time, and reward settings.
6. Review statement, rewards, and analytics summaries.
7. Clear statement dues when needed and keep unbilled spends separate.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Features

- Add and manage multiple credit cards
- Bank-wise card database with illustrated previews
- Cashback, reward points, and miles tracking
- Shared limit support for related cards
- Statement and unbilled spend separation
- Transaction editing and deletion
- Analytics with category and card breakdowns
- CSV import and export for backup and restore

## Data Structure

Credit card data is split by bank inside `data/creditCards/`, with a central aggregator in `data/creditCards/index.ts`.

## Folder Highlights

- `app/` - routes, dashboard, analytics, and card detail screens
- `components/` - card UI, spend modal, detail views, layout, and shared controls
- `data/` - bank-wise credit card database
- `hooks/` - local state helpers for cards and transactions
- `lib/` - billing logic, reward formatting, CSV helpers, and storage utilities
- `types/` - shared TypeScript types

## Notes

- Data is stored locally in the browser.
- The UI uses a white and grey glass aesthetic with card illustrations.
- Some card and bank details are sample-based and can be expanded with verified sources later.
