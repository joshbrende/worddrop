/**
 * DictionaryService - Word validation service
 * Loads dictionary, validates words, handles caching
 */

import { BOARD_CONFIG } from '../constants/game';

const DICTIONARY_CACHE_KEY = 'worddrop_dictionary_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Dictionary paths (try multiple locations)
// In Vite, files in public/ are served from root
// So public/assets/dictionary.csv is accessible at /assets/dictionary.csv
const DICTIONARY_PATHS = [
  '/assets/dictionary.csv',        // public/assets/dictionary.csv (served from root) - PRIMARY PATH
  '/public/assets/dictionary.csv', // Alternative absolute path
  './assets/dictionary.csv',       // Alternative relative path
  '/dictionary.csv',               // Root public folder (fallback)
  'assets/dictionary.csv',         // Relative path (fallback)
];

interface DictionaryCache {
  words: string[]; // Store as array for JSON serialization
  timestamp: number;
}

/**
 * Dictionary Service - Singleton
 * Loads dictionary from CSV, validates words, caches in localStorage
 */
class DictionaryService {
  private dictionary: Set<string> | null = null;
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private initialized: boolean = false;
  
  // Fallback dictionary (always available immediately, initialized in constructor)
  private readonly fallbackDictionary: Set<string>;

  // Known sponsor words (always valid regardless of dictionary)
  private readonly SPONSOR_WORDS = new Set([
    'ALIPAY',
    'MAYBACH',
    'BIXBY',
    'GAMEPASS',
    'MUSICALLY',
    'LEXUS',
    'EOS',
    'OSWALD',
    'COCO',
  ]);

  /**
   * Constructor - Initialize fallback dictionary immediately (always available)
   */
  constructor() {
    // Initialize fallback dictionary synchronously - always available
    this.fallbackDictionary = this.buildFallbackDictionary();
    this.initialized = true; // Fallback is always initialized
  }

