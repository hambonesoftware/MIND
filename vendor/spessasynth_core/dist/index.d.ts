/**
 * Indexed_array.ts
 * purpose: extends Uint8Array with a currentIndex property.
 */
declare class IndexedByteArray extends Uint8Array {
    /**
     * The current index of the array.
     */
    currentIndex: number;
    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): IndexedByteArray;
}

/**
 * Writes an audio into a valid WAV file.
 * @param audioData the audio data channels.
 * @param sampleRate the sample rate, in Hertz.
 * @param options Additional options for writing the file.
 * @returns the binary file.
 */
declare function audioToWav(audioData: Float32Array[], sampleRate: number, options?: Partial<WaveWriteOptions>): ArrayBuffer;

/**
 * Reads number as Big endian.
 * @param dataArray the array to read from.
 * @param bytesAmount the number of bytes to read.
 * @param offset the offset to start reading from.
 * @returns the number.
 */
declare function readBigEndian(dataArray: number[] | ArrayLike<number>, bytesAmount: number, offset?: number): number;

/**
 * Reads the number as little endian from an IndexedByteArray.
 * @param dataArray the array to read from.
 * @param bytesAmount the number of bytes to read.
 * @returns the number.
 */
declare function readLittleEndianIndexed(dataArray: IndexedByteArray, bytesAmount: number): number;

/**
 * Reads bytes as an ASCII string from an IndexedByteArray.
 * @param dataArray the IndexedByteArray to read from.
 * @param bytes the amount of bytes to read.
 * @returns the string.
 */
declare function readBinaryStringIndexed(dataArray: IndexedByteArray, bytes: number): string;

/**
 * Reads VLQ from a MIDI byte array.
 * @param MIDIbyteArray the array to read from.
 * @returns the number.
 */
declare function readVariableLengthQuantity(MIDIbyteArray: IndexedByteArray): number;

/**
 * Enables or disables logging.
 * @param enableInfo enables info.
 * @param enableWarn enables warning.
 * @param enableGroup enables groups.
 */
declare function SpessaSynthLogging(enableInfo: boolean, enableWarn: boolean, enableGroup: boolean): void;
declare function SpessaSynthInfo(...message: unknown[]): void;
declare function SpessaSynthWarn(...message: unknown[]): void;
declare function SpessaSynthGroup(...message: unknown[]): void;
declare function SpessaSynthGroupCollapsed(...message: unknown[]): void;
declare function SpessaSynthGroupEnd(): void;

/**
 * All SoundFont2 Generator enumerations.
 */
declare const generatorTypes: {
    readonly INVALID: -1;
    readonly startAddrsOffset: 0;
    readonly endAddrOffset: 1;
    readonly startloopAddrsOffset: 2;
    readonly endloopAddrsOffset: 3;
    readonly startAddrsCoarseOffset: 4;
    readonly modLfoToPitch: 5;
    readonly vibLfoToPitch: 6;
    readonly modEnvToPitch: 7;
    readonly initialFilterFc: 8;
    readonly initialFilterQ: 9;
    readonly modLfoToFilterFc: 10;
    readonly modEnvToFilterFc: 11;
    readonly endAddrsCoarseOffset: 12;
    readonly modLfoToVolume: 13;
    readonly unused1: 14;
    readonly chorusEffectsSend: 15;
    readonly reverbEffectsSend: 16;
    readonly pan: 17;
    readonly unused2: 18;
    readonly unused3: 19;
    readonly unused4: 20;
    readonly delayModLFO: 21;
    readonly freqModLFO: 22;
    readonly delayVibLFO: 23;
    readonly freqVibLFO: 24;
    readonly delayModEnv: 25;
    readonly attackModEnv: 26;
    readonly holdModEnv: 27;
    readonly decayModEnv: 28;
    readonly sustainModEnv: 29;
    readonly releaseModEnv: 30;
    readonly keyNumToModEnvHold: 31;
    readonly keyNumToModEnvDecay: 32;
    readonly delayVolEnv: 33;
    readonly attackVolEnv: 34;
    readonly holdVolEnv: 35;
    readonly decayVolEnv: 36;
    readonly sustainVolEnv: 37;
    readonly releaseVolEnv: 38;
    readonly keyNumToVolEnvHold: 39;
    readonly keyNumToVolEnvDecay: 40;
    readonly instrument: 41;
    readonly reserved1: 42;
    readonly keyRange: 43;
    readonly velRange: 44;
    readonly startloopAddrsCoarseOffset: 45;
    readonly keyNum: 46;
    readonly velocity: 47;
    readonly initialAttenuation: 48;
    readonly reserved2: 49;
    readonly endloopAddrsCoarseOffset: 50;
    readonly coarseTune: 51;
    readonly fineTune: 52;
    readonly sampleID: 53;
    readonly sampleModes: 54;
    readonly reserved3: 55;
    readonly scaleTuning: 56;
    readonly exclusiveClass: 57;
    readonly overridingRootKey: 58;
    readonly unused5: 59;
    readonly endOper: 60;
    readonly vibLfoToVolume: 61;
    readonly vibLfoToFilterFc: 62;
};
type GeneratorType = (typeof generatorTypes)[keyof typeof generatorTypes];
declare const GENERATORS_AMOUNT: number;
declare const MAX_GENERATOR: number;
/**
 * Min: minimum value, max: maximum value, def: default value, nrpn: nrpn scale...
 */
declare const generatorLimits: {
    min: number;
    max: number;
    def: number;
    nrpn: number;
}[];

declare const sampleTypes: {
    readonly monoSample: 1;
    readonly rightSample: 2;
    readonly leftSample: 4;
    readonly linkedSample: 8;
    readonly romMonoSample: 32769;
    readonly romRightSample: 32770;
    readonly romLeftSample: 32772;
    readonly romLinkedSample: 32776;
};
type SampleType = (typeof sampleTypes)[keyof typeof sampleTypes];
declare const modulatorSources: {
    readonly noController: 0;
    readonly noteOnVelocity: 2;
    readonly noteOnKeyNum: 3;
    readonly polyPressure: 10;
    readonly channelPressure: 13;
    readonly pitchWheel: 14;
    readonly pitchWheelRange: 16;
    readonly link: 127;
};
type ModulatorSourceEnum = (typeof modulatorSources)[keyof typeof modulatorSources];
declare const modulatorCurveTypes: {
    readonly linear: 0;
    readonly concave: 1;
    readonly convex: 2;
    readonly switch: 3;
};
type ModulatorCurveType = (typeof modulatorCurveTypes)[keyof typeof modulatorCurveTypes];
declare const modulatorTransformTypes: {
    readonly linear: 0;
    readonly absolute: 2;
};
type ModulatorTransformType = (typeof modulatorTransformTypes)[keyof typeof modulatorTransformTypes];
type DLSTransform = ModulatorCurveType;
declare const dlsSources: {
    readonly none: 0;
    readonly modLfo: 1;
    readonly velocity: 2;
    readonly keyNum: 3;
    readonly volEnv: 4;
    readonly modEnv: 5;
    readonly pitchWheel: 6;
    readonly polyPressure: 7;
    readonly channelPressure: 8;
    readonly vibratoLfo: 9;
    readonly modulationWheel: 129;
    readonly volume: 135;
    readonly pan: 138;
    readonly expression: 139;
    readonly chorus: 221;
    readonly reverb: 219;
    readonly pitchWheelRange: 256;
    readonly fineTune: 257;
    readonly coarseTune: 258;
};
type DLSSource = (typeof dlsSources)[keyof typeof dlsSources];
declare const dlsDestinations: {
    readonly none: 0;
    readonly gain: 1;
    readonly reserved: 2;
    readonly pitch: 3;
    readonly pan: 4;
    readonly keyNum: 5;
    readonly chorusSend: 128;
    readonly reverbSend: 129;
    readonly modLfoFreq: 260;
    readonly modLfoDelay: 261;
    readonly vibLfoFreq: 276;
    readonly vibLfoDelay: 277;
    readonly volEnvAttack: 518;
    readonly volEnvDecay: 519;
    readonly reservedEG1: 520;
    readonly volEnvRelease: 521;
    readonly volEnvSustain: 522;
    readonly volEnvDelay: 523;
    readonly volEnvHold: 524;
    readonly modEnvAttack: 778;
    readonly modEnvDecay: 779;
    readonly reservedEG2: 780;
    readonly modEnvRelease: 781;
    readonly modEnvSustain: 782;
    readonly modEnvDelay: 783;
    readonly modEnvHold: 784;
    readonly filterCutoff: 1280;
    readonly filterQ: 1281;
};
type DLSDestination = (typeof dlsDestinations)[keyof typeof dlsDestinations];
declare const DLSLoopTypes: {
    readonly forward: 0;
    readonly loopAndRelease: 1;
};
type DLSLoopType = (typeof DLSLoopTypes)[keyof typeof DLSLoopTypes];

declare const interpolationTypes: {
    readonly linear: 0;
    readonly nearestNeighbor: 1;
    readonly hermite: 2;
};
type InterpolationType = (typeof interpolationTypes)[keyof typeof interpolationTypes];
declare const dataEntryStates: {
    readonly Idle: 0;
    readonly RPCoarse: 1;
    readonly RPFine: 2;
    readonly NRPCoarse: 3;
    readonly NRPFine: 4;
    readonly DataCoarse: 5;
    readonly DataFine: 6;
};
type DataEntryState = (typeof dataEntryStates)[keyof typeof dataEntryStates];
declare const customControllers: {
    readonly channelTuning: 0;
    readonly channelTransposeFine: 1;
    readonly modulationMultiplier: 2;
    readonly masterTuning: 3;
    readonly channelTuningSemitones: 4;
    readonly channelKeyShift: 5;
    readonly sf2NPRNGeneratorLSB: 6;
};
type CustomController = (typeof customControllers)[keyof typeof customControllers];

interface MIDIPatch {
    /**
     * The MIDI program number.
     */
    program: number;
    /**
     * The MIDI bank MSB number.
     */
    bankMSB: number;
    /**
     * The MIDI bank LSB number.
     */
    bankLSB: number;
    /**
     * If the preset is marked as GM/GS drum preset. Note that XG drums do not have this flag.
     */
    isGMGSDrum: boolean;
}
interface MIDIPatchNamed extends MIDIPatch {
    /**
     * The name of the patch.
     */
    name: string;
}
declare class MIDIPatchTools {
    /**
     * Converts a MIDI patch to a string.
     */
    static toMIDIString(patch: MIDIPatch): string;
    /**
     * Gets a MIDI patch from a string.
     * @param string
     */
    static fromMIDIString(string: string): MIDIPatch;
    /**
     * Converts a named MIDI patch to string.
     * @param patch
     */
    static toNamedMIDIString(patch: MIDIPatchNamed): string;
    /**
     * Checks if two MIDI patches match.
     * @param patch1
     * @param patch2
     */
    static matches(patch1: MIDIPatch, patch2: MIDIPatch): boolean;
    /**
     * Gets a named MIDI patch from a string.
     * @param string
     */
    static fromNamedMIDIString(string: string): MIDIPatchNamed;
    static sorter(a: MIDIPatch, b: MIDIPatch): number;
}

type SynthSystem = "gm" | "gm2" | "gs" | "xg";
interface NoteOnCallback {
    /** The MIDI note number. */
    midiNote: number;
    /** The MIDI channel number. */
    channel: number;
    /** The velocity of the note. */
    velocity: number;
}
interface NoteOffCallback {
    /** The MIDI note number. */
    midiNote: number;
    /** The MIDI channel number. */
    channel: number;
}
interface DrumChangeCallback {
    /** The MIDI channel number. */
    channel: number;
    /** Indicates if the channel is a drum channel. */
    isDrumChannel: boolean;
}
interface ProgramChangeCallback extends MIDIPatch {
    /** The MIDI channel number. */
    channel: number;
}
interface ControllerChangeCallback {
    /** The MIDI channel number. */
    channel: number;
    /** The controller number. */
    controllerNumber: number;
    /** The value of the controller. */
    controllerValue: number;
}
interface MuteChannelCallback {
    /** The MIDI channel number. */
    channel: number;
    /** Indicates if the channel is muted. */
    isMuted: boolean;
}
interface PresetListEntry extends MIDIPatchNamed {
    /**
     * Indicates if this preset is any kind of drum preset.
     */
    isAnyDrums: boolean;
}
/**
 * A list of preset changes, each with a name, bank, and program number.
 */
type PresetList = PresetListEntry[];
/**
 * The synthesizer display system exclusive data, EXCLUDING THE F0 BYTE!
 */
type SynthDisplayCallback = number[];
interface PitchWheelCallback {
    /** The MIDI channel number. */
    channel: number;
    /**
     * The unsigned 14-bit value of the pitch: 0 - 16383.
     */
    pitch: number;
}
interface ChannelPressureCallback {
    /** The MIDI channel number. */
    channel: number;
    /** The pressure value. */
    pressure: number;
}
interface PolyPressureCallback {
    /** The MIDI channel number. */
    channel: number;
    /** The MIDI note number. */
    midiNote: number;
    /** The pressure value. */
    pressure: number;
}
/**
 * The error message for sound bank errors.
 */
type SoundBankErrorCallback = Error;
interface StopAllCallback {
    /**
     * The MIDI channel number.
     */
    channel: number;
    /**
     * If the channel was force stopped. (no release time)
     */
    force: boolean;
}
type MasterParameterChangeCallback = {
    [P in keyof MasterParameterType]: {
        /**
         * The parameter that was changed.
         */
        parameter: P;
        /**
         * The new value of this parameter.
         */
        value: MasterParameterType[P];
    };
}[keyof MasterParameterType];
interface ChannelPropertyChangeCallback {
    /**
     * The channel number of the new property.
     */
    channel: number;
    /**
     * The updated property.
     */
    property: ChannelProperty;
}
interface SynthProcessorEventData {
    /**
     * This event fires when a note is played.
     */
    noteOn: NoteOnCallback;
    /**
     * This event fires when a note is released.
     */
    noteOff: NoteOffCallback;
    /**
     * This event fires when a pitch wheel is changed.
     */
    pitchWheel: PitchWheelCallback;
    /**
     * This event fires when a controller is changed.
     */
    controllerChange: ControllerChangeCallback;
    /**
     * This event fires when a program is changed.
     */
    programChange: ProgramChangeCallback;
    /**
     * This event fires when a channel pressure is changed.
     */
    channelPressure: ChannelPressureCallback;
    /**
     * This event fires when a polyphonic pressure is changed.
     */
    polyPressure: PolyPressureCallback;
    /**
     * This event fires when a drum channel is changed.
     */
    drumChange: DrumChangeCallback;
    /**
     * This event fires when all notes on a channel are stopped.
     */
    stopAll: StopAllCallback;
    /**
     * This event fires when a new channel is created. There is no data for this event.
     */
    newChannel: void;
    /**
     * This event fires when a channel is muted or unmuted.
     */
    muteChannel: MuteChannelCallback;
    /**
     * This event fires when the preset list is changed.
     */
    presetListChange: PresetList;
    /**
     * This event fires when all controllers on all channels are reset. There is no data for this event.
     */
    allControllerReset: void;
    /**
     * This event fires when a sound bank parsing error occurs.
     */
    soundBankError: SoundBankErrorCallback;
    /**
     * This event fires when the synthesizer receives a display message.
     */
    synthDisplay: SynthDisplayCallback;
    /**
     * This event fires when a master parameter changes.
     */
    masterParameterChange: MasterParameterChangeCallback;
    /**
     * This event fires when a channel property changes.
     */
    channelPropertyChange: ChannelPropertyChangeCallback;
}
type SynthProcessorEvent = {
    [K in keyof SynthProcessorEventData]: {
        type: K;
        data: SynthProcessorEventData[K];
    };
}[keyof SynthProcessorEventData];
interface SynthMethodOptions {
    /**
     * The audio context time when the event should execute, in seconds.
     */
    time: number;
}
/**
 * KeyNum: tuning.
 */
type MTSProgramTuning = MTSNoteTuning[];
interface MTSNoteTuning {
    /**
     * The base MIDI note to use, -1 means no change.
     */
    midiNote: number;
    /**
     * Additional tuning.
     */
    centTuning: number | null;
}
/**
 * Looping mode of the sample.
 * 0 - no loop.
 * 1 - loop.
 * 2 - UNOFFICIAL: polyphone 2.4 added start on release.
 * 3 - loop then play when released.
 */
