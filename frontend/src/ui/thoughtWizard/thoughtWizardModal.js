import { THOUGHT_INTENT_KEYS } from '../../music/immutables.js';
import { STYLE_CATALOG } from '../../music/styleCatalog.js';
import { getDefaultMoodId, getMoodsForStyle } from '../../music/moodCatalog.js';
import { MOTION_CATALOG } from '../../music/motionCatalog.js';
import { normalizeMusicThoughtParams } from '../../music/normalizeThought.js';
import { normalizeThoughtIntent } from '../../music/thoughtIntentNormalize.js';
import { mulberry32 } from '../../music/styleResolver.js';
import { LOCKS_KEY } from './wizardStepFactory.js';
import { createCommitStep } from './steps/commitStep.js';
import { createDensityStep } from './steps/densityStep.js';
import { createGoalStep, GOAL_OPTIONS } from './steps/goalStep.js';
import { createHarmonyBehaviorStep, HARMONY_BEHAVIOR_OPTIONS } from './steps/harmonyBehaviorStep.js';
import { createMoodStep } from './steps/moodStep.js';
import { createMotionStep } from './steps/motionStep.js';
import { createRoleStep, ROLE_OPTIONS } from './steps/roleStep.js';
import { createSoundColorStep, SOUND_COLOR_OPTIONS } from './steps/soundColorStep.js';
import { createStyleStep } from './steps/styleStep.js';

const buildStyleOptions = () => STYLE_CATALOG.map(style => ({
  value: style.id,
  label: style.label || style.id,
}));

const buildMoodOptions = (styleId) => {
  const moods = getMoodsForStyle(styleId);
  return moods.map(mood => ({
    value: mood.id,
    label: mood.label || mood.id,
  }));
};

const buildMotionOptions = () => MOTION_CATALOG.map(motion => ({
  value: motion.id,
  label: motion.label || motion.id,
  description: Array.isArray(motion.tags) ? motion.tags.join(' • ') : '',
}));

const DENSITY_BUCKETS = [0.2, 0.35, 0.5, 0.65, 0.8];

const toNumber = (value, fallback) => (Number.isFinite(value) ? value : fallback);

