import React from 'react';

export const CASES = [
  {
    disease: '10356.0',
    drug: 'DB01612',
    open_list: [1, 3],
    description: (
      <span>
        NSIAD is a rare genetic disorder of water and sodium imbalance that has
        prevalence of less than one in a million
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Orphanet]
        </a>
        . A mutation in the AVPR2 gene confirms diagnosis
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Orphanet]
        </a>
        . Patients with congestive heart failure also experience similar
        challenges with fluid retention. Congestive heart failure is strongly
        associated with both AVPR2 and NPR1 genes{' '}
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Open targets]
        </a>
        . The AVPR2 and NPR1 genes regulate fluid and electrolyte balance in the
        body through complementary but different pathways. While AVPR2 is
        involved in water retention and concentrating urine, NPR1 promotes
        vasodilation, decreased blood pressure, and increased excretion of
        water. Enhancing NPR1 activity could theoretically help counterbalance
        the excessive water reabsorption caused by the abnormally functioning
        AVPR2 receptors in NSIAD. The NPR1 gene is target for Amyl Nitrite,
        hence this drug could be a useful therapy in NSIAD patients
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Drugbank]
        </a>
        .
      </span>
    ),
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
    disease: '19567_19568_7522',
    drug: 'DB00755',
    open_list: [1, 3],
    description: (
      <span>
        Ehlers-Danlos syndrome is a rare inherited connective tissue disorder
        caused by mutations in genes that code for collagen (such as COL1A1,
        COL1A2) with a prevalence of 1-9 / 100 000
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Orphanet]
        </a>
        . Key symptoms include impaired wound healing and formation of form
        atypical scars on the skin. Tretnoin is a vitamin A derivative used to
        treat acne and is carrier by albumin (ALB) and targets ALDH1A1 to
        prevents collagen loss and reduce inflammation
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Drugbank]
        </a>
        . Tretinoin may help in Ehlers-Danlos Syndrome by potentially enhancing
        wound healing and improving the appearance of scars due to its ability
        to stimulate collagen production in the skin. Some subtypes of
        Elhers-Danlos Syndrome are associated with a pathogenic mutation in the
        ALB gene in ClinVar and weakly linked to ALDH1AI in Europe PMC
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Opentargets]
        </a>
      </span>
    ),
    paths: [],
  },
  {
    disease: '27407_54701_12455',
    drug: 'DB00425',
    open_list: [0, 3],
    description: (
      <span>
        Kleefstra syndrome is a rare genetic, intellectual disability syndrome
        caused by mutations in EHMT1 characterized by little speech development,
        autism spectrum disorder, and childhood hypotonia with a prevalence of
        less than one in a million
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Orphanet]
        </a>
        . Zolpidem, commonly known as a sedative-hypnotic medication used for
        the short-term treatment of insomnia, has been found in some cases to
        have unexpected neurological benefits in various neurodevelopmental and
        neurodegenerative disorders. In neurodevelopmental disorders (such as
        Kleefstra syndrome), the brain might have dormant or underactive neurons
        due to genetic or molecular abnormalities. Zolpidem has been observed in
        some cases to temporarily “awaken” these underactive neural pathways
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [study]
        </a>
        . This effect is thought to be due to zolpidem’s action on GABA-A
        receptors (gene GABRG2) in the brain
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Drugbank]
        </a>
        . GABA-A receptors are inhibitory, meaning they reduce neuronal
        activity. Zolpidem typically enhances the inhibitory effects of GABA,
        leading to sedation. However, in certain neurological conditions, it may
        paradoxically improve neuronal activity in some brain regions [Case
        report]. There have been anecdotal reports and a few small studies
        suggesting that zolpidem may improve symptoms like speech, motor
        abilities, and alertness in some patients with severe brain injuries or
        neurodevelopmental disorders{' '}
        <a
          href="https://www.orpha.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [another study]
        </a>
        .
      </span>
    ),
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
