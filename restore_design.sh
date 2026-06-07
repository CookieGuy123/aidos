#!/bin/bash
# Restore previous design
cp design_backup/src/App.tsx src/App.tsx
cp design_backup/src/index.css src/index.css
cp design_backup/src/components/*.tsx src/components/
echo 'Design restored from design_backup/'