type SampleLoopingMode = 0 | 1 | 2 | 3;
/**
 * A list of voices for a given key:velocity.
 */
type VoiceList = Voice[];
interface ChannelProperty {
    /**
     * The channel's current voice amount.
     */
    voicesAmount: number;
    /**
     * The channel's current pitch wheel 0 - 16384.
     */
    pitchWheel: number;
    /**
     * The pitch wheel's range, in semitones.
     */
    pitchWheelRange: number;
    /**
     * Indicates whether the channel is muted.
     */
    isMuted: boolean;
    /**
     * Indicates whether the channel is a drum channel.
     */
    isDrum: boolean;
    /**
     * The channel's transposition, in semitones.
     */
    transposition: number;
}
interface SynthProcessorOptions {
    /**
     * Indicates if the event system is enabled. This can be changed later.
     */
    enableEventSystem: boolean;
    /**
     * The initial time of the synth, in seconds.
     */
    initialTime: number;
    /**
     * Indicates if the effects are enabled. This can be changed later.
     */
    enableEffects: boolean;
}
/**
 * The master parameters of the synthesizer.
 */
interface MasterParameterType {
    /**
     * The master gain, from 0 to any number. 1 is 100% volume.
     */
    masterGain: number;
    /**
     * The master pan, from -1 (left) to 1 (right). 0 is center.
     */
    masterPan: number;
    /**
     * The maximum number of voices that can be played at once.
     */
    voiceCap: number;
    /**
     * The interpolation type used for sample playback.
     */
    interpolationType: InterpolationType;
    /**
     * The MIDI system used by the synthesizer for bank selects and system exclusives. (GM, GM2, GS, XG)
     */
    midiSystem: SynthSystem;
    /**
     * Indicates whether the synthesizer is in monophonic retrigger mode.
     * This emulates the behavior of Microsoft GS Wavetable Synth,
     * Where a new note will kill the previous one if it is still playing.
     */
    monophonicRetriggerMode: boolean;
    /**
     * The reverb gain, from 0 to any number. 1 is 100% reverb.
     */
    reverbGain: number;
    /**
     * The chorus gain, from 0 to any number. 1 is 100% chorus.
     */
    chorusGain: number;
    /**
     * Forces note killing instead of releasing. Improves performance in black MIDIs.
     */
    blackMIDIMode: boolean;
    /**
     * The global transposition in semitones. It can be decimal to provide microtonal tuning.
     */
    transposition: number;
    /**
     * Synthesizer's device ID for system exclusive messages. Set to -1 to accept all.
     */
    deviceID: number;
}

/**
 * Sets a master parameter of the synthesizer.
 * @param parameter The type of the master parameter to set.
 * @param value The value to set for the master parameter.
 */
declare function setMasterParameterInternal<P extends keyof MasterParameterType>(this: SpessaSynthProcessor, parameter: P, value: MasterParameterType[P]): void;
/**
 * Gets a master parameter of the synthesizer.
 * @param type The type of the master parameter to get.
 * @returns The value of the master parameter.
 */
declare function getMasterParameterInternal<P extends keyof MasterParameterType>(this: SpessaSynthProcessor, type: P): MasterParameterType[P];
/**
 * Gets all master parameters of the synthesizer.
 * @returns All the master parameters.
 */
declare function getAllMasterParametersInternal(this: SpessaSynthProcessor): MasterParameterType;

declare class Generator {
    /**
     * The generator's SF2 type.
     */
    generatorType: GeneratorType;
    /**
     * The generator's 16-bit value.
     */
    generatorValue: number;
    /**
     * Constructs a new generator
     * @param type generator type
     * @param value generator value
     * @param validate if the limits should be validated
     */
    constructor(type: GeneratorType, value: number, validate?: boolean);
    write(genData: IndexedByteArray): void;
    toString(): string;
}

declare class BasicZone {
    /**
     * The zone's velocity range.
     * min -1 means that it is a default value
     */
    velRange: GenericRange;
    /**
     * The zone's key range.
     * min -1 means that it is a default value.
     */
    keyRange: GenericRange;
    /**
     * The zone's generators.
     */
    generators: Generator[];
    /**
     * The zone's modulators.
     */
    modulators: Modulator[];
    get hasKeyRange(): boolean;
    get hasVelRange(): boolean;
    /**
     * The current tuning in cents, taking in both coarse and fine generators.
     */
    get fineTuning(): number;
    /**
     * The current tuning in cents, taking in both coarse and fine generators.
     */
    set fineTuning(tuningCents: number);
    /**
     * Adds to a given generator, or its default value.
     */
    addToGenerator(type: GeneratorType, value: number, validate?: boolean): void;
    /**
     * Sets a generator to a given value if preset, otherwise adds a new one.
     */
    setGenerator(type: GeneratorType, value: number | null, validate?: boolean): void;
    /**
     * Adds generators to the zone.
     * @param generators
     */
    addGenerators(...generators: Generator[]): void;
    addModulators(...modulators: Modulator[]): void;
    getGenerator<K>(generatorType: GeneratorType, notFoundValue: number | K): number | K;
    copyFrom(zone: BasicZone): void;
    /**
     * Filters the generators and prepends the range generators.
     */
    getWriteGenerators(bank: BasicSoundBank): Generator[];
}

declare class BasicGlobalZone extends BasicZone {
}

declare class BasicSample {
    /**
     * The sample's name.
     */
    name: string;
    /**
     * Sample rate in Hz.
     */
    sampleRate: number;
    /**
     * Original pitch of the sample as a MIDI note number.
     */
    originalKey: number;
    /**
     * Pitch correction, in cents. Can be negative.
     */
    pitchCorrection: number;
    /**
     * Linked sample, unused if mono.
     */
    linkedSample?: BasicSample;
    /**
     * The type of the sample.
     */
    sampleType: SampleType;
    /**
     * Relative to the start of the sample in sample points.
     */
    loopStart: number;
    /**
     * Relative to the start of the sample in sample points.
     */
    loopEnd: number;
    /**
     * Sample's linked instruments (the instruments that use it)
     * note that duplicates are allowed since one instrument can use the same sample multiple times.
     */
    linkedTo: BasicInstrument[];
    /**
     * Indicates if the data was overridden, so it cannot be copied back unchanged.
     */
    protected dataOverridden: boolean;
    /**
     * The compressed sample data if the sample has been compressed.
     */
    protected compressedData?: Uint8Array;
    /**
     * The sample's audio data.
     */
    protected audioData?: Float32Array;
    /**
     * The basic representation of a sample
     * @param sampleName The sample's name
     * @param sampleRate The sample's rate in Hz
     * @param originalKey The sample's pitch as a MIDI note number
     * @param pitchCorrection The sample's pitch correction in cents
     * @param sampleType The sample's type, an enum that can indicate SF3
     * @param loopStart The sample's loop start relative to the sample start in sample points
     * @param loopEnd The sample's loop end relative to the sample start in sample points
     */
    constructor(sampleName: string, sampleRate: number, originalKey: number, pitchCorrection: number, sampleType: SampleType, loopStart: number, loopEnd: number);
    /**
     * Indicates if the sample is compressed using vorbis SF3.
     */
    get isCompressed(): boolean;
    /**
     * If the sample is linked to another sample.
     */
    get isLinked(): boolean;
    /**
     * The sample's use count
     */
    get useCount(): number;
    /**
     * Get raw data for writing the file, either a compressed bit stream or signed 16-bit little endian PCM data.
     * @param allowVorbis if vorbis file data is allowed.
     * @return either s16le or vorbis data.
     */
    getRawData(allowVorbis: boolean): Uint8Array;
    /**
     * Resamples the audio data to a given sample rate.
     */
    resampleData(newSampleRate: number): void;
    /**
     * Compresses the audio data
     * @param encodeVorbis the compression function to use when compressing
     */
    compressSample(encodeVorbis: SampleEncodingFunction): Promise<void>;
    /**
     * Sets the sample type and unlinks if needed.
     * @param type The type to set it to.
     */
    setSampleType(type: SampleType): void;
    /**
     * Unlinks the sample from its stereo link if it has any.
     */
    unlinkSample(): void;
    /**
     * Links a stereo sample.
     * @param sample the sample to link to.
     * @param type either left, right or linked.
     */
    setLinkedSample(sample: BasicSample, type: SampleType): void;
    /**
     * Links the sample to a given instrument
     * @param instrument the instrument to link to
     */
    linkTo(instrument: BasicInstrument): void;
    /**
     * Unlinks the sample from a given instrument
     * @param instrument the instrument to unlink from
     */
    unlinkFrom(instrument: BasicInstrument): void;
    /**
     * Get the float32 audio data.
     * Note that this either decodes the compressed data or passes the ready sampleData.
     * If neither are set then it will throw an error!
     * @returns the audio data
     */
    getAudioData(): Float32Array;
    /**
     * Replaces the audio data *in-place*.
     * @param audioData The new audio data as Float32.
     * @param sampleRate The new sample rate, in Hertz.
     */
    setAudioData(audioData: Float32Array, sampleRate: number): void;
    /**
     * Replaces the audio with a compressed data sample and flags the sample as compressed
     * @param data the new compressed data
     */
    setCompressedData(data: Uint8Array): void;
    /**
     * Encodes s16le sample
     * @return the encoded data
     */
    protected encodeS16LE(): IndexedByteArray;
    /**
     * Decode binary vorbis into a float32 pcm
     */
    protected decodeVorbis(): Float32Array;
}
declare class EmptySample extends BasicSample {
    /**
     * A simplified class for creating samples.
     */
    constructor();
}

declare class BasicInstrumentZone extends BasicZone {
    /**
     * The instrument this zone belongs to.
     */
    readonly parentInstrument: BasicInstrument;
    /**
     * For tracking on the individual zone level, since multiple presets can refer to the same instrument.
     */
    useCount: number;
    /**
     * Creates a new instrument zone.
     * @param instrument The parent instrument.
     * @param sample The sample to use in this zone.
     */
    constructor(instrument: BasicInstrument, sample: BasicSample);
    /**
     * Zone's sample.
     */
    private _sample;
    /**
     * Zone's sample.
     */
    get sample(): BasicSample;
    /**
     * Sets a sample for this zone.
     * @param sample the sample to set.
     */
    set sample(sample: BasicSample);
    getWriteGenerators(bank: BasicSoundBank): Generator[];
}

/**
 * Returned structure containing extended SF2 chunks.
 */
interface ExtendedSF2Chunks {
    /**
     * The PDTA part of the chunk.
     */
    pdta: IndexedByteArray;
    /**
     * The XDTA (https://github.com/spessasus/soundfont-proposals/blob/main/extended_limits.md) part of the chunk.
     */
    xdta: IndexedByteArray;
}
/**
 * Write indexes for tracking writing a SoundFont file.
 */
interface SoundFontWriteIndexes {
    /**
     * Generator start index.
     */
    gen: number;
    /**
     * Modulator start index.
     */
    mod: number;
    /**
     * Zone start index.
     */
    bag: number;
    /**
     * Preset/instrument start index.
     */
    hdr: number;
}

/**
 * Represents a single instrument
 */
declare class BasicInstrument {
    /**
     * The instrument's name
     */
    name: string;
    /**
     * The instrument's zones
     */
    zones: BasicInstrumentZone[];
    /**
     * Instrument's global zone
     */
    readonly globalZone: BasicGlobalZone;
    /**
     * Instrument's linked presets (the presets that use it)
     * note that duplicates are allowed since one preset can use the same instrument multiple times.
     */
    readonly linkedTo: BasicPreset[];
    /**
     * How many presets is this instrument used by
     */
    get useCount(): number;
    /**
     * Creates a new instrument zone and returns it.
     * @param sample The sample to use in the zone.
     */
    createZone(sample: BasicSample): BasicInstrumentZone;
    /**
     * Links the instrument ta a given preset
     * @param preset the preset to link to
     */
    linkTo(preset: BasicPreset): void;
    /**
     * Unlinks the instrument from a given preset
     * @param preset the preset to unlink from
     */
    unlinkFrom(preset: BasicPreset): void;
    deleteUnusedZones(): void;
    delete(): void;
    /**
     * Deletes a given instrument zone if it has no uses
     * @param index the index of the zone to delete
     * @param force ignores the use count and deletes forcibly
     * @returns if the zone has been deleted
     */
    deleteZone(index: number, force?: boolean): boolean;
    /**
     * Globalizes the instrument *in-place.*
     * This means trying to move as many generators and modulators
     * to the global zone as possible to reduce clutter and the count of parameters.
     */
    globalize(): void;
    write(instData: ExtendedSF2Chunks, index: number): void;
}

declare class BasicPresetZone extends BasicZone {
    /**
     * The preset this zone belongs to.
     */
    readonly parentPreset: BasicPreset;
    /**
     * Creates a new preset zone.
     * @param preset the preset this zone belongs to.
     * @param instrument the instrument to use in this zone.
     */
    constructor(preset: BasicPreset, instrument: BasicInstrument);
    /**
     * Zone's instrument.
     */
    private _instrument;
    /**
     * Zone's instrument.
     */
    get instrument(): BasicInstrument;
    /**
     * Zone's instrument.
     */
    set instrument(instrument: BasicInstrument);
    getWriteGenerators(bank: BasicSoundBank): Generator[];
}

declare class BasicPreset implements MIDIPatchNamed {
    /**
     * The parent soundbank instance
     * Currently used for determining default modulators and XG status
     */
    readonly parentSoundBank: BasicSoundBank;
    /**
     * The preset's name
     */
    name: string;
    program: number;
    bankMSB: number;
    bankLSB: number;
    isGMGSDrum: boolean;
    /**
     * The preset's zones
     */
    zones: BasicPresetZone[];
    /**
     * Preset's global zone
     */
    readonly globalZone: BasicGlobalZone;
    /**
     * Unused metadata
     */
    library: number;
    /**
     * Unused metadata
     */
    genre: number;
    /**
     * Unused metadata
     */
    morphology: number;
    /**
     * Creates a new preset representation.
     * @param parentSoundBank the sound bank this preset belongs to.
     * @param globalZone optional, a global zone to use.
     */
    constructor(parentSoundBank: BasicSoundBank, globalZone?: BasicGlobalZone);
    get isXGDrums(): boolean;
    /**
     * Checks if this preset is a drum preset
     */
    get isAnyDrums(): boolean;
    /**
     * Unlinks everything from this preset.
     */
    delete(): void;
    /**
     * Deletes an instrument zone from this preset.
     * @param index the zone's index to delete.
     */
    deleteZone(index: number): void;
    /**
     * Creates a new preset zone and returns it.
     * @param instrument the instrument to use in the zone.
     */
    createZone(instrument: BasicInstrument): BasicPresetZone;
    /**
     * Preloads (loads and caches synthesis data) for a given key range.
     */
    preload(keyMin: number, keyMax: number): void;
    /**
     * Checks if the bank and program numbers are the same for the given preset as this one.
     * @param preset The preset to check.
     */
    matches(preset: MIDIPatch): boolean;
    /**
     * Returns the synthesis data from this preset
     * @param midiNote the MIDI note number
     * @param velocity the MIDI velocity
     * @returns the returned sound data
     */
    getSynthesisData(midiNote: number, velocity: number): VoiceSynthesisData[];
    /**
     * BankMSB:bankLSB:program:isGMGSDrum
     */
    toMIDIString(): string;
    toString(): string;
    /**
     * Combines preset into an instrument, flattening the preset zones into instrument zones.
     * This is a really complex function that attempts to work around the DLS limitations of only having the instrument layer.
     * @returns The instrument containing the flattened zones. In theory, it should exactly the same as this preset.
     */
    toFlattenedInstrument(): BasicInstrument;
    /**
     * Writes the SF2 header
     * @param phdrData
     * @param index
     */
    write(phdrData: ExtendedSF2Chunks, index: number): void;
}

