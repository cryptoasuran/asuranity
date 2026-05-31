#!/bin/bash
echo "=== Counting MANUALLY WRITTEN code only ==="
echo ""
echo "Features (manually written):"
wc -l src/features/*.js 2>/dev/null | tail -1
echo ""
echo "Core (manually written):"
wc -l src/core/VanityEngine.js src/core/PatternMatcher.js src/core/AddressValidator.js src/core/store/GeneratorStore.js 2>/dev/null | tail -1
echo ""
echo "Workers (manually written):"
wc -l src/workers/GeneratorWorker.js 2>/dev/null | tail -1
echo ""
echo "UI Components (manually written):"
wc -l src/ui/components/*.jsx src/App.jsx 2>/dev/null | tail -1
echo ""
echo "Testing/Security/Systems (manually written):"
wc -l src/testing/*.js src/security/*.js src/systems/*.js 2>/dev/null | tail -1
echo ""
echo "Demo:"
wc -l demo.html 2>/dev/null | tail -1
