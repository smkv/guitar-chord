class GuitarChord extends HTMLElement {
    static observedAttributes = ['name', 'value', 'color', 'background-color', 'silent-string-color', 'string-notes'];

    constructor() {
        super();
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    render() {
        const svgNamespace = 'http://www.w3.org/2000/svg';
        this.shadowRoot.innerHTML = '';
        const model = this.model;
        const width = 160;
        const height = 160;
        const stringsStartTop = 30;
        const xMargin = 25;
        const fingerRadius = 9;

        const svg = document.createElementNS(svgNamespace, 'svg');
        svg.setAttribute('xmlns', svgNamespace);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('style', `font-family: Arial, sans-serif; background-color: ${this.backgroundColor};`);

        const text = document.createElementNS(svgNamespace, 'text');
        text.setAttribute('x', String(width / 2));
        text.setAttribute('y', '15');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', '900');
        text.textContent = this.name;
        svg.append(text);

        const fretSpace = (height - stringsStartTop - 10) / model.visibleFretCount;
        for (let i = 0; i < model.visibleFretCount; i++) {
            const y = stringsStartTop + (fretSpace * i);
            const fret = document.createElementNS(svgNamespace, 'line');
            fret.setAttribute('x1', String(xMargin - 1));
            fret.setAttribute('y1', String(y));
            fret.setAttribute('x2', String(width - xMargin + 1));
            fret.setAttribute('y2', String(y));
            fret.setAttribute('stroke', this.color);
            fret.setAttribute('stroke-width', model.startFret + i === 1 ? '5' : '1');
            svg.append(fret);

            const fretLabel = document.createElementNS(svgNamespace, 'text');
            fretLabel.setAttribute('x', String(xMargin - 10));
            fretLabel.setAttribute('y', String(stringsStartTop + (fretSpace * i) + (fretSpace / 2) + 4));
            fretLabel.setAttribute('text-anchor', 'end');
            fretLabel.setAttribute('font-size', '12');
            fretLabel.textContent = String(model.startFret + i);
            svg.append(fretLabel);
        }

        const stringSpace = (width - xMargin - xMargin) / (model.strings.length - 1);
        let bareStart = 0;
        let bareEnd = 0;
        let bareY = 0;

        for (let i = 0; i < model.strings.length; i++) {
            const x = stringSpace * i + xMargin;
            if (model.strings[i].fret && model.strings[i].finger === 1) {
                bareStart = bareStart === 0 ? x : Math.min(bareStart, x);
                bareEnd = bareEnd === 0 ? x : Math.max(bareEnd, x);
                bareY = stringsStartTop + (fretSpace * (model.strings[i].fret - model.startFret)) + (fretSpace / 2);
            }
        }


        if (bareStart !== bareEnd) {
            const bare = document.createElementNS(svgNamespace, 'line');
            bare.setAttribute('x1', String(bareStart));
            bare.setAttribute('y1', String(bareY));
            bare.setAttribute('x2', String(bareEnd));
            bare.setAttribute('y2', String(bareY));
            bare.setAttribute('stroke', this.color);
            bare.setAttribute('stroke-width', String(fingerRadius * 2));
            bare.setAttribute('stroke-opacity', '0.5');
            svg.append(bare);
        }

        for (let i = 0; i < model.strings.length; i++) {
            const x = stringSpace * i + xMargin;
            const string = document.createElementNS(svgNamespace, 'line');
            string.setAttribute('x1', String(x));
            string.setAttribute('y1', String(stringsStartTop));
            string.setAttribute('x2', String(x));
            string.setAttribute('y2', String(height - 10));
            string.setAttribute('stroke', model.strings[i].fret === null ? this.silentStringColor : this.color);
            string.setAttribute('stroke-width', '1.5');
            svg.append(string);

            const label = document.createElementNS(svgNamespace, 'text');
            label.setAttribute('x', String(x));
            label.setAttribute('y', String(stringsStartTop - 5));
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12');
            if (model.strings[i].fret == null) {
                label.setAttribute('stroke', this.silentStringColor);
                label.textContent = 'x';
            } else if (model.strings[i].fret === 0) {
                label.textContent = 'o';
            } else {
                label.textContent = '';
            }
            svg.append(label);

            if (model.strings[i].fret) {
                const fingerY = stringsStartTop + (fretSpace * (model.strings[i].fret - model.startFret)) + (fretSpace / 2);
                const finger = document.createElementNS(svgNamespace, 'circle');
                finger.setAttribute('cx', String(x));
                finger.setAttribute('cy', String(fingerY));
                finger.setAttribute('r', String(fingerRadius));
                finger.setAttribute('fill', this.color);
                svg.append(finger);

                if (model.strings[i].finger !== 0) {
                    const fingerLabel = document.createElementNS(svgNamespace, 'text');
                    fingerLabel.setAttribute('x', String(x));
                    fingerLabel.setAttribute('y', String(fingerY + 5));
                    fingerLabel.setAttribute('text-anchor', 'middle');
                    fingerLabel.setAttribute('font-size', '12');
                    fingerLabel.setAttribute('fill', this.backgroundColor);
                    fingerLabel.textContent = String(model.strings[i].finger);
                    svg.append(fingerLabel);
                }
            }

            const note = document.createElementNS(svgNamespace, 'text');
            note.setAttribute('x', String(x));
            note.setAttribute('y', String(height));
            note.setAttribute('text-anchor', 'middle');
            note.setAttribute('font-size', '10');
            note.setAttribute('font-weight', '600');
            note.textContent = this.stringNotes[i] || '';
            svg.append(note);
        }

        this.shadowRoot.append(svg);
    }

    get name() {
        return this.getAttribute('name') || '';
    }

    set name(value) {
        this.setAttribute('name', value);
    }

    get value() {
        return this.getAttribute('value') || GuitarChord.CHORDS[this.name] || '';
    }

    set value(value) {
        this.setAttribute('value', value);
    }

    get color() {
        return this.getAttribute('color') || 'black';
    }

    set color(value) {
        this.setAttribute('color', value);
    }

    get backgroundColor() {
        return this.getAttribute('background-color') || 'white';
    }

    set backgroundColor(value) {
        this.setAttribute('background-color', value);
    }

    get silentStringColor() {
        return this.getAttribute('silent-string-color') || '#D70040';
    }

    set silentStringColor(value) {
        this.setAttribute('silent-string-color', value);
    }

    get stringNotes() {
        return this.getAttribute('string-notes')?.split('|') || ['E', 'B', 'G', 'D', 'A', 'E'];
    }

    set stringNotes(values) {
        this.setAttribute('string-notes', values?.join('|'));
    }

    get model() {
        let split = this.value.split('|').filter(Boolean);
        let strings = [];
        let stringPattern = /o|x|\d+(-(\d))?/i;
        for (let i = 0; i < split.length; i++) {
            let fret = 0;
            let finger = 0;
            let error = false;
            let item = split[i];
            let result = stringPattern.exec(item);
            if (result !== null) {
                if (result[0] === 'o') {
                    fret = 0;
                } else if (result[0] === 'x') {
                    fret = null;
                } else {
                    fret = parseInt(result[0]);
                    if (result[2]) {
                        finger = parseInt(result[2]);
                    }
                }
            } else {
                error = true;
                console.log('Invalid string pattern', this.name, item);
            }
            strings.push({
                finger,
                fret
            });
        }

        let minFret = strings.map(s => s.fret).filter(f => f !== null).reduce((previousValue, currentValue) => previousValue ? Math.min(previousValue, currentValue) : currentValue);
        let maxFret = strings.map(s => s.fret).filter(f => f !== null).reduce((previousValue, currentValue) => previousValue ? Math.max(previousValue, currentValue) : currentValue);
        let visibleFretCount = Math.max(3, maxFret - minFret + 1);
        let startFret = Math.max(1, maxFret - visibleFretCount + 1);
        return {
            startFret,
            visibleFretCount,
            strings
        };
    }

    static CHORDS = {
        'C': 'x|3-3|2-2|o|1-1|o',
        'C(3)': 'x|3-1|5-2|5-3|5-4|3-1',
        'C(5)': 'x|x|5-1|5-1|5-1|8-4',
        'Cm': 'x|3-3|1-1|o|1-2|3-4',
        'Cm(3)': 'x|3-1|5-3|5-4|4-2|3-1',
        'Cm(8)': '8-1|10-3|10-4|8-1|8-1|8-1',
        'C7': 'x|3-3|2-2|3-4|1-1|o',
        'C7(3)': 'x|3-1|5-3|3-1|5-4|3-1',
        'C5': 'x|x|x|o|1-1|x',
        'Cdim': 'x|3-1|4-2|5-4|4-3|x',
        'Cdim7': '2-2|x|1-1|2-3|1-1|x',
        'Caug': 'x|3-4|2-3|1-1|1-2|o',
        'Caug(5)': '8-4|7-3|6-2|5-1|5-1|x',
        'Csus2': 'x|3-1|5-3|5-4|3-1|3-1',
        'Csus2(10)': 'x|x|10-1|12-3|13-4|10-1',
        'Csus': 'x|3-3|3-4|o|1-1|x',
        'Csus(3)': 'x|3-1|5-2|5-3|6-4|3-1',
        'Csus(8)': '8-1|10-2|10-3|10-4|8-1|8-1',
        'Cmaj7': 'x|x|2-2|4-4|1-1|3-3',
        'Cmaj7(3)': 'x|3-1|5-3|4-2|5-4|3-1',
        'Cmaj7(5)': 'x|7-3|5-1|5-1|5-1|7-4',
        'Cmaj7(7)': 'x|x|10-4|9-3|8-2|7-1',
        'Cmaj7(8)': '8-1|10-4|9-2|9-3|8-1|8-1',
        'Cm7': 'x|3-3|1-1|3-4|1-1|x',
        'Cm7(1)': 'x|1-1|1-1|3-3|1-1|3-4',
        'Cm7(3)': 'x|3-1|5-3|3-1|4-2|3-1',
        'Cm7(4)': 'x|x|5-2|5-3|4-1|6-4',
        'Cm7(8)': '8-1|10-3|8-1|8-1|8-1|8-1',
        'C7sus4': 'x|3-1|5-3|3-1|6-4|3-1',
        'C7sus4(8)': '8-1|10-3|8-1|10-4|8-1|8-1',
        'Cmaj9': 'x|3-2|2-1|4-4|3-3|x',
        'Cmaj9(3)': 'x|3-1|5-3|4-2|3-1|3-1',
        'Cmaj9(7)': '8-2|7-1|9-4|7-1|8-3|7-1',
        'Cmaj9(10)': 'x|x|10-1|12-3|12-4|10-1',
        'Cmaj11': 'x|3-3|2-2|4-4|1-1|1-1',
        'Cmaj13': 'x|3-1|x|4-2|5-4|5-4',
        'Cmaj13(7)': '8-2|7-1|7-1|7-1|8-3|7-1',
        'Cadd9': '8-4|7-2|5-1|7-3|5-1|x',
        'C6add9': 'x|3-2|2-1|2-1|3-3|3-4',
        'C6add9(7)': '8-2|7-1|7-1|7-1|8-3|8-4',
        'Cm6': 'x|3-3|1-1|2-2|1-1|3-4',
        'Cm6(2)': 'x|3-2|x|2-1|4-4|3-3',
        'Cm6(4)': 'x|x|5-2|5-3|4-1|5-4',
        'Cm6(5)': '5-1|6-2|5-1|5-1|8-4|5-1',
        'Cm6(7)': '8-2|x|7-1|8-3|8-4|x',
        'Cm9': 'x|3-2|1-1|3-3|3-4|x',
        'Cm9(8)': '8-1|x|8-1|8-1|8-1|10-4',
        'Cm11': 'x|3-1|3-1|3-1|4-2|3-1',
        'Cm11(6)': '8-2|x|8-3|8-4|6-1|x',
        'Cm11(8)': '8-1|8-1|8-1|8-1|8-1|8-1',
        'Cm13': 'x|3-1|5-3|3-1|4-2|5-4',
        'Cm13(8)': '8-1|10-2|8-1|8-1|10-3|10-4',
        'Cmadd9': 'x|3-3|1-1|o|3-4|x',
        'Cmadd9(8)': 'x|x|10-3|8-1|8-1|10-4',
        'Cm6add9': 'x|3-3|1-1|2-2|3-4|x',
        'Cmmaj7': 'x|3-1|5-4|4-2|4-3|3-1',
        'Cmmaj7(4)': 'x|x|5-2|5-3|4-1|7-4',
        'Cmmaj7(7)': 'x|x|10-4|8-2|8-3|7-1',
        'Cmmaj7(8)': '8-1|10-3|10-2|8-1|8-1|8-1',
        'Cmmaj9': 'x|3-2|1-1|4-4|3-3|x',
        'Cmmaj9(8)': '8-1|10-3|9-2|8-1|8-1|10-4',
        'Cm7b5': 'x|1-1|1-1|3-3|1-1|2-2',
        'Cm7#5': 'x|3-1|x|3-2|4-3|4-4',
        'Cm7#5(8)': '8-1|x|8-2|8-3|9-4|x',
        'C6': 'x|x|2-2|2-3|1-1|3-4',
        'C6(3)': 'x|3-1|5-3|5-3|5-3|5-3',
        'C6(5)': 'x|x|5-1|5-1|5-1|5-1',
        'C6(5)2': '5-1|7-3|5-1|5-1|5-1|5-1',
        'C9': 'x|3-2|2-1|3-3|3-3|3-3',
        'C9(5)': 'x|5-1|5-1|5-1|5-1|6-2',
        'C13': 'x|3-2|2-1|3-3|3-3|5-4',
        'C13(5)': '8-3|x|8-4|7-2|5-1|5-1',
        'C13(8)': 'x|x|8-1|9-2|10-3|8-1',
        'C7b5': '2-2|x|2-3|3-4|1-1|x',
        'C7#5': 'x|1-1|2-2|1-1|1-1|x',
        'C7b9': 'x|3-2|2-1|3-3|2-1|3-4',
        'C7#9': 'x|3-2|2-1|3-3|4-4|x',
        'C9b5': 'x|3-2|2-1|3-3|3-4|2-1',
        'C9#5': 'x|3-2|2-1|3-3|3-3|4-4',
        'C13#11': 'x|3-1|4-2|3-1|5-3|5-4',
        'C13b9': 'x|3-2|2-1|3-3|2-1|5-4',
        'C11b9': 'x|3-2|3-3|3-4|2-1|x',
        'Csus2sus4': 'x|3-1|3-1|5-4|3-1|3-1',
        'C#/Db': 'x|4-4|3-3|1-1|2-2|1-1',
        'C#/Db(4)': 'x|4-1|6-2|6-3|6-4|4-1',
        'C#/Db(6)': 'x|x|6-1|6-1|6-1|9-4',
        'C#/Db(9)': '9-1|11-3|11-4|10-2|9-1|9-1',
        'C#/Dbm': 'x|4-1|6-3|6-4|5-2|4-1',
        'C#/Dbm(9)': '9-1|11-3|11-4|9-1|9-1|9-1',
        'C#/Db7': 'x|4-3|3-2|4-4|2-1|x',
        'C#/Db7(4)': 'x|4-1|6-3|4-1|6-4|4-1',
        'C#/Db7(6)': 'x|x|6-1|6-1|6-1|7-2',
        'C#/Db5': 'x|x|x|1-1|2-2|x',
        'C#/Dbdim': 'x|4-1|5-2|6-4|5-3|x',
        'C#/Dbdim(9)': '9-1|10-2|11-3|9-1|x|x',
        'C#/Dbdim7': 'x|1-1|2-2|o|2-3|x',
        'C#/Dbdim7(2)': '3-2|x|2-1|3-3|2-1|x',
        'C#/Dbdim7(3)': 'x|4-2|5-3|3-1|5|4|x',
        'C#/Dbdim7(5)': '6-2|x|5-1|6-3|5-1|x',
        'C#/Dbaug': 'x|x|3-4|2-2|2-3|1-1',
        'C#/Dbaug(2)': 'x|4-4|3-3|2-1|2-2|x',
        'C#/Dbaug(5)': 'x|x|7-4|6-2|6-3|5-1',
        'C#/Dbsus2': 'x|4-1|6-3|6-4|4-1|4-1',
        'C#/Dbsus': 'x|4-3|4-4|1-1|2-2|x',
        'C#/Dbsus(4)': 'x|4-1|6-2|6-3|7-4|4-1',
        'C#/Dbsus(6)': 'x|x|6-1|6-1|7-2|9-4',
        'C#/Dbsus(9)': '9-1|11-2|11-3|11-4|9-1|9-1',
        'C#/Dbmaj7': '1-1|4-4|3-3|1-1|1-1|1-1',
        'C#/Dbmaj7(4)': '4-1|4-1|6-3|5-2|6-4|4-1',
        'C#/Dbm7': 'x|4-3|2-1|4-4|2-1|x',
        'C#/Dbm7(2)': 'x|2-1|2-1|4-3|2-1|4-4',
        'C#/Dbm7(4)': 'x|4-1|6-3|4-1|5-2|4-1',
        'C#/Dbm7(9)': '9-1|11-3|9-1|9-1|9-1|9-1',
        'C#/Db7sus4': 'x|4-1|6-3|4-1|7-4|4-1',
        'C#/Db7sus4(9)': '9-1|11-3|9-1|11-4|9-1|9-1',
        'C#/Dbmaj9': 'x|4-4|1-1|1-1|1-1|1-1',
        'C#/Dbmaj9(3)': 'x|4-2|3-1|5-4|4-3|x',
        'C#/Dbmaj9(4)': 'x|4-1|6-3|5-2|4-1|4-1',
        'C#/Dbmaj11': 'x|4-3|3-2|5-4|2-1|2-1',
        'C#/Dbmaj13': 'x|4-4|3-2|3-3|1-1|1-1',
        'C#/Dbmaj13(8)': '9-2|8-1|8-1|8-1|9-3|8-1',
        'C#/Dbmadd9': 'x|4-3|2-2|1-1|4-4|x',
        'C#/Dbmadd9(9)': 'x|x|11-3|9-1|9-1|11-4',
        'C#/Dbm6add9': 'x|4-3|2-1|3-2|4-4|x',
        'C#/Dbmmaj7': 'x|4-4|2-2|1-1|1-1|x',
        'C#/Dbmmaj7(4)': 'x|4-1|6-4|5-2|5-3|4-1',
        'C#/Dbmmaj9': 'x|4-2|2-1|5-4|4-3|x',
        'C#/Dbmmaj9(9)': '9-1|11-3|10-2|9-1|9-1|11-4',
        'C#/Dbm7b5': 'x|x|2-1|4-3|2-1|3-2',
        'C#/Dbm7b5(2)': 'x|2-1|2-1|4-3|2-1|3-2',
        'C#/Dbm7b5(3)': 'x|4-2|x|4-3|5-4|3-1',
        'C#/Dbm7#5': 'x|4-1|x|4-2|5-3|5-4',
        'C#/Dbm7#5(9)': '9-1|x|9-2|9-3|10-4',
        'C#/Db6': '1-1|1-1|3-3|1-1|2-2|1-1',
        'C#/Db6(2)': 'x|x|3-2|3-3|2-1|4-4',
        'C#/Db6(4)': 'x|4-1|6-3|6-3|6-3|6-3',
        'C#/Db6(6)': '6-1|8-3|6-1|6-1|6-1|6-1',
        'C#/Db9': 'x|x|1-1|4-4|2-2|1-1',
        'C#/Db9(3)': 'x|4-2|3-1|4-3|4-3|4-3',
        'C#/Db9(6)': 'x|6-1|6-1|6-1|6-1|7-2',
        'C#/Db11': 'x|4-2|x|4-3|4-4|2-1',
        'C#/Db11(4)': 'x|4-1|4-1|4-1|4-1',
        'C#/Db13': 'x|4-2|3-1|3-3|3-3|6-4',
        'C#/Db13(6)': '9-3|x|9-4|8-2|6-1|6-1',
        'C#/Db13(9)': 'x|x|9-1|10-2|11-3|9-1',
        'C#/Db7b5': '3-2|x|3-3|4-4|2-1|x',
        'C#/Db7b5(2)': 'x|x|3-2|4-4|2-1|3-3',
        'C#/Db7b5(4)': 'x|4-1|5-2|4-1|6-3|x',
        'C#/Db7#5': 'x|2-1|3-2|2-1|2-1|x',
        'C#/Db7#5(2)': 'x|2-1|3-2|4-3|2-1|5-4',
        'C#/Db7#5(4)': 'x|4-1|7-4|4-1|6-3|5-2',
        'C#/Db7#5(6)': 'x|x|7-2|6-1|6-1|7-3',
        'C#/Db7#5(9)': 'x|x|9-1|10-2|10-3|9-1',
        'C#/Db7b9': 'x|4-2|3-1|4-3|3-1|4-4',
        'C#/Db7b9(9)': '9-1|11-4|9-1|10-2|9-1|10-3',
        'C#/Db7b9(10)': '10-1|11-2|11-3|10-1|12-4|10-1',
        'C#/Db7#9': 'x|4-2|3-1|4-3|5-4|x',
        'C#/Db7#9(9)': '9-1|11-3|9-1|10-2|12-4|12-4',
        'C#/Db9b5': 'x|4-2|3-1|4-3|4-4|3-1',
        'C#/Db9b5(8)': '9-2|8-1|9-3|8-1|8-1|x',
        'C#/Db9#5': 'x|4-2|3-1|4-3|4-3|5-4',
        'C#/Db9#5(9)': '9-1|x|9-1|10-2|10-3|11-4',
        'C#/Db13#11': 'x|4-1|5-2|4-1|6-3|6-4',
        'C#/Db13#11(9)': '9-1|10-2|9-1|10-3|11-4|11-4',
        'C#/Db13b9': 'x|4-2|3-1|4-3|3-1|6-4',
        'C#/Db13b9(6)': '9-3|x|9-4|7-2|6-1|6-1',
        'C#/Db13b9(9)': '9-1|x|9-1|10-2|11-4|10-3',
        'C#/Db11b9': 'x|4-2|4-3|4-4|3-1|x',
        'C#/Db11b9(7)': '9-3|x|9-4|7-1|7-1|x',
        'C#/Db11b9(10)': 'x|x|11-2|11-3|12-4|10-1',
        'C#/Dbsus2sus4': 'x|4-1|4-1|6-4|4-1|4-1',
        'C#/Dbsus2sus4(9)': '9-1|9-1|11-2|11-3|9-1|11-4',
        'C#/Dbsus2sus4(11)': 'x|x|11-1|11-1|14-4|11-1',
        'C#/Db-5': 'x|4-1|5-2|6-4|6-4|x'
    };
}

customElements.define('guitar-chord', GuitarChord);