declare class SoundBankManager {
    /**
     * All the sound banks, ordered from the most important to the least.
     */
    soundBankList: SoundBankManagerListEntry[];
    private readonly presetListChangeCallback;
    private selectablePresetList;
    /**
     * @param presetListChangeCallback Supplied by the parent synthesizer class,
     * this is called whenever the preset list changes.
     */
    constructor(presetListChangeCallback: () => unknown);
    private _presetList;
    /**
     * The list of all presets in the sound bank stack.
     */
    get presetList(): PresetListEntry[];
    /**
     * The current sound bank priority order.
     * @returns The IDs of the sound banks in the current order.
     */
    get priorityOrder(): string[];
    /**
     * The current sound bank priority order.
     * @param newList The new order of sound bank IDs.
     */
    set priorityOrder(newList: string[]);
    /**
     * Deletes a given sound bank by its ID.
     * @param id the ID of the sound bank to delete.
     */
    deleteSoundBank(id: string): void;
    /**
     * Adds a new sound bank with a given ID, or replaces an existing one.
     * @param font the sound bank to add.
     * @param id the ID of the sound bank.
     * @param bankOffset the bank offset of the sound bank.
     */
    addSoundBank(font: BasicSoundBank, id: string, bankOffset?: number): void;
    /**
     * Gets a given preset from the sound bank stack.
     * @param patch The MIDI patch to search for.
     * @param system The MIDI system to select the preset for.
     * @returns An object containing the preset and its bank offset.
     */
    getPreset(patch: MIDIPatch, system: SynthSystem): BasicPreset;
    destroy(): void;
    private generatePresetList;
}

/**
 * Kills the specified number of voices based on their priority.
 * This function will remove the least important voices from all channels.
 * @param amount The number of voices to remove.
 */
declare function killVoicesIntenral(this: SpessaSynthProcessor, amount: number): void;

type SysExAcceptedArray = number[] | IndexedByteArray | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Uint8ClampedArray | Float32Array | Float64Array;

/**
 * Executes a system exclusive message for the synthesizer.
 * @param syx The system exclusive message as an array of bytes.
 * @param channelOffset The channel offset to apply (default is 0).
 * @remarks
 * This is a rather extensive method that handles various system exclusive messages,
 * including Roland GS, MIDI Tuning Standard, and other non-realtime messages.
 */
declare function systemExclusiveInternal(this: SpessaSynthProcessor, syx: SysExAcceptedArray, channelOffset?: number): void;

declare const midiMessageTypes: {
    readonly noteOff: 128;
    readonly noteOn: 144;
    readonly polyPressure: 160;
    readonly controllerChange: 176;
    readonly programChange: 192;
    readonly channelPressure: 208;
    readonly pitchWheel: 224;
    readonly systemExclusive: 240;
    readonly timecode: 241;
    readonly songPosition: 242;
    readonly songSelect: 243;
    readonly tuneRequest: 246;
    readonly clock: 248;
    readonly start: 250;
    readonly continue: 251;
    readonly stop: 252;
    readonly activeSensing: 254;
    readonly reset: 255;
    readonly sequenceNumber: 0;
    readonly text: 1;
    readonly copyright: 2;
    readonly trackName: 3;
    readonly instrumentName: 4;
    readonly lyric: 5;
    readonly marker: 6;
    readonly cuePoint: 7;
    readonly programName: 8;
    readonly midiChannelPrefix: 32;
    readonly midiPort: 33;
    readonly endOfTrack: 47;
    readonly setTempo: 81;
    readonly smpteOffset: 84;
    readonly timeSignature: 88;
    readonly keySignature: 89;
    readonly sequenceSpecific: 127;
};
type MIDIMessageType = (typeof midiMessageTypes)[keyof typeof midiMessageTypes];
declare const midiControllers: {
    readonly bankSelect: 0;
    readonly modulationWheel: 1;
    readonly breathController: 2;
    readonly undefinedCC3: 3;
    readonly footController: 4;
    readonly portamentoTime: 5;
    readonly dataEntryMSB: 6;
    readonly mainVolume: 7;
    readonly balance: 8;
    readonly undefinedCC9: 9;
    readonly pan: 10;
    readonly expressionController: 11;
    readonly effectControl1: 12;
    readonly effectControl2: 13;
    readonly undefinedCC14: 14;
    readonly undefinedCC15: 15;
    readonly generalPurposeController1: 16;
    readonly generalPurposeController2: 17;
    readonly generalPurposeController3: 18;
    readonly generalPurposeController4: 19;
    readonly undefinedCC20: 20;
    readonly undefinedCC21: 21;
    readonly undefinedCC22: 22;
    readonly undefinedCC23: 23;
    readonly undefinedCC24: 24;
    readonly undefinedCC25: 25;
    readonly undefinedCC26: 26;
    readonly undefinedCC27: 27;
    readonly undefinedCC28: 28;
    readonly undefinedCC29: 29;
    readonly undefinedCC30: 30;
    readonly undefinedCC31: 31;
    readonly bankSelectLSB: 32;
    readonly modulationWheelLSB: 33;
    readonly breathControllerLSB: 34;
    readonly undefinedCC3LSB: 35;
    readonly footControllerLSB: 36;
    readonly portamentoTimeLSB: 37;
    readonly dataEntryLSB: 38;
    readonly mainVolumeLSB: 39;
    readonly balanceLSB: 40;
    readonly undefinedCC9LSB: 41;
    readonly panLSB: 42;
    readonly expressionControllerLSB: 43;
    readonly effectControl1LSB: 44;
    readonly effectControl2LSB: 45;
    readonly undefinedCC14LSB: 46;
    readonly undefinedCC15LSB: 47;
    readonly undefinedCC16LSB: 48;
    readonly undefinedCC17LSB: 49;
    readonly undefinedCC18LSB: 50;
    readonly undefinedCC19LSB: 51;
    readonly undefinedCC20LSB: 52;
    readonly undefinedCC21LSB: 53;
    readonly undefinedCC22LSB: 54;
    readonly undefinedCC23LSB: 55;
    readonly undefinedCC24LSB: 56;
    readonly undefinedCC25LSB: 57;
    readonly undefinedCC26LSB: 58;
    readonly undefinedCC27LSB: 59;
    readonly undefinedCC28LSB: 60;
    readonly undefinedCC29LSB: 61;
    readonly undefinedCC30LSB: 62;
    readonly undefinedCC31LSB: 63;
    readonly sustainPedal: 64;
    readonly portamentoOnOff: 65;
    readonly sostenutoPedal: 66;
    readonly softPedal: 67;
    readonly legatoFootswitch: 68;
    readonly hold2Pedal: 69;
    readonly soundVariation: 70;
    readonly filterResonance: 71;
    readonly releaseTime: 72;
    readonly attackTime: 73;
    readonly brightness: 74;
    readonly decayTime: 75;
    readonly vibratoRate: 76;
    readonly vibratoDepth: 77;
    readonly vibratoDelay: 78;
    readonly soundController10: 79;
    readonly generalPurposeController5: 80;
    readonly generalPurposeController6: 81;
    readonly generalPurposeController7: 82;
    readonly generalPurposeController8: 83;
    readonly portamentoControl: 84;
    readonly undefinedCC85: 85;
    readonly undefinedCC86: 86;
    readonly undefinedCC87: 87;
    readonly undefinedCC88: 88;
    readonly undefinedCC89: 89;
    readonly undefinedCC90: 90;
    readonly reverbDepth: 91;
    readonly tremoloDepth: 92;
    readonly chorusDepth: 93;
    readonly detuneDepth: 94;
    readonly phaserDepth: 95;
    readonly dataIncrement: 96;
    readonly dataDecrement: 97;
    readonly nonRegisteredParameterLSB: 98;
    readonly nonRegisteredParameterMSB: 99;
    readonly registeredParameterLSB: 100;
    readonly registeredParameterMSB: 101;
    readonly undefinedCC102LSB: 102;
    readonly undefinedCC103LSB: 103;
    readonly undefinedCC104LSB: 104;
    readonly undefinedCC105LSB: 105;
    readonly undefinedCC106LSB: 106;
    readonly undefinedCC107LSB: 107;
    readonly undefinedCC108LSB: 108;
    readonly undefinedCC109LSB: 109;
    readonly undefinedCC110LSB: 110;
    readonly undefinedCC111LSB: 111;
    readonly undefinedCC112LSB: 112;
    readonly undefinedCC113LSB: 113;
    readonly undefinedCC114LSB: 114;
    readonly undefinedCC115LSB: 115;
    readonly undefinedCC116LSB: 116;
    readonly undefinedCC117LSB: 117;
    readonly undefinedCC118LSB: 118;
    readonly undefinedCC119LSB: 119;
    readonly allSoundOff: 120;
    readonly resetAllControllers: 121;
    readonly localControlOnOff: 122;
    readonly allNotesOff: 123;
    readonly omniModeOff: 124;
    readonly omniModeOn: 125;
    readonly monoModeOn: 126;
    readonly polyModeOn: 127;
};
type MIDIController = (typeof midiControllers)[keyof typeof midiControllers];

/**
 * Executes a data entry fine (LSB) change for the current channel.
 * @param dataValue The value to set for the data entry fine controller (0-127).
 */
declare function dataEntryFine(this: MIDIChannel, dataValue: number): void;

/**
 * Handles MIDI controller changes for a channel.
 * @param controllerNumber The MIDI controller number (0-127).
 * @param controllerValue The value of the controller (0-127).
 * @param sendEvent If an event should be emitted.
 * @remarks
 * This function processes MIDI controller changes, updating the channel's
 * midiControllers table and handling special cases like bank select,
 * data entry, and sustain pedal. It also computes modulators for all voices
 * in the channel based on the controller change.
 * If the controller number is greater than 127, it is treated as a channel
 * configuration controller, and the `force` parameter must be set to true
 * to allow changes.
 */
declare function controllerChange(this: MIDIChannel, controllerNumber: MIDIController, controllerValue: number, sendEvent?: boolean): void;

/**
 * Executes a data entry coarse (MSB) change for the current channel.
 * @param dataValue The value to set for the data entry coarse controller (0-127).
 */
declare function dataEntryCoarse(this: MIDIChannel, dataValue: number): void;

/**
 * Sends a "MIDI Note on" message and starts a note.
 * @param midiNote The MIDI note number (0-127).
 * @param velocity The velocity of the note (0-127). If less than 1, it will send a note off instead.
 */
declare function noteOn(this: MIDIChannel, midiNote: number, velocity: number): void;

/**
 * Releases a note by its MIDI note number.
 * If the note is in high performance mode and the channel is not a drum channel,
 * it kills the note instead of releasing it.
 * @param midiNote The MIDI note number to release (0-127).
 */
declare function noteOff(this: MIDIChannel, midiNote: number): void;

/**
 * Changes the program (preset) of the channel.
 * @param program The program number (0-127) to change to.
 */
declare function programChange(this: MIDIChannel, program: number): void;

/**
 * A class for dynamic modulators
 * that are assigned for more complex system exclusive messages
 */
declare class DynamicModulatorSystem {
    /**
     * The current dynamic modulator list.
     */
    modulatorList: {
        mod: Modulator;
        id: string;
    }[];
    resetModulators(): void;
    /**
     * @param source Like in midiControllers: values below NON_CC_INDEX_OFFSET are CCs,
     * above are regular modulator sources.
     * @param destination The generator type to modulate.
     * @param amount The amount of modulation to apply.
     * @param isBipolar If true, the modulation is bipolar (ranges from -1 to 1 instead of from 0 to 1).
     * @param isNegative If true, the modulation is negative (goes from 1 to 0 instead of from 0 to 1).
     */
    setModulator(source: ModulatorSourceEnum, destination: GeneratorType, amount: number, isBipolar?: boolean, isNegative?: boolean): void;
    private getModulatorID;
    private deleteModulator;
}

declare class ProtectedSynthValues {
    /**
     * This.tunings[program][key] = tuning
     */
    readonly tunings: MTSProgramTuning[];
    masterParameters: MasterParameterType;
    /**
     * The volume gain, set by MIDI sysEx
     */
    midiVolume: number;
    /**
     * Set via system exclusive.
     * Note: Remember to reset in system reset!
     */
    reverbSend: number;
    /**
     * Set via system exclusive.
     * Note: Remember to reset in system reset!
     */
    chorusSend: number;
    /**
     * The pan of the left channel.
     */
    panLeft: number;
    /**
     * The pan of the right channel.
     */
    panRight: number;
    /**
     * Synth's default (reset) preset.
     */
    defaultPreset: BasicPreset | undefined;
    /**
     * Synth's default (reset) drum preset.
     */
    drumPreset: BasicPreset | undefined;
    readonly volumeEnvelopeSmoothingFactor: number;
    readonly panSmoothingFactor: number;
    readonly filterSmoothingFactor: number;
    /**
     * Calls when an event occurs.
     * @param eventType The event type.
     * @param eventData The event data.
     */
    eventCallbackHandler: <K extends keyof SynthProcessorEventData>(eventType: K, eventData: SynthProcessorEventData[K]) => unknown;
    getVoices: (channel: number, midiNote: number, velocity: number, realKey: number) => VoiceList;
    voiceKilling: (amount: number) => unknown;
    /**
     * Cached voices for all presets for this synthesizer.
     * Nesting is calculated in getCachedVoiceIndex, returns a list of voices for this note.
     */
    cachedVoices: VoiceList[];
    constructor(eventCallbackHandler: <K extends keyof SynthProcessorEventData>(eventType: K, eventData: SynthProcessorEventData[K]) => unknown, getVoices: (channel: number, midiNote: number, velocity: number, realKey: number) => VoiceList, voiceKillingFunction: (amount: number) => unknown, volumeEnvelopeSmoothingFactor: number, panSmoothingFactor: number, filterSmoothingFactor: number);
    /**
     * Copied callback so MIDI channels can call it.
     */
    callEvent<K extends keyof SynthProcessorEventData>(eventName: K, eventData: SynthProcessorEventData[K]): void;
}

/**
 * This class represents a single MIDI Channel within the synthesizer.
 */
