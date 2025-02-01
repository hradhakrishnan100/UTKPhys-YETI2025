// equation.js: Module for LaTeX equation rendering and downloading
export const EquationModule = (() => {
  // Predefined equations 
  const predefinedEquations = {
    "Quadratic Formula": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    "Euler's Identity": "e^{i\\pi} + 1 = 0",
    "Pythagorean Theorem": "a^2 + b^2 = c^2",
    "Newton's Second Law": "F = m \\times a",
    "Mass–Energy Equivalence": "E = mc^2",
    "Ideal Gas Law": "PV = nRT",
    "Ohm's Law": "V = IR",
    "Gravitational Force": "F = G \\frac{m_1 m_2}{r^2}",
    "Coulomb's Law": "F = k \\frac{q_1 q_2}{r^2}",
    "Time-Independent Schrödinger Equation": "-\\frac{\\hbar^2}{2m}\\nabla^2\\psi + V\\psi = E\\psi",
    "Time-Dependent Schrödinger Equation": "i\\hbar\\frac{\\partial \\psi}{\\partial t} = \\hat{H}\\psi",
    "Gauss's Law": "\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{enc}}{\\varepsilon_0}",
    "Maxwell's Equations": "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0} \\quad \\nabla \\cdot \\mathbf{B} = 0 \\quad \\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t} \\quad \\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\varepsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}",
    "Euler-Lagrange Equation": "\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}}\\right) - \\frac{\\partial L}{\\partial q} = 0"
  };

  // Populate the datalist with the keys from predefinedEquations
  function populateEquationList() {
    let datalist = document.getElementById("equationList");
    if (!datalist) {
      // If no datalist exists in the HTML, create one and append it to the body
      datalist = document.createElement("datalist");
      datalist.id = "equationList";
      document.body.appendChild(datalist);
    }
    // Clear any existing options
    datalist.innerHTML = "";
    Object.keys(predefinedEquations).forEach(key => {
      const option = document.createElement("option");
      option.value = key;
      datalist.appendChild(option);
    });
  }

  function init() {
    // Get DOM elements
    const eqSearch = document.getElementById("eq-search");
    const latexInput = document.getElementById("latex-input");
    const renderBtn = document.getElementById("render-btn");
    const output = document.getElementById("equation-output");
    const downloadSvgBtn = document.getElementById("download-svg-btn");
    const downloadPngBtn = document.getElementById("download-png-btn");

    // Populate the datalist with suggestions
    populateEquationList();

    // Auto-populate the LaTeX code when an equation is selected/typed
    if (eqSearch) {
      eqSearch.addEventListener("change", () => {
        const selected = eqSearch.value;
        const foundKey = Object.keys(predefinedEquations).find(key =>
          key.toLowerCase() === selected.toLowerCase()
        );
        if (foundKey) {
          latexInput.value = predefinedEquations[foundKey];
        }
      });
    }

    // Render the equation when the "Render Equation" button is clicked
    if (renderBtn) {
      renderBtn.addEventListener("click", () => {
        try {
          katex.render(latexInput.value, output, {
            throwOnError: false,
            displayMode: true
          });
        } catch (error) {
          output.innerHTML = "<span style='color: red;'>Error rendering LaTeX.</span>";
        }
      });
    }

    // Download SVG with transparent background
    if (downloadSvgBtn) {
      downloadSvgBtn.addEventListener("click", () => {
        domtoimage.toSvg(output, { bgcolor: 'transparent' })
          .then(dataUrl => {
            const link = document.createElement('a');
            link.download = 'equation.svg';
            link.href = dataUrl;
            link.click();
          })
          .catch(error => {
            console.error('Error generating SVG:', error);
          });
      });
    }

    // Download PNG with a white background
    if (downloadPngBtn) {
      downloadPngBtn.addEventListener("click", () => {
        domtoimage.toPng(output, { bgcolor: 'white' })
          .then(dataUrl => {
            const link = document.createElement('a');
            link.download = 'equation.png';
            link.href = dataUrl;
            link.click();
          })
          .catch(error => {
            console.error('Error generating PNG:', error);
          });
      });
    }
  }

  return { init };
})();
