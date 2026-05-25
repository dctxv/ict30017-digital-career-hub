// OpenRouter model registry
// inputPrice / outputPrice are USD per 1M tokens

export const MODELS = [
  {
    folder:        'gemini_3.1_flash_lite',
    openrouterId:  'google/gemini-3.1-flash-lite',
    inputPrice:    0.25,
    outputPrice:   1.50,
  },
  {
    folder:        'gemini_3_flash_preview',
    openrouterId:  'google/gemini-3-flash-preview',
    inputPrice:    0.50,
    outputPrice:   3.00,
  },
  {
    folder:        'gemini_2.5_flash',
    openrouterId:  'google/gemini-2.5-flash',
    inputPrice:    0.30,
    outputPrice:   2.50,
  },
  {
    folder:        'gpt_5.4_nano',
    openrouterId:  'openai/gpt-5.4-nano',
    inputPrice:    0.20,
    outputPrice:   1.25,
  },
  {
    folder:        'gpt_5_nano',
    openrouterId:  'openai/gpt-5-nano',
    inputPrice:    0.05,
    outputPrice:   0.40,
  },
  {
    folder:        'haiku_4.5',
    openrouterId:  'anthropic/claude-haiku-4.5',
    inputPrice:    1.00,
    outputPrice:   5.00,
  },
  {
    folder:        'mistral_small_4',
    openrouterId:  'mistralai/mistral-small-2603',
    inputPrice:    0.15,
    outputPrice:   0.60,
  },
  {
    folder:        'llama_3.3_70b',
    openrouterId:  'meta-llama/llama-3.3-70b-instruct',
    inputPrice:    0.10,
    outputPrice:   0.32,
  },
  {
    folder:        'gemma_4_26b_a4b',
    openrouterId:  'google/gemma-4-26b-a4b-it',
    inputPrice:    0.06,
    outputPrice:   0.33,
  },
];
