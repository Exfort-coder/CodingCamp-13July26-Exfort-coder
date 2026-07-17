# Design

## UI Layout

- **Top bar / Header**
  - Live greeting section:
    - Greeting text (time-of-day based)
    - Custom name input (saved in LocalStorage)
    - Current time + date
  - Right side actions:
    - Light/Dark mode toggle

- **Main grid** (responsive)
  - **Card 1: Focus Timer (Pomodoro)**
    - Large timer display
    - Start / Stop / Reset controls
    - Input to change Pomodoro minutes + Apply button

  - **Card 2: To-Do List**
    - Task input + Add button
    - Sort dropdown + Clear Done button
    - List of tasks:
      - Checkbox for done/undone
      - Edit and Delete actions

  - **Card 3: Quick Links**
    - Input fields for site title + URL
    - Save button
    - List of favorite links with Open and Delete
    - Clear all button

## Visual Style

- Clean card-based layout
- Theme controlled using CSS variables
- Dark mode default; light mode available via toggle
- Buttons and inputs styled for clarity and readability

## Data Model (LocalStorage)

- `tld_theme_v1`: theme ('dark' | 'light')
- `tld_name_v1`: custom greeting name
- `tld_pomodoro_minutes_v1`: Pomodoro duration in minutes
- `tld_tasks_v1`: array of tasks
  - `{ id, title, done, createdAt, updatedAt }`
- `tld_links_v1`: array of links
  - `{ id, title, url, createdAt }`

## Interactions

- Timer
  - Start runs countdown; Stop pauses; Reset returns to configured duration
  - Apply updates Pomodoro duration and refreshes display

- Tasks
  - Add inserts new task (newest first)
  - Edit replaces task title inline
  - Checkbox toggles done and re-saves
  - Delete removes item
  - Sorting is applied at render-time based on selected option

- Links
  - Save validates and normalizes URL (adds https:// if missing)
  - Open opens in new tab
  - Delete removes item
  - Clear All wipes favorites
