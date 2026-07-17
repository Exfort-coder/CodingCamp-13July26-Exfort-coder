# Requirements

## Technical Constraints

### TC-1: Technology Stack

- **HTML** for structure
- **CSS** for styling
- **Vanilla JavaScript** (no frameworks)
- No backend server required

### TC-2: Data Storage

- Use **browser Local Storage** (`localStorage`)
- All data stored client-side only

### TC-3: Browser Compatibility

- Must work in modern browsers: **Chrome, Firefox, Edge, Safari**
- Can be used standalone web app

## Non-Functional Requirements

### NFR-1: Simplicity

- Clean, minimal interface
- Easy to understand and use
- No complex setup required

### NFR-2: Performance

- Fast load time
- Responsive UI interactions
- No noticeable lag when updating data

### NFR-3: Visual Design

- User-friendly aesthetic
- Clear visual hierarchy
- Readable typography

## MVP Features (Required)

1. **Greeting**
   - Show current time and date
   - Show greeting based on time of day
2. **Focus Timer**
   - 25-minute timer (Pomodoro)
   - Start, stop, reset buttons
3. **To-Do List**
   - Add tasks
   - Edit tasks
   - Mark tasks as done
   - Delete tasks
   - Persist tasks using LocalStorage
4. **Quick Links**
   - Buttons/links that open favorite websites
   - Links saved in LocalStorage

## Added Features

- Light/Dark mode
- Custom name in greeting
- Change Pomodoro time
- Sort tasks
