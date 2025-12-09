import csv
import json
from collections import OrderedDict
from typing import Any

# 1. Musical Theory Setup
# Map of notes to numerical values (0-11)
NOTE_MAP = {
    # C (0)
    'C': 0, 'B#': 0, 'Dbb': 0,
    # C#/Db (1)
    'C#': 1, 'Db': 1, 'B##': 1,
    # D (2)
    'D': 2, 'C##': 2, 'Ebb': 2,
    # D#/Eb (3)
    'D#': 3, 'Eb': 3, 'Fbb': 3,
    # E (4)
    'E': 4, 'D##': 4, 'Fb': 4,
    # F (5)
    'F': 5, 'E#': 5, 'Gbb': 5,
    # F#/Gb (6)
    'F#': 6, 'Gb': 6, 'E##': 6,
    # G (7)
    'G': 7, 'F##': 7, 'Abb': 7,
    # G#/Ab (8)
    'G#': 8, 'Ab': 8,
    # A (9)
    'A': 9, 'G##': 9, 'Bbb': 9,
    # A#/Bb (10)
    'A#': 10, 'Bb': 10, 'Cbb': 10,
    # B (11)
    'B': 11, 'A##': 11, 'Cb': 11
}

# Standard guitar tuning (E A D G B e) in numerical form
# E=4, A=9, D=2, G=7, B=11, e=4
STANDARD_TUNING = [4, 9, 2, 7, 11, 4]


def calculate_fret(open_string_val, note_name):
    """Calculates the fret number based on the open string note and the target note."""
    if note_name not in NOTE_MAP:
        return 0  # Fallback for strange notes

    target_val = NOTE_MAP[note_name]

    # Difference between the target note and the open string
    # (Target - Open) % 12 gives the fret (0-11)
    fret = (target_val - open_string_val) % 12

    # Correction: if the calculated fret is 0 but the finger is not 0 (e.g., E on E string),
    # it implies the 12th fret (octave). We'll return the calculated value for now.
    if fret == 0:
        fret = 12

    return fret


def process_chord_row(row):
    """
    Converts a single CSV row into the required format.
    Returns the base chord key, the formatted fret/finger value, the minimum non-zero fret,
    and the maximum fret used.
    """

    # Get data from columns
    root = row['CHORD_ROOT']
    chord_type = row['CHORD_TYPE']

    # Split strings "x,0,1,2..." into lists
    # .strip() removes extra spaces
    try:
        finger_positions_str = row['FINGER_POSITIONS'].strip().strip('"')
        note_names_str = row['NOTE_NAMES'].strip().strip('"')
    except AttributeError:
        # Handle cases where the row might be malformed or missing data
        return "ERROR", "x|x|x|x|x|x", 0, 0

    finger_positions = [f.strip() for f in finger_positions_str.split(',')]
    note_names = [n.strip() for n in note_names_str.split(',')]

    max_fret, min_fret, result_parts = get_chord_schema(finger_positions, note_names)

    # Assemble the final string value
    formatted_chord = "|".join(result_parts)

    # Naming logic for the base key (without suffix)
    if chord_type == 'maj':
        chord_key = root
    elif chord_type == 'min':
        chord_key = f"{root}m"
    else:
        chord_key = f"{root}{chord_type}"

    # Determine the actual lowest fret used
    final_min_fret = min_fret if min_fret != 99 else 0
    final_max_fret = max_fret

    # Return key, value, min fret, and max fret for span check
    return chord_key, formatted_chord, final_min_fret, final_max_fret


def adjust_chord(max_fret, result_parts):
    min_fret = 99
    for i, finder_fret in enumerate(result_parts):
        if finder_fret != 'x' and finder_fret != 'o':
            fret = int(finder_fret.split('-')[0])
            finger = finder_fret.split('-')[1]
            if max_fret - fret > 5:
                fret += 12
            result_parts[i] = f'{finger}-{finger}'
            if fret < min_fret:
                min_fret = fret

    return max_fret, min_fret, result_parts


def get_chord_schema(finger_positions: list[Any], note_names: list[Any]) -> tuple[list[Any], int, int]:
    result_parts = []
    note_idx = 0  # Index for the note_names list (increments only if the string is played)
    min_fret = 99  # Used to find the lowest non-zero fret (e.g., the barre fret)
    max_fret = 0  # Used to find the highest fret

    # Iterate through all 6 strings
    for string_num in range(6):
        # Guard against index out of bounds (if data is corrupt)
        if string_num >= len(finger_positions):
            break

        finger = finger_positions[string_num]

        # Case 1: String is muted
        if finger == 'x':
            result_parts.append('x')
            continue

        # Case 2: Open string
        if finger == '0':
            result_parts.append('o')
            note_idx += 1
            continue

        # Case 3: Fretted string (fret number must be calculated)
        if note_idx < len(note_names):
            note_name = note_names[note_idx]
            open_string_val = STANDARD_TUNING[string_num]

            fret = calculate_fret(open_string_val, note_name)

            # If the fret is 0 (e.g., E note on E string), but the finger is not 0,
            # it means the 12th fret
            if fret == 0 and finger != '0':
                fret = 12

            # Track the minimum non-zero fret for naming purposes
            if fret > 0 and fret < min_fret:
                min_fret = fret

            # Track the maximum fret used
            if fret > max_fret:
                max_fret = fret

            result_parts.append(f"{fret}-{finger}")
            note_idx += 1
        else:
            # If there aren't enough notes (data error), use a placeholder
            result_parts.append('?')

    while max_fret - min_fret > 5:
        max_fret, min_fret, result_parts = adjust_chord(max_fret, result_parts)

    return max_fret, min_fret, result_parts


# ---------------------------------------------------------
# Main execution block to read the file and construct unique keys
# ---------------------------------------------------------

# Define input/output file paths
INPUT_FILE_PATH = 'chord-fingers.csv'
OUTPUT_FILE_PATH = 'guitar-chords-db.js'

# List to collect all generated chord entries
output_lines = []

chords = OrderedDict()

try:
    # Open the CSV file for reading. IMPORTANT: Using delimiter=';'
    with open(INPUT_FILE_PATH, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for row in reader:
            # Process the row to get the base key, chord data, minimum fret, and maximum fret
            base_key, formatted_chord, min_fret, max_fret = process_chord_row(row)
            unique_key = base_key

            if unique_key in chords:
                unique_key = f"{base_key}[{min_fret}]"
                counter = 0
                if unique_key in chords:
                    counter = 1
                    while f'{base_key}[{min_fret}-{counter}]' in chords:
                        counter += 1
                    unique_key = f'{base_key}[{min_fret}-{counter}]'

            chords[unique_key] = formatted_chord
            print(f'{unique_key}: {formatted_chord}')
        with open(OUTPUT_FILE_PATH, 'w', encoding='utf-8') as outfile:
            outfile.write("static CHORDS = ")
            json.dump(chords, outfile, indent=4)

        print(f"Output successfully written to {OUTPUT_FILE_PATH}")

except FileNotFoundError:
    # Error handling if the file is missing (in English)
    print(f"Error: File '{INPUT_FILE_PATH}' not found. Please ensure the file is in the same directory.")
