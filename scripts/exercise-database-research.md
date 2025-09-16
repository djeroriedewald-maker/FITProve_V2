# Free Exercise Database Research

## Top GitHub Exercise Databases (Free & Open Source)

### 1. **wger Exercise Database** 
- **Repository**: https://github.com/wger-project/wger
- **Data**: https://github.com/wger-project/wger/tree/master/wger/exercises/fixtures
- **Content**: 200+ exercises with muscle groups, equipment, instructions
- **Format**: JSON fixtures, API available
- **License**: AGPL (open source)
- **Languages**: Multiple languages including English
- **Quality**: High - professional fitness application

### 2. **Everkinetic Exercises**
- **Repository**: https://github.com/everkinetic/data
- **Content**: 100+ exercises with muscle groups, equipment
- **Format**: JSON/CSV
- **License**: MIT (very permissive)
- **Quality**: Good - focused on muscle group classification

### 3. **Exercise Database API**
- **Repository**: https://github.com/yuhonas/free-exercise-db
- **Content**: 800+ exercises with images, muscle groups, instructions
- **Format**: JSON with image URLs
- **License**: Public domain/CC0
- **Quality**: Excellent - includes images and detailed data

### 4. **FitnessApp Exercises**
- **Repository**: https://github.com/jamesgeorge007/fitness-app-exercises
- **Content**: 300+ exercises with muscle groups, equipment, instructions
- **Format**: JSON
- **License**: MIT
- **Quality**: Good - clean structured data

### 5. **Open Exercise Dataset**
- **Repository**: https://github.com/parkerhiggins/exercises
- **Content**: Basic exercise list with muscle groups
- **Format**: CSV/JSON
- **License**: Public domain
- **Quality**: Basic but clean

## Recommended Strategy

### Primary Source: **yuhonas/free-exercise-db**
- **Pros**: 
  - Largest dataset (800+ exercises)
  - Includes images
  - Public domain license (no restrictions)
  - Well-structured JSON format
  - Active maintenance

### Secondary Source: **wger-project**
- **Pros**:
  - High quality professional data
  - Multiple languages
  - Detailed instructions
  - Muscle group classifications
  - Used by real fitness applications

### Data Processing Pipeline:
1. **Download** JSON data from both sources
2. **Merge and deduplicate** exercises by name similarity
3. **Standardize** muscle group names to our schema
4. **Clean and validate** data (remove incomplete entries)
5. **Enhance** with YouTube search for video content
6. **Import** to Supabase in batches

## Next Steps:
1. Execute the database schema in Supabase
2. Download exercise data from selected repositories
3. Create data processing scripts
4. Import exercises to database
5. Update frontend to use live data

## Estimated Timeline:
- Database setup: 10 minutes
- Data download and processing: 30 minutes  
- Import scripts: 20 minutes
- Frontend updates: 15 minutes
- **Total: ~75 minutes to live 800+ exercise database**