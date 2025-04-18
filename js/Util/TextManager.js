import * as THREE from 'three';

export class TextManager {
    constructor() {
        this.textElements = new Map(); // Store references to text elements
    }

    createText(id, text, position = null, style = {}) {
        // Get the browser window's width and height
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Default position near the bottom-center of the screen
        if (!position) {
            position = { 
                x: windowWidth / 2, // 50% of the screen width
                y: windowHeight * 0.9 // 90% from the top of the screen
            };
        }
        if (this.textElements.has(id)) {
            this.removeText(id);
        }

        // Create a div element for the text
        const textElement = document.createElement('div');
        textElement.textContent = text;

        // Set default styles
        textElement.style.position = 'absolute';
        textElement.style.color = 'black';
        textElement.style.fontSize = '24px';
        textElement.style.pointerEvents = 'none';  // Prevent it from blocking clicks
        textElement.style.zIndex = 10;

        // Apply custom styles if provided
        Object.assign(textElement.style, style);

        // Set the position based on screen coordinates
        textElement.style.left = `${position.x}px`;
        textElement.style.top = `${position.y}px`;

        // Append the text element to the body
        document.body.appendChild(textElement);

        // Store the reference
        this.textElements.set(id, textElement);

        return textElement; // Optionally return the created element
    }

    // Remove text by ID
    removeText(id) {
        if (this.textElements.has(id)) {
            const textElement = this.textElements.get(id);
            document.body.removeChild(textElement);
            this.textElements.delete(id);
        }
    }

    // Remove all text elements
    removeAllTexts() {
        this.textElements.forEach((textElement, id) => {
            document.body.removeChild(textElement);
            this.textElements.delete(id);
        });
    }
}
