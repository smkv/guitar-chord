class GuitarChordVariations extends HTMLElement {
    static observedAttributes = ['name', 'color', 'background-color', 'muted-string-color', 'open-string-notes'];

    constructor() {
        super();
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = '';
        if (this.name) {
            let names = Object.keys(GuitarChord.CHORDS)
                .filter(n => n === name || n.startsWith(this.name + '('))
            for (let name of names) {
                let guitarChord = document.createElement('guitar-chord');
                guitarChord.name = name;
                guitarChord.color = this.color;
                guitarChord.backgroundColor = this.backgroundColor;
                guitarChord.mutedStringColor = this.mutedStringColor;
                guitarChord.openStringNotes = this.openStringNotes;
                this.shadowRoot.append(guitarChord);
            }
        }
    }

    get name() {
        return this.getAttribute('name') || '';
    }

    set name(value) {
        this.setAttribute('name', value);
    }

    get color() {
        return this.getAttribute('color') || '#000000';
    }

    set color(value) {
        this.setAttribute('color', value);
    }

    get backgroundColor() {
        return this.getAttribute('background-color') || '#FFFFFF';
    }

    set backgroundColor(value) {
        this.setAttribute('background-color', value);
    }

    get mutedStringColor() {
        return this.getAttribute('muted-string-color') || '#D70040';
    }

    set mutedStringColor(value) {
        this.setAttribute('muted-string-color', value);
    }

    get openStringNotes() {
        return this.getAttribute('open-string-notes')?.split('|') || ['E', 'A', 'D', 'G', 'B', 'E'];
    }

    set openStringNotes(values) {
        this.setAttribute('open-string-notes', values?.join('|'));
    }
}

customElements.define('guitar-chord-variations', GuitarChordVariations);