declare class MIDIChannel {
    readonly midiControllers: Int16Array;
    /**
     * An array indicating if a controller, at the equivalent index in the midiControllers array, is locked
     * (i.e., not allowed changing).
     * A locked controller cannot be modified.
     */
    lockedControllers: boolean[];
    /**
     * An array of custom (non-SF2) control values such as RPN pitch tuning, transpose, modulation depth, etc.
     * Refer to controller_tables.ts for the index definitions.
     */
    readonly customControllers: Float32Array;
    /**
     * The key shift of the channel (in semitones).
     */
    channelTransposeKeyShift: number;
    /**
     * An array of octave tuning values for each note on the channel.
     * Each index corresponds to a note (0 = C, 1 = C#, ..., 11 = B).
     * Note: Repeated every 12 notes.
     */
    channelOctaveTuning: Int8Array;
    /**
     * A system for dynamic modulator assignment for advanced system exclusives.
     */
    sysExModulators: DynamicModulatorSystem;
    /**
     * Indicates whether this channel is a drum channel.
     */
    drumChannel: boolean;
    /**
     * Enables random panning for every note played on this channel.
     */
    randomPan: boolean;
    /**
     * The current state of the data entry for the channel.
     */
    dataEntryState: DataEntryState;
    /**
     * The currently selected MIDI patch of the channel.
     * Note that the exact matching preset may not be available, but this represents exactly what MIDI asks for.
     */
    readonly patch: MIDIPatch;
    /**
     * The preset currently assigned to the channel.
     */
    preset?: BasicPreset;
    /**
     * Indicates whether the program on this channel is locked.
     */
    lockPreset: boolean;
    /**
     * Indicates the MIDI system when the preset was locked.
     */
    lockedSystem: SynthSystem;
    /**
     * Indicates whether the GS NRPN parameters are enabled for this channel.
     */
    lockGSNRPNParams: boolean;
    /**
     * The vibrato settings for the channel.
     * @property depth - Depth of the vibrato effect in cents.
     * @property delay - Delay before the vibrato effect starts (in seconds).
     * @property rate - Rate of the vibrato oscillation (in Hz).
     */
    channelVibrato: {
        delay: number;
        depth: number;
        rate: number;
    };
    /**
     * An array of voices currently active on the channel.
     */
    voices: VoiceList;
    /**
     * An array of voices that are sustained on the channel.
     */
    sustainedVoices: VoiceList;
    /**
     * The channel's number (0-based index)
     */
    readonly channelNumber: number;
    /**
     * Parent processor instance.
     */
    synth: SpessaSynthProcessor;
    /**
     * Grants access to protected synth values.
     */
    synthProps: ProtectedSynthValues;
    /**
     * Sends a "MIDI Note on" message and starts a note.
     * @param midiNote The MIDI note number (0-127).
     * @param velocity The velocity of the note (0-127). If less than 1, it will send a note off instead.
     */
    noteOn: typeof noteOn;
    /**
     * Releases a note by its MIDI note number.
     * If the note is in high performance mode and the channel is not a drum channel,
     * it kills the note instead of releasing it.
     * @param midiNote The MIDI note number to release (0-127).
     */
    noteOff: typeof noteOff;
    /**
     * Changes the program (preset) of the channel.
     * @param programNumber The program number (0-127) to change to.
     */
    programChange: typeof programChange;
    controllerChange: typeof controllerChange;
    /**
     * Reset all controllers for channel.
     * This will reset all controllers to their default values,
     * except for the locked controllers.
     */
    readonly resetControllers: typeof resetControllers;
    readonly resetPreset: typeof resetPreset;
    /**
     * https://amei.or.jp/midistandardcommittee/Recommended_Practice/e/rp15.pdf
     * Reset controllers according to RP-15 Recommended Practice.
     */
    readonly resetControllersRP15Compliant: typeof resetControllersRP15Compliant;
    /**
     * Reset all parameters to their default values.
     * This includes NRPN and RPN controllers, data entry state,
     * and generator overrides and offsets.
     */
    resetParameters: typeof resetParameters;
    /**
     * Executes a data entry fine (LSB) change for the current channel.
     * @param dataValue The value to set for the data entry fine controller (0-127).
     */
    dataEntryFine: typeof dataEntryFine;
    /**
     * Executes a data entry coarse (MSB) change for the current channel.
     * @param dataValue The value to set for the data entry coarse controller (0-127).
     */
    dataEntryCoarse: typeof dataEntryCoarse;
    /**
     * Will be updated every time something tuning-related gets changed.
     * This is used to avoid a big addition for every voice rendering call.
     */
    protected channelTuningCents: number;
    /**
     * An array of offsets generators for SF2 nrpn support.
     * A value of 0 means no change; -10 means 10 lower, etc.
     */
    protected generatorOffsets: Int16Array;
    /**
     * A small optimization that disables applying offsets until at least one is set.
     */
    protected generatorOffsetsEnabled: boolean;
    /**
     * An array of override generators for AWE32 support.
     * A value of 32,767 means unchanged, as it is not allowed anywhere.
     */
    protected generatorOverrides: Int16Array;
    /**
     * A small optimization that disables applying overrides until at least one is set.
     */
    protected generatorOverridesEnabled: boolean;
    protected renderVoice: (voice: Voice, timeNow: number, outputLeft: Float32Array<ArrayBufferLike>, outputRight: Float32Array<ArrayBufferLike>, reverbOutputLeft: Float32Array<ArrayBufferLike>, reverbOutputRight: Float32Array<ArrayBufferLike>, chorusOutputLeft: Float32Array<ArrayBufferLike>, chorusOutputRight: Float32Array<ArrayBufferLike>, startIndex: number, sampleCount: number) => boolean;
    protected panAndMixVoice: (voice: Voice, inputBuffer: Float32Array<ArrayBufferLike>, outputLeft: Float32Array<ArrayBufferLike>, outputRight: Float32Array<ArrayBufferLike>, reverbLeft: Float32Array<ArrayBufferLike>, reverbRight: Float32Array<ArrayBufferLike>, chorusLeft: Float32Array<ArrayBufferLike>, chorusRight: Float32Array<ArrayBufferLike>, startIndex: number) => void;
    protected computeModulators: (voice: Voice, sourceUsesCC?: 0 | 1 | -1 | undefined, sourceIndex?: number | undefined) => void;
    /**
     * Constructs a new MIDI channel.
     */
    constructor(synth: SpessaSynthProcessor, synthProps: ProtectedSynthValues, preset: BasicPreset | undefined, channelNumber: number);
    /**
     * Indicates whether the channel is muted.
     */
    protected _isMuted: boolean;
    /**
     * Indicates whether the channel is muted.
     */
    get isMuted(): boolean;
    /**
     * Indicates whether the sustain (hold) pedal is active.
     */
    get holdPedal(): boolean;
    protected get channelSystem(): SynthSystem;
    /**
     * Transposes the channel by given amount of semitones.
     * @param semitones The number of semitones to transpose the channel by. Can be decimal.
     * @param force Defaults to false, if true, it will force the transpose even if the channel is a drum channel.
     */
    transposeChannel(semitones: number, force?: boolean): void;
    /**
     * Sets the octave tuning for a given channel.
     * @param tuning The tuning array of 12 values, each representing the tuning for a note in the octave.
     * @remarks
     * Cent tunings are relative.
     */
    setOctaveTuning(tuning: Int8Array): void;
    /**
     * Sets the modulation depth for the channel.
     * @param cents The modulation depth in cents to set.
     * @remarks
     * This method sets the modulation depth for the channel by converting the given cents value into a
     * multiplier. The MIDI specification assumes the default modulation depth is 50 cents,
     * but it may vary for different sound banks.
     * For example, if you want a modulation depth of 100 cents,
     * the multiplier will be 2,
     * which, for a preset with a depth of 50,
     * will create a total modulation depth of 100 cents.
     *
     */
    setModulationDepth(cents: number): void;
    /**
     * Sets the channel's tuning.
     * @param cents The tuning in cents to set.
     * @param log If true, logs the change to the console.
     */
    setTuning(cents: number, log?: boolean): void;
    /**
     * Sets the pitch of the given channel.
     * @param pitch The pitch (0 - 16384)
     */
    pitchWheel(pitch: number): void;
    /**
     * Sets the channel pressure (MIDI Aftertouch).
     * @param pressure the pressure of the channel.
     */
    channelPressure(pressure: number): void;
    /**
     * Sets the pressure of the given note on a specific channel.
     * This is used for polyphonic pressure (aftertouch).
     * @param midiNote 0 - 127, the MIDI note number to set the pressure for.
     * @param pressure 0 - 127, the pressure value to set for the note.
     */
    polyPressure(midiNote: number, pressure: number): void;
    setCustomController(type: CustomController, value: number): void;
    updateChannelTuning(): void;
    /**
     * Renders Float32 audio for this channel.
     * @param outputLeft the left output buffer.
     * @param outputRight the right output buffer.
     * @param reverbOutputLeft left output for reverb.
     * @param reverbOutputRight right output for reverb.
     * @param chorusOutputLeft left output for chorus.
     * @param chorusOutputRight right output for chorus.
     * @param startIndex start index offset.
     * @param sampleCount sample count to render.
     */
    renderAudio(outputLeft: Float32Array, outputRight: Float32Array, reverbOutputLeft: Float32Array, reverbOutputRight: Float32Array, chorusOutputLeft: Float32Array, chorusOutputRight: Float32Array, startIndex: number, sampleCount: number): void;
    /**
     * Locks or unlocks the preset from MIDI program changes.
     * @param locked If the preset should be locked.
     */
    setPresetLock(locked: boolean): void;
    /**
     * Changes the preset to, or from drums.
     * Note that this executes a program change.
     * @param isDrum If the channel should be a drum preset or not.
     */
    setDrums(isDrum: boolean): void;
    /**
     * Sets the channel to a given MIDI patch.
     * Note that this executes a program change.
     * @param patch The MIDI patch to set the channel to.
     */
    setPatch(patch: MIDIPatch): void;
    /**
     * Sets the GM/GS drum flag.
     * @param drums
     */
    setGSDrums(drums: boolean): void;
    /**
     * Sets a custom vibrato.
     * @param depth In cents.
     * @param rate In Hertz.
     * @param delay seconds.
     */
    setVibrato(depth: number, rate: number, delay: number): void;
    /**
     * Disables and locks all GS NPRN parameters, including the custom vibrato.
     */
    disableAndLockGSNRPN(): void;
    resetGeneratorOverrides(): void;
    setGeneratorOverride(gen: GeneratorType, value: number, realtime?: boolean): void;
    resetGeneratorOffsets(): void;
    setGeneratorOffset(gen: GeneratorType, value: number): void;
    /**
     * Stops a note nearly instantly.
     * @param midiNote The note to stop.
     * @param releaseTime in timecents, defaults to -12000 (very short release).
     */
    killNote(midiNote: number, releaseTime?: number): void;
    /**
     * Stops all notes on the channel.
     * @param force If true, stops all notes immediately, otherwise applies release time.
     */
    stopAllNotes(force?: boolean): void;
    /**
     * Mutes or unmutes a channel.
     * @param isMuted If the channel should be muted.
     */
    muteChannel(isMuted: boolean): void;
    /**
     * Sends this channel's property
     */
    sendChannelProperty(): void;
    protected setBankMSB(bankMSB: number): void;
    protected setBankLSB(bankLSB: number): void;
    /**
     * Sets drums on channel.
     */
    protected setDrumFlag(isDrum: boolean): void;
}

/**
 * Executes a full system reset of all controllers.
 * This will reset all controllers to their default values,
 * except for the locked controllers.
 */
declare function resetAllControllersInternal(this: SpessaSynthProcessor, system?: SynthSystem): void;
/**
 * Reset all controllers for channel.
 * This will reset all controllers to their default values,
 * except for the locked controllers.
 */
declare function resetControllers(this: MIDIChannel, sendCCEvents?: boolean): void;
declare function resetPreset(this: MIDIChannel): void;
/**
 * https://amei.or.jp/midistandardcommittee/Recommended_Practice/e/rp15.pdf
 * Reset controllers according to RP-15 Recommended Practice.
 */
declare function resetControllersRP15Compliant(this: MIDIChannel): void;
/**
 * Reset all parameters to their default values.
 * This includes NRPN and RPN controllers, data entry state,
 * and generator overrides and offsets.
 */
declare function resetParameters(this: MIDIChannel): void;

/**
 * Represents a snapshot of a single channel's state in the synthesizer.
 */
declare class ChannelSnapshot {
    /**
     * The MIDI patch that the channel is using.
     */
    patch: MIDIPatchNamed;
    /**
     * Indicates whether the channel's program change is disabled.
     */
    lockPreset: boolean;
    /**
     * Indicates the MIDI system when the preset was locked
     */
    lockedSystem: SynthSystem;
    /**
     * The array of all MIDI controllers (in 14-bit values) with the modulator sources at the end.
     */
    midiControllers: Int16Array;
    /**
     * An array of booleans, indicating if the controller with a current index is locked.
     */
    lockedControllers: boolean[];
    /**
     * Array of custom (not SF2) control values such as RPN pitch tuning, transpose, modulation depth, etc.
     */
    customControllers: Float32Array;
    /**
     * Indicates whether the channel vibrato is locked.
     */
    lockVibrato: boolean;
    /**
     * The channel's vibrato settings.
     * @property depth Vibrato depth, in gain.
     * @property delay Vibrato delay from note on in seconds.
     * @property rate Vibrato rate in Hz.
     */
    channelVibrato: {
        depth: number;
        delay: number;
        rate: number;
    };
    /**
     * Key shift for the channel.
     */
    channelTransposeKeyShift: number;
    /**
     * The channel's octave tuning in cents.
     */
    channelOctaveTuning: Int8Array;
    /**
     * Indicates whether the channel is muted.
     */
    isMuted: boolean;
    /**
     * Indicates whether the channel is a drum channel.
     */
    drumChannel: boolean;
    /**
     * The channel number this snapshot represents.
     */
    channelNumber: number;
    constructor(patch: MIDIPatchNamed, lockPreset: boolean, lockedSystem: SynthSystem, midiControllers: Int16Array, lockedControllers: boolean[], customControllers: Float32Array, lockVibrato: boolean, channelVibrato: {
        delay: number;
        depth: number;
        rate: number;
    }, channelTransposeKeyShift: number, channelOctaveTuning: Int8Array, isMuted: boolean, drumChannel: boolean, channelNumber: number);
    /**
     * Creates a copy of existing snapshot.
     * @param snapshot The snapshot to create a copy from.
     */
    static copyFrom(snapshot: ChannelSnapshot): ChannelSnapshot;
    /**
     * Creates a snapshot of the channel's state.
     * @param spessaSynthProcessor The synthesizer processor containing the channel.
     * @param channelNumber The channel number to snapshot.
     */
    static create(spessaSynthProcessor: SpessaSynthProcessor, channelNumber: number): ChannelSnapshot;
    /**
     * Applies the snapshot to the specified channel.
     * @param spessaSynthProcessor The processor containing the channel.
     */
    apply(spessaSynthProcessor: SpessaSynthProcessor): void;
}

/**
 * A manager for custom key overrides for channels
 */

declare class KeyModifier {
    /**
     * The new override velocity. -1 means unchanged.
     */
    velocity: number;
    /**
     * The MIDI patch this key uses. -1 on any property means unchanged.
     */
    patch: MIDIPatch;
    /**
     * Linear gain override for the voice.
     */
    gain: number;
}
declare class KeyModifierManager {
    /**
     * The velocity override mappings for MIDI keys
     * stored as [channelNumber][midiNote].
     */
    private keyMappings;
    /**
     * Add a mapping for a MIDI key to a KeyModifier.
     * @param channel The MIDI channel number.
     * @param midiNote The MIDI note number (0-127).
     * @param mapping The KeyModifier to apply for this key.
     */
    addMapping(channel: number, midiNote: number, mapping: KeyModifier): void;
    /**
     * Delete a mapping for a MIDI key.
     * @param channel The MIDI channel number.
     * @param midiNote The MIDI note number (0-127).
     */
    deleteMapping(channel: number, midiNote: number): void;
    /**
     * Clear all key mappings.
     */
    clearMappings(): void;
    /**
     * Sets the key mappings to a new array.
     * @param mappings A 2D array where the first dimension is the channel number and the second dimension is the MIDI note number.
     */
    setMappings(mappings: (KeyModifier | undefined)[][]): void;
    /**
     * Returns the current key mappings.
     */
    getMappings(): (KeyModifier | undefined)[][];
    /**
     * Gets the velocity override for a MIDI key.
     * @param channel The MIDI channel number.
     * @param midiNote The MIDI note number (0-127).
     * @returns The velocity override, or -1 if no override is set.
     */
    getVelocity(channel: number, midiNote: number): number;
    /**
     * Gets the gain override for a MIDI key.
     * @param channel The MIDI channel number.
     * @param midiNote The MIDI note number (0-127).
     * @returns The gain override, or 1 if no override is set.
     */
    getGain(channel: number, midiNote: number): number;
    /**
     * Checks if a MIDI key has an override for the patch.
     * @param channel The MIDI channel number.
     * @param midiNote The MIDI note number (0-127).
     * @returns True if the key has an override patch, false otherwise.
     */
    hasOverridePatch(channel: number, midiNote: number): boolean;
    /**
     * Gets the patch override for a MIDI key.
     * @param channel The MIDI channel number.
     * @param midiNote The MIDI note number (0-127).
     * @returns An object containing the bank and program numbers.
     * @throws Error if no modifier is set for the key.
     */
    getPatch(channel: number, midiNote: number): MIDIPatch;
}

/**
 * Represents a snapshot of the synthesizer's state.
 */
declare class SynthesizerSnapshot {
    /**
     * The individual channel snapshots.
     */
    channelSnapshots: ChannelSnapshot[];
    /**
     * Key modifiers.
     */
    keyMappings: (KeyModifier | undefined)[][];
    masterParameters: MasterParameterType;
    constructor(channelSnapshots: ChannelSnapshot[], masterParameters: MasterParameterType, keyMappings: (KeyModifier | undefined)[][]);
    /**
     * Creates a new synthesizer snapshot from the given SpessaSynthProcessor.
     * @param processor the processor to take a snapshot of.
     * @returns The snapshot.
     */
    static create(processor: SpessaSynthProcessor): SynthesizerSnapshot;
    /**
     * Creates a copy of existing snapshot.
     * @param snapshot The snapshot to create a copy from.
     */
    static copyFrom(snapshot: SynthesizerSnapshot): SynthesizerSnapshot;
    /**
     * Applies the snapshot to the synthesizer.
     * @param processor the processor to apply the snapshot to.
     */
    apply(processor: SpessaSynthProcessor): void;
}

/**
 * Processor.ts
 * purpose: the core synthesis engine
 */
