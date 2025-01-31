# UTKPhys-YETI2025

## My Tool: PhysX (Physics + Extensions)

Created for the **UTK Physics Department YETI Challenge (January 2025)**  

The idea behind this project was to create a set of tools that I often find useful while conducting research, teaching, reading papers, and making presentations. This is not available on any browsers. The best way to test it would be in **Google Chrome**.

---

## How to Install Locally

1. Clone this repository:  
   ```sh
   git clone https://github.com/hradhakrishnan100/YETI2025.git
   ```
2. Open **Google Chrome** and navigate to:  
   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode** (top right).
4. Click **Load Unpacked** and select the `physics-extension` folder.

---

## Features

### 1. **Unit Converter**
   - Convert between physics-related units.  
   - Includes a wide range of unit conversions but can be easily expanded.

### 2. **Equation Overlay**
   - Render, download, and search **LaTeX equations**.  
   - Useful for making PowerPoint slides.  
   - Search for predefined equations such as:
     - Kinematics equations  
     - Coulomb force equation  
     - Gravitational force equation  
     - Schrödinger’s time-dependent & time-independent equations  
     - More can be added, I ran out of time
### 3. **arXiv Search**
   - Find and save physics-related papers.  
   - Allows citation management and reference saving.
   - Highlights search terms

### 4. **Saved Articles**
   - Store and manage research references.  

> **Note:** While these tools already exist individually, this extension consolidates them, saving tab space and improving efficiency.

---

## Future Improvements (To-Do List)
- [ ] Expand **glossary/explanations** for LaTeX equations.  
- [ ] Improve **citation formatting** for better readability and accuracy.  
- [ ] Enhance saved arXiv articles with **folders** for organization.  
- [ ] Implement **date filtering, pagination, and reverse chronological sorting** for arXiv search.
- [ ] Allow for abstract **expansion**
- [ ] Add **Dark Mode** (because it’s superior).  

---

## File Structure

```
physics-extension/
│── manifest.json
│── popup.js
│── sidepanel.html
│── styles.css
```

### **manifest.json**
- The manifest file for the Chrome extension.  
- Defines permissions, content scripts, background scripts, and UI elements.  
- Declares the popup UI and permissions for arXiv API access.  

### **popup.js**
- The main JavaScript file handling logic for the extension.  
- Manages carousel navigation between features.  
- Handles unit conversion calculations.  
- Fetches and displays arXiv papers.  
- Manages saving and removing articles from storage.  

### **sidepanel.html**
- The main UI of the extension.  
- Contains a carousel-based navigation system (Unit Converter, Equation Renderer, arXiv Search, Saved Papers).  
- Includes search input for arXiv research.  

### **styles.css**
- Defines the styling for the extension’s UI.  
- Includes themes, button styles, animations, and carousel layouts.  
- Uses distinct color accents to differentiate features.  

---

## Easter Eggs
There are several **easter eggs** hidden in the extension. I think it’s more fun to find them yourself, but a full list can be found in `easter.txt`.
