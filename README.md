# UTKPhys-YETI2025

## My Tool: PhysX (Physics + Extensions)

Created for the **UTK Physics Department YETI Challenge (January 2025)**  

The idea behind this project was to create a set of tools that I often find useful while conducting research, teaching, reading papers, and making presentations (+ save time by using stuff I've done in js/css before and didn't get to use last YETI) (but I did teach myself about browser extensions!). The best way to test it would be in **Google Chrome**. I have no idea how this would function on any other browser

---
## A note on the initial challenge 
1. Opening the transmission.jpg in a HEX editor revealed the bytes were flipped as per the hint in the initial email
2. My code for fixing the file is in the decoding folder, byteswitch.ipynb
3. I used binwalk to extract the files and learned about steganography!
4. I spent way too long decoding that message because I got so hung up on the first image, before I went back and read the email to see there were supposedly five images, so I am curious to know what the relationship between symbols and letters was
   
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
5. Go to details and make sure it is pinned to the toolbar
6. Right click the icon and open the sidepanel (I cannot figure out how to get this to happen automatically)
---

## Features

### 1. **Unit Converter**
   - Convert between physics-related units.  
   - Includes a wide range of unit conversions but can be easily expanded

### 2. **Equation Overlay**
   - Render, download, and search **LaTeX equations**.  (I got to use this for a talk in group meeting today it was very exciting)
   - Useful for making PowerPoint slides  
   - Search for predefined equations
     
### 3. **arXiv Search**
   - Find and save physics-related papers 
   - Allows citation copying and reference saving
   - Highlights search terms

### 4. **Saved Articles**
   - Store and manage research references.

### 5. **Coffee Counter**
   - Because I really need to drink less coffee (> 10 coffees were involved in the making of this tool)

> **Note:** While these tools already exist individually, this extension consolidates them into one tool that's easily accessible, saving tab space and improving efficiency

---

## (To-Do List)
- [ ] Expand available LaTeX equations
- [ ] More efficiently figure out how to make a glossary for units and equations. . .instead of just copying them one by one 
- [ ] Improve citation formatting, it's really bad  
- [ ] A nicer way to organize saved arXiV files (but honestly Readcube is great at this)
- [ ] Figure out why the reverse chronological ordering isn't working + generally improve the search, the way it pulls papers is really random 
- [ ] Allow for hovering/seeing the full abstracts
- [ ] Add **Dark Mode** (because it’s superior, and in that vein improve the color scheme/general UI/design)
- [ ] More easter eggs!
- [ ] Functionality in other browsers because I do not actually like Chrome 
---

## File Structure

```
physics-extension/
├── manifest.json            # Chrome extension manifest file
├── popup.js                 # JavaScript entry that initializes modules
├── background.js            # Configures the side panel on installation and opens it with icon clicks
├── sidepanel.html           # UI using a carousel layout for features
├── styles.css               # CSS for layout, colors, transitions, and animations
├── carousel.js              # Module for carousel navigation and UI updates
├── converter.js             # Module for unit conversion calculations
├── arxiv.js                 # Module for arXiv search
├── equation.js              # Module for LaTeX equation rendering and downloading
├── coffee.js                # Module for watching coffee count
└── libs/                    # Folder containing third-party libraries:
    ├── katex.min.css        # KaTeX CSS for LaTeX rendering
    ├── katex.min.js         # KaTeX JS for LaTeX rendering
    └── dom-to-image.min.js  # Library to convert DOM nodes to SVG/PNG images
└── icons/                    # Folder containing svgs and pngs for the extension icon
```
### **manifest.json**
- The manifest file for the Chrome extension
- Defines permissions, background scripts, icons, and UI elements
- Declares the side panel UI and required permissions (e.g., for storage and sidePanel)

### **popup.js**
- The main JavaScript entry point for the extension.
- Imports and initializes modules

### **sidepanel.html**
- The primary HTML UI for the extension
- Uses a carousel-based layout with separate slides for each feature
  
### **styles.css**
- Contains all the CSS styling for the extension’s UI

### **carousel.js**
- Module responsible for carousel navigation and UI updates
- Implements functions to update the carousel’s position and current accent color

### **converter.js**
- Module that handles unit conversion functionality
- Defines a comprehensive list of physics-related unit conversions
- Populates datalists for units based on the selected category
- Binds events to input elements and performs the conversion calculations
- Updates the conversion result dynamically with smooth animation effects

### **arxiv.js**
- Module for arXiv search, infinite scrolling, and managing saved articles
- Queries the arXiv API and parses XML responses to display search results
- Binds events for saving articles, copying citations, and infinite scrolling
- Provides functions to load, remove, and clear saved articles from local storage

### **equation.js**
- Module for rendering LaTeX equations and enabling downloads
- Populates a datalist for equation auto-suggestions 
- Uses KaTeX to render LaTeX code into a display element when the render button is clicked.
- Provides buttons to download the rendered equation as an SVG or png

### **libs/**
- **katex.min.css** and **katex.min.js**
  - Sourced from the [KaTeX GitHub Repository](https://github.com/KaTeX/KaTeX)
  - KaTeX is used to render LaTeX equations quickly and with high quality.
- **dom-to-image.min.js**
  - Sourced from the [dom-to-image GitHub Repository](https://github.com/tsayen/dom-to-image)
  - dom-to-image converts DOM nodes into downloadable SVG/PNG images, enabling the equation download feature.
``



## Acknowledgements 
### **KaTeX:** 
KaTeX is used to render LaTeX equations (citation above)
### **dom-to-image** 
Used to convert equations to pngs (citations above)
### **ChatGPT-4o** 
For helping me debug my carousel feature when it kept scrolling at weird increments + the arXiv search 
### **arXiv API** 
This part of the extension uses the arXiv API to fetch research papers. Acknowledgements to Cornell University for providing access to this

## Easter Eggs
There are a few easter eggs hidden in the extension. I think it’s more fun to find them yourself, but the running list can be found in `easter.txt`.
