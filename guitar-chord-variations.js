/* MIT License

Copyright (c) 2025 Andrei Samkov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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