declare class SpessaSynthProcessor {
    soundBankManager: SoundBankManager;
    /**
     * All MIDI channels of the synthesizer.
     */
    midiChannels: MIDIChannel[];
    /**
     * Handles the custom key overrides: velocity and preset
     */
    keyModifierManager: KeyModifierManager;
    /**
     * Current total amount of voices that are currently playing.
     */
    totalVoicesAmount: number;
    /**
     * Controls if the processor is fully initialized.
     */
    readonly processorInitialized: Promise<boolean>;
    /**
     * The current time of the synthesizer, in seconds. You probably should not modify this directly.
     */
    currentSynthTime: number;
    /**
     * Sample rate in Hertz.
     */
    readonly sampleRate: number;
    /**
     * Are the chorus and reverb effects enabled?
     */
    enableEffects: boolean;
    /**
     * Is the event system enabled?
     */
    enableEventSystem: boolean;
    /**
     * Calls when an event occurs.
     * @param event The event that occurred.
     */
    onEventCall?: (event: SynthProcessorEvent) => unknown;
    /**
     * Executes a system exclusive message for the synthesizer.
     * @param syx The system exclusive message as an array of bytes.
     * @param channelOffset The channel offset to apply (default is 0).
     */
    readonly systemExclusive: typeof systemExclusiveInternal;
    /**
     * Executes a full system reset of all controllers.
     * This will reset all controllers to their default values,
     * except for the locked controllers.
     */
    readonly resetAllControllers: typeof resetAllControllersInternal;
    /**
     * Sets a master parameter of the synthesizer.
     * @param type The type of the master parameter to set.
     * @param value The value to set for the master parameter.
     */
    readonly setMasterParameter: typeof setMasterParameterInternal;
    /**
     * Gets a master parameter of the synthesizer.
     * @param type The type of the master parameter to get.
     * @returns The value of the master parameter.
     */
    readonly getMasterParameter: typeof getMasterParameterInternal;
    /**
     * Gets all master parameters of the synthesizer.
     * @returns All the master parameters.
     */
    readonly getAllMasterParameters: typeof getAllMasterParametersInternal;
    /**
     * Gets voices for a preset.
     * @param preset The preset to get voices for.
     * @param bankMSB The bank to cache the voices in.
     * @param program Program to cache the voices in.
     * @param midiNote The MIDI note to use.
     * @param velocity The velocity to use.
     * @param realKey The real MIDI note if the "midiNote" was changed by MIDI Tuning Standard.
     * @returns Output is an array of voices.
     * @remarks
     * This is a public method, but it is only intended to be used by the sequencer.
     */
    readonly getVoicesForPreset: typeof getVoicesForPresetInternal;
    /**
     * Kills the specified number of voices based on their priority.
     * @param amount The number of voices to remove.
     */
    readonly killVoices: typeof killVoicesIntenral;
    protected readonly getVoices: (channel: number, midiNote: number, velocity: number, realKey: number) => VoiceList;
    protected privateProps: ProtectedSynthValues;
    /**
     * Tor applying the snapshot after an override sound bank too.
     */
    protected savedSnapshot?: SynthesizerSnapshot;
    /**
     * Synth's event queue from the main thread
     */
    protected eventQueue: {
        callback: () => unknown;
        time: number;
    }[];
    private readonly sampleTime;
    /**
     * Creates a new synthesizer engine.
     * @param sampleRate sample rate, in Hertz.
     * @param opts the processor's options.
     */
    constructor(sampleRate: number, opts?: Partial<SynthProcessorOptions>);
    /**
     * Applies the snapshot to the synth
     */
    applySynthesizerSnapshot(snapshot: SynthesizerSnapshot): void;
    /**
     * Gets a synthesizer snapshot from this processor instance.
     */
    getSnapshot(): SynthesizerSnapshot;
    /**
     * Sets the embedded sound bank.
     * @param bank The sound bank file to set.
     * @param offset The bank offset of the embedded sound bank.
     */
    setEmbeddedSoundBank(bank: ArrayBuffer, offset: number): void;
    clearEmbeddedBank(): void;
    createMIDIChannel(): void;
    /**
     * Stops all notes on all channels.
     * @param force if true, all notes are stopped immediately, otherwise they are stopped gracefully.
     */
    stopAllChannels(force?: boolean): void;
    /**
     * Renders float32 audio data to stereo outputs; buffer size of 128 is recommended.
     * All float arrays must have the same length.
     * @param outputs output stereo channels (L, R).
     * @param reverb reverb stereo channels (L, R).
     * @param chorus chorus stereo channels (L, R).
     * @param startIndex start offset of the passed arrays, rendering starts at this index, defaults to 0.
     * @param sampleCount the length of the rendered buffer, defaults to float32array length - startOffset.
     */
    renderAudio(outputs: Float32Array[], reverb: Float32Array[], chorus: Float32Array[], startIndex?: number, sampleCount?: number): void;
    /**
     * Renders the float32 audio data of each channel; buffer size of 128 is recommended.
     * All float arrays must have the same length.
     * @param reverbChannels reverb stereo channels (L, R).
     * @param chorusChannels chorus stereo channels (L, R).
     * @param separateChannels a total of 16 stereo pairs (L, R) for each MIDI channel.
     * @param startIndex start offset of the passed arrays, rendering starts at this index, defaults to 0.
     * @param sampleCount the length of the rendered buffer, defaults to float32array length - startOffset.
     */
    renderAudioSplit(reverbChannels: Float32Array[], chorusChannels: Float32Array[], separateChannels: Float32Array[][], startIndex?: number, sampleCount?: number): void;
    /**
     *  Destroy the synthesizer processor, clearing all channels and voices.
     *  This is irreversible, so use with caution.
     */
    destroySynthProcessor(): void;
    /**
     * Executes a MIDI controller change message on the specified channel.
     * @param channel The MIDI channel to change the controller on.
     * @param controllerNumber The MIDI controller number to change.
     * @param controllerValue The value to set the controller to.
     */
    controllerChange(channel: number, controllerNumber: MIDIController, controllerValue: number): void;
    /**
     * Executes a MIDI Note-on message on the specified channel.
     * @param channel The MIDI channel to send the note on.
     * @param midiNote The MIDI note number to play.
     * @param velocity The velocity of the note, from 0 to 127.
     * @remarks
     * If the velocity is 0, it will be treated as a Note-off message.
     */
    noteOn(channel: number, midiNote: number, velocity: number): void;
    /**
     * Executes a MIDI Note-off message on the specified channel.
     * @param channel The MIDI channel to send the note off.
     * @param midiNote The MIDI note number to stop playing.
     */
    noteOff(channel: number, midiNote: number): void;
    /**
     * Executes a MIDI Poly Pressure (Aftertouch) message on the specified channel.
     * @param channel The MIDI channel to send the poly pressure on.
     * @param midiNote The MIDI note number to apply the pressure to.
     * @param pressure The pressure value, from 0 to 127.
     */
    polyPressure(channel: number, midiNote: number, pressure: number): void;
    /**
     * Executes a MIDI Channel Pressure (Aftertouch) message on the specified channel.
     * @param channel The MIDI channel to send the channel pressure on.
     * @param pressure The pressure value, from 0 to 127.
     */
    channelPressure(channel: number, pressure: number): void;
    /**
     * Executes a MIDI Pitch Wheel message on the specified channel.
     * @param channel The MIDI channel to send the pitch wheel on.
     * @param pitch The new pitch value: 0-16384
     */
    pitchWheel(channel: number, pitch: number): void;
    /**
     * Executes a MIDI Program Change message on the specified channel.
     * @param channel The MIDI channel to send the program change on.
     * @param programNumber The program number to change to, from 0 to 127.
     */
    programChange(channel: number, programNumber: number): void;
    /**
     * Processes a raw MIDI message.
     * @param message The message to process.
     * @param channelOffset The channel offset for the message.
     * @param force If true, forces the message to be processed.
     * @param options Additional options for scheduling the message.
     */
    processMessage(message: Uint8Array | number[], channelOffset?: number, force?: boolean, options?: SynthMethodOptions): void;
    clearCache(): void;
    /**
     * @param volume {number} 0 to 1
     */
    protected setMIDIVolume(volume: number): void;
    /**
     * Sets the synth's primary tuning.
     * @param cents
     */
    protected setMasterTuning(cents: number): void;
    /**
     * Calls synth event
     * @param eventName the event name
     * @param eventData the event data
     */
    protected callEvent<K extends keyof SynthProcessorEventData>(eventName: K, eventData: SynthProcessorEventData[K]): void;
    protected getCachedVoice(patch: MIDIPatch, midiNote: number, velocity: number): VoiceList | undefined;
    protected setCachedVoice(patch: MIDIPatch, midiNote: number, velocity: number, voices: VoiceList): void;
    private getCachedVoiceIndex;
    private createMIDIChannelInternal;
    private updatePresetList;
    private getDefaultPresets;
}

declare class LowpassFilter {
    /**
     * Cached coefficient calculations.
     * stored as cachedCoefficients[resonanceCb][currentInitialFc].
     */
    private static cachedCoefficients;
    /**
     * Resonance in centibels.
     */
    resonanceCb: number;
    /**
     * Current cutoff frequency in absolute cents.
     */
    currentInitialFc: number;
    /**
     * Filter coefficient 1.
     */
    private a0;
    /**
     * Filter coefficient 2.
     */
    private a1;
    /**
     * Filter coefficient 3.
     */
    private a2;
    /**
     * Filter coefficient 4.
     */
    private a3;
    /**
     * Filter coefficient 5.
     */
    private a4;
    /**
     * Input history 1.
     */
    private x1;
    /**
     * Input history 2.
     */
    private x2;
    /**
     * Output history 1.
     */
    private y1;
    /**
     * Output history 2.
     */
    private y2;
    /**
     * For tracking the last cutoff frequency in the apply method, absolute cents.
     * Set to infinity to force recalculation.
     */
    private lastTargetCutoff;
    /**
     * Used for tracking if the filter has been initialized.
     */
    private initialized;
    /**
     * Filter's sample rate in Hz.
     */
    private sampleRate;
    /**
     * Maximum cutoff frequency in Hz.
     * This is used to prevent aliasing and ensure the filter operates within the valid frequency range.
     */
    private maxCutoff;
    /**
     * Initializes a new instance of the filter.
     * @param sampleRate the sample rate of the audio engine in Hz.
     */
    constructor(sampleRate: number);
    /**
     * Applies the lowpass filter to the output buffer of a voice.
     * @param voice The voice to apply the filter to.
     * @param outputBuffer The output buffer to filter.
     * @param fcExcursion The frequency excursion in cents to apply to the filter.
     * @param smoothingFactor The smoothing factor for the filter as determined by the parent synthesizer.
     */
    static apply(voice: Voice, outputBuffer: Float32Array, fcExcursion: number, smoothingFactor: number): void;
    /**
     * Calculates the filter coefficients based on the current resonance and cutoff frequency and caches them.
     * @param filter The lowpass filter instance to calculate coefficients for.
     * @param cutoffCents The cutoff frequency in cents.
     */
    static calculateCoefficients(filter: LowpassFilter, cutoffCents: number): void;
}

/**
 * VOL ENV STATES:
 * 0 - delay
 * 1 - attack
 * 2 - hold/peak
 * 3 - decay
 * 4 - sustain
 * release indicates by isInRelease property
 */
type VolumeEnvelopeState = 0 | 1 | 2 | 3 | 4;
declare class VolumeEnvelope {
    /**
     * The sample rate in Hz.
     */
    sampleRate: number;
    /**
     * The current attenuation of the envelope in dB.
     */
    currentAttenuationDb: number;
    /**
     * The current stage of the volume envelope.
     */
    state: VolumeEnvelopeState;
    /**
     * The voice's absolute attenuation as linear gain.
     */
    attenuation: number;
    /**
     * The attenuation target, which the "attenuation" property is linearly interpolated towards (gain).
     */
    attenuationTargetGain: number;
    /**
     * The envelope's current time in samples.
     */
    protected currentSampleTime: number;
    /**
     * The dB attenuation of the envelope when it entered the release stage.
     */
    protected releaseStartDb: number;
    /**
     * The time in samples relative to the start of the envelope.
     */
    protected releaseStartTimeSamples: number;
    /**
     * The current gain applied to the voice in the release stage.
     */
    protected currentReleaseGain: number;
    /**
     * The attack duration in samples.
     */
    protected attackDuration: number;
    /**
     * The decay duration in samples.
     */
    protected decayDuration: number;
    /**
     * The release duration in samples.
     */
    protected releaseDuration: number;
    /**
     * The attenuation target, which the "attenuation" property is linearly interpolated towards (dB).
     */
    protected attenuationTarget: number;
    /**
     * The voice's sustain amount in dB, relative to attenuation.
     */
    protected sustainDbRelative: number;
    /**
     * The time in samples to the end of delay stage, relative to the start of the envelope.
     */
    protected delayEnd: number;
    /**
     * The time in samples to the end of attack stage, relative to the start of the envelope.
     */
    protected attackEnd: number;
    /**
     * The time in samples to the end of hold stage, relative to the start of the envelope.
     */
    protected holdEnd: number;
    /**
     * The time in samples to the end of decay stage, relative to the start of the envelope.
     */
    protected decayEnd: number;
    /**
     * If sustain stage is silent,
     * then we can turn off the voice when it is silent.
     * We can't do that with modulated as it can silence the volume and then raise it again, and the voice must keep playing.
     */
    protected canEndOnSilentSustain: boolean;
    /**
     * @param sampleRate Hz
     * @param initialDecay cb
     */
    constructor(sampleRate: number, initialDecay: number);
    /**
     * Starts the release phase in the envelope.
     * @param voice the voice this envelope belongs to.
     */
    static startRelease(voice: Voice): void;
    /**
     * Recalculates the envelope
     * @param voice the voice this envelope belongs to
     */
    static recalculate(voice: Voice): void;
    /**
     * Applies volume envelope gain to the given output buffer.
     * Essentially we use approach of 100dB is silence, 0dB is peak, and always add attenuation to that (which is interpolated).
     * @param voice the voice we're working on
     * @param audioBuffer the audio buffer to modify
     * @param centibelOffset the centibel offset of volume, for modLFOtoVolume
     * @param smoothingFactor the adjusted smoothing factor for the envelope
     */
    static apply(voice: Voice, audioBuffer: Float32Array, centibelOffset: number, smoothingFactor: number): void;
}

declare class ModulationEnvelope {
    /**
     * The attack duration, in seconds.
     */
    protected attackDuration: number;
    /**
     * The decay duration, in seconds.
     */
    protected decayDuration: number;
    /**
     * The hold duration, in seconds.
     */
    protected holdDuration: number;
    /**
     * Release duration, in seconds.
     */
    protected releaseDuration: number;
    /**
     * The sustain level 0-1.
     */
    protected sustainLevel: number;
    /**
     * Delay phase end time in seconds, absolute (audio context time).
     */
    protected delayEnd: number;
    /**
     * Attack phase end time in seconds, absolute (audio context time).
     */
    protected attackEnd: number;
    /**
     * Hold phase end time in seconds, absolute (audio context time).
     */
    protected holdEnd: number;
    /**
     * Decay phase end time in seconds, absolute (audio context time).
     */
    protected decayEnd: number;
    /**
     * The level of the envelope when the release phase starts.
     */
    protected releaseStartLevel: number;
    /**
     * The current modulation envelope value.
     */
    protected currentValue: number;
    /**
     * Starts the release phase in the envelope.
     * @param voice the voice this envelope belongs to.
     */
    static startRelease(voice: Voice): void;
    /**
     * @param voice the voice to recalculate.
     */
    static recalculate(voice: Voice): void;
    /**
     * Calculates the current modulation envelope value for the given time and voice.
     * @param voice the voice we are working on.
     * @param currentTime in seconds.
     * @param ignoreRelease if true, it will compute the value as if the voice was not released.
     * @returns  mod env value, from 0 to 1.
     */
    static getValue(voice: Voice, currentTime: number, ignoreRelease?: boolean): number;
}

declare class AudioSample {
    /**
     * The sample's audio data
     */
    readonly sampleData: Float32Array;
    /**
     * Current playback step (rate)
     */
    readonly playbackStep: number;
    /**
     * Current position in the sample
     */
    cursor: number;
    /**
     * MIDI root key of the sample
     */
    readonly rootKey: number;
    /**
     * Start position of the loop
     */
    loopStart: number;
    /**
     * End position of the loop
     */
    loopEnd: number;
    /**
     * End position of the sample
     */
    end: number;
    /**
     * Looping mode of the sample:
     * 0 - no loop
     * 1 - loop
     * 2 - UNOFFICIAL: polyphone 2.4 added start on release
     * 3 - loop then play when released
     */
    loopingMode: SampleLoopingMode;
    /**
     * Indicates if the sample is currently looping
     */
    isLooping: boolean;
    /**
     * @param data
     * @param playbackStep the playback step, a single increment
     * @param cursorStart the sample id which starts the playback
     * @param rootKey MIDI root key
     * @param loopStart loop start index
     * @param loopEnd loop end index
     * @param endIndex sample end index (for end offset)
     * @param loopingMode sample looping mode
     */
    constructor(data: Float32Array, playbackStep: number, cursorStart: number, rootKey: number, loopStart: number, loopEnd: number, endIndex: number, loopingMode: SampleLoopingMode);
}

