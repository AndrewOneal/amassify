# Requirements

## Front End
* Login Page
  * Login with spotify button
* Profile Page
  * Profile Pic
  * Display of Username
  * Top Tracks
  * Top Artists
* Ratings
  * Tab display for: 
    * Top 50 Artists
    * Top 25 Albums
    * Top 50 Songs
  * Add button for each one, opens modal search feature within
    * Selected object for type
  * Delete button on each item
  * Drag and Drop type to reorder
* Data Insights
  * How popular their music taste is
  * Top artist genres
  * Top song genres
  * Recent Song Genres
  * Top audio features
  * Recent audio features

## Back End

### Spotify API functions
* Get User access token
* Get User profile info
* Get User top tracks for 4 weeks, 6 months, and 1 year
* Get User top artists for 4 weeks, 6 months, and 1 year
* Get User recent tracks

### PocketBase Functions
* Put new user login data (Spotify username, user id)
* Put new user top artists, songs, and tracks lists
* Get user login data (Spotify username, user id)
* Get user top artists, songs, and tracks lists
* Update user top artists, songs, and tracks lists
* Delete user login data (Spotify username, user id)
* Delete user top artists, songs, and tracks lists
