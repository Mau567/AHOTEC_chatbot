# Cleanup: Unused Code and Optional Removals

## Already removed

- **`components/MapModal.tsx`** – Not imported anywhere (was referenced in docs as "comentado").
- **`package.json`** – Removed unused dependencies:
  - `clsx`
  - `next-auth` (auth uses `jsonwebtoken` only)
  - `tailwind-merge`

Run `npm install` after the package.json change to update the lockfile.

---

## Optional larger cleanups

### 1. Guided chatbot code in `app/page.tsx`

The guided (step-by-step) chatbot is hidden with `SHOW_GUIDED_CHATBOT = false`. You can remove it entirely to simplify the page:

- **State to remove:** `chatStep`, `userLocation`, `userHotelType`, `hotelResults`, `noResults`, `selectedHotel`, `hotelTypeOptions`, and the constant `SHOW_GUIDED_CHATBOT`.
- **Handlers to remove:** `handleSendGuidedQuery`, `handleChatReset`, and `formatRecreationAreas` (only used in the guided results block).
- **UI to remove:** The whole block wrapped in `{SHOW_GUIDED_CHATBOT && ( <> ... </> )}` (location → type → results steps and the reset button).

This would remove roughly 150+ lines. The free-form chatbot and hotel form would be unchanged.

### 2. Unused Mistral helpers in `lib/mistral.ts`

The chat API only uses `freeFormChatbot`. The rest is legacy from the guided/semantic flow and is unused:

- `isGenericQuery`
- `buildHotelKeywords`
- `findMatchingHotelsByKeywords`
- `getHotelRecommendations`
- `getHotelsBySemanticLocation`

Plus all the helpers/constants they use (e.g. `AIRPORT_SYNONYMS`, `LANDMARK_CITY_MAP`, `textIncludesAny`, `resolveLandmarkCity`, `resolveAirportCity`, `hotelHasAirportSignal`, `isGenericAirportQuery`, `Hotel` type if only used there).

Removing these would cut a few hundred lines from `lib/mistral.ts`. Only do this if you are sure you will not reuse the guided/semantic search later.

---

## Summary

| Item                         | Status        | Action                    |
|-----------------------------|---------------|---------------------------|
| MapModal.tsx                | Removed       | Deleted                   |
| clsx, next-auth, tailwind-merge | Removed    | Removed from package.json |
| Guided block in page.tsx    | Optional      | Remove if you won’t use it |
| Mistral guided/semantic code| Optional      | Remove if you won’t use it |