/**
 * Voice.ts
 * purpose: prepares Voices from sample and generator data
 */

/**
 * Voice represents a single instance of the
 * SoundFont2 synthesis model.
 * That is:
 * A wavetable oscillator (sample)
 * A volume envelope (volumeEnvelope)
 * A modulation envelope (modulationEnvelope)
 * Generators (generators and modulatedGenerators)
 * Modulators (modulators)
 * And MIDI params such as channel, MIDI note, velocity
 */
declare class Voice {
    /**
     * The sample of the voice.
     */
    sample: AudioSample;
    /**
     * Lowpass filter applied to the voice.
     */
    filter: LowpassFilter;
    /**
     * Linear gain of the voice. Used with Key Modifiers.
     */
    gain: number;
    /**
     * The unmodulated (copied to) generators of the voice.
     */
    generators: Int16Array;
    /**
     * The voice's modulators.
     */
    modulators: Modulator[];
    /**
     * Resonance offset, it is affected by the default resonant modulator
     */
    resonanceOffset: number;
    /**
     * The generators in real-time, affected by modulators.
     * This is used during rendering.
     */
    modulatedGenerators: Int16Array;
    /**
     * Indicates if the voice is finished.
     */
    finished: boolean;
    /**
     * Indicates if the voice is in the release phase.
     */
    isInRelease: boolean;
    /**
     * Velocity of the note.
     */
    velocity: number;
    /**
     * MIDI note number.
     */
    midiNote: number;
    /**
     * The pressure of the voice
     */
    pressure: number;
    /**
     * Target key for the note.
     */
    targetKey: number;
    /**
     * Modulation envelope.
     */
    modulationEnvelope: ModulationEnvelope;
    /**
     * Volume envelope.
     */
    volumeEnvelope: VolumeEnvelope;
    /**
     * Start time of the voice, absolute.
     */
    startTime: number;
    /**
     * Start time of the release phase, absolute.
     */
    releaseStartTime: number;
    /**
     * Current tuning in cents.
     */
    currentTuningCents: number;
    /**
     * Current calculated tuning. (as in ratio)
     */
    currentTuningCalculated: number;
    /**
     * From -500 to 500.
     */
    currentPan: number;
    /**
     * If MIDI Tuning Standard is already applied (at note-on time),
     * this will be used to take the values at real-time tuning as "midiNote"
     * property contains the tuned number.
     * see  SpessaSynth#29 comment by @paulikaro
     */
    realKey: number;
    /**
     * Initial key to glide from, MIDI Note number. If -1, the portamento is OFF.
     */
    portamentoFromKey: number;
    /**
     * Duration of the linear glide, in seconds.
     */
    portamentoDuration: number;
    /**
     * From -500 to 500, where zero means disabled (use the channel pan). Used for random pan.
     */
    overridePan: number;
    /**
     * Exclusive class number for hi-hats etc.
     */
    exclusiveClass: number;
    /**
     * Creates a Voice.
     */
    constructor(sampleRate: number, audioSample: AudioSample, midiNote: number, velocity: number, currentTime: number, targetKey: number, realKey: number, generators: Int16Array, modulators: Modulator[]);
    /**
     * Copies a voice.
     */
    static copyFrom(voice: Voice, currentTime: number, realKey: number): Voice;
    /**
     * Releases the voice as exclusiveClass.
     */
    exclusiveRelease(currentTime: number): void;
    /**
     * Stops the voice
     * @param currentTime
     * @param minNoteLength minimum note length in seconds
     */
    release(currentTime: number, minNoteLength?: number): void;
}
/**
 * @param preset the preset to get voices for
 * @param midiNote the MIDI note to use
 * @param velocity the velocity to use
 * @param realKey the real MIDI note if the "midiNote" was changed by MIDI Tuning Standard
 * @returns output is an array of Voices
 */
declare function getVoicesForPresetInternal(this: SpessaSynthProcessor, preset: BasicPreset, midiNote: number, velocity: number, realKey: number): VoiceList;

declare class ModulatorSource {
    /**
     * If this field is set to false, the controller should be mapped with a minimum value of 0 and a maximum value of 1. This is also
     * called Unipolar. Thus, it behaves similar to the Modulation Wheel controller of the MIDI specification.
     *
     * If this field is set to true, the controller sound be mapped with a minimum value of -1 and a maximum value of 1. This is also
     * called Bipolar. Thus, it behaves similar to the Pitch Wheel controller of the MIDI specification.
     */
    isBipolar: boolean;
    /**
     * If this field is set true, the direction of the controller should be from the maximum value to the minimum value. So, for
     * example, if the controller source is Key Number, then a Key Number value of 0 corresponds to the maximum possible
     * controller output, and the Key Number value of 127 corresponds to the minimum possible controller input.
     */
    isNegative: boolean;
    /**
     * The index of the source.
     * It can point to one of the MIDI controllers or one of the predefined sources, depending on the 'isCC' flag.
     */
    index: ModulatorSourceIndex;
    /**
     * If this field is set to true, the MIDI Controller Palette is selected. The ‘index’ field value corresponds to one of the 128
     * MIDI Continuous Controller messages as defined in the MIDI specification.
     */
    isCC: boolean;
    /**
     * This field specifies how the minimum value approaches the maximum value.
     */
    curveType: ModulatorCurveType;
    constructor(index?: ModulatorSourceIndex, curveType?: ModulatorCurveType, isCC?: boolean, isBipolar?: boolean, isNegative?: boolean);
    private get sourceName();
    private get curveTypeName();
    static fromSourceEnum(sourceEnum: number): ModulatorSource;
    /**
     * Copies the modulator source.
     * @param source The source to copy from.
     * @returns the copied source.
     */
    static copyFrom(source: ModulatorSource): ModulatorSource;
    toString(): string;
    toSourceEnum(): number;
    isIdentical(source: ModulatorSource): boolean;
    /**
     * Gets the current value from this source.
     * @param midiControllers The MIDI controller + modulator source array.
     * @param voice The voice to get the data for.
     */
    getValue(midiControllers: Int16Array, voice: Voice): number;
}

declare class Modulator {
    /**
     * The current computed value of this modulator. Only used in the synthesis engine for local voices.
     */
    currentValue: number;
    /**
     * The generator destination of this modulator.
     */
    destination: GeneratorType;
    /**
     * The transform amount for this modulator.
     */
    transformAmount: number;
    /**
     * The transform type for this modulator.
     */
    transformType: ModulatorTransformType;
    /**
     * Indicates if the given modulator is chorus or reverb effects modulator.
     * This is done to simulate BASSMIDI effects behavior:
     * - defaults to 1000 transform amount rather than 200
     * - values can be changed, but anything above 200 is 1000
     * (except for values above 1000, they are copied directly)
     * - all values below are multiplied by 5 (200 * 5 = 1000)
     * - still can be disabled if the soundfont has its own modulator curve
     * - this fixes the very low amount of reverb by default and doesn't break soundfonts
     */
    readonly isEffectModulator: boolean;
    /**
     * The default resonant modulator does not affect the filter gain.
     * Neither XG nor GS responded to cc #74 in that way.
     */
    readonly isDefaultResonantModulator: boolean;
    /**
     * The primary source of this modulator.
     */
    readonly primarySource: ModulatorSource;
    /**
     * The secondary source of this modulator.
     */
    readonly secondarySource: ModulatorSource;
    /**
     * Creates a new SF2 Modulator
     */
    constructor(primarySource?: ModulatorSource, secondarySource?: ModulatorSource, destination?: GeneratorType, amount?: number, transformType?: ModulatorTransformType, isEffectModulator?: boolean, isDefaultResonantModulator?: boolean);
    private get destinationName();
    /**
     * Checks if the pair of modulators is identical (in SF2 terms)
     * @param mod1 modulator 1
     * @param mod2 modulator 2
     * @param checkAmount if the amount should be checked too.
     * @returns if they are identical
     */
    static isIdentical(mod1: Modulator, mod2: Modulator, checkAmount?: boolean): boolean;
    /**
     * Copies a modulator.
     * @param mod The modulator to copy.
     * @returns The copied modulator.
     */
    static copyFrom(mod: Modulator): Modulator;
    toString(): string;
    write(modData: IndexedByteArray, indexes?: SoundFontWriteIndexes): void;
    /**
     * Sums transform and create a NEW modulator
     * @param modulator the modulator to sum with
     * @returns the new modulator
     */
    sumTransform(modulator: Modulator): Modulator;
}

/**
 * Midi_message.ts
 * purpose: contains enums for midi events and controllers and functions to parse them
 */

declare class MIDIMessage {
    /**
     * Absolute number of MIDI ticks from the start of the track.
     */
    ticks: number;
    /**
     * The MIDI message status byte. Note that for meta events, it is the second byte. (not 0xFF)
     */
    statusByte: MIDIMessageType;
    /**
     * Message's binary data
     */
    data: Uint8Array<ArrayBuffer>;
    /**
     * Creates a new MIDI message
     * @param ticks time of this message in absolute MIDI ticks
     * @param byte the message status byte
     * @param data the message's binary data
     */
    constructor(ticks: number, byte: MIDIMessageType, data: Uint8Array<ArrayBuffer>);
}

/**
 * RMIDInfoData type represents metadata for an RMIDI file.
 */
interface RMIDInfoData {
    /**
     * The name of the song.
     */
    name: string;
    /**
     * The engineer who worked on the sound bank file.
     */
    engineer: string;
    /**
     * The artist of the MIDI file.
     */
    artist: string;
    /**
     * The album of the song.
     */
    album: string;
    /**
     * The genre of the song.
     */
    genre: string;
    /**
     * The image for the file (album cover).
     */
    picture: ArrayBuffer;
    /**
     * The comment of the file.
     */
    comment: string;
    /**
     * The creation date of the file.
     */
    creationDate: Date;
    /**
     * The copyright of the file.
     */
    copyright: string;
    /**
     * The encoding of the RMIDI info.
     */
    infoEncoding: string;
    /**
     * The encoding of the MIDI file's text messages.
     */
    midiEncoding: string;
    /**
     * The software used to write the file.
     */
    software: string;
    /**
     * The subject of the file.
     */
    subject: string;
}
interface TempoChange {
    /**
     * MIDI ticks of the change, absolute value from the start of the MIDI file.
     */
    ticks: number;
    /**
     * New tempo in BPM.
     */
    tempo: number;
}
type MIDILoopType = "soft" | "hard";
interface MIDILoop {
    /**
     * Start of the loop, in MIDI ticks.
     */
    start: number;
    /**
     * End of the loop, in MIDI ticks.
     */
    end: number;
    /**
     * The type of the loop detected:
     * - Soft - the playback will immediately jump to the loop start pointer without any further processing.
     * - Hard - the playback will quickly process all messages from
     * the start of the file to ensure that synthesizer is in the correct state.
     * This is the default behavior.
     *
     * Soft loop types are enabled for Touhou and GameMaker loop points.
     */
    type: MIDILoopType;
}
type MIDIFormat = 0 | 1 | 2;
interface NoteTime {
    /**
     * The MIDI key number.
     */
    midiNote: number;
    /**
     * Start of the note, in seconds.
     */
    start: number;
    /**
     * Length of the note, in seconds.
     */
    length: number;
    /**
     * The MIDI velocity of the note.
     */
    velocity: number;
}
/**
 * Represents a desired program change for a MIDI channel.
 */
interface DesiredProgramChange extends MIDIPatch {
    /**
     * The channel number.
     */
    channel: number;
}
/**
 * Represents a desired controller change for a MIDI channel.
 */
interface DesiredControllerChange {
    /**
     * The channel number.
     */
    channel: number;
    /**
     * The MIDI controller number.
     */
    controllerNumber: number;
    /**
     * The new controller value.
     */
    controllerValue: number;
}
/**
 * Represents a desired channel transpose change.
 */
interface DesiredChannelTranspose {
    /**
     * The channel number.
     */
    channel: number;
    /**
     * The number of semitones to transpose.
     * This can use floating point numbers, which will be used to fine-tune the pitch in cents using RPN.
     */
    keyShift: number;
}
interface RMIDIWriteOptions {
    /**
     * The bank offset for RMIDI.
     */
    bankOffset: number;
    /**
     * The metadata of the file. Optional.
     */
    metadata: Partial<Omit<RMIDInfoData, "infoEncoding">>;
    /**
     * If the MIDI file should internally be corrected to work with the set bank offset.
     */
    correctBankOffset: boolean;
    /**
     * The optional sound bank instance used to correct bank offset.
     */
    soundBank?: BasicSoundBank;
}
type RMIDInfoFourCC = "INAM" | "IPRD" | "IALB" | "IART" | "IGNR" | "IPIC" | "ICOP" | "ICRD" | "ICRT" | "ICMT" | "IENG" | "ISFT" | "ISBJ" | "IENC" | "MENC" | "DBNK";

declare class MIDITrack {
    /**
     * The name of this track.
     */
    name: string;
    /**
     * The MIDI port number used by the track.
     */
    port: number;
    /**
     * A set that contains the MIDI channels used by the track in the sequence.
     */
    channels: Set<number>;
    /**
     * All the MIDI messages of this track.
     */
    events: Omit<MIDIMessage[], "push" | "splice">;
    static copyFrom(track: MIDITrack): MIDITrack;
    copyFrom(track: MIDITrack): void;
    /**
     * Adds an event to the track.
     * @param event The event to add.
     * @param index The index at which to add this event.
     */
    addEvent(event: MIDIMessage, index: number): void;
    /**
     * Removes an event from the track.
     * @param index The index of the event to remove.
     */
    deleteEvent(index: number): void;
    /**
     * Appends an event to the end of the track.
     * @param event The event to add.
     */
    pushEvent(event: MIDIMessage): void;
}

/**
 * BasicMIDI is the base of a complete MIDI file.
 */
