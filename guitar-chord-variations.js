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
        if (this.shadowRoot) {
            this.render();
        }
    }

    render() {
        this.shadowRoot.innerHTML = '';
        if (this.name) {
            let names = Object.keys(GuitarChord.CHORDS)
                .filter(n => n === this.name || n.startsWith(this.name + '['))
                .sort(this._sortByFretAndVersion.bind(this));
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

    _sortByFretAndVersion(a, b) {
        a = this._nameToFretVersion(a);
        b = this._nameToFretVersion(b);
        if (a.length !== b.length) {
            return a.length - b.length;
        }

        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return a[i] - b[i];
            }
        }

        return 0;
    }

    _nameToFretVersion(name) {
        const regex = /.+\[(\d+)(-(\d+))?]/;
        let result = regex.exec(name);
        return [
            result && result[1] ? parseInt(result[1]) : 0,
            result && result[3] ? parseInt(result[3]) : 1,
        ];
    }

    get name() {
        return this.getAttribute('name') || '';
    }

    set name(value) {
        this.setAttribute('name', value);
    }

    get color() {
        return this.getAttribute('color') || '';
    }

    set color(value) {
        this.setAttribute('color', value);
    }

    get backgroundColor() {
        return this.getAttribute('background-color') || '';
    }

    set backgroundColor(value) {
        this.setAttribute('background-color', value);
    }

    get mutedStringColor() {
        return this.getAttribute('muted-string-color') || '';
    }

    set mutedStringColor(value) {
        this.setAttribute('muted-string-color', value);
    }

    get openStringNotes() {
        return this.getAttribute('open-string-notes')?.split('|') || ['E', 'A', 'D', 'G', 'B', 'e'];
    }

    set openStringNotes(values) {
        this.setAttribute('open-string-notes', values?.join('|'));
    }
}

customElements.define('guitar-chord-variations', GuitarChordVariations);