  /**
   * Initialize dictionary (load from cache or fetch)
   * Returns promise that resolves when dictionary is ready
   */
  async initialize(): Promise<void> {
    if (this.dictionary) {
      return; // Already loaded
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise; // Already loading
    }

    this.isLoading = true;
    this.loadPromise = this.loadDictionary();
    
    try {
      await this.loadPromise;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load dictionary from cache or fetch from CSV
   */
  private async loadDictionary(): Promise<void> {
    // Try to load from cache first
    const cached = this.loadFromCache();
    if (cached && cached.size > 100) {
      // Only use cache if it has substantial words (not just fallback)
      this.dictionary = cached;
      console.log(`✅ Dictionary loaded from cache: ${cached.size} words`);
      return;
    }

    // Load from CSV file - try multiple paths
    let loaded = false;
    let lastError: Error | null = null;
    
    for (const path of DICTIONARY_PATHS) {
      try {
        console.log(`Attempting to load dictionary from: ${path}`);
        const response = await fetch(path, {
          method: 'GET',
          headers: {
            'Accept': 'text/csv, text/plain, */*',
          },
        });
        
        if (response.ok) {
          console.log(`✅ Dictionary file found at: ${path} (${response.status})`);
          const text = await response.text();
          
          if (!text || text.trim().length === 0) {
            console.warn(`⚠️ Dictionary file at ${path} is empty`);
            continue;
          }
          
          const words = this.parseDictionary(text);
          
          if (words.length < 100) {
            console.warn(`⚠️ Dictionary at ${path} has too few words (${words.length}), trying next path`);
            continue;
          }
          
          this.dictionary = new Set(words);
          this.saveToCache(this.dictionary);
          
          console.log(`✅ Dictionary loaded successfully from ${path}: ${this.dictionary.size} words`);
          loaded = true;
          break;
        } else {
          console.warn(`❌ Failed to load dictionary from ${path}: HTTP ${response.status} ${response.statusText}`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`❌ Error loading dictionary from ${path}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        // Try next path
        continue;
      }
    }

    // If all paths failed, use fallback dictionary
    if (!loaded) {
      console.error('❌ Failed to load dictionary from all paths:', lastError);
      console.warn('⚠️ Using fallback dictionary (limited words). The game will work but with fewer valid words.');
      console.warn('⚠️ Make sure dictionary.csv is at public/assets/dictionary.csv and is accessible.');
      console.warn('⚠️ Dictionary file should be accessible at: /assets/dictionary.csv (served from public/assets/dictionary.csv)');
      
      // Use fallback dictionary - it's always available
      this.dictionary = new Set(this.fallbackDictionary);
      console.log(`📚 Using fallback dictionary only: ${this.dictionary.size} words`);
      console.warn('⚠️ Consider checking browser console network tab to see why dictionary.csv failed to load');
    } else if (this.dictionary) {
      // If main dictionary loaded successfully, merge with fallback for completeness
      // This ensures words in fallback are always available even if not in main dictionary
      const fallback = this.getFallbackDictionary();
      const beforeSize = this.dictionary.size;
      for (const word of fallback) {
        this.dictionary.add(word);
      }
      const afterSize = this.dictionary.size;
      console.log(`✅ Dictionary loaded successfully: ${afterSize} words (main: ${beforeSize}, added ${afterSize - beforeSize} from fallback)`);
    }
  }

  /**
   * Parse CSV text into array of words
   * Filters to valid words (3-8 letters, A-Z only)
   */
  private parseDictionary(text: string): string[] {
    const lines = text.split(/\r?\n/); // Handle both \n and \r\n
    const words: string[] = [];
    let processedLines = 0;
    let skippedLines = 0;

    for (const line of lines) {
      processedLines++;
      const word = line.trim().toUpperCase();
      
      // Skip empty lines
      if (!word) {
        skippedLines++;
        continue;
      }
      
      // Filter: only valid words
      if (
        word.length >= BOARD_CONFIG.MIN_WORD_LENGTH &&
        word.length <= BOARD_CONFIG.MAX_WORD_LENGTH &&
        /^[A-Z]+$/.test(word) // Only letters A-Z (no numbers, special chars)
      ) {
        words.push(word);
      } else {
        skippedLines++;
      }
    }

    // Remove duplicates
    const uniqueWords = Array.from(new Set(words));
    
    console.log(`📖 Parsed dictionary: ${processedLines} lines, ${uniqueWords.length} valid words (${skippedLines} skipped)`);
    
    return uniqueWords;
  }

  /**
   * Load dictionary from localStorage cache
   */
  private loadFromCache(): Set<string> | null {
    try {
      const cached = localStorage.getItem(DICTIONARY_CACHE_KEY);
      if (!cached) {
        return null;
      }

      const data: DictionaryCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - data.timestamp > CACHE_EXPIRY_MS) {
        localStorage.removeItem(DICTIONARY_CACHE_KEY);
        return null;
      }

      // Convert array back to Set
      return new Set(data.words);
    } catch (error) {
      console.error('Failed to load dictionary from cache:', error);
      return null;
    }
  }

  /**
   * Save dictionary to localStorage cache
   */
  private saveToCache(dictionary: Set<string>): void {
    try {
      const data: DictionaryCache = {
        words: Array.from(dictionary), // Convert Set to Array for JSON
        timestamp: Date.now(),
      };
      localStorage.setItem(DICTIONARY_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save dictionary to cache:', error);
      // localStorage might be full or disabled - continue without cache
    }
  }

  /**
   * Build fallback dictionary with common words (called once in constructor)
   * Used if main dictionary fails to load
   */
  private buildFallbackDictionary(): Set<string> {
    const commonWords = [
      // Common 3-letter words (expanded)
      'CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PAT', 'VAT',
      'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
      'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW',
      'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS',
      'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'HAD', 'HAS', 'HAD', 'WAS',
      'BED', 'RED', 'LED', 'TED', 'FED', 'BAD', 'MAD', 'SAD', 'DAD', 'LAD',
      'BAG', 'TAG', 'RAG', 'WAG', 'JOG', 'LOG', 'FOG', 'DOG', 'HOG', 'BOG',
      'BIG', 'DIG', 'FIG', 'PIG', 'RIG', 'WIG', 'JIG', 'GIG', 'BIN', 'DIN',
      'FIN', 'GIN', 'PIN', 'TIN', 'WIN', 'BOW', 'COW', 'HOW', 'LOW', 'NOW',
      'ROW', 'SAW', 'PAW', 'LAW', 'RAW', 'JAW', 'YAW', 'AXE', 'BOX', 'FOX',
      'POX', 'MIX', 'FIX', 'SIX', 'TAX', 'WAX', 'BAY', 'DAY', 'GAY', 'HAY',
      'LAY', 'MAY', 'PAY', 'RAY', 'SAY', 'WAY', 'YES', 'KEY', 'LEY', 'BEY',
      
      // Common 4-letter words (expanded)
      'CATS', 'DOGS', 'BATS', 'RATS', 'HATS', 'MATS', 'SATS', 'FATS', 'PATS',
      'THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW',
      'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME',
      'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE',
      'THAN', 'THEM', 'WELL', 'WERE', 'WORD', 'WORK', 'WALK', 'TALK', 'BALK',
      // Critical: Add FACT and other common F-words that were missing
      'FACT', 'FACE', 'FADE', 'FAIL', 'FAIN', 'FAIR', 'FAKE', 'FALL', 'FAME',
      'FANE', 'FANG', 'FANS', 'FARE', 'FARM', 'FART', 'FASH', 'FAST', 'FATE',
      'FATS', 'FAUN', 'FAUX', 'FAVE', 'FAWN', 'FAZE', 'FEAR', 'FEAT', 'FEED',
      'FEEL', 'FEES', 'FEET', 'FELL', 'FELT', 'FEND', 'FENS', 'FERN', 'FESS',
      'FEST', 'FETA', 'FETE', 'FETS', 'FEUD', 'FILE', 'FILL', 'FILM', 'FIND',
      'FINE', 'FINK', 'FINO', 'FINS', 'FIRE', 'FIRK', 'FIRM', 'FIRS', 'FISC',
      'FISH', 'FIST', 'FITS', 'FIVE', 'FIXT', 'FLAB', 'FLAG', 'FLAK', 'FLAM',
      'FLAN', 'FLAP', 'FLAT', 'FLAW', 'FLAX', 'FLAY', 'FLEA', 'FLED', 'FLEE',
      'FLEG', 'FLEW', 'FLEX', 'FLEY', 'FLIC', 'FLIM', 'FLIP', 'FLIR', 'FLIT',
      'FLOB', 'FLOC', 'FLOE', 'FLOG', 'FLOP', 'FLOR', 'FLOW', 'FLUB', 'FLUE',
      'FLUS', 'FLUX', 'FOAL', 'FOAM', 'FOBS', 'FOCI', 'FOES', 'FOGS', 'FOGY',
      'FOIL', 'FOIN', 'FOLD', 'FOLK', 'FOND', 'FONE', 'FONS', 'FONT', 'FOOD',
      'FOOL', 'FOOT', 'FOPS', 'FORA', 'FORB', 'FORD', 'FORE', 'FORK', 'FORM',
      'FORT', 'FOSS', 'FOUL', 'FOUR', 'FOWL', 'FOXY', 'FOYS', 'FOZY', 'FRAB',
      'FRAE', 'FRAG', 'FRAP', 'FRAS', 'FRAT', 'FRAU', 'FRAY', 'FREE', 'FRET',
      'FRIB', 'FRIG', 'FRIS', 'FRIT', 'FRIZ', 'FROE', 'FROG', 'FROM', 'FRON',
      'FROW', 'FRUG', 'FUBS', 'FUCI', 'FUDS', 'FUEL', 'FUFF', 'FUGS', 'FUGU',
      'FUJI', 'FULL', 'FUME', 'FUMS', 'FUMY', 'FUND', 'FUNG', 'FUNK', 'FUNS',
      'FURL', 'FURR', 'FURS', 'FURY', 'FUSE', 'FUSS', 'FUST',
      'BALL', 'CALL', 'FALL', 'HALL', 'MALL', 'TALL', 'WALL', 'BAND', 'HAND',
      'LAND', 'SAND', 'WAND', 'BANK', 'DANK', 'HANK', 'RANK', 'SANK', 'TANK',
      'BARE', 'CARE', 'DARE', 'FARE', 'HARE', 'MARE', 'PARE', 'RARE', 'WARE',
      'BARK', 'DARK', 'HARK', 'LARK', 'MARK', 'PARK', 'SARK', 'WARK', 'BARN',
      'CARN', 'DARN', 'EARN', 'HARN', 'KARN', 'TARN', 'WARN', 'YARN', 'BASE',
      'CASE', 'LASE', 'MASE', 'PASE', 'RASE', 'VASE', 'WASE', 'BASH', 'CASH',
      'DASH', 'GASH', 'HASH', 'LASH', 'MASH', 'PASH', 'RASH', 'SASH', 'WASH',
      
      // Common 5-letter words
      'WORDS', 'WORKS', 'WALKS', 'TALKS', 'BALKS', 'BALLS', 'CALLS', 'FALLS',
      'THERE', 'THEIR', 'WOULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE',
      'THINK', 'WHERE', 'BEING', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE',
      'UNDER', 'WHILE', 'WORLD', 'YOUNG', 'ABOUT', 'ABOVE', 'ABUSE', 'ADULT',
      'ADVICE', 'AFTER', 'AGAIN', 'AGAINST', 'AGENT', 'AGREE', 'AHEAD', 'ALARM',
      
      // Common 6-letter words
      'ABOUT', 'BEFORE', 'BETWEEN', 'DURING', 'FAMILY', 'FATHER',
      'FRIEND', 'LITTLE', 'MOTHER', 'PEOPLE', 'PERSON', 'PLEASE', 'SCHOOL',
      'SHOULD', 'SISTER', 'THROUGH', 'WOMAN',
      
      // Common 7-letter words
      'ALWAYS', 'ANOTHER', 'BECAUSE', 'BROTHER', 'DIFFERENT', 'EVERYONE',
      'GENERAL', 'IMPORTANT', 'NOTHING', 'PICTURE', 'PRESENT', 'PROBLEM',
      'SEVERAL', 'THOUGHT', 'TOGETHER', 'WITHOUT',
      
      // Common 8-letter words
      'SOMETIMES', 'SOMETHING', 'TOMORROW',       'YESTERDAY',
      
      // Add more common words for testing
      'ACT', 'ADD', 'AGE', 'AID', 'AIM', 'AIR', 'ALE', 'ALL', 'ANT', 'ANY', 'APE', 'APT', 'ARC', 'ARE', 'ARK', 'ARM', 'ART', 'ASH', 'ASK', 'ASP',
      'BAD', 'BAG', 'BAN', 'BAR', 'BAT', 'BAY', 'BED', 'BEE', 'BEG', 'BEL', 'BEN', 'BET', 'BIB', 'BID', 'BIG', 'BIN', 'BIT', 'BOA', 'BOB', 'BOG',
      'BOO', 'BOP', 'BOW', 'BOX', 'BOY', 'BRA', 'BUD', 'BUG', 'BUM', 'BUN', 'BUS', 'BUT', 'BUY', 'BYE', 'CAB', 'CAD', 'CAM', 'CAN', 'CAP', 'CAR',
      'CAT', 'CAW', 'CAY', 'COB', 'COD', 'COG', 'COL', 'CON', 'COO', 'COP', 'COT', 'COW', 'COX', 'COY', 'CRY', 'CUB', 'CUD', 'CUE', 'CUM', 'CUP',
      'CUR', 'CUT', 'DAB', 'DAD', 'DAG', 'DAK', 'DAM', 'DAN', 'DAP', 'DAY', 'DEB', 'DEE', 'DEF', 'DEL', 'DEN', 'DEP', 'DEV', 'DEW', 'DEX', 'DEY',
      'DIB', 'DID', 'DIE', 'DIG', 'DIM', 'DIN', 'DIP', 'DIS', 'DIT', 'DOC', 'DOD', 'DOE', 'DOG', 'DOH', 'DOL', 'DOM', 'DON', 'DOO', 'DOP', 'DOR',
      'DOS', 'DOT', 'DOW', 'DRY', 'DSO', 'DUB', 'DUD', 'DUE', 'DUG', 'DUH', 'DUI', 'DUM', 'DUN', 'DUO', 'DUP', 'DUX', 'DYE', 'EAR', 'EAT', 'EBB',
      'ECU', 'EDH', 'EDS', 'EEK', 'EEL', 'EFF', 'EFS', 'EFT', 'EGG', 'EGO', 'EKE', 'ELD', 'ELF', 'ELK', 'ELL', 'ELM', 'ELS', 'EME', 'EMS', 'EMU',
      'END', 'ENG', 'ENS', 'EON', 'ERA', 'ERE', 'ERG', 'ERK', 'ERN', 'ERR', 'ERS', 'ESS', 'EST', 'ETA', 'ETH', 'EVE', 'EWE', 'EWT', 'EYE', 'FAB',
      'FAD', 'FAG', 'FAH', 'FAN', 'FAR', 'FAS', 'FAT', 'FAW', 'FAX', 'FAY', 'FED', 'FEE', 'FEG', 'FEH', 'FEM', 'FEN', 'FER', 'FES', 'FET', 'FEU',
      'FEW', 'FEY', 'FEZ', 'FIB', 'FID', 'FIE', 'FIG', 'FIL', 'FIN', 'FIR', 'FIT', 'FIX', 'FIZ', 'FLU', 'FLY', 'FOB', 'FOE', 'FOG', 'FOH', 'FON',
      'FOP', 'FOR', 'FOU', 'FOX', 'FOY', 'FRA', 'FRO', 'FRY', 'FUB', 'FUD', 'FUG', 'FUM', 'FUN', 'FUR', 'GAB', 'GAD', 'GAE', 'GAG', 'GAK', 'GAL',
      'GAM', 'GAN', 'GAP', 'GAR', 'GAS', 'GAT', 'GAU', 'GAV', 'GAW', 'GAY', 'GAZ', 'GED', 'GEE', 'GEL', 'GEM', 'GEN', 'GEO', 'GER', 'GET', 'GEY',
      'GHI', 'GIB', 'GID', 'GIE', 'GIF', 'GIG', 'GIN', 'GIO', 'GIP', 'GIS', 'GIT', 'GJU', 'GNU', 'GOA', 'GOB', 'GOD', 'GOE', 'GON', 'GOO', 'GOR',
      'GOS', 'GOT', 'GOU', 'GOV', 'GOX', 'GOY', 'GOZ', 'GUB', 'GUE', 'GUL', 'GUM', 'GUN', 'GUP', 'GUR', 'GUS', 'GUT', 'GUY', 'GYM', 'GYP', 'HAD',
      'HAE', 'HAG', 'HAH', 'HAJ', 'HAK', 'HAM', 'HAN', 'HAO', 'HAP', 'HAS', 'HAT', 'HAW', 'HAY', 'HEH', 'HEM', 'HEN', 'HEP', 'HER', 'HES', 'HET',
      'HEW', 'HEX', 'HEY', 'HIC', 'HID', 'HIE', 'HIM', 'HIN', 'HIP', 'HIS', 'HIT', 'HMM', 'HOB', 'HOC', 'HOD', 'HOE', 'HOG', 'HOH', 'HOI', 'HOM',
      'HON', 'HOO', 'HOP', 'HOS', 'HOT', 'HOU', 'HOW', 'HOX', 'HOY', 'HUB', 'HUE', 'HUG', 'HUH', 'HUI', 'HUM', 'HUN', 'HUP', 'HUT', 'HYE', 'HYP',
      'ICE', 'ICH', 'ICK', 'ICY', 'IDE', 'IDS', 'IFF', 'IFS', 'IGG', 'ILK', 'ILL', 'IMP', 'INK', 'INN', 'INS', 'ION', 'IOS', 'IRE', 'IRK', 'ISH',
      'ISM', 'ISO', 'ITA', 'ITS', 'IVY', 'IWI', 'JAB', 'JAG', 'JAK', 'JAM', 'JAP', 'JAR', 'JAW', 'JAY', 'JEE', 'JET', 'JEU', 'JEW', 'JIB', 'JIG',
      'JIN', 'JIZ', 'JOB', 'JOE', 'JOG', 'JOL', 'JOR', 'JOT', 'JOW', 'JOY', 'JUD', 'JUG', 'JUN', 'JUS', 'JUT', 'KAB', 'KAE', 'KAF', 'KAI', 'KAJ',
      'KAK', 'KAM', 'KAS', 'KAT', 'KAW', 'KAY', 'KEA', 'KEB', 'KED', 'KEF', 'KEG', 'KEN', 'KEP', 'KET', 'KEX', 'KEY', 'KHI', 'KID', 'KIF', 'KIN',
      'KIP', 'KIR', 'KIS', 'KIT', 'KOI', 'KON', 'KOP', 'KOR', 'KOS', 'KOW', 'KOX', 'KUE', 'KYE', 'KYU', 'LAB', 'LAC', 'LAD', 'LAG', 'LAH', 'LAM',
      'LAP', 'LAR', 'LAS', 'LAT', 'LAV', 'LAW', 'LAX', 'LAY', 'LEA', 'LED', 'LEE', 'LEG', 'LEI', 'LEK', 'LEP', 'LES', 'LET', 'LEU', 'LEV', 'LEW',
      'LEX', 'LEY', 'LEZ', 'LIB', 'LID', 'LIE', 'LIG', 'LIN', 'LIP', 'LIS', 'LIT', 'LOB', 'LOC', 'LOD', 'LOG', 'LOO', 'LOP', 'LOR', 'LOS', 'LOT',
      'LOU', 'LOW', 'LOX', 'LOY', 'LUD', 'LUG', 'LUM', 'LUN', 'LUR', 'LUV', 'LUX', 'LUZ', 'LYE', 'LYM', 'MAC', 'MAD', 'MAE', 'MAG', 'MAK', 'MAL',
      'MAM', 'MAN', 'MAP', 'MAR', 'MAS', 'MAT', 'MAW', 'MAX', 'MAY', 'MED', 'MEE', 'MEG', 'MEH', 'MEL', 'MEM', 'MEN', 'MES', 'MET', 'MEU', 'MEW',
      'MHO', 'MIB', 'MIC', 'MID', 'MIG', 'MIL', 'MIM', 'MIR', 'MIS', 'MIX', 'MIZ', 'MMM', 'MOA', 'MOB', 'MOC', 'MOD', 'MOE', 'MOG', 'MOI', 'MOL',
      'MOM', 'MON', 'MOO', 'MOP', 'MOR', 'MOS', 'MOT', 'MOU', 'MOW', 'MOX', 'MOY', 'MOZ', 'MUD', 'MUG', 'MUM', 'MUN', 'MUS', 'MUT', 'MUX', 'MYC',
      'NAB', 'NAE', 'NAG', 'NAH', 'NAM', 'NAN', 'NAP', 'NAS', 'NAT', 'NAW', 'NAY', 'NEB', 'NED', 'NEE', 'NEF', 'NEG', 'NEK', 'NEP', 'NET', 'NEW',
      'NIB', 'NID', 'NIE', 'NIL', 'NIM', 'NIP', 'NIS', 'NIT', 'NIX', 'NOB', 'NOD', 'NOG', 'NOH', 'NOM', 'NON', 'NOO', 'NOR', 'NOS', 'NOT', 'NOV',
      'NOW', 'NOX', 'NOY', 'NTH', 'NUB', 'NUG', 'NUN', 'NUR', 'NUS', 'NUT', 'NYE', 'NYM', 'OAF', 'OAK', 'OAR', 'OAT', 'OBA', 'OBB', 'OBE', 'OBI',
      'OBO', 'OBS', 'OCA', 'OCH', 'ODA', 'ODD', 'ODE', 'ODS', 'OES', 'OFF', 'OFT', 'OHM', 'OHO', 'OHS', 'OHV', 'OIK', 'OIL', 'OIS', 'OKA', 'OKE',
      'OLD', 'OLE', 'OLM', 'OMS', 'ONE', 'ONO', 'ONS', 'ONY', 'OOF', 'OOH', 'OOM', 'OON', 'OOP', 'OOR', 'OOS', 'OOT', 'OPE', 'OPS', 'OPT', 'ORA',
      'ORB', 'ORC', 'ORD', 'ORE', 'ORF', 'ORG', 'ORS', 'ORT', 'OSE', 'OUD', 'OUK', 'OUL', 'OUP', 'OUR', 'OUS', 'OUT', 'OUX', 'OVA', 'OVE', 'OWE',
      'OWL', 'OWN', 'OWT', 'OXO', 'OXY', 'OYE', 'OYS', 'PAC', 'PAD', 'PAH', 'PAK', 'PAL', 'PAM', 'PAN', 'PAP', 'PAR', 'PAS', 'PAT', 'PAV', 'PAW',
      'PAX', 'PAY', 'PEA', 'PEC', 'PED', 'PEE', 'PEG', 'PEH', 'PEL', 'PEN', 'PEP', 'PER', 'PES', 'PET', 'PEW', 'PHI', 'PHO', 'PHT', 'PIA', 'PIC',
      'PIE', 'PIG', 'PIN', 'PIP', 'PIR', 'PIS', 'PIT', 'PIU', 'PIX', 'PLU', 'PLY', 'POA', 'POD', 'POH', 'POI', 'POL', 'POM', 'POO', 'POP', 'POR',
      'POS', 'POT', 'POW', 'POX', 'POY', 'PRE', 'PRO', 'PRY', 'PSI', 'PST', 'PUB', 'PUD', 'PUG', 'PUH', 'PUL', 'PUM', 'PUN', 'PUP', 'PUR', 'PUS',
      'PUT', 'PUY', 'PYA', 'PYE', 'PYX', 'QAT', 'QIS', 'QUA', 'RAD', 'RAG', 'RAH', 'RAI', 'RAJ', 'RAM', 'RAN', 'RAP', 'RAS', 'RAT', 'RAV', 'RAW',
      'RAX', 'RAY', 'REB', 'REC', 'RED', 'REE', 'REF', 'REG', 'REH', 'REI', 'REM', 'REN', 'REO', 'REP', 'RES', 'RET', 'REV', 'REW', 'REX', 'REZ',
      'RHO', 'RIB', 'RID', 'RIF', 'RIG', 'RIM', 'RIN', 'RIP', 'RIT', 'RIZ', 'ROB', 'ROC', 'ROD', 'ROE', 'ROK', 'ROM', 'ROO', 'ROT', 'ROW', 'RUB',
      'RUC', 'RUD', 'RUE', 'RUG', 'RUM', 'RUN', 'RUT', 'RYA', 'RYE', 'RYU', 'SAB', 'SAC', 'SAD', 'SAE', 'SAG', 'SAI', 'SAK', 'SAL', 'SAM', 'SAN',
      'SAP', 'SAR', 'SAS', 'SAT', 'SAU', 'SAV', 'SAW', 'SAX', 'SAY', 'SAZ', 'SEA', 'SEC', 'SED', 'SEE', 'SEG', 'SEI', 'SEL', 'SEN', 'SER', 'SET',
      'SEW', 'SEX', 'SEY', 'SEZ', 'SHA', 'SHE', 'SHH', 'SHY', 'SIB', 'SIC', 'SIF', 'SIK', 'SIM', 'SIN', 'SIP', 'SIR', 'SIS', 'SIT', 'SIX', 'SKA',
      'SKI', 'SKY', 'SLY', 'SOB', 'SOC', 'SOD', 'SOG', 'SOH', 'SOL', 'SOM', 'SON', 'SOP', 'SOS', 'SOT', 'SOU', 'SOV', 'SOW', 'SOX', 'SOY', 'SOZ',
      'SPA', 'SPY', 'SRI', 'STY', 'SUB', 'SUD', 'SUE', 'SUG', 'SUI', 'SUK', 'SUM', 'SUN', 'SUP', 'SUQ', 'SUR', 'SUS', 'SUT', 'SUX', 'SUY', 'SWY',
      'SYE', 'SYN', 'SYP', 'TAB', 'TAD', 'TAE', 'TAG', 'TAI', 'TAJ', 'TAK', 'TAM', 'TAN', 'TAO', 'TAP', 'TAR', 'TAS', 'TAT', 'TAU', 'TAV', 'TAW',
      'TAX', 'TAY', 'TEA', 'TEC', 'TED', 'TEE', 'TEF', 'TEG', 'TEL', 'TEM', 'TEN', 'TEP', 'TER', 'TES', 'TET', 'TEW', 'TEX', 'THE', 'THO', 'THY',
      'TIC', 'TID', 'TIE', 'TIG', 'TIL', 'TIM', 'TIN', 'TIP', 'TIS', 'TIT', 'TIX', 'TOC', 'TOD', 'TOE', 'TOG', 'TOM', 'TON', 'TOO', 'TOP', 'TOR',
      'TOT', 'TOU', 'TOW', 'TOY', 'TRP', 'TRY', 'TSK', 'TUB', 'TUG', 'TUI', 'TUM', 'TUN', 'TUP', 'TUT', 'TUX', 'TWA', 'TWO', 'TWY', 'TYE', 'TYG',
      'UDO', 'UDS', 'UEY', 'UFO', 'UGH', 'UGS', 'UKE', 'ULU', 'UMM', 'UMP', 'UMS', 'UMU', 'UNI', 'UNS', 'UPO', 'UPS', 'URB', 'URD', 'URE', 'URF',
      'URN', 'URP', 'USE', 'UTA', 'UTE', 'UTS', 'UTU', 'UVA', 'VAC', 'VAE', 'VAG', 'VAN', 'VAR', 'VAS', 'VAT', 'VAU', 'VAV', 'VAW', 'VEE', 'VEG',
      'VET', 'VEX', 'VIA', 'VID', 'VIE', 'VIG', 'VIM', 'VIN', 'VIS', 'VLY', 'VOE', 'VOL', 'VOM', 'VOR', 'VOW', 'VOX', 'VOY', 'VUG', 'VUM', 'WAB',
      'WAD', 'WAE', 'WAG', 'WAH', 'WAI', 'WAN', 'WAP', 'WAR', 'WAS', 'WAT', 'WAW', 'WAX', 'WAY', 'WEB', 'WED', 'WEE', 'WEM', 'WEN', 'WEP', 'WER',
      'WES', 'WET', 'WEX', 'WEY', 'WHA', 'WHO', 'WHY', 'WIG', 'WIN', 'WIS', 'WIT', 'WIZ', 'WOE', 'WOF', 'WOG', 'WOK', 'WON', 'WOO', 'WOP', 'WOS',
      'WOT', 'WOW', 'WOX', 'WOY', 'WUD', 'WUS', 'WYE', 'WYN', 'XIS', 'YAD', 'YAE', 'YAG', 'YAH', 'YAK', 'YAM', 'YAP', 'YAR', 'YAS', 'YAW', 'YAY',
      'YEA', 'YEH', 'YEN', 'YEP', 'YES', 'YET', 'YEW', 'YEX', 'YEY', 'YGO', 'YID', 'YIN', 'YIP', 'YIS', 'YOB', 'YOD', 'YOK', 'YOM', 'YON', 'YOS',
      'YOW', 'YOX', 'YOY', 'YUA', 'YUG', 'YUK', 'YUM', 'YUN', 'YUP', 'YUS', 'ZAG', 'ZAP', 'ZAS', 'ZAX', 'ZEA', 'ZED', 'ZEE', 'ZEK', 'ZEL', 'ZEP',
      'ZEX', 'ZHO', 'ZIG', 'ZIN', 'ZIP', 'ZIT', 'ZIZ', 'ZOA', 'ZOL', 'ZOO', 'ZOS', 'ZOT', 'ZOU', 'ZOW', 'ZUZ', 'ZZZ',
    ];

    return new Set(commonWords);
  }

  /**
   * Get fallback dictionary (always available, initialized in constructor)
   */
  private getFallbackDictionary(): Set<string> {
    return this.fallbackDictionary;
  }

  /**
   * Check if a word is valid
   * @param word - Word to validate (case-insensitive)
   * @returns true if word is valid, false otherwise
   */
  isValidWord(word: string): boolean {
    // Ensure fallback is always initialized (should be from constructor)
    if (!this.initialized || !this.fallbackDictionary) {
      console.error('❌ Dictionary service not properly initialized!');
      return false;
    }

    if (!word || typeof word !== 'string') {
      return false;
    }

    const cleanWord = word.trim().toUpperCase();

    // Empty string check
    if (cleanWord.length === 0) {
      return false;
    }

    // Check length
    if (
      cleanWord.length < BOARD_CONFIG.MIN_WORD_LENGTH ||
      cleanWord.length > BOARD_CONFIG.MAX_WORD_LENGTH
    ) {
      return false;
    }

    // Check if it's a sponsor word (always valid)
    if (this.SPONSOR_WORDS.has(cleanWord)) {
      return true;
    }

    // Always check fallback dictionary first (it's always initialized)
    if (this.fallbackDictionary.has(cleanWord)) {
      // If main dictionary is loaded, check if word is also in main (for logging)
      if (this.dictionary && this.dictionary.size > 0) {
        const inMain = this.dictionary.has(cleanWord);
        if (!inMain) {
          console.log(`✅ Word "${cleanWord}" found in fallback dictionary (main dict: ${this.dictionary.size} words)`);
        }
      }
      return true;
    }

    // Check main dictionary if loaded
    if (this.dictionary && this.dictionary.size > 0) {
      const isValid = this.dictionary.has(cleanWord);
      if (isValid) {
        return true;
      }
      // Word not found in either dictionary
      console.log(`❌ Word "${cleanWord}" not found in main dictionary (${this.dictionary.size} words) or fallback (${this.fallbackDictionary.size} words)`);
      return false;
    }

    // Main dictionary not loaded yet - start loading in background (non-blocking)
    if (!this.isLoading) {
      this.initialize().catch(error => {
        console.error('Dictionary initialization error:', error);
      });
    }

    // Word not found in fallback dictionary
    console.log(`❌ Word "${cleanWord}" not found in fallback dictionary (${this.fallbackDictionary.size} words), main dict not loaded yet`);
    return false;
  }

  /**
   * Get dictionary size (number of words)
   */
  getDictionarySize(): number {
    return this.dictionary?.size ?? 0;
  }

  /**
   * Check if dictionary is loaded
   */
  isLoaded(): boolean {
    return this.dictionary !== null;
  }

  /**
   * Clear dictionary cache
   */
  clearCache(): void {
    localStorage.removeItem(DICTIONARY_CACHE_KEY);
    this.dictionary = null;
    this.loadPromise = null;
  }
}

// Export singleton instance
export default new DictionaryService();