declare class BasicMIDI {
    /**
     * The tracks in the sequence.
     */
    tracks: MIDITrack[];
    /**
     * The time division of the sequence, representing the number of MIDI ticks per beat.
     */
    timeDivision: number;
    /**
     * The duration of the sequence, in seconds.
     */
    duration: number;
    /**
     * The tempo changes in the sequence, ordered from the last change to the first.
     * Each change is represented by an object with a MIDI tick position and a tempo value in beats per minute.
     */
    tempoChanges: TempoChange[];
    /**
     * Any extra metadata found in the file.
     * These messages were deemed "interesting" by the parsing algorithm
     */
    extraMetadata: MIDIMessage[];
    /**
     * An array containing the lyrics of the sequence.
     */
    lyrics: MIDIMessage[];
    /**
     * The tick position of the first note-on event in the MIDI sequence.
     */
    firstNoteOn: number;
    /**
     * The MIDI key range used in the sequence, represented by a minimum and maximum note value.
     */
    keyRange: GenericRange;
    /**
     * The tick position of the last voice event (such as note-on, note-off, or control change) in the sequence.
     */
    lastVoiceEventTick: number;
    /**
     * An array of channel offsets for each MIDI port, using the SpessaSynth method.
     * The index is the port number and the value is the channel offset.
     */
    portChannelOffsetMap: number[];
    /**
     * The loop points (in ticks) of the sequence, including both start and end points.
     */
    loop: MIDILoop;
    /**
     * The file name of the MIDI sequence, if provided during parsing.
     */
    fileName?: string;
    /**
     * The format of the MIDI file, which can be 0, 1, or 2, indicating the type of the MIDI file.
     */
    format: MIDIFormat;
    /**
     * The RMID (Resource-Interchangeable MIDI) info data, if the file is RMID formatted.
     * Otherwise, this object is empty.
     * Info type: Chunk data as a binary array.
     * Note that text chunks contain a terminal zero byte.
     */
    rmidiInfo: Partial<Record<keyof RMIDInfoData, Uint8Array<ArrayBuffer>>>;
    /**
     * The bank offset used for RMID files.
     */
    bankOffset: number;
    /**
     * If the MIDI file is a Soft Karaoke file (.kar), this is set to true.
     * https://www.mixagesoftware.com/en/midikit/help/HTML/karaoke_formats.html
     */
    isKaraokeFile: boolean;
    /**
     * Indicates if this file is a Multi-Port MIDI file.
     */
    isMultiPort: boolean;
    /**
     * If the MIDI file is a DLS RMIDI file.
     */
    isDLSRMIDI: boolean;
    /**
     * The embedded sound bank in the MIDI file, represented as an ArrayBuffer, if available.
     */
    embeddedSoundBank?: ArrayBuffer;
    /**
     * The raw, encoded MIDI name, represented as a Uint8Array.
     * Useful when the MIDI file uses a different code page.
     * Undefined if no MIDI name could be found.
     */
    protected binaryName?: Uint8Array;
    /**
     * The encoding of the RMIDI info in file, if specified.
     */
    get infoEncoding(): string | undefined;
    /**
     * Loads a MIDI file (SMF, RMIDI, XMF) from a given ArrayBuffer.
     * @param arrayBuffer The ArrayBuffer containing the binary file data.
     * @param fileName The optional name of the file, will be used if the MIDI file does not have a name.
     */
    static fromArrayBuffer(arrayBuffer: ArrayBuffer, fileName?: string): BasicMIDI;
    /**
     * Loads a MIDI file (SMF, RMIDI, XMF) from a given file.
     * @param file The file to load.
     */
    static fromFile(file: File): Promise<BasicMIDI>;
    /**
     * Copies a MIDI.
     * @param mid The MIDI to copy.
     * @returns The copied MIDI.
     */
    static copyFrom(mid: BasicMIDI): BasicMIDI;
    /**
     * Copies a MIDI.
     * @param mid The MIDI to copy.
     */
    copyFrom(mid: BasicMIDI): void;
    /**
     * Converts MIDI ticks to time in seconds.
     * @param ticks The time in MIDI ticks.
     * @returns The time in seconds.
     */
    midiTicksToSeconds(ticks: number): number;
    /**
     * Gets the used programs and keys for this MIDI file with a given sound bank.
     * @param soundbank the sound bank.
     * @returns The output data is a key-value pair: preset -> Set<"key-velocity">
     */
    getUsedProgramsAndKeys(soundbank: BasicSoundBank | SoundBankManager): Map<BasicPreset, Set<string>>;
    /**
     * Preloads all voices for this sequence in a given synth.
     * This caches all the needed voices for playing back this sequencer, resulting in a smooth playback.
     * The sequencer calls this function by default when loading the songs.
     * @param synth
     */
    preloadSynth(synth: SpessaSynthProcessor): void;
    /**
     * Updates all internal values of the MIDI.
     * @param sortEvents if the events should be sorted by ticks. Recommended to be true.
     */
    flush(sortEvents?: boolean): void;
    /**
     * Calculates all note times in seconds.
     * @param minDrumLength the shortest a drum note (channel 10) can be, in seconds.
     * @returns an array of 16 channels, each channel containing its notes,
     * with their key number, velocity, absolute start time and length in seconds.
     */
    getNoteTimes(minDrumLength?: number): NoteTime[][];
    /**
     * Exports the midi as a standard MIDI file.
     * @returns the binary file data.
     */
    writeMIDI(): ArrayBuffer;
    /**
     * Writes an RMIDI file. Note that this method modifies the MIDI file in-place.
     * @param soundBankBinary the binary sound bank to embed into the file.
     * @param configuration Extra options for writing the file.
     * @returns the binary file data.
     */
    writeRMIDI(soundBankBinary: ArrayBuffer, configuration?: Partial<RMIDIWriteOptions>): ArrayBuffer;
    /**
     * Allows easy editing of the file by removing channels, changing programs,
     * changing controllers and transposing channels. Note that this modifies the MIDI *in-place*.
     * @param desiredProgramChanges - The programs to set on given channels.
     * @param desiredControllerChanges - The controllers to set on given channels.
     * @param desiredChannelsToClear - The channels to remove from the sequence.
     * @param desiredChannelsToTranspose - The channels to transpose.
     */
    modify(desiredProgramChanges?: DesiredProgramChange[], desiredControllerChanges?: DesiredControllerChange[], desiredChannelsToClear?: number[], desiredChannelsToTranspose?: DesiredChannelTranspose[]): void;
    /**
     * Modifies the sequence *in-place* according to the locked presets and controllers in the given snapshot.
     * @param snapshot the snapshot to apply.
     */
    applySnapshot(snapshot: SynthesizerSnapshot): void;
    /**
     * Gets the MIDI's decoded name.
     * @param encoding The encoding to use if the MIDI uses an extended code page.
     * @remarks
     * Do not call in audioWorkletGlobalScope as it uses TextDecoder.
     * RMIDI encoding overrides the provided encoding.
     */
    getName(encoding?: string): string | undefined;
    /**
     * Gets the decoded extra metadata as text and removes any unneeded characters (such as "@T" for karaoke files)
     * @param encoding The encoding to use if the MIDI uses an extended code page.
     * @remarks
     * Do not call in audioWorkletGlobalScope as it uses TextDecoder.
     * RMIDI encoding overrides the provided encoding.
     */
    getExtraMetadata(encoding?: string): string[];
    /**
     * Sets a given RMIDI info value.
     * @param infoType The type to set.
     * @param infoData The value to set it to.
     * @remarks
     * This sets the Info encoding to utf-8.
     */
    setRMIDInfo<K extends keyof RMIDInfoData>(infoType: K, infoData: RMIDInfoData[K]): void;
    /**
     * Gets a given chunk from the RMIDI information, undefined if it does not exist.
     * @param infoType The metadata type.
     * @returns String, Date, ArrayBuffer or undefined.
     */
    getRMIDInfo<K extends keyof RMIDInfoData>(infoType: K): RMIDInfoData[K] | undefined;
    /**
     * Iterates over the MIDI file, ordered by the time the events happen.
     * @param callback The callback function to process each event.
     */
    iterate(callback: (event: MIDIMessage, trackNumber: number, eventIndexes: number[]) => unknown): void;
    /**
     * INTERNAL USE ONLY!
     */
    protected copyMetadataFrom(mid: BasicMIDI): void;
    /**
     * Parses internal MIDI values
     */
    protected parseInternal(): void;
}

/**
 * Represents a single sound bank, be it DLS or SF2.
 */
declare class BasicSoundBank {
    /**
     * Indicates if the SF3/SF2Pack decoder is ready.
     */
    static isSF3DecoderReady: Promise<boolean>;
    /**
     * Sound bank's info.
     */
    soundBankInfo: SoundBankInfoData;
    /**
     * The sound bank's presets.
     */
    presets: BasicPreset[];
    /**
     * The sound bank's samples.
     */
    samples: BasicSample[];
    /**
     * The sound bank's instruments.
     */
    instruments: BasicInstrument[];
    /**
     * Sound bank's default modulators.
     */
    defaultModulators: Modulator[];
    /**
     * If the sound bank has custom default modulators (DMOD).
     */
    customDefaultModulators: boolean;
    private _isXGBank;
    /**
     * Checks for XG drum sets and considers if this sound bank is XG.
     */
    get isXGBank(): boolean;
    /**
     * Merges sound banks with the given order. Keep in mind that the info read is copied from the first one
     * @param soundBanks the sound banks to merge, the first overwrites the last
     */
    static mergeSoundBanks(...soundBanks: BasicSoundBank[]): BasicSoundBank;
    /**
     * Creates a simple sound bank with one saw wave preset.
     */
    static getSampleSoundBankFile(): Promise<ArrayBuffer>;
    /**
     * Copies a given sound bank.
     * @param bank The sound bank to copy.
     */
    static copyFrom(bank: BasicSoundBank): BasicSoundBank;
    /**
     * Adds complete presets along with their instruments and samples.
     * @param presets The presets to add.
     */
    addCompletePresets(presets: BasicPreset[]): void;
    /**
     * Write the sound bank as a .dls file. This may not be 100% accurate.
     * @param options - options for writing the file.
     * @returns the binary file.
     */
    writeDLS(options?: Partial<DLSWriteOptions>): Promise<ArrayBuffer>;
    /**
     * Writes the sound bank as an SF2 file.
     * @param writeOptions the options for writing.
     * @returns the binary file data.
     */
    writeSF2(writeOptions?: Partial<SoundFont2WriteOptions>): Promise<ArrayBuffer>;
    addPresets(...presets: BasicPreset[]): void;
    addInstruments(...instruments: BasicInstrument[]): void;
    addSamples(...samples: BasicSample[]): void;
    /**
     * Clones a sample into this bank.
     * @param sample The sample to copy.
     * @returns the copied sample, if a sample exists with that name, it is returned instead
     */
    cloneSample(sample: BasicSample): BasicSample;
    /**
     * Recursively clones an instrument into this sound bank, as well as its samples.
     * @returns the copied instrument, if an instrument exists with that name, it is returned instead.
     */
    cloneInstrument(instrument: BasicInstrument): BasicInstrument;
    /**
     * Recursively clones a preset into this sound bank, as well as its instruments and samples.
     * @returns the copied preset, if a preset exists with that name, it is returned instead.
     */
    clonePreset(preset: BasicPreset): BasicPreset;
    /**
     * Updates internal values.
     */
    flush(): void;
    /**
     * Trims a sound bank to only contain samples in a given MIDI file.
     * @param mid - the MIDI file
     */
    trimSoundBank(mid: BasicMIDI): void;
    removeUnusedElements(): void;
    deleteInstrument(instrument: BasicInstrument): void;
    deletePreset(preset: BasicPreset): void;
    deleteSample(sample: BasicSample): void;
    /**
     * Get the appropriate preset.
     */
    getPreset(patch: MIDIPatch, system: SynthSystem): BasicPreset;
    destroySoundBank(): void;
    protected parsingError(error: string): void;
    /**
     * Parses the bank after loading is done
     * @protected
     */
    protected parseInternal(): void;
    protected printInfo(): void;
}

interface SoundBankManagerListEntry {
    /**
     * The unique string identifier of the sound bank.
     */
    id: string;
    /**
     * The sound bank itself.
     */
    soundBank: BasicSoundBank;
    /**
     * The bank MSB offset for this sound bank.
     */
    bankOffset: number;
}
interface SF2VersionTag {
    /**
     * The major revision number of the sound bank.
     */
    major: number;
    /**
     * The minor revision number of this sound bank.
     */
    minor: number;
}
type GenericBankInfoFourCC = "INAM" | "ICRD" | "IENG" | "IPRD" | "ICOP" | "ICMT" | "ISFT";
type SF2InfoFourCC = GenericBankInfoFourCC | "ifil" | "isng" | "irom" | "iver" | "DMOD" | "LIST";
type SF2ChunkFourCC = "pdta" | "xdta" | "sdta" | "smpl" | "sm24" | "phdr" | "pbag" | "pmod" | "pgen" | "inst" | "ibag" | "imod" | "igen" | "shdr";
type DLSInfoFourCC = GenericBankInfoFourCC | "ISBJ";
type DLSChunkFourCC = WAVFourCC | "dls " | "dlid" | "cdl " | "ptbl" | "vers" | "colh" | "wvpl" | "wsmp" | "data" | "lart" | "lar2" | "art2" | "art1" | "lrgn" | "rgnh" | "wlnk" | "lins" | "ins " | "insh" | "rgn " | "rgn2" | "pgal";
interface SoundBankInfoData {
    /**
     * Name.
     */
    name: string;
    /**
     * The sound bank's version.
     */
    version: SF2VersionTag;
    /**
     * Creation date.
     */
    creationDate: Date;
    /**
     * Sound engine.
     */
    soundEngine: string;
    /**
     * Author.
     */
    engineer?: string;
    /**
     * Product.
     */
    product?: string;
    /**
     * Copyright.
     */
    copyright?: string;
    /**
     * Comment.
     */
    comment?: string;
    /**
     * Subject.
     */
    subject?: string;
    /**
     * ROM information.
     */
    romInfo?: string;
    /**
     * Software used to edit the file.
     */
    software?: string;
    /**
     * A tag that only applies to SF2 and will usually be undefined.
     */
    romVersion?: SF2VersionTag;
}
type SoundBankInfoFourCC = keyof SoundBankInfoData;
interface VoiceSynthesisData {
    instrumentGenerators: Generator[];
    presetGenerators: Generator[];
    modulators: Modulator[];
    sample: BasicSample;
}
type SampleEncodingFunction = (audioData: Float32Array, sampleRate: number) => Promise<Uint8Array>;
type ModulatorSourceIndex = ModulatorSourceEnum | MIDIController;
/**
 * A function to track progress during writing.
 */
type ProgressFunction = (
/**
 * The written sample name.
 */
sampleName: string, 
/**
 * The sample's index.
 */
sampleIndex: number, 
/**
 * The total sample count for progress displaying.
 */
sampleCount: number) => Promise<unknown>;
/**
 * Options for writing a SoundFont2 file.
 */
interface SoundFont2WriteOptions {
    /**
     * If the soundfont should be compressed with a given function.
     */
    compress: boolean;
    /**
     * The function for compressing samples. It can be undefined if not compressed.
     */
    compressionFunction?: SampleEncodingFunction;
    /**
     * A function to show progress for writing large banks. It can be undefined.
     */
    progressFunction?: ProgressFunction;
    /**
     * If the DMOD chunk should be written. Recommended.
     * Note that it will only be written if the modulators are unchanged.
     */
    writeDefaultModulators: boolean;
    /**
     * If the XDTA chunk should be written to allow virtually infinite parameters. Recommended.
     * Note that it will only be written needed.
     */
    writeExtendedLimits: boolean;
    /**
     * If an SF3 bank should be decompressed back to SF2. Not recommended.
     */
    decompress: boolean;
}
/**
 * Options for writing a DLS file.
 */
interface DLSWriteOptions {
    /**
     * A function to show progress for writing large banks. It can be undefined.
     */
    progressFunction?: ProgressFunction;
}
interface GenericRange {
    min: number;
    max: number;
}
interface DLSLoop {
    loopType: DLSLoopType;
    loopStart: number;
    loopLength: number;
}

type GenericRIFFFourCC = "RIFF" | "LIST" | "INFO";
type WAVFourCC = "wave" | "cue " | "fmt ";
type FourCC = GenericRIFFFourCC | SoundBankInfoFourCC | SF2InfoFourCC | SF2ChunkFourCC | DLSInfoFourCC | DLSChunkFourCC | RMIDInfoFourCC | WAVFourCC;

declare const SpessaSynthCoreUtils: {
    consoleColors: {
        warn: string;
        unrecognized: string;
        info: string;
        recognized: string;
        value: string;
    };
    SpessaSynthInfo: typeof SpessaSynthInfo;
    SpessaSynthWarn: typeof SpessaSynthWarn;
    SpessaSynthGroupCollapsed: typeof SpessaSynthGroupCollapsed;
    SpessaSynthGroup: typeof SpessaSynthGroup;
    SpessaSynthGroupEnd: typeof SpessaSynthGroupEnd;
    readBytesAsUintBigEndian: typeof readBigEndian;
    readLittleEndian: typeof readLittleEndianIndexed;
    readBytesAsString: typeof readBinaryStringIndexed;
    readVariableLengthQuantity: typeof readVariableLengthQuantity;
    inflateSync: (input: Uint8Array) => Uint8Array<ArrayBuffer>;
};

declare const DEFAULT_WAV_WRITE_OPTIONS: WaveWriteOptions;
interface WaveWriteOptions {
    /**
     * This will find the max sample point and set it to 1, and scale others with it. Recommended
     */
    normalizeAudio: boolean;
    /**
     * The loop start and end points in seconds. Undefined if no loop should be written.
     */
    loop?: {
        /**
         * The start point in seconds.
         */
        start: number;
        /**
         * The end point in seconds.
         */
        end: number;
    };
    /**
     * The metadata to write into the file.
     */
    metadata: Partial<WaveMetadata>;
}
interface WaveMetadata {
    /**
     * The song's title.
     */
    title: string;
    /**
     * The song's artist.
     */
    artist: string;
    /**
     * The song's album.
     */
    album: string;
    /**
     * The song's genre.
     */
    genre: string;
}

