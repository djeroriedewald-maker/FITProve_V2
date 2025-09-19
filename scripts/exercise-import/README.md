# Exercise Import Pipeline

Deze map bevat scripts om grote gratis exercise databases te combineren en te importeren in jouw Supabase exercise library.

## Bronnen
- **ExerciseDB**: https://github.com/justinmeza/exercisedb (JSON, veel GIFs)
- **Everkinetic**: https://github.com/everkinetic/data (JSON/CSV, SVG/PNG images)
- **Open Source GitHub datasets**: handmatig te selecteren, bijv. https://github.com/jeremyschlatter/open-exercise-db

## Stappen
1. Download de datasets (zie bronnen hierboven).
2. Gebruik het script `combine-exercises.ts` om alles te mappen naar het bestaande ExerciseImportData formaat.
3. Gebruik je bestaande bulk import script om de gecombineerde data in Supabase te laden.

## Mapping eisen
- Elke oefening moet minimaal bevatten: naam, uitleg, instructies, afbeelding/gif, spiergroepen, equipment, difficulty.
- Media (image_url, gif_url) moet een directe link zijn (of lokaal gehost worden).
- Duplicaten worden gefilterd op naam + spiergroep + equipment.

## Let op
- Controleer rechten/licentie van de brondata (alle genoemde bronnen zijn open source).
- Test eerst met een kleine subset voordat je alles importeert.
