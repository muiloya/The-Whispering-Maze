export class StartScreen {
    /**
     * @param {Function} onStart called when user presses any key or clicks
     */
    constructor(onStart) {
      this.onStart = onStart;
      // Create overlay container
      this.container = document.createElement('div');
      Object.assign(this.container.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        backgroundColor: '#555',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffcc00',
        fontFamily: 'sans-serif',
        zIndex: '10000'
      });
  
      // Title
      const title = document.createElement('h1');
      title.textContent = 'The Whispering Maze';
      Object.assign(title.style, {
        fontSize: '48px',
        marginBottom: '20px'
      });
      this.container.appendChild(title);

      // Rule box container
      const ruleBox = document.createElement('div');
      Object.assign(ruleBox.style, {
        backgroundColor: 'rgba(0,0,0,0.3)',
        border: '2px solid #ffcc00',
        borderRadius: '8px',
        padding: '20px',
        margin: '0 20px',
        textAlign: 'center'
      });
  
      // The Poem
      const lines = [
        'In a world unknown, you’re trapped, you’re alone',
        'All dark and empty and nowhere to go home.',
        'But seek the one who’s rarely seen,',
        'He floats around, all ghostly green.',
        'He holds the path, He knows the key,',
        'To set you loose and set you free.',
        'So find him fast, if you dare to play',
        'Oh he shall point you toward the way!'
      ];
      for (const text of lines) {
        const p = document.createElement('p');
        p.textContent = text;
        Object.assign(p.style, {
          color: '#ffffff',
          fontSize: '20px',
          margin: '4px 0',
          fontFamily: 'Times New Roman'
        });
        ruleBox.appendChild(p);
      }
      this.container.appendChild(ruleBox);
  
      // Prompt
        // Prompt (highlighted)
    const prompt = document.createElement('p');
    prompt.textContent = 'Press any button to start the game';
    Object.assign(prompt.style, {
      fontSize: '16px',
      marginTop: '40px',
      backgroundColor: '#ffcc00',
      color: '#555',
      padding: '10px 20px',
      borderRadius: '6px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.3s ease-in-out'
    });
    // simple hover effect
    prompt.addEventListener('mouseenter', () => {
      prompt.style.transform = 'scale(1.1)';
    });
    prompt.addEventListener('mouseleave', () => {
      prompt.style.transform = 'scale(1)';
    });
    this.container.appendChild(prompt);

    document.body.appendChild(this.container);
  
      // Bind events
      this._onKey = this._onKey.bind(this);
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('mousedown', this._onKey);
    }
  
    _onKey() {
      this.destroy();
      this.onStart();
    }
  
    destroy() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('mousedown', this._onKey);
      if (this.container.parentElement) {
        this.container.parentElement.removeChild(this.container);
      }
    }
  }
  