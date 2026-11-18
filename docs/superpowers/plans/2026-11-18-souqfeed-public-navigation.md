# Home redesign and public navigation

Requested 2026-11-18: make the home page richer (banner and mobile layout
inspired by a reference site, more sections, the mascot in different states),
then build the WTB page, a suppliers directory, a categories mega menu and
working header menus.

## Home

Rounded hero banner with the live feed drawn as a phone, feature cards, a
messy-WhatsApp-to-clean-offers section, a brand strip, a bolder supplier
banner. Mobile: compact banner, info cards, search, a 4-column category grid
whose last slot opens a bottom sheet with every category. Every section shares
one 1240px container. Display headings use Plus Jakarta Sans; the rest of the
app keeps Geist.

## Navigation

- Header: Market, Categories (mega menu), Suppliers, WTB Requests, How It
  Works. "Insights" is removed until Phase 12 gives it content.
- Mega menu: top-level categories on the left (taxonomy order), the hovered
  category's subcategories in columns, a WTB card on the right. Opens on hover
  or click; a click while it is open from hover pins it; Esc, outside click or
  a page change closes it. Data comes from `getCategoryMenu()` (cached 60 s,
  falls back to the built-in taxonomy if the database is unreachable) and is
  passed down from the root layout.
- Mobile: the menu sheet has a Categories accordion; the bottom nav links to
  WTB and Suppliers.
- Links filter `/search?category=<id>`, which already includes subcategories.

## Pages

- `/categories`: every top-level category as a card with its subcategories.
  Live counts show once the market has live offers.
- `/suppliers`: directory with search, category, area, verified and sort
  filters as a plain GET form. Live mode lists every active supplier with its
  live offer count; while the market has no live offers it shows the demo
  suppliers with the sample notice (the home page's rule).
- `/wtb`: sample want-to-buy requests with a notice. Real requests need a table,
  a posting flow and a supplier response path, which stay a post-launch phase;
  "Post a request" opens sign-up. "Find a match" searches the market for the
  request's title.

## Verification

Unit tests for the menu builder, link builder and directory filters. Docker:
hover and click the mega menu, follow a subcategory link, filter the directory,
check desktop and mobile layouts and that mobile has no horizontal scroll.
