# Homeroom

A student housing website that matches students with on-campus and off-campus places near a (fictional) Hartwell University.

- **Quiz first:** budget, roommates, commute, amenities and lease length, with a live map of places that fit.
- **Top 4 matches:** each with a match score, reasons and trade-offs, and an expandable full listing (photos, location, price, property details, landlord info, reviews).
- **Housing assistant:** a chat beside the results that answers questions about the listings.
- **Browse:** every listing as a photo card next to an interactive map.
- **Contact and tours:** message a landlord or book a tour from any listing.

## Run it

Open `index.html` in a browser. There's no build step.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page markup |
| `styles.css` | Design tokens (light and dark) and component styles |
| `data.js` | Quiz options, listings and map data. Edit this to use real listings. |
| `match.js` | Scoring and commute times |
| `art.js` | Generated listing illustrations and the campus map |
| `app.js` | Quiz, results, browse map, dialogs and the assistant |

## Notes

- All listings, landlords and the university are demo data.
- Messages and tour requests are saved only in the visitor's browser. Nothing is sent.
- Outside claude.ai, the assistant runs in basic mode and answers common questions from the listing data.
