# Full Afro Percussion Rack Design

## Overview

Expand Crescent Studio's beat generator with 12 new Afro sub-genres, 12 new percussion instruments, and authentic genre-specific MIDI drum patterns. This covers all major types and dimensions of African-rooted music production.

## New Afro Sub-Genres (12)

| Genre | Region | Default BPM | Description |
|---|---|---|---|
| Highlife | Ghana/Nigeria | 115 | Brass-driven, palm wine guitar, 6/8 bell pattern |
| Juju | Nigeria (Yoruba) | 108 | Talking drum-led, layered guitars, call-and-response |
| Fuji | Nigeria (Yoruba) | 118 | Pure percussion, sakara + talking drum, no guitars |
| Afrobeat Classic | Nigeria (Fela) | 120 | Tony Allen polyrhythm, horn stabs, jazz chords |
| Soukous | Congo/DRC | 135 | Sebene guitar arpeggios, fast rumba rhythm |
| Makossa | Cameroon | 122 | Heavy bass guitar, syncopated kick, horn melody |
| Afro-House | Pan-African | 122 | Four-on-the-floor meets Afro percussion |
| Gqom | South Africa | 152 | Dark, raw, broken beat, minimal and aggressive |
| Kuduro | Angola | 136 | Electronic + tribal, fast and energetic |
| Mbalax | Senegal | 116 | Sabar drum-driven, tama, polyrhythmic complexity |
| Kwaito | South Africa | 108 | Slow house, deep bass, sparse percussion |
| Ndombolo | Congo/DRC | 130 | Fast Congolese dance, snare-heavy, party energy |

## New Percussion Instruments (12)

| Instrument | Origin | Role |
|---|---|---|
| Djembe | West Africa | Lead/solo percussion |
| Dundun | West Africa | Bass drum foundation |
| Shekere | West Africa | Gourd rattle texture |
| Bata drums | Yoruba | Sacred/ceremonial ensemble |
| Udu drum | Igbo | Clay pot, deep resonant bass |
| Agogo bells | West Africa | Dual-pitch timeline keeper |
| Cowbell | Pan-African | Accent and pattern anchor |
| Gankogui | Ghana (Ewe) | Double bell, 6/8 master timeline |
| Balafon | West Africa | Wooden xylophone, melodic percussion |
| Bougarabou | Senegal/Gambia | Deep goblet drum bass |
| Sakara drum | Yoruba | Clay frame drum, Fuji signature |
| Axatse | Ghana (Ewe) | Gourd shaker, interlocks with gankogui |

## MIDI Drum Patterns

Each genre gets an authentic pattern replacing the generic kick-snare-hihat:

- **Afrobeats**: Syncopated kick on and-of-2, open hi-hat upbeats, clave snare
- **Amapiano**: Log drum 1-and-3, kick ghosts, shaker 16ths
- **Highlife**: Gankogui 3+3+2 bell, cross-rhythm kick
- **Afrobeat Classic**: Tony Allen broken kick, ride every beat, shekere 16ths
- **Soukous**: Driving snare 2&4, hi-hat 16ths, syncopated kick doubles
- **Gqom**: Distorted kick on 1, open hat and-of-3, sparse snare
- **Fuji**: No kick/snare, dundun 1&3, talking drum fills, shekere constant
- **Mbalax**: Sabar lead, tama accents, bell timeline (12/8)
- **Kuduro**: 808 kick every beat, rapid hi-hat triplets, clap 2&4
- **Kwaito**: Kick on 1 only, snare on 3, wide spacing
- **Ndombolo**: Snare rolls with flams on 2&4, busy hi-hat
- **Makossa**: Bass-drum interlock, offbeat hi-hat, bell pattern
- **Afro-House**: Four-on-floor, Afro shaker 16ths, conga upbeats
- **Afro-Fusion**: Modern + traditional blend, ghost snare notes
- **Juju**: Talking drum lead, agogo bell, soft kick foundation

## Default Instrument Presets

Each genre has a curated default instrument list:

- Highlife: drums, bass, guitar, horns, agogo bells, congas, shakers
- Juju: drums, bass, guitar, talking drum, agogo bells, shakers, pad
- Fuji: drums, dundun, talking drum, sakara drum, shekere, congas
- Afrobeat Classic: drums, bass, guitar, horns, organ, congas, shekere, gankogui
- Soukous: drums, bass, guitar, horns, congas, cowbell, shakers
- Makossa: drums, bass, guitar, horns, cowbell, congas
- Afro-House: drums, bass, pad, shakers, congas, djembe, cowbell
- Gqom: drums, bass, pad, shakers
- Kuduro: drums, bass, pad, cowbell, shakers, agogo bells
- Mbalax: drums, bass, guitar, talking drum, djembe, bougarabou, balafon
- Kwaito: drums, bass, pad, shakers, cowbell
- Ndombolo: drums, bass, guitar, horns, congas, cowbell, shakers

## Files Changed

| File | Changes |
|---|---|
| `backend/src/models.h` | Add 12 Genre enum values, update `genre_to_str()` and `genre_from_str()` |
| `backend/src/presets.h` | Add BPM defaults, prompt descriptions, 12 new instruments to `all_instruments()` |
| `backend/src/midi_writer.h` | Add GM drum notes, genre-specific pattern functions, `write_afro_drum_midi()` |
| `backend/src/main.cpp` | Use genre-aware MIDI in generate endpoints |
