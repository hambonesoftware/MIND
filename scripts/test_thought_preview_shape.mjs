import { runBuildPreviewGraphTest } from '../frontend/src/audio/thoughtPreview/__tests__/test_buildPreviewGraph.mjs';

try {
  runBuildPreviewGraphTest();
  console.log('test_thought_preview_shape: ok');
} catch (error) {
  console.error('test_thought_preview_shape: failed');
  console.error(error);
  process.exit(1);
}
