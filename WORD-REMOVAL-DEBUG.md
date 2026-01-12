# Word Removal Debugging Guide

## Issue
Words are not disappearing when formed, and the game freezes.

## Current Flow
1. Word is detected by `WordDetector.detectWords()`
2. Cells are marked with `isRemoving: true` in `processWordsOnce()`
3. `removalTimeoutId` is set to pause game loop
4. After 400ms timeout, `clearRemovingWords()` is called
5. Cells are set to `letter: null`, `isEmpty: true`, `isRemoving: false`
6. Gravity is applied
7. Cascading word detection checks for new words

## Potential Issues

### 1. Timeout Not Firing
- Check browser console for "⏰ Removal timeout fired" message
- If not present, timeout might not be executing
- Check if `window.setTimeout` is being blocked

### 2. Words Not Being Detected
- Check console for "✅ Found X valid word(s)" message
- Check for "🎯 Processing X detected word(s)" message
- If not present, words might not be detected by dictionary

### 3. Cells Not Being Marked
- Check console for "✅ Marked X cell(s) for removal" message
- If not present, cells might not be marked correctly

### 4. Clearing Not Working
- Check console for "✅ Cleared X cell(s) marked for removal" message
- If not present, `clearRemovingWords()` might not be working
- Check for warnings about cells still marked as removing

### 5. State Not Updating
- Check if React is re-rendering after `notifyStateChange()`
- Check if `stateChangeCallback` is set correctly

## Debug Steps

1. **Open browser console** and look for debug messages
2. **Form a word** (e.g., "CAT") and watch console
3. **Check for these messages**:
   - `✅ Found X valid word(s): [words]`
   - `🎯 Processing X detected word(s): [words]`
   - `✅ Marked X cell(s) for removal for word "[word]"`
   - `⏱️ Setting removal timeout (X word(s) to remove)...`
   - `✅ Removal timeout set (ID: X)`
   - `⏰ Removal timeout fired - clearing words...`
   - `✅ Cleared X cell(s) marked for removal: [(x,y), ...]`
   - `📊 Before gravity: X empty, Y letters, Z still removing`
   - `📊 After gravity: X empty, Y letters (gravity applied/no movement)`

4. **If timeout doesn't fire**: Check for JavaScript errors blocking execution
5. **If clearing doesn't work**: Check if cells have `isRemoving: true` but aren't being cleared
6. **If state doesn't update**: Check if `notifyStateChange()` is being called

## Quick Fix (Temporary)

If words are detected but not cleared, try:
1. Reduce timeout delay to 0ms (clear immediately)
2. Remove cascading word detection temporarily
3. Add more error handling to catch issues

## Expected Behavior

1. Word formed (e.g., "CAT")
2. Console: "✅ Found 1 valid word(s): CAT (horizontal)"
3. Console: "🎯 Processing 1 detected word(s): CAT"
4. Console: "✅ Marked 3 cell(s) for removal for word \"CAT\""
5. Cells animate (letters fade out)
6. After 400ms: "⏰ Removal timeout fired - clearing words..."
7. Console: "✅ Cleared 3 cell(s) marked for removal: (4,10), (4,11), (4,12)"
8. Console: "📊 Before gravity: 3 empty, X letters, 0 still removing"
9. Letters above fall down
10. Console: "📊 After gravity: Y empty, Z letters (gravity applied)"
11. Game resumes

## If Freeze Persists

Check:
- Browser console for errors
- Network tab for failed requests (dictionary loading)
- React DevTools for state updates
- Check if game loop is paused (`removalTimeoutId !== null`)
