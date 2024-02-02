const STATIC_URL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.REACT_APP_PORT}`
    : './';

const SERVER_URL =
  process.env.NODE_ENV === 'development' ? `http://localhost:8002` : './';

const DATA_URL = 'txgnn_data_v2';

const CASES = [
  {
    disease: '10356.0',
    drug: 'DB01612',
    paths: [
      [
        'disease:10356.0', // nephrogenic syndrome of inappropriate antidiuresis
        'gene/protein:554.0', // disease_protein -> AVPR2
        'disease:5009.0', // disease_protein -> congestive heart failure
        'gene/protein:4881.0', //disease_protein -> NPR1
        'drug:DB01612', // drug_protein -> Amyl Nitrite
      ],
    ],
  },
  {
    disease: '27407_54701_12455',
    drug: 'DB00425',
    paths: [
      [
        'disease:27407_54701_12455', // Kleefstra syndrome
        'gene/protein:79813.0', // disease_protein -> EHMT1
        'anatomy:7105.0', // anatomy_protein_present -> dorsolateral prefrontal cortex
        'gene/protein:2554.0', // anatomy_protein_present -> GABRA1
        'drug:DB00425', // -> drug_protein -> Zolpidemm
      ],
    ],
  },
];

export { STATIC_URL, SERVER_URL, DATA_URL, CASES };
