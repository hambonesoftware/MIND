import { STYLE_CATALOG } from '../frontend/src/music/styleCatalog.js';
import { getMoodsForStyle } from '../frontend/src/music/moodCatalog.js';
import { buildStyleOptionSets } from '../frontend/src/music/styleResolver.js';

function reportIssues(issues) {
  if (issues.length === 0) {
    console.log('Catalog coverage checks passed');
    return;
  }
  console.error('Catalog coverage issues found:');
  issues.forEach(issue => console.error('-', issue));
  process.exit(1);
}

function main() {
  const issues = [];
  const styles = STYLE_CATALOG.filter(style => style.id !== 'legacy');
  for (const style of styles) {
    const moods = getMoodsForStyle(style.id).filter(mood => mood.id !== 'none');
    if (moods.length < 1) {
      issues.push(`Style ${style.id} is missing mood definitions`);
      continue;
    }
    for (const mood of moods) {
      const { optionSets } = buildStyleOptionSets({
        styleId: style.id,
        moodId: mood.id,
        moodMode: 'override',
        styleSeed: 11,
        nodeId: `coverage-${style.id}-${mood.id}`,
      });
      const progressionAll = optionSets.progressions?.all || [];
      const progressionRec = optionSets.progressions?.recommended || [];
      const patternAll = optionSets.patterns?.all || [];
      const feelRec = optionSets.feels?.recommended || [];
      const instrumentRec = optionSets.instruments?.recommended || [];
      if (progressionAll.length < 4) {
        issues.push(`Style ${style.id} mood ${mood.id} has only ${progressionAll.length} total progressions`);
      }
      if (progressionRec.length < 2) {
        issues.push(`Style ${style.id} mood ${mood.id} has only ${progressionRec.length} recommended progressions`);
      }
      if (patternAll.length < 3) {
        issues.push(`Style ${style.id} mood ${mood.id} has only ${patternAll.length} pattern options after gating`);
      }
      if (feelRec.length < 2) {
        issues.push(`Style ${style.id} mood ${mood.id} has only ${feelRec.length} recommended feel presets`);
      }
      if (instrumentRec.length < 2) {
        issues.push(`Style ${style.id} mood ${mood.id} has only ${instrumentRec.length} recommended instruments`);
      }
    }
  }
  reportIssues(issues);
}

main();