export function createThoughtWizardModal({ store } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'thought-wizard-modal';

  const card = document.createElement('div');
  card.className = 'thought-wizard-card';
  overlay.appendChild(card);

  const header = document.createElement('div');
  header.className = 'thought-wizard-header';
  const title = document.createElement('div');
  title.className = 'thought-wizard-title';
  title.textContent = 'Guided Thought Wizard';
  header.appendChild(title);
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'thought-wizard-close';
  closeButton.textContent = 'Close';
  header.appendChild(closeButton);
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'thought-wizard-body';
  card.appendChild(body);

  let isOpen = false;
  let isNewNode = false;
  let nodeId = null;
  let intentState = {};
  let activeIndex = 0;

  const styleOptions = buildStyleOptions();
  const motionOptions = buildMotionOptions();

  const getIntentValue = (key) => intentState?.[key];

  const getLocks = () => {
    const locks = intentState?.[LOCKS_KEY];
    return locks && typeof locks === 'object' ? { ...locks } : {};
  };

  const setIntentValue = (key, value) => {
    intentState = { ...intentState, [key]: value };
  };

  const setLockValue = (key, locked) => {
    const locks = getLocks();
    if (locked) {
      locks[key] = true;
    } else {
      delete locks[key];
    }
    setIntentValue(LOCKS_KEY, locks);
  };

  const close = ({ discard } = {}) => {
    if (discard && isNewNode && nodeId) {
      store.removeNode(nodeId);
    }
    isOpen = false;
    isNewNode = false;
    nodeId = null;
    overlay.classList.remove('is-open');
    body.innerHTML = '';
  };

  const applyIntentToNode = () => {
    if (!nodeId) {
      return;
    }
    store.updateNode(nodeId, (node) => {
      const nextParams = {
        ...(node.params || {}),
        [THOUGHT_INTENT_KEYS.ROOT]: { ...intentState },
        [THOUGHT_INTENT_KEYS.STYLE_ID]: getIntentValue(THOUGHT_INTENT_KEYS.STYLE_ID),
        [THOUGHT_INTENT_KEYS.MOOD_ID]: getIntentValue(THOUGHT_INTENT_KEYS.MOOD_ID),
        [THOUGHT_INTENT_KEYS.SEED]: getIntentValue(THOUGHT_INTENT_KEYS.SEED),
      };
      return { params: nextParams };
    });
  };

  const buildSummary = () => {
    const roleValue = getIntentValue(THOUGHT_INTENT_KEYS.ROLE);
    const goalValue = getIntentValue(THOUGHT_INTENT_KEYS.GOAL);
    const styleValue = getIntentValue(THOUGHT_INTENT_KEYS.STYLE_ID);
    const moodValue = getIntentValue(THOUGHT_INTENT_KEYS.MOOD_ID);
    const motionValue = getIntentValue(THOUGHT_INTENT_KEYS.MOTION_ID);
    const densityValue = getIntentValue(THOUGHT_INTENT_KEYS.DENSITY);
    const harmonyValue = getIntentValue(THOUGHT_INTENT_KEYS.HARMONY_BEHAVIOR);
    const soundValue = getIntentValue(THOUGHT_INTENT_KEYS.SOUND_COLOR);

    const styleLabel = styleOptions.find(option => option.value === styleValue)?.label || styleValue;
    const moodLabel = buildMoodOptions(styleValue).find(option => option.value === moodValue)?.label || moodValue;
    const motionLabel = motionOptions.find(option => option.value === motionValue)?.label || motionValue;

    return [
      { label: 'Goal', value: goalValue || '—' },
      { label: 'Role', value: roleValue || '—' },
      { label: 'Style', value: styleLabel || '—' },
      { label: 'Mood', value: moodLabel || '—' },
      { label: 'Motion', value: motionLabel || '—' },
      { label: 'Density', value: Number.isFinite(densityValue) ? `${Math.round(densityValue * 100)}%` : '—' },
      { label: 'Harmony', value: harmonyValue || '—' },
      { label: 'Sound Color', value: soundValue || '—' },
    ];
  };

  const rerollIntent = () => {
    const currentSeed = toNumber(getIntentValue(THOUGHT_INTENT_KEYS.SEED), 1);
    const nextSeed = currentSeed + 1;
    setIntentValue(THOUGHT_INTENT_KEYS.SEED, nextSeed);
    const rng = mulberry32(nextSeed);
    const locks = getLocks();

    const pickOption = (key, options) => {
      if (locks[key]) {
        return;
      }
      if (!options || options.length === 0) {
        return;
      }
      const index = Math.floor(rng() * options.length) % options.length;
      setIntentValue(key, options[index].value);
    };

    pickOption(THOUGHT_INTENT_KEYS.GOAL, GOAL_OPTIONS);
    pickOption(THOUGHT_INTENT_KEYS.ROLE, ROLE_OPTIONS);
    pickOption(THOUGHT_INTENT_KEYS.STYLE_ID, styleOptions);
    const moodOptions = buildMoodOptions(getIntentValue(THOUGHT_INTENT_KEYS.STYLE_ID));
    pickOption(THOUGHT_INTENT_KEYS.MOOD_ID, moodOptions);
    pickOption(THOUGHT_INTENT_KEYS.MOTION_ID, motionOptions);
    if (!locks[THOUGHT_INTENT_KEYS.DENSITY]) {
      const densityIndex = Math.floor(rng() * DENSITY_BUCKETS.length) % DENSITY_BUCKETS.length;
      setIntentValue(THOUGHT_INTENT_KEYS.DENSITY, DENSITY_BUCKETS[densityIndex]);
    }
    pickOption(THOUGHT_INTENT_KEYS.HARMONY_BEHAVIOR, HARMONY_BEHAVIOR_OPTIONS);
    pickOption(THOUGHT_INTENT_KEYS.SOUND_COLOR, SOUND_COLOR_OPTIONS);
  };

  const canAdvance = (key) => {
    const value = getIntentValue(key);
    if (key === THOUGHT_INTENT_KEYS.DENSITY) {
      return Number.isFinite(value);
    }
    return value !== undefined && value !== null && value !== '';
  };

  const getSteps = () => {
    const roleValue = getIntentValue(THOUGHT_INTENT_KEYS.ROLE);
    const shouldShowHarmony = ['harmony', 'bass'].includes(roleValue);
    return [
      {
        id: 'Goal',
        render: (index) => createGoalStep({
          value: getIntentValue(THOUGHT_INTENT_KEYS.GOAL),
          locked: Boolean(getLocks()[THOUGHT_INTENT_KEYS.GOAL]),
          onSelect: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.GOAL, next);
            render();
          },
          onToggleLock: (locked) => {
            setLockValue(THOUGHT_INTENT_KEYS.GOAL, locked);
            render();
          },
          onContinue: () => {
            activeIndex = Math.min(activeIndex + 1, getSteps().length - 1);
            render();
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          canContinue: canAdvance(THOUGHT_INTENT_KEYS.GOAL),
          showBack: index > 0,
        }),
      },
      {
        id: 'Role',
        render: (index) => createRoleStep({
          value: getIntentValue(THOUGHT_INTENT_KEYS.ROLE),
          locked: Boolean(getLocks()[THOUGHT_INTENT_KEYS.ROLE]),
          onSelect: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.ROLE, next);
            render();
          },
          onToggleLock: (locked) => {
            setLockValue(THOUGHT_INTENT_KEYS.ROLE, locked);
            render();
          },
          onContinue: () => {
            activeIndex = Math.min(activeIndex + 1, getSteps().length - 1);
            render();
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          canContinue: canAdvance(THOUGHT_INTENT_KEYS.ROLE),
          showBack: index > 0,
        }),
      },
      {
        id: 'Style',
        render: (index) => createStyleStep({
          options: styleOptions,
          value: getIntentValue(THOUGHT_INTENT_KEYS.STYLE_ID),
          locked: Boolean(getLocks()[THOUGHT_INTENT_KEYS.STYLE_ID]),
          seedValue: getIntentValue(THOUGHT_INTENT_KEYS.SEED),
          onSelect: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.STYLE_ID, next);
            const moods = buildMoodOptions(next);
            const currentMood = getIntentValue(THOUGHT_INTENT_KEYS.MOOD_ID);
            const hasMood = moods.some(option => option.value === currentMood);
            if (!hasMood) {
              setIntentValue(THOUGHT_INTENT_KEYS.MOOD_ID, getDefaultMoodId(next));
            }
            render();
          },
          onToggleLock: (locked) => {
            setLockValue(THOUGHT_INTENT_KEYS.STYLE_ID, locked);
            render();
          },
          onSeedChange: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.SEED, next);
            render();
          },
          onReroll: () => {
            rerollIntent();
            render();
          },
          onContinue: () => {
            activeIndex = Math.min(activeIndex + 1, getSteps().length - 1);
            render();
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          canContinue: canAdvance(THOUGHT_INTENT_KEYS.STYLE_ID),
          showBack: index > 0,
        }),
      },
      {
        id: 'Mood',
        render: (index) => createMoodStep({
          options: buildMoodOptions(getIntentValue(THOUGHT_INTENT_KEYS.STYLE_ID)),
          value: getIntentValue(THOUGHT_INTENT_KEYS.MOOD_ID),
          locked: Boolean(getLocks()[THOUGHT_INTENT_KEYS.MOOD_ID]),
          onSelect: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.MOOD_ID, next);
            render();
          },
          onToggleLock: (locked) => {
            setLockValue(THOUGHT_INTENT_KEYS.MOOD_ID, locked);
            render();
          },
          onContinue: () => {
            activeIndex = Math.min(activeIndex + 1, getSteps().length - 1);
            render();
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          canContinue: canAdvance(THOUGHT_INTENT_KEYS.MOOD_ID),
          showBack: index > 0,
        }),
      },
      {
        id: 'Motion',
        render: (index) => createMotionStep({
          options: motionOptions,
          value: getIntentValue(THOUGHT_INTENT_KEYS.MOTION_ID),
          locked: Boolean(getLocks()[THOUGHT_INTENT_KEYS.MOTION_ID]),
          onSelect: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.MOTION_ID, next);
            render();
          },
          onToggleLock: (locked) => {
            setLockValue(THOUGHT_INTENT_KEYS.MOTION_ID, locked);
            render();
          },
          onContinue: () => {
            activeIndex = Math.min(activeIndex + 1, getSteps().length - 1);
            render();
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          canContinue: canAdvance(THOUGHT_INTENT_KEYS.MOTION_ID),
          showBack: index > 0,
        }),
      },
      {
        id: 'Density',
        render: (index) => createDensityStep({
          value: getIntentValue(THOUGHT_INTENT_KEYS.DENSITY),
          locked: Boolean(getLocks()[THOUGHT_INTENT_KEYS.DENSITY]),
          onSelect: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.DENSITY, next);
            render();
          },
          onToggleLock: (locked) => {
            setLockValue(THOUGHT_INTENT_KEYS.DENSITY, locked);
            render();
          },
          onContinue: () => {
            activeIndex = Math.min(activeIndex + 1, getSteps().length - 1);
            render();
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          canContinue: canAdvance(THOUGHT_INTENT_KEYS.DENSITY),
          showBack: index > 0,
        }),
      },
      ...(shouldShowHarmony ? [{
        id: 'Harmony',
        render: (index) => createHarmonyBehaviorStep({
          value: getIntentValue(THOUGHT_INTENT_KEYS.HARMONY_BEHAVIOR),
          locked: Boolean(getLocks()[THOUGHT_INTENT_KEYS.HARMONY_BEHAVIOR]),
          onSelect: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.HARMONY_BEHAVIOR, next);
            render();
          },
          onToggleLock: (locked) => {
            setLockValue(THOUGHT_INTENT_KEYS.HARMONY_BEHAVIOR, locked);
            render();
          },
          onContinue: () => {
            activeIndex = Math.min(activeIndex + 1, getSteps().length - 1);
            render();
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          canContinue: canAdvance(THOUGHT_INTENT_KEYS.HARMONY_BEHAVIOR),
          showBack: index > 0,
        }),
      }] : []),
      {
        id: 'Sound',
        render: (index) => createSoundColorStep({
          value: getIntentValue(THOUGHT_INTENT_KEYS.SOUND_COLOR),
          locked: Boolean(getLocks()[THOUGHT_INTENT_KEYS.SOUND_COLOR]),
          onSelect: (next) => {
            setIntentValue(THOUGHT_INTENT_KEYS.SOUND_COLOR, next);
            render();
          },
          onToggleLock: (locked) => {
            setLockValue(THOUGHT_INTENT_KEYS.SOUND_COLOR, locked);
            render();
          },
          onContinue: () => {
            activeIndex = Math.min(activeIndex + 1, getSteps().length - 1);
            render();
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          canContinue: canAdvance(THOUGHT_INTENT_KEYS.SOUND_COLOR),
          showBack: index > 0,
        }),
      },
      {
        id: 'Commit',
        render: (index) => createCommitStep({
          summary: buildSummary(),
          onCommit: () => {
            applyIntentToNode();
            close({ discard: false });
          },
          onBack: () => {
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
          },
          showBack: index > 0,
        }),
      },
    ];
  };

  const render = () => {
    if (!isOpen) {
      return;
    }
    const steps = getSteps();
    const maxIndex = Math.max(0, steps.length - 1);
    activeIndex = Math.min(activeIndex, maxIndex);
    body.innerHTML = '';
    const visibleSteps = steps.slice(0, activeIndex + 1);
    visibleSteps.forEach((step, index) => {
      const section = step.render(index);
      if (index < activeIndex) {
        section.classList.add('is-complete');
      }
      if (index === activeIndex) {
        section.classList.add('is-active');
      }
      body.appendChild(section);
    });
  };

  const open = ({ nodeId: nextNodeId, isNew } = {}) => {
    const state = store.getState();
    const node = state.nodes.find(item => item.id === nextNodeId);
    if (!node) {
      return;
    }
    const canon = normalizeMusicThoughtParams(node.params || {});
    const intent = normalizeThoughtIntent(canon);
    const locks = intent?.[LOCKS_KEY] || {};
    intent[LOCKS_KEY] = { ...locks };
    if (!intent[THOUGHT_INTENT_KEYS.MOOD_ID]) {
      intent[THOUGHT_INTENT_KEYS.MOOD_ID] = getDefaultMoodId(intent[THOUGHT_INTENT_KEYS.STYLE_ID]);
    }

    intentState = { ...intent };
    activeIndex = 0;
    nodeId = nextNodeId;
    isNewNode = Boolean(isNew);
    isOpen = true;
    overlay.classList.add('is-open');
    render();
  };

  closeButton.addEventListener('click', () => close({ discard: true }));
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close({ discard: true });
    }
  });

  return {
    element: overlay,
    open,
    close: () => close({ discard: false }),
  };
}
