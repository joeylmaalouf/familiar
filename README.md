# Familiar

### Introduction

Familiar is a web app for Pathfinder players, meant to assist them in their TTRPG adventures.

### Features

We plan to support a variety of features:

- [ ] Spell Tracker
  - [ ] integration with spell/ability lookup (below)
  - [ ] custom spell creation
  - [ ] support for prepared, spontaneous, and hybrid spell casting
  - [ ] quick metamagic application
- [ ] Resource Point Tracker
  - [ ] integration with spell/ability lookup (below)
  - [ ] custom ability creation
- [ ] Spell/Ability Lookup
  - [ ] categorical search/filter, more than just name
    - [ ] class list
    - [ ] level
    - [ ] school/domain/subdomain/element
- [ ] Creature Lookup
  - [ ] search by property or statistics
    - [ ] CR
    - [ ] abilities
    - [ ] other properties
  - [ ] template application
- [ ] User Dashboard
  - [ ] pregenerated layouts for common character types
  - [ ] dashboard customization and integration of tools as widgets
- [ ] Feat/Condition/Other Lookup

### Setup

Development Setup
Create a cloud-based firebase project [here](https://console.firebase.google.com/)
In ./firebase, execute `firebase use --add <project key>`
To deploy to your project, simply `firebase deploy`