interface MIDIBuilderOptions {
    /**
     * The MIDI file's tick precision (how many ticks fit in a quarter note).
     */
    timeDivision: number;
    /**
     * The MIDI file's initial tempo in BPM.
     */
    initialTempo: number;
    /**
     * The MIDI file's MIDI track format.
     */
    format: MIDIFormat;
    /**
     * The MIDI file's name. Will be appended to the conductor track.
     */
    name: string;
}
/**
 * A class that helps to build a MIDI file from scratch.
 */
declare class MIDIBuilder extends BasicMIDI {
    private encoder;
    /**
     * Creates a new MIDI file.
     * @param options The options for writing the file.
     */
    constructor(options?: Partial<MIDIBuilderOptions>);
    /**
     * Adds a new Set Tempo event.
     * @param ticks the tick number of the event.
     * @param tempo the tempo in beats per minute (BPM).
     */
    addSetTempo(ticks: number, tempo: number): void;
    /**
     * Adds a new MIDI track.
     * @param name the new track's name.
     * @param port the new track's port.
     */
    addNewTrack(name: string, port?: number): void;
    /**
     * Adds a new MIDI Event.
     * @param ticks the tick time of the event (absolute).
     * @param track the track number to use.
     * @param event the MIDI event number.
     * @param eventData {Uint8Array|Iterable<number>} the raw event data.
     */
    addEvent(ticks: number, track: number, event: MIDIMessageType, eventData: Uint8Array | Iterable<number>): void;
    /**
     * Adds a new Note On event.
     * @param ticks the tick time of the event.
     * @param track the track number to use.
     * @param channel the channel to use.
     * @param midiNote the midi note of the keypress.
     * @param velocity the velocity of the keypress.
     */
    addNoteOn(ticks: number, track: number, channel: number, midiNote: number, velocity: number): void;
    /**
     * Adds a new Note Off event.
     * @param ticks the tick time of the event.
     * @param track the track number to use.
     * @param channel the channel to use.
     * @param midiNote the midi note of the key release.
     * @param velocity optional and unsupported by spessasynth.
     */
    addNoteOff(ticks: number, track: number, channel: number, midiNote: number, velocity?: number): void;
    /**
     * Adds a new Program Change event.
     * @param ticks the tick time of the event.
     * @param track the track number to use.
     * @param channel the channel to use.
     * @param programNumber the MIDI program to use.
     */
    addProgramChange(ticks: number, track: number, channel: number, programNumber: number): void;
    /**
     * Adds a new Controller Change event.
     * @param ticks the tick time of the event.
     * @param track the track number to use.
     * @param channel the channel to use.
     * @param controllerNumber the MIDI CC to use.
     * @param controllerValue the new CC value.
     */
    addControllerChange(ticks: number, track: number, channel: number, controllerNumber: number, controllerValue: number): void;
    /**
     * Adds a new Pitch Wheel event.
     * @param ticks the tick time of the event.
     * @param track the track to use.
     * @param channel the channel to use.
     * @param MSB SECOND byte of the MIDI pitchWheel message.
     * @param LSB FIRST byte of the MIDI pitchWheel message.
     */
    addPitchWheel(ticks: number, track: number, channel: number, MSB: number, LSB: number): void;
}

/**
 * Processes a single MIDI tick.
 * Call this every rendering quantum to process the sequencer events in real-time.
 */
declare function processTick(this: SpessaSynthSequencer): void;

/**
 * Plays the MIDI file to a specific time or ticks.
 * @param time in seconds.
 * @param ticks optional MIDI ticks, when given is used instead of time.
 * @returns true if the MIDI file is not finished.
 */
declare function setTimeToInternal(this: SpessaSynthSequencer, time: number, ticks?: number | undefined): boolean;

interface SequencerEventData {
    /**
     * Called when a MIDI message is sent and externalMIDIPlayback is true.
     */
    midiMessage: {
        /**
         * The binary MIDI message.
         */
        message: Iterable<number>;
    };
    /**
     * Called when the time is changed.
     * It also gets called when a song gets changed.
     */
    timeChange: {
        /**
         * The new time in seconds.
         */
        newTime: number;
    };
    /**
     * Called when the playback stops.
     * @deprecated use songEnded instead.
     */
    pause: {
        /**
         * True if the playback stopped because it finished playing the song, false if it was stopped manually.
         */
        isFinished: boolean;
    };
    /**
     * Called when the playback stops.
     */
    songEnded: object;
    /**
     * Called when the song changes.
     */
    songChange: {
        /**
         * The index of the new song in the song list.
         */
        songIndex: number;
    };
    /**
     * Called when the song list changes.
     */
    songListChange: {
        /**
         * The new song list.
         */
        newSongList: BasicMIDI[];
    };
    /**
     * Called when a MIDI Meta event is encountered.
     */
    metaEvent: {
        /**
         * The MIDI message of the meta event.
         */
        event: MIDIMessage;
        /**
         * The index of the track where the meta event was encountered.
         */
        trackIndex: number;
    };
    /**
     * Called when the loop count changes (decreases).
     */
    loopCountChange: {
        /**
         * The new loop count.
         */
        newCount: number;
    };
}
type SequencerEvent = {
    [K in keyof SequencerEventData]: {
        type: K;
        data: SequencerEventData[K];
    };
}[keyof SequencerEventData];

declare class SpessaSynthSequencer {
    /**
     * Sequencer's song list.
     */
    songs: BasicMIDI[];
    /**
     * The shuffled song indexes.
     * This is used when shuffleMode is enabled.
     */
    shuffledSongIndexes: number[];
    /**
     * The synthesizer connected to the sequencer.
     */
    readonly synth: SpessaSynthProcessor;
    /**
     * If the MIDI messages should be sent to an event instead of the synth.
     * This is used by spessasynth_lib to pass them over to Web MIDI API.
     */
    externalMIDIPlayback: boolean;
    /**
     * If the notes that were playing when the sequencer was paused should be re-triggered.
     * Defaults to true.
     */
    retriggerPausedNotes: boolean;
    /**
     * The loop count of the sequencer.
     * If set to Infinity, it will loop forever.
     * If set to zero, the loop is disabled.
     */
    loopCount: number;
    /**
     * Indicates if the sequencer should skip to the first note on event.
     * Defaults to true.
     */
    skipToFirstNoteOn: boolean;
    /**
     * Indicates if the sequencer has finished playing.
     */
    isFinished: boolean;
    /**
     * Indicates if the synthesizer should preload the voices for the newly loaded sequence.
     * Recommended.
     */
    preload: boolean;
    /**
     * Called when the sequencer calls an event.
     * @param event The event
     */
    onEventCall?: (event: SequencerEvent) => unknown;
    /**
     * Processes a single MIDI tick.
     * You should call this every rendering quantum to process the sequencer events in real-time.
     */
    processTick: typeof processTick;
    /**
     * The time of the first note in seconds.
     */
    protected firstNoteTime: number;
    /**
     * How long a single MIDI tick currently lasts in seconds.
     */
    protected oneTickToSeconds: number;
    /**
     * The current event index for each track.
     * This is used to track which event is currently being processed for each track.
     */
    protected eventIndexes: number[];
    /**
     * The time that has already been played in the current song.
     */
    protected playedTime: number;
    /**
     * The paused time of the sequencer.
     * If the sequencer is not paused, this is undefined.
     */
    protected pausedTime?: number;
    /**
     * Absolute time of the sequencer when it started playing.
     * It is based on the synth's current time.
     */
    protected absoluteStartTime: number;
    /**
     * Currently playing notes (for pausing and resuming)
     */
    protected playingNotes: {
        midiNote: number;
        channel: number;
        velocity: number;
    }[];
    /**
     * MIDI Port number for each of the MIDI tracks in the current sequence.
     */
    protected currentMIDIPorts: number[];
    /**
     * This is used to assign new MIDI port offsets to new ports.
     */
    protected midiPortChannelOffset: number;
    /**
     * Channel offsets for each MIDI port.
     * Stored as:
     * Record<midi port, channel offset>
     */
    protected midiPortChannelOffsets: Record<number, number>;
    protected assignMIDIPort: (trackNum: number, port: number) => void;
    protected loadNewSequence: (parsedMidi: BasicMIDI) => void;
    protected processEvent: (event: MIDIMessage, trackIndex: number) => void;
    protected setTimeTo: typeof setTimeToInternal;
    /**
     * Initializes a new Sequencer without any songs loaded.
     * @param spessasynthProcessor the synthesizer processor to use with this sequencer.
     */
    constructor(spessasynthProcessor: SpessaSynthProcessor);
    protected _midiData?: BasicMIDI;
    /**
     * The currently loaded MIDI data.
     */
    get midiData(): BasicMIDI | undefined;
    /**
     * The length of the current sequence in seconds.
     */
    get duration(): number;
    protected _songIndex: number;
    /**
     * The current song index in the song list.
     * If shuffleMode is enabled, this is the index of the shuffled song list.
     */
    get songIndex(): number;
    /**
     * The current song index in the song list.
     * If shuffleMode is enabled, this is the index of the shuffled song list.
     */
    set songIndex(value: number);
    protected _shuffleMode: boolean;
    /**
     * Controls if the sequencer should shuffle the songs in the song list.
     * If true, the sequencer will play the songs in a random order.
     */
    get shuffleMode(): boolean;
    /**
     * Controls if the sequencer should shuffle the songs in the song list.
     * If true, the sequencer will play the songs in a random order.
     */
    set shuffleMode(on: boolean);
    /**
     * Internal playback rate.
     */
    protected _playbackRate: number;
    /**
     * The sequencer's playback rate.
     * This is the rate at which the sequencer plays back the MIDI data.
     */
    get playbackRate(): number;
    /**
     * The sequencer's playback rate.
     * This is the rate at which the sequencer plays back the MIDI data.
     * @param value the playback rate to set.
     */
    set playbackRate(value: number);
    /**
     * The current time of the sequencer.
     * This is the time in seconds since the sequencer started playing.
     */
    get currentTime(): number;
    /**
     * The current time of the sequencer.
     * This is the time in seconds since the sequencer started playing.
     * @param time the time to set in seconds.
     */
    set currentTime(time: number);
    /**
     * True if paused, false if playing or stopped
     */
    get paused(): boolean;
    /**
     * Starts or resumes the playback of the sequencer.
     * If the sequencer is paused, it will resume from the paused time.
     */
    play(): void;
    /**
     * Pauses the playback.
     */
    pause(): void;
    /**
     * Loads a new song list into the sequencer.
     * @param midiBuffers the list of songs to load.
     */
    loadNewSongList(midiBuffers: BasicMIDI[]): void;
    protected callEvent<K extends keyof SequencerEventData>(type: K, data: SequencerEventData[K]): void;
    protected pauseInternal(isFinished: boolean): void;
    protected songIsFinished(): void;
    /**
     * Stops the playback
     */
    protected stop(): void;
    /**
     * @returns The track number of the next closest event, based on eventIndexes.
     */
    protected findFirstEventIndex(): number;
    /**
     * Adds a new port (16 channels) to the synth.
     */
    protected addNewMIDIPort(): void;
    protected sendMIDIMessage(message: number[]): void;
    protected sendMIDIAllOff(): void;
    protected sendMIDIReset(): void;
    protected loadCurrentSong(): void;
    protected shuffleSongIndexes(): void;
    /**
     * Sets the time in MIDI ticks.
     * @param ticks the MIDI ticks to set the time to.
     */
    protected setTimeTicks(ticks: number): void;
    /**
     * Recalculates the absolute start time of the sequencer.
     * @param time the time in seconds to recalculate the start time for.
     */
    protected recalculateStartTime(time: number): void;
    /**
     * Jumps to a MIDI tick without any further processing.
     * @param targetTicks The MIDI tick to jump to.
     * @protected
     */
    protected jumpToTick(targetTicks: number): void;
    protected sendMIDINoteOn(channel: number, midiNote: number, velocity: number): void;
    protected sendMIDINoteOff(channel: number, midiNote: number): void;
    protected sendMIDICC(channel: number, type: MIDIController, value: number): void;
    protected sendMIDIProgramChange(channel: number, program: number): void;
    /**
     * Sets the pitch of the given channel
     * @param channel usually 0-15: the channel to change pitch
     * @param pitch the 14-bit pitch value
     */
    protected sendMIDIPitchWheel(channel: number, pitch: number): void;
}

declare const DEFAULT_MASTER_PARAMETERS: MasterParameterType;

/**
 * Default MIDI drum channel.
 */
declare const DEFAULT_PERCUSSION = 9;
declare const ALL_CHANNELS_OR_DIFFERENT_ACTION = -1;

declare const NON_CC_INDEX_OFFSET = 128;
declare const CONTROLLER_TABLE_SIZE = 147;
/**
 * An array with the default MIDI controller values. Note that these are 14-bit, not 7-bit.
 */
declare const defaultMIDIControllerValues: Int16Array<ArrayBuffer>;
declare const setResetValue: (i: MIDIController, v: number) => number;
declare const CUSTOM_CONTROLLER_TABLE_SIZE: number;
declare const customResetArray: Float32Array<ArrayBuffer>;

declare class SoundBankLoader {
    /**
     * Loads a sound bank from a file buffer.
     * @param buffer The binary file buffer to load.
     * @returns The loaded sound bank, a BasicSoundBank instance.
     */
    static fromArrayBuffer(buffer: ArrayBuffer): BasicSoundBank;
    private static loadDLS;
}

export { ALL_CHANNELS_OR_DIFFERENT_ACTION, BasicGlobalZone, BasicInstrument, BasicInstrumentZone, BasicMIDI, BasicPreset, BasicPresetZone, BasicSample, BasicSoundBank, BasicZone, CONTROLLER_TABLE_SIZE, CUSTOM_CONTROLLER_TABLE_SIZE, type ChannelPressureCallback, type ChannelProperty, type ChannelPropertyChangeCallback, ChannelSnapshot, type ControllerChangeCallback, type CustomController, DEFAULT_MASTER_PARAMETERS, DEFAULT_PERCUSSION, DEFAULT_WAV_WRITE_OPTIONS, type DLSChunkFourCC, type DLSDestination, type DLSInfoFourCC, type DLSLoop, type DLSLoopType, DLSLoopTypes, type DLSSource, type DLSTransform, type DLSWriteOptions, type DataEntryState, type DesiredChannelTranspose, type DesiredControllerChange, type DesiredProgramChange, type DrumChangeCallback, EmptySample, type FourCC, GENERATORS_AMOUNT, Generator, type GeneratorType, type GenericBankInfoFourCC, type GenericRIFFFourCC, type GenericRange, IndexedByteArray, type InterpolationType, KeyModifier, MAX_GENERATOR, MIDIBuilder, type MIDIController, type MIDIFormat, type MIDILoop, type MIDILoopType, MIDIMessage, type MIDIMessageType, type MIDIPatch, type MIDIPatchNamed, MIDIPatchTools, MIDITrack, type MTSNoteTuning, type MTSProgramTuning, type MasterParameterChangeCallback, type MasterParameterType, Modulator, type ModulatorCurveType, ModulatorSource, type ModulatorSourceEnum, type ModulatorSourceIndex, type ModulatorTransformType, type MuteChannelCallback, NON_CC_INDEX_OFFSET, type NoteOffCallback, type NoteOnCallback, type NoteTime, type PitchWheelCallback, type PolyPressureCallback, type PresetList, type PresetListEntry, type ProgramChangeCallback, type ProgressFunction, type RMIDIWriteOptions, type RMIDInfoData, type RMIDInfoFourCC, type SF2ChunkFourCC, type SF2InfoFourCC, type SF2VersionTag, type SampleEncodingFunction, type SampleLoopingMode, type SampleType, type SequencerEvent, type SequencerEventData, type SoundBankErrorCallback, type SoundBankInfoData, type SoundBankInfoFourCC, SoundBankLoader, type SoundBankManagerListEntry, type SoundFont2WriteOptions, SpessaSynthCoreUtils, SpessaSynthLogging, SpessaSynthProcessor, SpessaSynthSequencer, type StopAllCallback, type SynthMethodOptions, type SynthProcessorEvent, type SynthProcessorEventData, type SynthProcessorOptions, type SynthSystem, SynthesizerSnapshot, type TempoChange, type VoiceList, type VoiceSynthesisData, type WaveMetadata, type WaveWriteOptions, audioToWav, customControllers, customResetArray, dataEntryStates, defaultMIDIControllerValues, dlsDestinations, dlsSources, generatorLimits, generatorTypes, interpolationTypes, midiControllers, midiMessageTypes, modulatorCurveTypes, modulatorSources, modulatorTransformTypes, sampleTypes, setResetValue };
