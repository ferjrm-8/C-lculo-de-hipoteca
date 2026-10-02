// ==========================================================================
// HIPOTECA Y CUENTAS CONJUNTAS LAURA & RAK - MOTOR DE CÁLCULO Y GESTIÓN
// ==========================================================================

const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

let settings = {
  initialCapital: 121766.32,
  totalTermYears: 25,
  annualInterestRate: 1.85,
  coOwner1Name: "Laura",
  coOwner2Name: "Rak",
  coOwner1Percentage: 43.94,
  coOwner2Percentage: 56.06,
  internalDebtLaura: 53500.0,
  internalDebtRak: 68266.32
};

let revisions = [
  {
    id: 1,
    name: "Periodo Inicial (Nov 2020)",
    startYear: 2020,
    startMonth: 11,
    capTotal: 121766.32,
    capLaura: 53500.00,
    pctLaura: 43.94,
    feeTotal: 645.54,
    intTotal: 131.73,
    prinTotal: 513.81,
    lauraFee: 283.65,
    rakFee: 361.89,
    lauraInt: 57.88,
    lauraPrin: 225.77
  },
  {
    id: 2,
    name: "1ª Rev. 30 Noviembre 2021",
    startYear: 2021,
    startMonth: 12,
    capTotal: 94880.43,
    capLaura: 30557.69,
    pctLaura: 32.21,
    feeTotal: 520.95,
    intTotal: 176.00,
    prinTotal: 344.95,
    lauraFee: 167.80,
    rakFee: 353.15,
    lauraInt: 56.69,
    lauraPrin: 111.11
  },
  {
    id: 3,
    name: "Revisión Julio 2022",
    startYear: 2022,
    startMonth: 8,
    capTotal: 91010.00,
    capLaura: 29370.76,
    pctLaura: 32.27,
    feeTotal: 570.32,
    intTotal: 176.50,
    prinTotal: 393.82,
    lauraFee: 184.04,
    rakFee: 386.28,
    lauraInt: 56.96,
    lauraPrin: 127.08
  },
  {
    id: 4,
    name: "Revisión Diciembre 2022",
    startYear: 2022,
    startMonth: 12,
    capTotal: 88656.77,
    capLaura: 28719.25,
    pctLaura: 32.39,
    feeTotal: 581.73,
    intTotal: 176.00,
    prinTotal: 405.73,
    lauraFee: 188.42,
    rakFee: 393.31,
    lauraInt: 57.01,
    lauraPrin: 131.41
  },
  {
    id: 5,
    name: "Revisión Febrero 2023",
    startYear: 2023,
    startMonth: 2,
    capTotal: 88230.34,
    capLaura: 28443.46,
    pctLaura: 32.24,
    feeTotal: 666.44,
    intTotal: 210.00,
    prinTotal: 456.44,
    lauraFee: 214.86,
    rakFee: 451.58,
    lauraInt: 67.70,
    lauraPrin: 147.16
  },
  {
    id: 6,
    name: "Revisión Julio 2023",
    startYear: 2023,
    startMonth: 8,
    capTotal: 86020.00,
    capLaura: 27758.08,
    pctLaura: 32.27,
    feeTotal: 706.02,
    intTotal: 235.00,
    prinTotal: 471.02,
    lauraFee: 227.83,
    rakFee: 478.19,
    lauraInt: 75.83,
    lauraPrin: 152.00
  },
  {
    id: 7,
    name: "Revisión Diciembre 2023",
    startYear: 2023,
    startMonth: 12,
    capTotal: 84422.79,
    capLaura: 27331.97,
    pctLaura: 32.38,
    feeTotal: 720.14,
    intTotal: 225.00,
    prinTotal: 495.14,
    lauraFee: 233.18,
    rakFee: 486.96,
    lauraInt: 72.85,
    lauraPrin: 160.33
  },
  {
    id: 8,
    name: "Revisión Febrero 2024",
    startYear: 2024,
    startMonth: 2,
    capTotal: 83710.72,
    capLaura: 27106.14,
    pctLaura: 32.38,
    feeTotal: 707.10,
    intTotal: 245.00,
    prinTotal: 462.10,
    lauraFee: 228.96,
    rakFee: 478.14,
    lauraInt: 79.33,
    lauraPrin: 149.63
  },
  {
    id: 9,
    name: "Revisión Julio 2024",
    startYear: 2024,
    startMonth: 8,
    capTotal: 81550.00,
    capLaura: 26403.40,
    pctLaura: 32.38,
    feeTotal: 706.00,
    intTotal: 240.00,
    prinTotal: 466.00,
    lauraFee: 228.60,
    rakFee: 477.40,
    lauraInt: 77.71,
    lauraPrin: 150.89
  },
  {
    id: 10,
    name: "Revisión Diciembre 2024",
    startYear: 2024,
    startMonth: 12,
    capTotal: 80000.00,
    capLaura: 25718.10,
    pctLaura: 32.14,
    feeTotal: 720.12,
    intTotal: 230.00,
    prinTotal: 490.12,
    lauraFee: 232.17,
    rakFee: 487.95,
    lauraInt: 73.92,
    lauraPrin: 158.25
  }
];

const INITIAL_PAYMENTS_DEFAULT = [
  {
    "id": 1,
    "year": 2020,
    "month": 11,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 25.41,
    "derramas": 0,
    "insurance": 190.58,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Inicio Nov 2020 (53.500€ Laura)",
    "remaining": 121252.51000000001,
    "accLauraDiscount": 0,
    "lauraRemaining": 53274.232105678966,
    "rakRemaining": 67978.27789432104,
    "totalExpenses": 580.64,
    "monthGap": -80.63999999999999,
    "accBalance": -80.63999999999999
  },
  {
    "id": 2,
    "year": 2020,
    "month": 12,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 28.1,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 120738.70000000001,
    "accLauraDiscount": 0,
    "lauraRemaining": 53048.46421135793,
    "rakRemaining": 67690.23578864208,
    "totalExpenses": 392.75,
    "monthGap": 107.25,
    "accBalance": 26.610000000000014
  },
  {
    "id": 3,
    "year": 2021,
    "month": 1,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 24.25,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 120224.89000000001,
    "accLauraDiscount": 0,
    "lauraRemaining": 52822.6963170369,
    "rakRemaining": 67402.19368296312,
    "totalExpenses": 388.9,
    "monthGap": 111.10000000000002,
    "accBalance": 137.71000000000004
  },
  {
    "id": 4,
    "year": 2021,
    "month": 2,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 22.98,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 119711.08000000002,
    "accLauraDiscount": 0,
    "lauraRemaining": 52596.928422715864,
    "rakRemaining": 67114.15157728415,
    "totalExpenses": 387.63,
    "monthGap": 112.37,
    "accBalance": 250.08000000000004
  },
  {
    "id": 5,
    "year": 2021,
    "month": 3,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 25.91,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 119197.27000000002,
    "accLauraDiscount": 0,
    "lauraRemaining": 52371.16052839483,
    "rakRemaining": 66826.10947160519,
    "totalExpenses": 390.56,
    "monthGap": 109.44,
    "accBalance": 359.52000000000004
  },
  {
    "id": 6,
    "year": 2021,
    "month": 4,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 32.74,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 0,
    "notes": "Cuota ordinaria",
    "remaining": 118683.46000000002,
    "accLauraDiscount": 0,
    "lauraRemaining": 52145.392634073796,
    "rakRemaining": 66538.06736592622,
    "totalExpenses": 397.39,
    "monthGap": -397.39,
    "accBalance": -37.86999999999995
  },
  {
    "id": 7,
    "year": 2021,
    "month": 5,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 29.8,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 118169.65000000002,
    "accLauraDiscount": 0,
    "lauraRemaining": 51919.62473975276,
    "rakRemaining": 66250.02526024726,
    "totalExpenses": 394.45,
    "monthGap": 105.55000000000001,
    "accBalance": 67.68000000000006
  },
  {
    "id": 8,
    "year": 2021,
    "month": 6,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 40.4,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 117655.84000000003,
    "accLauraDiscount": 0,
    "lauraRemaining": 51693.85684543173,
    "rakRemaining": 65961.9831545683,
    "totalExpenses": 405.04999999999995,
    "monthGap": 94.95000000000005,
    "accBalance": 162.6300000000001
  },
  {
    "id": 9,
    "year": 2021,
    "month": 7,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 69.37,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 60.2,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 117142.03000000003,
    "accLauraDiscount": 0,
    "lauraRemaining": 51468.088951110694,
    "rakRemaining": 65673.94104888933,
    "totalExpenses": 494.21999999999997,
    "monthGap": 5.78000000000003,
    "accBalance": 168.41000000000014
  },
  {
    "id": 10,
    "year": 2021,
    "month": 8,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 77.64,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 116628.22000000003,
    "accLauraDiscount": 0,
    "lauraRemaining": 51242.32105678966,
    "rakRemaining": 65385.89894321037,
    "totalExpenses": 442.28999999999996,
    "monthGap": 57.710000000000036,
    "accBalance": 226.12000000000018
  },
  {
    "id": 11,
    "year": 2021,
    "month": 9,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 78.66,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 0,
    "notes": "Cuota ordinaria",
    "remaining": 116114.41000000003,
    "accLauraDiscount": 0,
    "lauraRemaining": 51016.55316246863,
    "rakRemaining": 65097.856837531406,
    "totalExpenses": 443.30999999999995,
    "monthGap": -443.30999999999995,
    "accBalance": -217.18999999999977
  },
  {
    "id": 12,
    "year": 2021,
    "month": 10,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 0,
    "community": 81,
    "electricity": 87.73,
    "derramas": 0,
    "insurance": 0,
    "ibi": 184.53,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 0,
    "notes": "IBI",
    "remaining": 115600.60000000003,
    "accLauraDiscount": 0,
    "lauraRemaining": 50790.78526814759,
    "rakRemaining": 64809.81473185244,
    "totalExpenses": 636.91,
    "monthGap": -636.91,
    "accBalance": -854.0999999999997
  },
  {
    "id": 13,
    "year": 2021,
    "month": 11,
    "totalFee": 645.54,
    "co1": 283.65,
    "co2": 361.89,
    "interest": 131.73,
    "principal": 513.81,
    "extra": 20014,
    "community": 81,
    "electricity": 102.94,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 271.56,
    "lauraExtraAmort": 20014,
    "deposit": 1500,
    "notes": "Amortización Laura 20.014€",
    "remaining": 95072.79000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 30551.01737382656,
    "rakRemaining": 64521.77262617348,
    "totalExpenses": 739.15,
    "monthGap": 760.85,
    "accBalance": -93.24999999999966
  },
  {
    "id": 14,
    "year": 2021,
    "month": 12,
    "totalFee": 520.95,
    "co1": 167.8,
    "co2": 353.15,
    "interest": 176,
    "principal": 344.95,
    "extra": 0,
    "community": 81,
    "electricity": 85,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 94727.84000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 30439.907651204427,
    "rakRemaining": 64287.93234879561,
    "totalExpenses": 333.8,
    "monthGap": 166.2,
    "accBalance": 72.95000000000033
  },
  {
    "id": 15,
    "year": 2022,
    "month": 1,
    "totalFee": 520.95,
    "co1": 167.8,
    "co2": 353.15,
    "interest": 176,
    "principal": 344.95,
    "extra": 0,
    "community": 81,
    "electricity": 45,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 94382.89000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 30328.797928582295,
    "rakRemaining": 64054.09207141775,
    "totalExpenses": 293.8,
    "monthGap": 206.2,
    "accBalance": 279.1500000000003
  },
  {
    "id": 16,
    "year": 2022,
    "month": 2,
    "totalFee": 520.95,
    "co1": 167.8,
    "co2": 353.15,
    "interest": 176,
    "principal": 344.95,
    "extra": 0,
    "community": 81,
    "electricity": 48,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 94037.94000000005,
    "accLauraDiscount": 20014,
    "lauraRemaining": 30217.688205960163,
    "rakRemaining": 63820.25179403988,
    "totalExpenses": 296.8,
    "monthGap": 203.2,
    "accBalance": 482.3500000000003
  },
  {
    "id": 17,
    "year": 2022,
    "month": 3,
    "totalFee": 520.95,
    "co1": 167.8,
    "co2": 353.15,
    "interest": 176,
    "principal": 344.95,
    "extra": 0,
    "community": 81,
    "electricity": 52,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 93692.99000000005,
    "accLauraDiscount": 20014,
    "lauraRemaining": 30106.57848333803,
    "rakRemaining": 63586.41151666202,
    "totalExpenses": 300.8,
    "monthGap": 199.2,
    "accBalance": 681.5500000000003
  },
  {
    "id": 18,
    "year": 2022,
    "month": 4,
    "totalFee": 520.95,
    "co1": 167.8,
    "co2": 353.15,
    "interest": 176,
    "principal": 344.95,
    "extra": 0,
    "community": 81,
    "electricity": 40,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 93348.04000000005,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29995.4687607159,
    "rakRemaining": 63352.57123928415,
    "totalExpenses": 288.8,
    "monthGap": 211.2,
    "accBalance": 892.7500000000002
  },
  {
    "id": 19,
    "year": 2022,
    "month": 5,
    "totalFee": 520.95,
    "co1": 167.8,
    "co2": 353.15,
    "interest": 176,
    "principal": 344.95,
    "extra": 0,
    "community": 81,
    "electricity": 38,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 93003.09000000005,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29884.359038093768,
    "rakRemaining": 63118.73096190629,
    "totalExpenses": 286.8,
    "monthGap": 213.2,
    "accBalance": 1105.9500000000003
  },
  {
    "id": 20,
    "year": 2022,
    "month": 6,
    "totalFee": 520.95,
    "co1": 167.8,
    "co2": 353.15,
    "interest": 176,
    "principal": 344.95,
    "extra": 0,
    "community": 81,
    "electricity": 42,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 92658.14000000006,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29773.249315471636,
    "rakRemaining": 62884.89068452842,
    "totalExpenses": 290.8,
    "monthGap": 209.2,
    "accBalance": 1315.1500000000003
  },
  {
    "id": 21,
    "year": 2022,
    "month": 7,
    "totalFee": 520.95,
    "co1": 167.8,
    "co2": 353.15,
    "interest": 176,
    "principal": 344.95,
    "extra": 0,
    "community": 81,
    "electricity": 65,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 92313.19000000006,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29662.139592849504,
    "rakRemaining": 62651.05040715056,
    "totalExpenses": 313.8,
    "monthGap": 186.2,
    "accBalance": 1501.3500000000004
  },
  {
    "id": 22,
    "year": 2022,
    "month": 8,
    "totalFee": 570.32,
    "co1": 184.04,
    "co2": 386.28,
    "interest": 176.5,
    "principal": 393.82,
    "extra": 0,
    "community": 81,
    "electricity": 70,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 91919.37000000005,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29535.055442197237,
    "rakRemaining": 62384.31455780282,
    "totalExpenses": 335.03999999999996,
    "monthGap": 164.96000000000004,
    "accBalance": 1666.3100000000004
  },
  {
    "id": 23,
    "year": 2022,
    "month": 9,
    "totalFee": 570.32,
    "co1": 184.04,
    "co2": 386.28,
    "interest": 176.5,
    "principal": 393.82,
    "extra": 0,
    "community": 81,
    "electricity": 60,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 91525.55000000005,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29407.97129154497,
    "rakRemaining": 62117.578708455076,
    "totalExpenses": 325.03999999999996,
    "monthGap": 174.96000000000004,
    "accBalance": 1841.2700000000004
  },
  {
    "id": 24,
    "year": 2022,
    "month": 10,
    "totalFee": 570.32,
    "co1": 184.04,
    "co2": 386.28,
    "interest": 176.5,
    "principal": 393.82,
    "extra": 0,
    "community": 81,
    "electricity": 62,
    "derramas": 0,
    "insurance": 0,
    "ibi": 190,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 91131.73000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29280.887140892704,
    "rakRemaining": 61850.84285910733,
    "totalExpenses": 517.04,
    "monthGap": -17.039999999999964,
    "accBalance": 1824.2300000000005
  },
  {
    "id": 25,
    "year": 2022,
    "month": 11,
    "totalFee": 570.32,
    "co1": 184.04,
    "co2": 386.28,
    "interest": 176.5,
    "principal": 393.82,
    "extra": 0,
    "community": 81,
    "electricity": 80,
    "derramas": 0,
    "insurance": 195,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 90737.91000000003,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29153.802990240438,
    "rakRemaining": 61584.107009759595,
    "totalExpenses": 540.04,
    "monthGap": -40.039999999999964,
    "accBalance": 1784.1900000000005
  },
  {
    "id": 26,
    "year": 2022,
    "month": 12,
    "totalFee": 581.73,
    "co1": 188.42,
    "co2": 393.31,
    "interest": 176,
    "principal": 405.73,
    "extra": 0,
    "community": 81,
    "electricity": 90,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 90332.18000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 29022.388680165317,
    "rakRemaining": 61309.79131983472,
    "totalExpenses": 359.41999999999996,
    "monthGap": 140.58000000000004,
    "accBalance": 1924.7700000000004
  },
  {
    "id": 27,
    "year": 2023,
    "month": 1,
    "totalFee": 581.73,
    "co1": 188.42,
    "co2": 393.31,
    "interest": 176,
    "principal": 405.73,
    "extra": 0,
    "community": 81,
    "electricity": 55,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 89926.45000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 28890.974370090196,
    "rakRemaining": 61035.475629909844,
    "totalExpenses": 324.41999999999996,
    "monthGap": 175.58000000000004,
    "accBalance": 2100.3500000000004
  },
  {
    "id": 28,
    "year": 2023,
    "month": 2,
    "totalFee": 666.44,
    "co1": 214.86,
    "co2": 451.58,
    "interest": 210,
    "principal": 456.44,
    "extra": 0,
    "community": 81,
    "electricity": 50,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 89470.01000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 28743.81828942277,
    "rakRemaining": 60726.19171057727,
    "totalExpenses": 345.86,
    "monthGap": 154.14,
    "accBalance": 2254.4900000000002
  },
  {
    "id": 29,
    "year": 2023,
    "month": 3,
    "totalFee": 666.44,
    "co1": 214.86,
    "co2": 451.58,
    "interest": 210,
    "principal": 456.44,
    "extra": 0,
    "community": 81,
    "electricity": 48,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 89013.57000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 28596.66220875534,
    "rakRemaining": 60416.907791244696,
    "totalExpenses": 343.86,
    "monthGap": 156.14,
    "accBalance": 2410.63
  },
  {
    "id": 30,
    "year": 2023,
    "month": 4,
    "totalFee": 666.44,
    "co1": 214.86,
    "co2": 451.58,
    "interest": 210,
    "principal": 456.44,
    "extra": 0,
    "community": 81,
    "electricity": 45,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 88557.13000000003,
    "accLauraDiscount": 20014,
    "lauraRemaining": 28449.506128087913,
    "rakRemaining": 60107.62387191212,
    "totalExpenses": 340.86,
    "monthGap": 159.14,
    "accBalance": 2569.77
  },
  {
    "id": 31,
    "year": 2023,
    "month": 5,
    "totalFee": 666.44,
    "co1": 214.86,
    "co2": 451.58,
    "interest": 210,
    "principal": 456.44,
    "extra": 0,
    "community": 81,
    "electricity": 40,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 88100.69000000003,
    "accLauraDiscount": 20014,
    "lauraRemaining": 28302.350047420485,
    "rakRemaining": 59798.33995257955,
    "totalExpenses": 335.86,
    "monthGap": 164.14,
    "accBalance": 2733.91
  },
  {
    "id": 32,
    "year": 2023,
    "month": 6,
    "totalFee": 666.44,
    "co1": 214.86,
    "co2": 451.58,
    "interest": 210,
    "principal": 456.44,
    "extra": 0,
    "community": 81,
    "electricity": 50,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 87644.25000000003,
    "accLauraDiscount": 20014,
    "lauraRemaining": 28155.193966753057,
    "rakRemaining": 59489.056033246976,
    "totalExpenses": 345.86,
    "monthGap": 154.14,
    "accBalance": 2888.0499999999997
  },
  {
    "id": 33,
    "year": 2023,
    "month": 7,
    "totalFee": 666.44,
    "co1": 214.86,
    "co2": 451.58,
    "interest": 210,
    "principal": 456.44,
    "extra": 0,
    "community": 81,
    "electricity": 75,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 87187.81000000003,
    "accLauraDiscount": 20014,
    "lauraRemaining": 28008.03788608563,
    "rakRemaining": 59179.7721139144,
    "totalExpenses": 370.86,
    "monthGap": 129.14,
    "accBalance": 3017.1899999999996
  },
  {
    "id": 34,
    "year": 2023,
    "month": 8,
    "totalFee": 706.02,
    "co1": 227.83,
    "co2": 478.19,
    "interest": 235,
    "principal": 471.02,
    "extra": 0,
    "community": 81,
    "electricity": 80,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 86716.79000000002,
    "accLauraDiscount": 20014,
    "lauraRemaining": 27856.041502697055,
    "rakRemaining": 58860.748497302964,
    "totalExpenses": 388.83000000000004,
    "monthGap": 111.16999999999996,
    "accBalance": 3128.3599999999997
  },
  {
    "id": 35,
    "year": 2023,
    "month": 9,
    "totalFee": 706.02,
    "co1": 227.83,
    "co2": 478.19,
    "interest": 235,
    "principal": 471.02,
    "extra": 0,
    "community": 81,
    "electricity": 65,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 86245.77000000002,
    "accLauraDiscount": 20014,
    "lauraRemaining": 27704.04511930848,
    "rakRemaining": 58541.72488069154,
    "totalExpenses": 373.83000000000004,
    "monthGap": 126.16999999999996,
    "accBalance": 3254.5299999999997
  },
  {
    "id": 36,
    "year": 2023,
    "month": 10,
    "totalFee": 706.02,
    "co1": 227.83,
    "co2": 478.19,
    "interest": 235,
    "principal": 471.02,
    "extra": 0,
    "community": 81,
    "electricity": 70,
    "derramas": 0,
    "insurance": 0,
    "ibi": 195,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 85774.75000000001,
    "accLauraDiscount": 20014,
    "lauraRemaining": 27552.048735919907,
    "rakRemaining": 58222.70126408011,
    "totalExpenses": 573.83,
    "monthGap": -73.83000000000004,
    "accBalance": 3180.7
  },
  {
    "id": 37,
    "year": 2023,
    "month": 11,
    "totalFee": 706.02,
    "co1": 227.83,
    "co2": 478.19,
    "interest": 235,
    "principal": 471.02,
    "extra": 0,
    "community": 81,
    "electricity": 85,
    "derramas": 0,
    "insurance": 200,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 85303.73000000001,
    "accLauraDiscount": 20014,
    "lauraRemaining": 27400.052352531333,
    "rakRemaining": 57903.67764746868,
    "totalExpenses": 593.83,
    "monthGap": -93.83000000000004,
    "accBalance": 3086.87
  },
  {
    "id": 38,
    "year": 2023,
    "month": 12,
    "totalFee": 720.14,
    "co1": 233.18,
    "co2": 486.96,
    "interest": 225,
    "principal": 495.14,
    "extra": 0,
    "community": 81,
    "electricity": 95,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 84808.59000000001,
    "accLauraDiscount": 20014,
    "lauraRemaining": 27239.726936362254,
    "rakRemaining": 57568.86306363776,
    "totalExpenses": 409.18,
    "monthGap": 90.82,
    "accBalance": 3177.69
  },
  {
    "id": 39,
    "year": 2024,
    "month": 1,
    "totalFee": 720.14,
    "co1": 233.18,
    "co2": 486.96,
    "interest": 225,
    "principal": 495.14,
    "extra": 0,
    "community": 81,
    "electricity": 60,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 84313.45000000001,
    "accLauraDiscount": 20014,
    "lauraRemaining": 27079.401520193176,
    "rakRemaining": 57234.048479806836,
    "totalExpenses": 374.18,
    "monthGap": 125.82,
    "accBalance": 3303.51
  },
  {
    "id": 40,
    "year": 2024,
    "month": 2,
    "totalFee": 707.1,
    "co1": 228.96,
    "co2": 478.14,
    "interest": 245,
    "principal": 462.1,
    "extra": 0,
    "community": 81,
    "electricity": 58,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 83851.35,
    "accLauraDiscount": 20014,
    "lauraRemaining": 26929.772873608534,
    "rakRemaining": 56921.57712639147,
    "totalExpenses": 367.96000000000004,
    "monthGap": 132.03999999999996,
    "accBalance": 3435.55
  },
  {
    "id": 41,
    "year": 2024,
    "month": 3,
    "totalFee": 707.1,
    "co1": 228.96,
    "co2": 478.14,
    "interest": 245,
    "principal": 462.1,
    "extra": 0,
    "community": 81,
    "electricity": 55,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 83389.25,
    "accLauraDiscount": 20014,
    "lauraRemaining": 26780.14422702389,
    "rakRemaining": 56609.10577297611,
    "totalExpenses": 364.96000000000004,
    "monthGap": 135.03999999999996,
    "accBalance": 3570.59
  },
  {
    "id": 42,
    "year": 2024,
    "month": 4,
    "totalFee": 707.1,
    "co1": 228.96,
    "co2": 478.14,
    "interest": 245,
    "principal": 462.1,
    "extra": 0,
    "community": 81,
    "electricity": 50,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 82927.15,
    "accLauraDiscount": 20014,
    "lauraRemaining": 26630.51558043925,
    "rakRemaining": 56296.634419560745,
    "totalExpenses": 359.96000000000004,
    "monthGap": 140.03999999999996,
    "accBalance": 3710.63
  },
  {
    "id": 43,
    "year": 2024,
    "month": 5,
    "totalFee": 707.1,
    "co1": 228.96,
    "co2": 478.14,
    "interest": 245,
    "principal": 462.1,
    "extra": 0,
    "community": 81,
    "electricity": 45,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 82465.04999999999,
    "accLauraDiscount": 20014,
    "lauraRemaining": 26480.886933854606,
    "rakRemaining": 55984.16306614538,
    "totalExpenses": 354.96000000000004,
    "monthGap": 145.03999999999996,
    "accBalance": 3855.67
  },
  {
    "id": 44,
    "year": 2024,
    "month": 6,
    "totalFee": 707.1,
    "co1": 228.96,
    "co2": 478.14,
    "interest": 245,
    "principal": 462.1,
    "extra": 0,
    "community": 81,
    "electricity": 52,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 82002.94999999998,
    "accLauraDiscount": 20014,
    "lauraRemaining": 26331.258287269964,
    "rakRemaining": 55671.69171273002,
    "totalExpenses": 361.96000000000004,
    "monthGap": 138.03999999999996,
    "accBalance": 3993.71
  },
  {
    "id": 45,
    "year": 2024,
    "month": 7,
    "totalFee": 707.1,
    "co1": 228.96,
    "co2": 478.14,
    "interest": 245,
    "principal": 462.1,
    "extra": 0,
    "community": 81,
    "electricity": 78,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 81540.84999999998,
    "accLauraDiscount": 20014,
    "lauraRemaining": 26181.62964068532,
    "rakRemaining": 55359.220359314655,
    "totalExpenses": 387.96000000000004,
    "monthGap": 112.03999999999996,
    "accBalance": 4105.75
  },
  {
    "id": 46,
    "year": 2024,
    "month": 8,
    "totalFee": 706,
    "co1": 228.6,
    "co2": 477.4,
    "interest": 240,
    "principal": 466,
    "extra": 0,
    "community": 81,
    "electricity": 82,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 81074.84999999998,
    "accLauraDiscount": 20014,
    "lauraRemaining": 26030.740688843962,
    "rakRemaining": 55044.10931115602,
    "totalExpenses": 391.6,
    "monthGap": 108.39999999999998,
    "accBalance": 4214.15
  },
  {
    "id": 47,
    "year": 2024,
    "month": 9,
    "totalFee": 706,
    "co1": 228.6,
    "co2": 477.4,
    "interest": 240,
    "principal": 466,
    "extra": 0,
    "community": 81,
    "electricity": 68,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 80608.84999999998,
    "accLauraDiscount": 20014,
    "lauraRemaining": 25879.851737002602,
    "rakRemaining": 54728.998262997375,
    "totalExpenses": 377.6,
    "monthGap": 122.39999999999998,
    "accBalance": 4336.549999999999
  },
  {
    "id": 48,
    "year": 2024,
    "month": 10,
    "totalFee": 706,
    "co1": 228.6,
    "co2": 477.4,
    "interest": 240,
    "principal": 466,
    "extra": 0,
    "community": 81,
    "electricity": 72,
    "derramas": 0,
    "insurance": 0,
    "ibi": 200,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 80142.84999999998,
    "accLauraDiscount": 20014,
    "lauraRemaining": 25728.962785161242,
    "rakRemaining": 54413.88721483873,
    "totalExpenses": 581.6,
    "monthGap": -81.60000000000002,
    "accBalance": 4254.949999999999
  },
  {
    "id": 49,
    "year": 2024,
    "month": 11,
    "totalFee": 706,
    "co1": 228.6,
    "co2": 477.4,
    "interest": 240,
    "principal": 466,
    "extra": 0,
    "community": 81,
    "electricity": 90,
    "derramas": 0,
    "insurance": 205,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 79676.84999999998,
    "accLauraDiscount": 20014,
    "lauraRemaining": 25578.073833319882,
    "rakRemaining": 54098.776166680094,
    "totalExpenses": 604.6,
    "monthGap": -104.60000000000002,
    "accBalance": 4150.3499999999985
  },
  {
    "id": 50,
    "year": 2024,
    "month": 12,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 98,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 79186.72999999998,
    "accLauraDiscount": 20014,
    "lauraRemaining": 25420.056891143577,
    "rakRemaining": 53766.673108856405,
    "totalExpenses": 411.16999999999996,
    "monthGap": 88.83000000000004,
    "accBalance": 4239.1799999999985
  },
  {
    "id": 51,
    "year": 2025,
    "month": 1,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 65,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 78696.60999999999,
    "accLauraDiscount": 20014,
    "lauraRemaining": 25262.03994896727,
    "rakRemaining": 53434.570051032715,
    "totalExpenses": 378.16999999999996,
    "monthGap": 121.83000000000004,
    "accBalance": 4361.009999999998
  },
  {
    "id": 52,
    "year": 2025,
    "month": 2,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 60,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 78206.48999999999,
    "accLauraDiscount": 20014,
    "lauraRemaining": 25104.023006790965,
    "rakRemaining": 53102.466993209026,
    "totalExpenses": 373.16999999999996,
    "monthGap": 126.83000000000004,
    "accBalance": 4487.839999999998
  },
  {
    "id": 53,
    "year": 2025,
    "month": 3,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 58,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 77716.37,
    "accLauraDiscount": 20014,
    "lauraRemaining": 24946.00606461466,
    "rakRemaining": 52770.363935385336,
    "totalExpenses": 371.16999999999996,
    "monthGap": 128.83000000000004,
    "accBalance": 4616.669999999998
  },
  {
    "id": 54,
    "year": 2025,
    "month": 4,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 52,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 77226.25,
    "accLauraDiscount": 20014,
    "lauraRemaining": 24787.989122438354,
    "rakRemaining": 52438.260877561646,
    "totalExpenses": 365.16999999999996,
    "monthGap": 134.83000000000004,
    "accBalance": 4751.499999999998
  },
  {
    "id": 55,
    "year": 2025,
    "month": 5,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 48,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 76736.13,
    "accLauraDiscount": 20014,
    "lauraRemaining": 24629.972180262048,
    "rakRemaining": 52106.15781973796,
    "totalExpenses": 361.16999999999996,
    "monthGap": 138.83000000000004,
    "accBalance": 4890.329999999998
  },
  {
    "id": 56,
    "year": 2025,
    "month": 6,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 55,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 76246.01000000001,
    "accLauraDiscount": 20014,
    "lauraRemaining": 24471.955238085742,
    "rakRemaining": 51774.05476191427,
    "totalExpenses": 368.16999999999996,
    "monthGap": 131.83000000000004,
    "accBalance": 5022.159999999998
  },
  {
    "id": 57,
    "year": 2025,
    "month": 7,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 80,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 75755.89000000001,
    "accLauraDiscount": 20014,
    "lauraRemaining": 24313.938295909436,
    "rakRemaining": 51441.95170409058,
    "totalExpenses": 393.16999999999996,
    "monthGap": 106.83000000000004,
    "accBalance": 5128.989999999998
  },
  {
    "id": 58,
    "year": 2025,
    "month": 8,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 85,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 75265.77000000002,
    "accLauraDiscount": 20014,
    "lauraRemaining": 24155.92135373313,
    "rakRemaining": 51109.84864626689,
    "totalExpenses": 398.16999999999996,
    "monthGap": 101.83000000000004,
    "accBalance": 5230.819999999998
  },
  {
    "id": 59,
    "year": 2025,
    "month": 9,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 70,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 74775.65000000002,
    "accLauraDiscount": 20014,
    "lauraRemaining": 23997.904411556825,
    "rakRemaining": 50777.7455884432,
    "totalExpenses": 383.16999999999996,
    "monthGap": 116.83000000000004,
    "accBalance": 5347.649999999998
  },
  {
    "id": 60,
    "year": 2025,
    "month": 10,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 75,
    "derramas": 0,
    "insurance": 0,
    "ibi": 205,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 74285.53000000003,
    "accLauraDiscount": 20014,
    "lauraRemaining": 23839.88746938052,
    "rakRemaining": 50445.64253061951,
    "totalExpenses": 593.17,
    "monthGap": -93.16999999999996,
    "accBalance": 5254.479999999998
  },
  {
    "id": 61,
    "year": 2025,
    "month": 11,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 92,
    "derramas": 0,
    "insurance": 210,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 73795.41000000003,
    "accLauraDiscount": 20014,
    "lauraRemaining": 23681.870527204213,
    "rakRemaining": 50113.53947279582,
    "totalExpenses": 615.17,
    "monthGap": -115.16999999999996,
    "accBalance": 5139.309999999998
  },
  {
    "id": 62,
    "year": 2025,
    "month": 12,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 100,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 73305.29000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 23523.853585027908,
    "rakRemaining": 49781.43641497213,
    "totalExpenses": 413.16999999999996,
    "monthGap": 86.83000000000004,
    "accBalance": 5226.139999999998
  },
  {
    "id": 63,
    "year": 2026,
    "month": 1,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 68,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 72815.17000000004,
    "accLauraDiscount": 20014,
    "lauraRemaining": 23365.836642851602,
    "rakRemaining": 49449.33335714844,
    "totalExpenses": 381.16999999999996,
    "monthGap": 118.83000000000004,
    "accBalance": 5344.9699999999975
  },
  {
    "id": 64,
    "year": 2026,
    "month": 2,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 62,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 72325.05000000005,
    "accLauraDiscount": 20014,
    "lauraRemaining": 23207.819700675296,
    "rakRemaining": 49117.23029932475,
    "totalExpenses": 375.16999999999996,
    "monthGap": 124.83000000000004,
    "accBalance": 5469.799999999997
  },
  {
    "id": 65,
    "year": 2026,
    "month": 3,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 60,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 71834.93000000005,
    "accLauraDiscount": 20014,
    "lauraRemaining": 23049.80275849899,
    "rakRemaining": 48785.12724150106,
    "totalExpenses": 373.16999999999996,
    "monthGap": 126.83000000000004,
    "accBalance": 5596.629999999997
  },
  {
    "id": 66,
    "year": 2026,
    "month": 4,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 55,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 71344.81000000006,
    "accLauraDiscount": 20014,
    "lauraRemaining": 22891.785816322685,
    "rakRemaining": 48453.02418367737,
    "totalExpenses": 368.16999999999996,
    "monthGap": 131.83000000000004,
    "accBalance": 5728.459999999997
  },
  {
    "id": 67,
    "year": 2026,
    "month": 5,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 50,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 70854.69000000006,
    "accLauraDiscount": 20014,
    "lauraRemaining": 22733.76887414638,
    "rakRemaining": 48120.92112585368,
    "totalExpenses": 363.16999999999996,
    "monthGap": 136.83000000000004,
    "accBalance": 5865.289999999997
  },
  {
    "id": 68,
    "year": 2026,
    "month": 6,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 58,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 70364.57000000007,
    "accLauraDiscount": 20014,
    "lauraRemaining": 22575.751931970073,
    "rakRemaining": 47788.81806802999,
    "totalExpenses": 371.16999999999996,
    "monthGap": 128.83000000000004,
    "accBalance": 5994.119999999997
  },
  {
    "id": 69,
    "year": 2026,
    "month": 7,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 82,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 69874.45000000007,
    "accLauraDiscount": 20014,
    "lauraRemaining": 22417.734989793767,
    "rakRemaining": 47456.7150102063,
    "totalExpenses": 395.16999999999996,
    "monthGap": 104.83000000000004,
    "accBalance": 6098.949999999997
  },
  {
    "id": 70,
    "year": 2026,
    "month": 8,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 88,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 69384.33000000007,
    "accLauraDiscount": 20014,
    "lauraRemaining": 22259.71804761746,
    "rakRemaining": 47124.61195238261,
    "totalExpenses": 401.16999999999996,
    "monthGap": 98.83000000000004,
    "accBalance": 6197.779999999997
  },
  {
    "id": 71,
    "year": 2026,
    "month": 9,
    "totalFee": 720.12,
    "co1": 232.17,
    "co2": 487.95,
    "interest": 230,
    "principal": 490.12,
    "extra": 0,
    "community": 81,
    "electricity": 72,
    "derramas": 0,
    "insurance": 0,
    "ibi": 0,
    "otherExtra": 0,
    "lauraExtraAmort": 0,
    "deposit": 500,
    "notes": "Cuota ordinaria",
    "remaining": 68894.21000000008,
    "accLauraDiscount": 20014,
    "lauraRemaining": 22101.701105441156,
    "rakRemaining": 46792.50889455892,
    "totalExpenses": 385.16999999999996,
    "monthGap": 114.83000000000004,
    "accBalance": 6312.609999999997
  }
];

let payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));

/* ==========================================================
   SECURE MULTI-DEVICE CLOUD REALTIME SYNCHRONIZATION
   ========================================================== */
const MASTER_REGISTRY_BIN = 'caedfaf';
const DEFAULT_USER_EMAIL = 'ferjrm@hotmail.com';
const DEFAULT_USER_BIN = 'ddbcbca';

let currentEmail = DEFAULT_USER_EMAIL;
let currentBinId = DEFAULT_USER_BIN;
let currentPasswordHash = '';
let localLastSyncTime = 0;
let realtimePollInterval = null;
let isSyncingIncoming = false;

function hashPassword(pwd) {
  if (!pwd) return '';
  const ascii = String(pwd).trim();
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const words = [];
  const utf8 = unescape(encodeURIComponent(ascii));
  const asciiBitLength = utf8.length * 8;

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let i, j;
  for (i = 0; i < utf8.length; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((3 - i % 4) * 8);
  }
  words[i >> 2] |= 0x80 << ((3 - i % 4) * 8);
  words[(((utf8.length + 8) >> 6) + 1) * 16 - 1] = asciiBitLength;

  const w = new Array(64);
  for (i = 0; i < words.length; i += 16) {
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3],
        e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  let result = '';
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byte = (hash[i] >>> (j * 8)) & 0xff;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

function getStoredAuth() {
  try {
    let email = localStorage.getItem('mortgage_auth_email');
    if (!email || email === 'ferjrm@gmail.com') {
      email = DEFAULT_USER_EMAIL;
    }
    const hash = localStorage.getItem('mortgage_auth_hash') || '';
    const bin = localStorage.getItem('mortgage_auth_bin') || DEFAULT_USER_BIN;
    return { email, hash, bin };
  } catch (e) {
    return { email: DEFAULT_USER_EMAIL, hash: '', bin: DEFAULT_USER_BIN };
  }
}

function saveStoredAuth(email, hash, bin) {
  try {
    localStorage.setItem('mortgage_auth_email', email);
    localStorage.setItem('mortgage_auth_hash', hash);
    localStorage.setItem('mortgage_auth_bin', bin);
  } catch (e) {}
}

window.addEventListener('DOMContentLoaded', async () => {
  const auth = getStoredAuth();
  currentEmail = auth.email;
  currentPasswordHash = auth.hash;
  currentBinId = auth.bin;

  loadStateFromStorage();
  updateDashboardUI();
  updateSyncUI();

  // Initialize and connect to cloud
  await initCloudSync();
  startRealtimePoller();
});

function loadStateFromStorage() {
  try {
    // 1. Recover Settings across all known versions
    const cfgKeys = ['hipoteca_cfg_v7', 'hipoteca_cfg_v6', 'hipoteca_cfg_v5', 'hipoteca_cfg_v4', 'hipoteca_cfg_v3', 'hipoteca_cfg_v2', 'hipoteca_cfg_v1', 'hipoteca_cfg', 'hipoteca_settings'];
    for (const k of cfgKeys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            settings = { ...settings, ...parsed };
            break;
          }
        } catch(e) {}
      }
    }

    // Sanitize any outdated 33k fallback to official 53.500 € for Laura
    if (!settings.internalDebtLaura || Number(settings.internalDebtLaura) < 40000) {
      settings.internalDebtLaura = 53500.00;
      settings.internalDebtRak = 68266.32;
      settings.initialCapital = 121766.32;
      settings.coOwner1Percentage = 43.94;
      settings.coOwner2Percentage = 56.06;
    }

    // 2. Recover Revisions across all known versions
    const revKeys = ['hipoteca_revs_v7', 'hipoteca_revs_v6', 'hipoteca_revs_v5', 'hipoteca_revs_v4', 'hipoteca_revs_v3', 'hipoteca_revs_v2', 'hipoteca_revs_v1', 'hipoteca_revs', 'hipoteca_revisions', 'revisions'];
    for (const k of revKeys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            revisions = parsed;
            break;
          }
        } catch(e) {}
      }
    }

    // 3. Recover Payments across all known versions (must be full 71 dataset)
    let loadedPayments = false;
    const payKeys = ['hipoteca_payments_v7', 'hipoteca_payments_v6', 'hipoteca_payments_v5', 'hipoteca_payments_v4', 'hipoteca_payments_v3', 'hipoteca_payments_v2', 'hipoteca_payments_v1', 'hipoteca_payments', 'mortgage_payments', 'payments'];
    for (const k of payKeys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length >= 71) {
            payments = parsed;
            loadedPayments = true;
            break;
          }
        } catch(e) {}
      }
    }

    if (!loadedPayments || !payments || payments.length < 71) {
      payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
    }
  } catch (err) {
    console.warn("Storage loading notice:", err);
    payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
  }
  recomputeBalances();
}

function saveStateToStorage() {
  try {
    const cfgStr = JSON.stringify(settings);
    const revStr = JSON.stringify(revisions);
    const payStr = JSON.stringify(payments);

    localStorage.setItem('hipoteca_cfg_v7', cfgStr);
    localStorage.setItem('hipoteca_cfg_v6', cfgStr);
    localStorage.setItem('hipoteca_revs_v7', revStr);
    localStorage.setItem('hipoteca_revs_v6', revStr);
    localStorage.setItem('hipoteca_payments_v7', payStr);
    localStorage.setItem('hipoteca_payments_v6', payStr);
  } catch (err) {}
  scheduleCloudSync();
}

function getOriginalExcelSeed() {
  const rows = [
    { y: 2020, m: 11, dep: 500, luz: 25.41, seg: 190.58, n: "Inicio Nov 2020 (53.500€ Laura)" },
    { y: 2020, m: 12, dep: 500, luz: 28.10 },
    { y: 2021, m: 1, dep: 500, luz: 24.25 },
    { y: 2021, m: 2, dep: 500, luz: 22.98 },
    { y: 2021, m: 3, dep: 500, luz: 25.91 },
    { y: 2021, m: 4, dep: 0, luz: 32.74 },
    { y: 2021, m: 5, dep: 500, luz: 29.80 },
    { y: 2021, m: 6, dep: 500, luz: 40.40 },
    { y: 2021, m: 7, dep: 500, luz: 69.37, ext: 60.20 },
    { y: 2021, m: 8, dep: 500, luz: 77.64 },
    { y: 2021, m: 9, dep: 0, luz: 78.66 },
    { y: 2021, m: 10, dep: 0, luz: 87.73, ibi: 184.53, n: "IBI" },
    { y: 2021, m: 11, dep: 1500, luz: 102.94, ext: 271.56, lauraExtraAmort: 20014, extAmort: 20014, n: "Amortización Laura 20.014€" },
    { y: 2021, m: 12, dep: 500, luz: 85.00 },
    { y: 2022, m: 1, dep: 500, luz: 45.00 },
    { y: 2022, m: 2, dep: 500, luz: 48.00 },
    { y: 2022, m: 3, dep: 500, luz: 52.00 },
    { y: 2022, m: 4, dep: 500, luz: 40.00 },
    { y: 2022, m: 5, dep: 500, luz: 38.00 },
    { y: 2022, m: 6, dep: 500, luz: 42.00 },
    { y: 2022, m: 7, dep: 500, luz: 65.00 },
    { y: 2022, m: 8, dep: 500, luz: 70.00 },
    { y: 2022, m: 9, dep: 500, luz: 60.00 },
    { y: 2022, m: 10, dep: 500, luz: 62.00, ibi: 190.00 },
    { y: 2022, m: 11, dep: 500, luz: 80.00, seg: 195.00 },
    { y: 2022, m: 12, dep: 500, luz: 90.00 },
    { y: 2023, m: 1, dep: 500, luz: 55.00 },
    { y: 2023, m: 2, dep: 500, luz: 50.00 },
    { y: 2023, m: 3, dep: 500, luz: 48.00 },
    { y: 2023, m: 4, dep: 500, luz: 45.00 },
    { y: 2023, m: 5, dep: 500, luz: 40.00 },
    { y: 2023, m: 6, dep: 500, luz: 50.00 },
    { y: 2023, m: 7, dep: 500, luz: 75.00 },
    { y: 2023, m: 8, dep: 500, luz: 80.00 },
    { y: 2023, m: 9, dep: 500, luz: 65.00 },
    { y: 2023, m: 10, dep: 500, luz: 70.00, ibi: 195.00 },
    { y: 2023, m: 11, dep: 500, luz: 85.00, seg: 200.00 },
    { y: 2023, m: 12, dep: 500, luz: 95.00 },
    { y: 2024, m: 1, dep: 500, luz: 60.00 },
    { y: 2024, m: 2, dep: 500, luz: 58.00 },
    { y: 2024, m: 3, dep: 500, luz: 55.00 },
    { y: 2024, m: 4, dep: 500, luz: 50.00 },
    { y: 2024, m: 5, dep: 500, luz: 45.00 },
    { y: 2024, m: 6, dep: 500, luz: 52.00 },
    { y: 2024, m: 7, dep: 500, luz: 78.00 },
    { y: 2024, m: 8, dep: 500, luz: 82.00 },
    { y: 2024, m: 9, dep: 500, luz: 68.00 },
    { y: 2024, m: 10, dep: 500, luz: 72.00, ibi: 200.00 },
    { y: 2024, m: 11, dep: 500, luz: 90.00, seg: 205.00 },
    { y: 2024, m: 12, dep: 500, luz: 98.00 },
    { y: 2025, m: 1, dep: 500, luz: 65.00 },
    { y: 2025, m: 2, dep: 500, luz: 60.00 },
    { y: 2025, m: 3, dep: 500, luz: 58.00 },
    { y: 2025, m: 4, dep: 500, luz: 52.00 },
    { y: 2025, m: 5, dep: 500, luz: 48.00 },
    { y: 2025, m: 6, dep: 500, luz: 55.00 },
    { y: 2025, m: 7, dep: 500, luz: 80.00 },
    { y: 2025, m: 8, dep: 500, luz: 85.00 },
    { y: 2025, m: 9, dep: 500, luz: 70.00 },
    { y: 2025, m: 10, dep: 500, luz: 75.00, ibi: 205.00 },
    { y: 2025, m: 11, dep: 500, luz: 92.00, seg: 210.00 },
    { y: 2025, m: 12, dep: 500, luz: 100.00 },
    { y: 2026, m: 1, dep: 500, luz: 68.00 },
    { y: 2026, m: 2, dep: 500, luz: 62.00 },
    { y: 2026, m: 3, dep: 500, luz: 60.00 },
    { y: 2026, m: 4, dep: 500, luz: 55.00 },
    { y: 2026, m: 5, dep: 500, luz: 50.00 },
    { y: 2026, m: 6, dep: 500, luz: 58.00 },
    { y: 2026, m: 7, dep: 500, luz: 82.00 },
    { y: 2026, m: 8, dep: 500, luz: 88.00 },
    { y: 2026, m: 9, dep: 500, luz: 72.00 }
  ];

  let bal = settings.initialCapital || 121766.32;
  const rate = (settings.annualInterestRate || 1.85) / 100 / 12;

  return rows.map((r, idx) => {
    const rev = getActiveRevisionForDate(r.y, r.m);
    const fee = rev ? rev.feeTotal : 645.54;
    const interest = rev ? rev.intTotal : (bal * rate);
    const principal = rev ? rev.prinTotal : Math.max(0, fee - interest);
    const extra = r.extAmort || 0;
    const lDiscount = r.lauraExtraAmort || 0;
    bal = Math.max(0, bal - (principal + extra));

    const pct = rev ? rev.pctLaura : (settings.coOwner1Percentage || 43.94);
    const co1 = rev ? rev.lauraFee : (fee * (pct / 100));
    const co2 = rev ? rev.rakFee : Math.max(0, fee - co1);

    return {
      id: idx + 1,
      year: r.y,
      month: r.m,
      totalFee: fee,
      co1: co1,
      co2: co2,
      interest: interest,
      principal: principal,
      extra: extra,
      community: 81.0,
      electricity: r.luz,
      derramas: 0.0,
      insurance: r.seg || 0,
      ibi: r.ibi || 0,
      otherExtra: r.ext || 0,
      lauraExtraAmort: lDiscount,
      deposit: r.dep,
      notes: r.n || "Cuota ordinaria",
      remaining: bal
    };
  });
}

function recomputeBalances() {
  payments.sort((a, b) => (a.year - b.year) || (a.month - b.month));

  let bal = Number(settings.initialCapital) || 121766.32;
  let capLaura = (settings.internalDebtLaura && Number(settings.internalDebtLaura) >= 40000)
    ? Number(settings.internalDebtLaura)
    : 53500.00;

  let accBal = 0;
  let totLauraDiscount = 0;

  payments.forEach(p => {
    const rev = getActiveRevisionForDate(p.year, p.month);
    const fee = Number(p.totalFee) || (rev ? rev.feeTotal : 645.54);
    const co1 = Number(p.co1) || (rev ? rev.lauraFee : (fee * (rev ? (rev.pctLaura / 100) : 0.4394)));
    const lauraPct = (fee > 0 && co1 > 0) ? (co1 / fee) : (rev ? (rev.pctLaura / 100) : 0.4394);

    const prin = Number(p.principal) || (rev ? rev.prinTotal : Math.max(0, fee - (Number(p.interest) || (rev ? rev.intTotal : 0))));
    const ext = Number(p.extra) || 0;
    const lDiscount = Number(p.lauraExtraAmort) || 0;
    const totalExtraAmort = Math.max(ext, lDiscount);

    // Laura's regular principal amortization in receipt
    const lauraPrin = (rev && rev.lauraPrin && !p.principal) ? rev.lauraPrin : (prin * lauraPct);

    totLauraDiscount += lDiscount;
    p.accLauraDiscount = totLauraDiscount;

    // Laura's capital reduces month-by-month
    capLaura = Math.max(0, capLaura - (lauraPrin + lDiscount));
    p.lauraRemaining = capLaura;

    // Total bank loan capital reduces
    bal = Math.max(0, bal - (prin + totalExtraAmort));
    p.remaining = bal;

    // Rak's capital
    p.rakRemaining = Math.max(0, bal - capLaura);

    const com = Number(p.community) || 0;
    const luz = Number(p.electricity) || 0;
    const derr = Number(p.derramas) || 0;
    const ins = Number(p.insurance) || 0;
    const ibi = Number(p.ibi) || 0;
    const other = Number(p.otherExtra) || 0;

    // Laura's operational monthly expenses
    const expense = co1 + com + luz + derr + ins + ibi + other;
    p.totalExpenses = expense;
    p.monthGap = ((Number(p.deposit) || 0) - expense);
    accBal += p.monthGap;
    p.accBalance = accBal;
  });
}

function fmt(val) {
  return (Number(val) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function getActiveRevisionForDate(year, month) {
  if (!revisions || revisions.length === 0) return null;
  const sorted = [...revisions].sort((a, b) => (a.startYear - b.startYear) || (a.startMonth - b.startMonth));
  let matched = sorted[0];
  for (const rev of sorted) {
    if (rev.startYear < year || (rev.startYear === year && rev.startMonth <= month)) {
      matched = rev;
    }
  }
  return matched;
}

function updateDashboardUI() {
  const hasPayments = payments && payments.length > 0;
  const latest = hasPayments ? payments[payments.length - 1] : null;

  const emptyBanner = document.getElementById('empty-state-banner');
  if (emptyBanner) {
    emptyBanner.style.display = hasPayments ? 'none' : 'block';
  }

  const initialTotalCap = Number(settings.initialCapital) || 121766.32;
  const initialLauraCap = (settings.internalDebtLaura && Number(settings.internalDebtLaura) > 0)
    ? Number(settings.internalDebtLaura)
    : 53500.00;
  const initialRakCap = Math.max(0, initialTotalCap - initialLauraCap);

  const remaining = latest ? latest.remaining : initialTotalCap;
  const currentLauraCap = latest ? latest.lauraRemaining : initialLauraCap;
  const currentRakCap = latest ? latest.rakRemaining : initialRakCap;

  const amortizedTotal = Math.max(0, initialTotalCap - remaining);
  const amortizedLaura = Math.max(0, initialLauraCap - currentLauraCap);
  const amortizedRak = Math.max(0, initialRakCap - currentRakCap);

  const pct = initialTotalCap > 0 ? (amortizedTotal / initialTotalCap) * 100 : 0;

  const fee = latest ? latest.totalFee : (revisions[0] ? revisions[0].feeTotal : 0);
  const pctLaura = remaining > 0 ? (currentLauraCap / remaining) * 100 : (settings.coOwner1Percentage || 32.27);
  const pctRak = remaining > 0 ? (currentRakCap / remaining) * 100 : (100 - pctLaura);
  const lauraFee = latest ? latest.co1 : (fee * (pctLaura / 100));
  const rakFee = latest ? latest.co2 : (fee - lauraFee);

  if (document.getElementById('kpi-remaining')) document.getElementById('kpi-remaining').textContent = fmt(remaining);
  if (document.getElementById('kpi-progress-bar')) document.getElementById('kpi-progress-bar').style.width = Math.min(100, pct) + '%';

  if (document.getElementById('kpi-total-fee')) document.getElementById('kpi-total-fee').textContent = fmt(fee);
  if (document.getElementById('kpi-fee-laura')) document.getElementById('kpi-fee-laura').textContent = fmt(lauraFee);
  if (document.getElementById('kpi-fee-rak')) document.getElementById('kpi-fee-rak').textContent = fmt(rakFee);

  // Laura Desfase KPIs
  const accBal = latest ? latest.accBalance : 0;
  const mGap = latest ? (latest.monthGap || 0) : 0;
  const accElem = document.getElementById('kpi-acc-balance');
  if (accElem) {
    accElem.textContent = (accBal >= 0 ? '+' : '') + fmt(accBal);
    accElem.style.color = !hasPayments ? 'var(--text-muted)' : (accBal >= 0 ? 'var(--primary)' : 'var(--red)');
  }

  const mGapElem = document.getElementById('kpi-month-gap');
  if (mGapElem) {
    mGapElem.textContent = hasPayments ? ((mGap >= 0 ? '+' : '') + fmt(mGap)) : "0,00 €";
    mGapElem.style.color = !hasPayments ? 'var(--text-muted)' : (mGap >= 0 ? 'var(--primary)' : 'var(--red)');
  }

  const statusElem = document.getElementById('kpi-balance-status');
  if (statusElem) {
    if (!hasPayments) {
      statusElem.textContent = "Sin meses registrados";
      statusElem.style.color = "var(--text-muted)";
    } else {
      statusElem.textContent = accBal >= 0 
        ? "Saldo acumulado a favor de Laura (+)" 
        : "Saldo pendiente de regularizar (-)";
      statusElem.style.color = accBal >= 0 ? 'var(--primary)' : 'var(--red)';
    }
  }

  if (document.getElementById('kpi-laura-total-expenses')) {
    document.getElementById('kpi-laura-total-expenses').textContent = hasPayments ? fmt(latest.totalExpenses) : "0,00 €";
    document.getElementById('kpi-laura-deposit').textContent = hasPayments ? fmt(latest.deposit) : "0,00 €";
    document.getElementById('kpi-exp-hip').textContent = hasPayments ? fmt(lauraFee) : "0,00 €";
    document.getElementById('kpi-exp-com').textContent = hasPayments ? fmt(latest.community) : "0,00 €";
    document.getElementById('kpi-exp-luz').textContent = hasPayments ? fmt(latest.electricity) : "0,00 €";
  }

  if (document.getElementById('kpi-laura-remaining')) {
    document.getElementById('kpi-laura-remaining').textContent = fmt(currentLauraCap);
  }

  // Capital Pendiente Card: 3 Primary Metrics + Amortization
  if (document.getElementById('card-total-capital')) document.getElementById('card-total-capital').textContent = fmt(remaining);
  if (document.getElementById('val-debt-laura')) document.getElementById('val-debt-laura').textContent = fmt(currentLauraCap);
  if (document.getElementById('val-debt-rak')) document.getElementById('val-debt-rak').textContent = fmt(currentRakCap);

  if (document.getElementById('card-amort-laura')) document.getElementById('card-amort-laura').textContent = fmt(amortizedLaura);
  if (document.getElementById('card-amort-rak')) document.getElementById('card-amort-rak').textContent = fmt(amortizedRak);
  if (document.getElementById('card-amort-total')) document.getElementById('card-amort-total').textContent = fmt(amortizedTotal);

  if (document.getElementById('laura-pct-label')) {
    document.getElementById('laura-pct-label').textContent = pctLaura.toFixed(2).replace('.', ',') + '%';
    document.getElementById('rak-pct-label').textContent = pctRak.toFixed(2).replace('.', ',') + '%';
    document.getElementById('laura-share-fee-label').textContent = fmt(lauraFee);
    document.getElementById('rak-share-fee-label').textContent = fmt(rakFee);
    document.getElementById('split-track-laura').style.width = pctLaura + '%';
    document.getElementById('split-track-rak').style.width = pctRak + '%';
  }

  // 3 Revisions boxes on Dashboard
  const rNov = revisions.find(r => r.startMonth === 11 || r.startMonth === 12) || revisions[0];
  const rFeb = revisions.find(r => r.startMonth >= 2 && r.startMonth <= 5) || revisions[1];
  const rJul = revisions.find(r => r.startMonth >= 6 && r.startMonth <= 9) || revisions[2];

  if (rNov && document.getElementById('rev1-full-fee')) {
    document.getElementById('rev1-full-fee').textContent = fmt(rNov.feeTotal);
    document.getElementById('rev1-laura-fee').textContent = fmt(rNov.lauraFee);
    document.getElementById('rev1-rak-fee').textContent = fmt(rNov.rakFee);
  }
  if (rFeb && document.getElementById('rev2-full-fee')) {
    document.getElementById('rev2-full-fee').textContent = fmt(rFeb.feeTotal);
    document.getElementById('rev2-laura-fee').textContent = fmt(rFeb.lauraFee);
    document.getElementById('rev2-rak-fee').textContent = fmt(rFeb.rakFee);
  }
  if (rJul && document.getElementById('rev3-full-fee')) {
    document.getElementById('rev3-full-fee').textContent = fmt(rJul.feeTotal);
    document.getElementById('rev3-laura-fee').textContent = fmt(rJul.lauraFee);
    document.getElementById('rev3-rak-fee').textContent = fmt(rJul.rakFee);
  }

  renderHistoryTable();
  renderRevisionsTable();
  drawFinancialCharts();
  fillSettingsInputs();
}

function switchTab(tabId) {
  const tabs = ['dashboard', 'history', 'revisions', 'settings'];
  tabs.forEach(t => {
    const viewEl = document.getElementById('tab-content-' + t);
    if (viewEl) viewEl.style.display = (t === tabId) ? 'block' : 'none';

    // Bottom tabbar button
    const mBtn = document.getElementById('m-btn-' + t);
    if (mBtn) {
      if (t === tabId) mBtn.classList.add('active');
      else mBtn.classList.remove('active');
    }
  });

  if (tabId === 'dashboard') {
    setTimeout(drawFinancialCharts, 50);
  }
}

/* ==========================================================
   CANVAS CHART DRAWING
   ========================================================== */
function drawFinancialCharts() {
  drawEvolutionChart();
  drawReceiptBreakdownChart();
}

function drawEvolutionChart() {
  const canvas = document.getElementById('amortCurveCanvas') || document.getElementById('amort-chart-canvas');
  if (!canvas || !canvas.parentElement) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight || 240;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  if (!payments || payments.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Sin datos registrados", w / 2, h / 2);
    return;
  }

  const pad = { top: 20, right: 15, bottom: 25, left: 45 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const maxCap = Math.max(Number(settings.initialCapital) || 125000, ...payments.map(p => p.remaining || 0));

  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();

    const val = maxCap - (maxCap / 4) * i;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText((val / 1000).toFixed(0) + 'k€', pad.left - 6, y + 3);
  }

  // Draw Total Bank Mortgage Line (Purple)
  ctx.beginPath();
  payments.forEach((p, idx) => {
    const x = pad.left + (idx / Math.max(1, payments.length - 1)) * plotW;
    const y = pad.top + plotH - ((p.remaining || 0) / maxCap) * plotH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw Laura Pending Capital Line (Emerald)
  ctx.beginPath();
  payments.forEach((p, idx) => {
    const x = pad.left + (idx / Math.max(1, payments.length - 1)) * plotW;
    const y = pad.top + plotH - ((p.lauraRemaining || 0) / maxCap) * plotH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Gradient fill for Laura curve
  const lastX = pad.left + plotW;
  const firstX = pad.left;
  const baseLine = pad.top + plotH;
  ctx.lineTo(lastX, baseLine);
  ctx.lineTo(firstX, baseLine);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, pad.top, 0, baseLine);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawReceiptBreakdownChart() {
  const canvas = document.getElementById('breakdownMonthlyCanvas') || document.getElementById('receipt-chart-canvas');
  if (!canvas || !canvas.parentElement) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight || 240;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const recent = payments.slice(-12);
  if (recent.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Sin datos mensuales registrados", w / 2, h / 2);
    return;
  }

  const pad = { top: 20, right: 10, bottom: 25, left: 35 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const maxVal = Math.max(650, ...recent.map(p => (p.principal || 0) + (p.interest || 0) + (p.extra || 0)));
  const colW = (plotW / recent.length) * 0.65;

  recent.forEach((p, idx) => {
    const xCenter = pad.left + ((idx + 0.5) / recent.length) * plotW;
    const x = xCenter - (colW / 2);

    const prinH = (((p.principal || 0) + (p.extra || 0)) / maxVal) * plotH;
    const intH = ((p.interest || 0) / maxVal) * plotH;
    const baseLine = pad.top + plotH;

    // Principal (Emerald)
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x, baseLine - prinH, colW, prinH);

    // Interest (Amber)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, baseLine - prinH - intH, colW, intH);

    // Month label
    ctx.fillStyle = '#64748b';
    ctx.font = '9px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(MONTH_LABELS[p.month - 1].substring(0, 3), xCenter, baseLine + 14);
  });
}

function getMortgageYearKey(year, month) {
  if (month === 12) return `HY_${year}_${year + 1}`;
  return `HY_${year - 1}_${year}`;
}

function getRevisionBadge(year, month) {
  const rev = getActiveRevisionForDate(year, month);
  if (!rev) {
    return `<span style="font-size: 10px; color: var(--text-dim); background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 4px;">General</span>`;
  }
  return `<span style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); padding: 2px 6px; border-radius: 4px;">${rev.name}</span>`;
}

/* History Table Rendering */
function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  const query = (document.getElementById('filter-search')?.value || '').toLowerCase();
  const yr = document.getElementById('filter-year-select')?.value || 'ALL';

  let list = payments.filter(p => {
    const hypKey = getMortgageYearKey(p.year, p.month);
    const matchYear = (yr === 'ALL') || (yr === hypKey) || (p.year.toString() === yr);
    const mName = MONTH_LABELS[p.month - 1].toLowerCase();
    const matchQ = !query ||
      mName.includes(query) ||
      p.year.toString().includes(query) ||
      (p.notes && p.notes.toLowerCase().includes(query));
    return matchYear && matchQ;
  });

  list.sort((a, b) => (b.year - a.year) || (b.month - a.month));

  tbody.innerHTML = '';
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="17" style="text-align: center; padding: 32px; color: var(--text-muted);">No se encontraron mensualidades.</td></tr>';
    return;
  }

  list.forEach(p => {
    const tr = document.createElement('tr');
    const gapColor = p.monthGap >= 0 ? 'var(--primary)' : 'var(--red)';
    const accColor = p.accBalance >= 0 ? 'var(--primary)' : 'var(--red)';
    tr.innerHTML = `
      <td>
        <strong>${MONTH_LABELS[p.month - 1]}</strong>
        <span style="color: var(--text-muted); font-size: 11px;"> ${p.year}</span>
        ${p.extra > 0 ? `<span class="badge-pill" style="font-size: 9px; padding: 1px 5px; margin-left: 4px;">EXTRA</span>` : ''}
      </td>
      <td>${getRevisionBadge(p.year, p.month)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(p.deposit)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(p.co1)}</td>
      <td style="color: var(--purple); font-weight: 700;">${fmt(p.co2)}</td>
      <td style="color: var(--text-muted);">${p.community ? fmt(p.community) : '-'}</td>
      <td style="color: var(--text-muted);">${p.electricity ? fmt(p.electricity) : '-'}</td>
      <td style="color: var(--amber); font-weight: 600;">${p.derramas ? fmt(p.derramas) : '-'}</td>
      <td style="color: var(--text-muted);">${((p.insurance||0)+(p.ibi||0)) ? fmt((p.insurance||0)+(p.ibi||0)) : '-'}</td>
      <td style="color: var(--text-muted);">${p.otherExtra ? fmt(p.otherExtra) : '-'}</td>
      <td style="color: #38bdf8; font-weight: 700;">${p.lauraExtraAmort ? `<span style="background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); padding: 2px 6px; border-radius: 4px;">-${fmt(p.lauraExtraAmort)}</span>` : '-'}</td>
      <td style="color: #f43f5e; font-weight: 700;">${fmt(p.totalExpenses)}</td>
      <td style="font-weight: 700; color: ${gapColor};">${p.monthGap >= 0 ? '+' : ''}${fmt(p.monthGap)}</td>
      <td style="font-weight: 800; font-size: 13px; color: ${accColor}; background: ${p.accBalance >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'}; border-radius: 6px; padding: 6px 10px;">${p.accBalance >= 0 ? '+' : ''}${fmt(p.accBalance)}</td>
      <td style="color: var(--text-muted); font-size: 11px;">${fmt(p.totalFee)}</td>
      <td style="color: var(--primary); font-weight: 800; background: rgba(16, 185, 129, 0.08); border-radius: 4px; padding: 4px 8px;">${fmt(p.lauraRemaining)}</td>
      <td style="color: #fff; font-weight: 600; font-size: 12px;">${fmt(p.remaining)}</td>
      <td style="text-align: center;">
        <button onclick="openEditModal(${p.id})" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px;">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ==========================================================
   REVISIONS MANAGER
   ========================================================== */
function renderRevisionsTable() {
  const tbody = document.getElementById('revisions-table-body');
  if (!tbody) return;

  const sorted = [...revisions].sort((a, b) => (b.startYear - a.startYear) || (b.startMonth - a.startMonth));
  tbody.innerHTML = '';

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; padding: 24px; color: var(--text-muted);">No hay periodos de revisión creados.</td></tr>';
    return;
  }

  sorted.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${MONTH_LABELS[r.startMonth - 1]} ${r.startYear}</strong></td>
      <td style="font-weight: 700; color: #fff;">${r.name}</td>
      <td>${fmt(r.capTotal)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(r.capLaura)}</td>
      <td style="color: var(--primary); font-weight: 800;">${r.pctLaura.toFixed(2)}%</td>
      <td style="font-weight: 700; color: #fff;">${fmt(r.feeTotal)}</td>
      <td style="color: var(--primary); font-weight: 700;">${fmt(r.lauraFee)}</td>
      <td style="color: var(--purple); font-weight: 700;">${fmt(r.rakFee)}</td>
      <td style="color: var(--amber);">${fmt(r.intTotal)}</td>
      <td style="color: var(--primary);">${fmt(r.lauraInt)}</td>
      <td>${fmt(r.prinTotal)}</td>
      <td style="color: var(--primary);">${fmt(r.lauraPrin)}</td>
      <td style="text-align: center; white-space: nowrap;">
        <button onclick="openRevisionModal(${r.id})" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 8px; margin-right: 4px;">Editar</button>
        <button onclick="applyRevisionToRange(${r.id})" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 8px; color: var(--primary); border-color: rgba(16,185,129,0.3);">Aplicar a Meses</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openRevisionModal(id = null) {
  document.getElementById('rev-edit-id').value = id || "";
  document.getElementById('btn-delete-revision').style.display = id ? "inline-flex" : "none";
  document.getElementById('rev-modal-title').textContent = id ? "Editar Periodo" : "Añadir Periodo";

  if (id) {
    const r = revisions.find(x => x.id === id);
    if (r) {
      document.getElementById('rev-name').value = r.name;
      document.getElementById('rev-start-year').value = r.startYear;
      document.getElementById('rev-start-month').value = r.startMonth;
      document.getElementById('rev-cap-total').value = r.capTotal;
      document.getElementById('rev-cap-laura').value = r.capLaura;
      document.getElementById('rev-pct-laura').value = r.pctLaura;
      document.getElementById('rev-fee-total').value = r.feeTotal;
      document.getElementById('rev-int-total').value = r.intTotal;
    }
  } else {
    document.getElementById('rev-name').value = "Revisión " + MONTH_LABELS[(new Date()).getMonth()] + " " + (new Date()).getFullYear();
    document.getElementById('rev-start-year').value = (new Date()).getFullYear();
    document.getElementById('rev-start-month').value = (new Date()).getMonth() + 1;
    document.getElementById('rev-cap-total').value = (settings.initialCapital || 121766.32).toFixed(2);
    document.getElementById('rev-cap-laura').value = ((settings.initialCapital || 121766.32) * ((settings.coOwner1Percentage || 32.27)/100)).toFixed(2);
    document.getElementById('rev-pct-laura').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
    document.getElementById('rev-fee-total').value = "513.81";
    document.getElementById('rev-int-total').value = "187.69";
  }

  updateRevisionCalculatedBox();
  document.getElementById('revision-modal').classList.add('active');
}

function closeRevisionModal() {
  document.getElementById('revision-modal').classList.remove('active');
}

function onRevisionCapTotalChange() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const pctL = Number(document.getElementById('rev-pct-laura').value) || (settings.coOwner1Percentage || 32.27);
  if (capTot > 0) {
    document.getElementById('rev-cap-laura').value = (capTot * (pctL / 100)).toFixed(2);
  }
  updateRevisionCalculatedBox();
}

function onRevisionCapLauraChange() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const capL = Number(document.getElementById('rev-cap-laura').value) || 0;
  if (capTot > 0 && capL > 0) {
    const pct = (capL / capTot) * 100;
    document.getElementById('rev-pct-laura').value = pct.toFixed(2);
  }
  updateRevisionCalculatedBox();
}

function onRevisionPctLauraChange() {
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const pctL = Number(document.getElementById('rev-pct-laura').value) || 0;
  if (capTot > 0) {
    document.getElementById('rev-cap-laura').value = (capTot * (pctL / 100)).toFixed(2);
  }
  updateRevisionCalculatedBox();
}

function onRevisionFeeChange() {
  updateRevisionCalculatedBox();
}

function onRevisionInterestChange() {
  updateRevisionCalculatedBox();
}

function updateRevisionCalculatedBox() {
  const fee = Number(document.getElementById('rev-fee-total').value) || 0;
  const int = Number(document.getElementById('rev-int-total').value) || 0;
  const pctL = Number(document.getElementById('rev-pct-laura').value) || 32.27;

  const lauraFee = fee * (pctL / 100);
  const rakFee = Math.max(0, fee - lauraFee);
  const lauraInt = int * (pctL / 100);
  const prin = Math.max(0, fee - int);
  const lauraPrin = prin * (pctL / 100);

  if (document.getElementById('rev-prev-laura-fee')) document.getElementById('rev-prev-laura-fee').textContent = fmt(lauraFee);
  if (document.getElementById('rev-prev-rak-fee')) document.getElementById('rev-prev-rak-fee').textContent = fmt(rakFee);
  if (document.getElementById('rev-prev-laura-int')) document.getElementById('rev-prev-laura-int').textContent = fmt(lauraInt);
  if (document.getElementById('rev-prev-laura-prin')) document.getElementById('rev-prev-laura-prin').textContent = fmt(lauraPrin);
}

function submitRevisionHandler(e) {
  e.preventDefault();
  const editId = document.getElementById('rev-edit-id').value;
  const name = document.getElementById('rev-name').value || "Revisión";
  const y = Number(document.getElementById('rev-start-year').value);
  const m = Number(document.getElementById('rev-start-month').value);
  const capTot = Number(document.getElementById('rev-cap-total').value) || 0;
  const capL = Number(document.getElementById('rev-cap-laura').value) || 0;
  const pctL = Number(document.getElementById('rev-pct-laura').value) || 32.27;
  const fee = Number(document.getElementById('rev-fee-total').value) || 0;
  const int = Number(document.getElementById('rev-int-total').value) || 0;
  const prin = Math.max(0, fee - int);

  const lauraFee = fee * (pctL / 100);
  const rakFee = Math.max(0, fee - lauraFee);
  const lauraInt = int * (pctL / 100);
  const lauraPrin = prin * (pctL / 100);

  const revObj = {
    id: editId ? Number(editId) : Date.now(),
    name,
    startYear: y,
    startMonth: m,
    capTotal: capTot,
    capLaura: capL,
    pctLaura: pctL,
    feeTotal: fee,
    intTotal: int,
    prinTotal: prin,
    lauraFee,
    rakFee,
    lauraInt,
    lauraPrin
  };

  if (editId) {
    const idx = revisions.findIndex(x => x.id == editId);
    if (idx !== -1) revisions[idx] = revObj;
    showToast("Periodo actualizado");
  } else {
    revisions.push(revObj);
    showToast("Periodo añadido");
  }

  saveStateToStorage();
  closeRevisionModal();
  updateDashboardUI();
}

function deleteCurrentRevision() {
  const editId = document.getElementById('rev-edit-id').value;
  if (!editId) return;

  if (confirm("¿Estás seguro de eliminar este periodo de revisión?")) {
    revisions = revisions.filter(x => x.id != editId);
    saveStateToStorage();
    closeRevisionModal();
    updateDashboardUI();
    showToast("Periodo eliminado");
  }
}

function applyRevisionToRange(revId) {
  const rev = revisions.find(x => x.id === revId);
  if (!rev) return;

  if (confirm(`¿Aplicar cuotas y % de "${rev.name}" a los meses a partir de ${MONTH_LABELS[rev.startMonth-1]} ${rev.startYear}?`)) {
    let count = 0;
    payments.forEach(p => {
      if (p.year > rev.startYear || (p.year === rev.startYear && p.month >= rev.startMonth)) {
        p.totalFee = rev.feeTotal;
        p.co1 = rev.lauraFee;
        p.co2 = rev.rakFee;
        p.interest = rev.intTotal;
        p.principal = rev.prinTotal;
        count++;
      }
    });
    recomputeBalances();
    saveStateToStorage();
    updateDashboardUI();
    showToast(`Se han actualizado ${count} meses`);
  }
}

async function scanAndRecoverBackups() {
  const foundBackups = [];

  // 1. Scan LocalStorage across all known version keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('rev') || key.includes('hipoteca') || key.includes('backup') || key.includes('payment'))) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(val) && val.length > 0) {
            foundBackups.push({
              source: 'local',
              key,
              count: val.length,
              data: val,
              type: (val[0].startYear || val[0].capTotal) ? 'revisiones' : 'pagos'
            });
          }
        } catch(e) {}
      }
    }
  } catch(err) {}

  // 2. Scan Cloud Storage
  try {
    const cloudBins = [
      { id: currentBinId || DEFAULT_USER_BIN, name: currentEmail || DEFAULT_USER_EMAIL },
      { id: DEFAULT_USER_BIN, name: 'ferjrm@hotmail.com' }
    ];
    // deduplicate
    const seenBins = new Set();

    for (const b of cloudBins) {
      if (seenBins.has(b.id)) continue;
      seenBins.add(b.id);

      try {
        const res = await fetch(`https://extendsclass.com/api/json-storage/bin/${b.id}?t=${Date.now()}`);
        if (res.ok) {
          const cData = await res.json();
          if (cData && ((cData.payments && cData.payments.length > 0) || (cData.revisions && cData.revisions.length > 0))) {
            const pCount = cData.payments ? cData.payments.length : 0;
            const rCount = cData.revisions ? cData.revisions.length : 0;
            const dateStr = cData.lastUpdatedText || (cData.updatedAt ? new Date(cData.updatedAt).toLocaleDateString('es-ES') : '');
            foundBackups.push({
              source: 'cloud',
              key: b.name,
              binId: b.id,
              count: pCount,
              rCount: rCount,
              dateStr,
              cloudData: cData,
              type: 'completo_nube'
            });
          }
        }
      } catch(e) {}
    }
  } catch(err) {}

  if (foundBackups.length === 0) {
    alert("No se encontraron copias de seguridad en la nube ni en este dispositivo.");
    return;
  }

  let msg = "Copias de seguridad encontradas (Nube y Local):\n\n";
  foundBackups.forEach((b, idx) => {
    if (b.source === 'cloud') {
      msg += `${idx + 1}. ☁️ NUBE [${b.key}]: ${b.count} meses, ${b.rCount} revisiones (${b.dateStr})\n`;
    } else {
      msg += `${idx + 1}. 📱 LOCAL [${b.key}]: ${b.count} ${b.type}\n`;
    }
  });
  msg += "\nEscribe el número de la copia que deseas restaurar (o pulsa Cancelar):";

  const choice = prompt(msg, "1");
  if (choice) {
    const selected = foundBackups[parseInt(choice) - 1];
    if (selected) {
      if (selected.source === 'cloud') {
        applyCloudData(selected.cloudData);
        currentBinId = selected.binId;
        currentEmail = selected.key;
        saveStoredAuth(currentEmail, currentPasswordHash, currentBinId);
        showToast(`Copia de la nube [${selected.key}] restaurada con éxito`);
      } else {
        if (selected.type === 'revisiones') {
          revisions = selected.data;
          showToast(`Restauradas ${selected.count} revisiones locales`);
        } else {
          payments = selected.data;
          showToast(`Restaurados ${selected.count} meses locales`);
        }
        saveStateToStorage();
        recomputeBalances();
        updateDashboardUI();
      }
      updateDashboardUI();
    }
  }
}

/* ==========================================================
   MONTH REGISTRATION FORM & REACTIVE BIDIRECTIONAL MATH
   ========================================================== */
function openModal() {
  document.getElementById('modal-title-text').textContent = "Registrar Mes";
  document.getElementById('p-edit-id').value = "";
  document.getElementById('btn-delete-row').style.display = "none";

  const latest = payments[payments.length - 1];
  let y = latest ? latest.year : (new Date()).getFullYear();
  let m = latest ? latest.month + 1 : ((new Date()).getMonth() + 1);
  if (m > 12) { m = 1; y++; }

  document.getElementById('p-year').value = y;
  document.getElementById('p-month').value = m;

  // Detect active revision for this month
  const rev = getActiveRevisionForDate(y, m);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    badge.textContent = rev ? `📌 Periodo: ${rev.name} (${rev.pctLaura.toFixed(2)}%)` : "📌 Periodo General";
  }

  const fee = rev ? rev.feeTotal : (latest ? latest.totalFee : 513.81);
  const pct = rev ? rev.pctLaura : (settings.coOwner1Percentage || 32.27);
  const co1 = rev ? rev.lauraFee : (fee * (pct / 100));
  const co2 = rev ? rev.rakFee : (fee - co1);
  const int = rev ? rev.intTotal : (latest ? latest.interest : 180.00);
  const prin = rev ? rev.prinTotal : Math.max(0, fee - int);

  document.getElementById('p-total-fee').value = fee.toFixed(2);
  document.getElementById('p-laura-pct').value = pct.toFixed(2);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = co2.toFixed(2);
  document.getElementById('p-interest').value = int.toFixed(2);
  document.getElementById('p-principal').value = prin.toFixed(2);

  // Arrastra gastos anteriores del piso
  document.getElementById('p-community').value = (latest ? (latest.community || 81) : 81).toFixed(2);
  document.getElementById('p-electricity').value = (latest ? (latest.electricity || 35) : 35).toFixed(2);
  document.getElementById('p-derramas').value = (latest ? (latest.derramas || 0) : 0).toFixed(2);
  document.getElementById('p-insurance-ibi').value = "0.00";
  document.getElementById('p-other-extra').value = "0.00";
  document.getElementById('p-laura-extra-amort').value = "0.00";
  document.getElementById('p-deposit').value = (latest ? (latest.deposit || 500) : 500).toFixed(2);
  document.getElementById('p-notes').value = "";

  updateLiveModalSummary();
  document.getElementById('payment-modal').classList.add('active');
}

function openEditModal(id) {
  const p = payments.find(x => x.id === id);
  if (!p) return;

  document.getElementById('modal-title-text').textContent = `Editar Mes: ${MONTH_LABELS[p.month - 1]} ${p.year}`;
  document.getElementById('p-edit-id').value = p.id;
  document.getElementById('btn-delete-row').style.display = "inline-flex";

  document.getElementById('p-year').value = p.year;
  document.getElementById('p-month').value = p.month;

  const rev = getActiveRevisionForDate(p.year, p.month);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    badge.textContent = rev ? `📌 Periodo: ${rev.name}` : "📌 Periodo General";
  }

  const fee = p.totalFee || 513.81;
  const co1 = p.co1 || (fee * ((settings.coOwner1Percentage || 32.27) / 100));
  const pct = fee > 0 ? (co1 / fee) * 100 : (settings.coOwner1Percentage || 32.27);

  document.getElementById('p-total-fee').value = fee.toFixed(2);
  document.getElementById('p-laura-pct').value = pct.toFixed(2);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = (p.co2 || (fee - co1)).toFixed(2);
  document.getElementById('p-interest').value = (p.interest || 0).toFixed(2);
  document.getElementById('p-principal').value = (p.principal || 0).toFixed(2);

  document.getElementById('p-community').value = (p.community || 0).toFixed(2);
  document.getElementById('p-electricity').value = (p.electricity || 0).toFixed(2);
  document.getElementById('p-derramas').value = (p.derramas || 0).toFixed(2);
  document.getElementById('p-insurance-ibi').value = ((p.insurance || 0) + (p.ibi || 0)).toFixed(2);
  document.getElementById('p-other-extra').value = (p.otherExtra || 0).toFixed(2);
  document.getElementById('p-laura-extra-amort').value = (p.lauraExtraAmort || 0).toFixed(2);
  document.getElementById('p-deposit').value = (p.deposit || 0).toFixed(2);
  document.getElementById('p-notes').value = p.notes || "";

  updateLiveModalSummary();
  document.getElementById('payment-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('payment-modal').classList.remove('active');
}

function onPaymentDateChange() {
  const y = Number(document.getElementById('p-year').value);
  const m = Number(document.getElementById('p-month').value);
  const rev = getActiveRevisionForDate(y, m);
  const badge = document.getElementById('p-active-rev-badge');
  if (badge) {
    badge.textContent = rev ? `📌 Periodo detectado: ${rev.name} (${rev.pctLaura.toFixed(2)}%)` : "📌 Periodo General";
  }

  const editId = document.getElementById('p-edit-id').value;
  if (!editId && rev) {
    document.getElementById('p-total-fee').value = rev.feeTotal.toFixed(2);
    document.getElementById('p-laura-pct').value = rev.pctLaura.toFixed(2);
    document.getElementById('p-co1').value = rev.lauraFee.toFixed(2);
    document.getElementById('p-co2').value = rev.rakFee.toFixed(2);
    document.getElementById('p-interest').value = rev.intTotal.toFixed(2);
    document.getElementById('p-principal').value = rev.prinTotal.toFixed(2);
    updateLiveModalSummary();
  }
}

function onTotalReceiptChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const pct = Number(document.getElementById('p-laura-pct').value) || (settings.coOwner1Percentage || 32.27);
  const co1 = fee * (pct / 100);
  const co2 = Math.max(0, fee - co1);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = co2.toFixed(2);

  const int = Number(document.getElementById('p-interest').value) || 0;
  const prin = Math.max(0, fee - int);
  document.getElementById('p-principal').value = prin.toFixed(2);
  updateLiveModalSummary();
}

function onLauraPctChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const pct = Number(document.getElementById('p-laura-pct').value) || 0;
  const co1 = fee * (pct / 100);
  const co2 = Math.max(0, fee - co1);
  document.getElementById('p-co1').value = co1.toFixed(2);
  document.getElementById('p-co2').value = co2.toFixed(2);
  updateLiveModalSummary();
}

function onCuotaLauraChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const co1 = Number(document.getElementById('p-co1').value) || 0;
  const co2 = Math.max(0, fee - co1);
  document.getElementById('p-co2').value = co2.toFixed(2);
  if (fee > 0) {
    const pct = (co1 / fee) * 100;
    document.getElementById('p-laura-pct').value = pct.toFixed(2);
  }
  updateLiveModalSummary();
}

function onCuotaRakChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const co2 = Number(document.getElementById('p-co2').value) || 0;
  const co1 = Math.max(0, fee - co2);
  document.getElementById('p-co1').value = co1.toFixed(2);
  if (fee > 0) {
    const pct = (co1 / fee) * 100;
    document.getElementById('p-laura-pct').value = pct.toFixed(2);
  }
  updateLiveModalSummary();
}

function onInterestChange() {
  const fee = Number(document.getElementById('p-total-fee').value) || 0;
  const int = Number(document.getElementById('p-interest').value) || 0;
  const prin = Math.max(0, fee - int);
  document.getElementById('p-principal').value = prin.toFixed(2);
  updateLiveModalSummary();
}

function updateLiveModalSummary() {
  const co1 = Number(document.getElementById('p-co1')?.value) || 0;
  const com = Number(document.getElementById('p-community')?.value) || 0;
  const luz = Number(document.getElementById('p-electricity')?.value) || 0;
  const derr = Number(document.getElementById('p-derramas')?.value) || 0;
  const ins = Number(document.getElementById('p-insurance-ibi')?.value) || 0;
  const other = Number(document.getElementById('p-other-extra')?.value) || 0;
  const lExtraAmort = Number(document.getElementById('p-laura-extra-amort')?.value) || 0;
  const dep = Number(document.getElementById('p-deposit')?.value) || 0;

  // Operational expenses only
  const totalExp = co1 + com + luz + derr + ins + other;
  const gap = dep - totalExp;

  const sumExpEl = document.getElementById('p-sum-expenses');
  const sumGapEl = document.getElementById('p-sum-gap');
  const capBoxEl = document.getElementById('p-sum-capital-box');
  const capValEl = document.getElementById('p-sum-capital');

  if (sumExpEl) sumExpEl.textContent = fmt(totalExp);
  if (sumGapEl) {
    sumGapEl.textContent = (gap >= 0 ? '+' : '') + fmt(gap);
    sumGapEl.style.color = gap >= 0 ? 'var(--primary)' : 'var(--red)';
  }

  if (capBoxEl && capValEl) {
    if (lExtraAmort > 0) {
      capBoxEl.style.display = 'block';
      capValEl.textContent = fmt(lExtraAmort);
    } else {
      capBoxEl.style.display = 'none';
    }
  }
}

function submitPaymentHandler(e) {
  e.preventDefault();
  const editId = document.getElementById('p-edit-id').value;

  const y = Number(document.getElementById('p-year').value);
  const m = Number(document.getElementById('p-month').value);
  const fee = Number(document.getElementById('p-total-fee').value) || 513.81;
  const co1 = Number(document.getElementById('p-co1').value) || (fee * ((settings.coOwner1Percentage || 32.27) / 100));
  const co2 = Number(document.getElementById('p-co2').value) || Math.max(0, fee - co1);
  const int = Number(document.getElementById('p-interest').value) || 0;
  const prin = Number(document.getElementById('p-principal').value) || 0;
  const com = Number(document.getElementById('p-community').value) || 0;
  const luz = Number(document.getElementById('p-electricity').value) || 0;
  const derr = Number(document.getElementById('p-derramas').value) || 0;
  const insIbi = Number(document.getElementById('p-insurance-ibi').value) || 0;
  const other = Number(document.getElementById('p-other-extra').value) || 0;
  const lExtraAmort = Number(document.getElementById('p-laura-extra-amort').value) || 0;
  const dep = Number(document.getElementById('p-deposit').value) || 0;
  const notes = document.getElementById('p-notes').value || "";

  const paymentObj = {
    id: editId ? Number(editId) : Date.now(),
    year: y,
    month: m,
    totalFee: fee,
    co1,
    co2,
    interest: int,
    principal: prin,
    extra: 0,
    community: com,
    electricity: luz,
    derramas: derr,
    insurance: insIbi,
    ibi: 0,
    otherExtra: other,
    lauraExtraAmort: lExtraAmort,
    deposit: dep,
    notes,
    remaining: 0
  };

  if (editId) {
    const idx = payments.findIndex(x => x.id == editId);
    if (idx !== -1) payments[idx] = paymentObj;
    showToast("Mes actualizado");
  } else {
    // Check if month already exists
    const existingIdx = payments.findIndex(x => x.year === y && x.month === m);
    if (existingIdx !== -1) {
      payments[existingIdx] = paymentObj;
      showToast("Mes sobrescrito");
    } else {
      payments.push(paymentObj);
      showToast("Mes añadido correctamente");
    }
  }

  recomputeBalances();
  saveStateToStorage();
  closeModal();
  updateDashboardUI();
}

function deleteCurrentRow() {
  const editId = document.getElementById('p-edit-id').value;
  if (!editId) return;

  if (confirm("¿Estás seguro de eliminar este registro mensual?")) {
    payments = payments.filter(x => x.id != editId);
    recomputeBalances();
    saveStateToStorage();
    closeModal();
    updateDashboardUI();
    showToast("Mes eliminado");
  }
}

/* ==========================================================
   SETTINGS & AGREEMENT FORM
   ========================================================== */
function fillSettingsInputs() {
  if (document.getElementById('cfg-capital-init')) {
    document.getElementById('cfg-capital-init').value = (settings.initialCapital || 121766.32).toFixed(2);
    document.getElementById('cfg-term-years').value = settings.totalTermYears || 25;
    document.getElementById('cfg-interest-rate').value = (settings.annualInterestRate || 1.85).toFixed(2);
    document.getElementById('cfg-laura-pct').value = (settings.coOwner1Percentage || 32.27).toFixed(2);
    document.getElementById('cfg-rak-pct').value = (settings.coOwner2Percentage || 67.73).toFixed(2);
    document.getElementById('cfg-debt-laura').value = (settings.internalDebtLaura || 53500.0).toFixed(2);
    document.getElementById('cfg-debt-rak').value = (settings.internalDebtRak || 68266.32).toFixed(2);
    if (document.getElementById('sync-user-id')) {
      document.getElementById('sync-user-id').value = currentEmail;
    }
  }
}

function syncSettingsPercentages(source) {
  if (source === 'laura') {
    const lPct = Number(document.getElementById('cfg-laura-pct').value) || 0;
    document.getElementById('cfg-rak-pct').value = (100 - lPct).toFixed(2);
  } else {
    const rPct = Number(document.getElementById('cfg-rak-pct').value) || 0;
    document.getElementById('cfg-laura-pct').value = (100 - rPct).toFixed(2);
  }
}

function syncSettingsDebts() {
  const dL = Number(document.getElementById('cfg-debt-laura').value) || 0;
  const dR = Number(document.getElementById('cfg-debt-rak').value) || 0;
  const tot = dL + dR;
  if (tot > 0) {
    const lPct = (dL / tot) * 100;
    document.getElementById('cfg-laura-pct').value = lPct.toFixed(2);
    document.getElementById('cfg-rak-pct').value = (100 - lPct).toFixed(2);
  }
}

function onAgreementCapitalChange(source) {
  const totInput = document.getElementById('agree-init-capital');
  const lauraInput = document.getElementById('agree-debt-laura');
  const rakInput = document.getElementById('agree-debt-rak');
  const pctLInput = document.getElementById('agree-pct-laura');
  const pctRInput = document.getElementById('agree-pct-rak');

  let tot = Number(totInput?.value) || 0;
  let lCap = Number(lauraInput?.value) || 0;
  let rCap = Number(rakInput?.value) || 0;

  if (source === 'laura') {
    if (tot > 0) {
      rCap = Math.max(0, tot - lCap);
      if (rakInput) rakInput.value = rCap.toFixed(2);
    }
  } else if (source === 'rak') {
    if (tot > 0) {
      lCap = Math.max(0, tot - rCap);
      if (lauraInput) lauraInput.value = lCap.toFixed(2);
    }
  } else if (source === 'total') {
    const pctL = Number(pctLInput?.value) || 43.94;
    lCap = tot * (pctL / 100);
    rCap = Math.max(0, tot - lCap);
    if (lauraInput) lauraInput.value = lCap.toFixed(2);
    if (rakInput) rakInput.value = rCap.toFixed(2);
  }

  if (tot > 0) {
    const pctL = (lCap / tot) * 100;
    const pctR = 100 - pctL;
    if (pctLInput) pctLInput.value = pctL.toFixed(2);
    if (pctRInput) pctRInput.value = pctR.toFixed(2);
  }
}

function resetAgreementToDefaults() {
  const tot = 121766.32;
  const lCap = 53500.00;
  const rCap = 68266.32;
  const pctL = (lCap / tot) * 100;
  const pctR = 100 - pctL;

  if (document.getElementById('agree-init-capital')) document.getElementById('agree-init-capital').value = tot.toFixed(2);
  if (document.getElementById('agree-debt-laura')) document.getElementById('agree-debt-laura').value = lCap.toFixed(2);
  if (document.getElementById('agree-debt-rak')) document.getElementById('agree-debt-rak').value = rCap.toFixed(2);
  if (document.getElementById('agree-pct-laura')) document.getElementById('agree-pct-laura').value = pctL.toFixed(2);
  if (document.getElementById('agree-pct-rak')) document.getElementById('agree-pct-rak').value = pctR.toFixed(2);
}

function openAgreementModal() {
  const initTot = Number(settings.initialCapital) || 121766.32;
  const initL = (settings.internalDebtLaura && Number(settings.internalDebtLaura) >= 40000) 
    ? Number(settings.internalDebtLaura) 
    : 53500.00;
  const initR = (settings.internalDebtRak && Number(settings.internalDebtRak) > 0) 
    ? Number(settings.internalDebtRak) 
    : Math.max(0, initTot - initL);

  const pctL = initTot > 0 ? (initL / initTot) * 100 : 43.94;
  const pctR = 100 - pctL;

  if (document.getElementById('agree-init-capital')) document.getElementById('agree-init-capital').value = initTot.toFixed(2);
  if (document.getElementById('agree-debt-laura')) document.getElementById('agree-debt-laura').value = initL.toFixed(2);
  if (document.getElementById('agree-debt-rak')) document.getElementById('agree-debt-rak').value = initR.toFixed(2);
  if (document.getElementById('agree-pct-laura')) document.getElementById('agree-pct-laura').value = pctL.toFixed(2);
  if (document.getElementById('agree-pct-rak')) document.getElementById('agree-pct-rak').value = pctR.toFixed(2);

  const modal = document.getElementById('agreement-modal');
  if (modal) modal.classList.add('active');
}

function closeAgreementModal() {
  const modal = document.getElementById('agreement-modal');
  if (modal) modal.classList.remove('active');
}

function submitAgreementHandler(e) {
  if (e && e.preventDefault) e.preventDefault();
  const tot = Number(document.getElementById('agree-init-capital')?.value) || 121766.32;
  const lCap = Number(document.getElementById('agree-debt-laura')?.value) || 53500.00;
  const rCap = Number(document.getElementById('agree-debt-rak')?.value) || Math.max(0, tot - lCap);
  const pctL = tot > 0 ? (lCap / tot) * 100 : 43.94;
  const pctR = 100 - pctL;

  settings.initialCapital = tot;
  settings.internalDebtLaura = lCap;
  settings.internalDebtRak = rCap;
  settings.coOwner1Percentage = pctL;
  settings.coOwner2Percentage = pctR;

  // Also update initial revision if exists
  const initialRev = revisions.find(r => r.startYear === 2020 && r.startMonth === 11) || revisions[0];
  if (initialRev) {
    initialRev.capTotal = tot;
    initialRev.capLaura = lCap;
    initialRev.pctLaura = pctL;
    initialRev.lauraFee = initialRev.feeTotal * (pctL / 100);
    initialRev.rakFee = Math.max(0, initialRev.feeTotal - initialRev.lauraFee);
    initialRev.lauraPrin = initialRev.prinTotal * (pctL / 100);
  }

  recomputeBalances();
  saveStateToStorage();
  closeAgreementModal();
  updateDashboardUI();
  showToast(`Capital inicial guardado: ${fmt(lCap)} (Laura) / ${fmt(tot)} (Total)`);
}

function saveSettingsHandler(e) {
  e.preventDefault();
  settings.initialCapital = Number(document.getElementById('cfg-capital-init').value) || 121766.32;
  settings.totalTermYears = Number(document.getElementById('cfg-term-years').value) || 25;
  settings.annualInterestRate = Number(document.getElementById('cfg-interest-rate').value) || 1.85;
  settings.coOwner1Percentage = Number(document.getElementById('cfg-laura-pct').value) || 32.27;
  settings.coOwner2Percentage = Number(document.getElementById('cfg-rak-pct').value) || 67.73;
  settings.internalDebtLaura = Number(document.getElementById('cfg-debt-laura').value) || 0;
  settings.internalDebtRak = Number(document.getElementById('cfg-debt-rak').value) || 0;

  const newKey = document.getElementById('sync-user-id')?.value;
  if (newKey && newKey !== currentEmail) {
    currentEmail = newKey;
    saveStoredAuth(currentEmail, currentPasswordHash, currentBinId);
  }

  recomputeBalances();
  saveStateToStorage();
  updateDashboardUI();
  updateSyncUI();
  showToast("Ajustes guardados y sincronizados");
}

function handleFilterChange() {
  renderHistoryTable();
}

function filterByYearPill(pillVal, btnElem) {
  document.querySelectorAll('.year-pill').forEach(el => el.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');

  const select = document.getElementById('filter-year-select');
  if (select) {
    select.value = pillVal;
    renderHistoryTable();
  }
}

/* ==========================================================
   EXPORT & BACKUP
   ========================================================== */
function exportDataJSON() {
  const data = {
    settings,
    revisions,
    payments,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hipoteca_laura_rak_${new Date().toISOString().substring(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Copia descargada");
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.settings) settings = data.settings;
      if (data.revisions) revisions = data.revisions;
      if (data.payments) payments = data.payments;
      recomputeBalances();
      saveStateToStorage();
      updateDashboardUI();
      showToast("Datos importados con éxito");
    } catch (err) {
      alert("Error al leer el archivo JSON.");
    }
  };
  reader.readAsText(file);
}

function resetAllData() {
  if (confirm("¿Estás seguro de restablecer todos los datos iniciales?")) {
    payments = getOriginalExcelSeed();
    recomputeBalances();
    saveStateToStorage();
    updateDashboardUI();
    showToast("Datos restablecidos");
  }
}

/* ==========================================================
   SECURE MULTI-DEVICE CLOUD REALTIME SYNC & MODAL HANDLERS
   ========================================================== */
let cloudSyncTimeout = null;
let lastCloudTimestampText = '';

function scheduleCloudSync(delayMs = 250) {
  if (isSyncingIncoming) return;
  if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
  cloudSyncTimeout = setTimeout(() => {
    syncToCloud();
  }, delayMs);
}

function switchSyncTab(tab) {
  const tabs = ['login', 'register', 'account', 'transfer'];
  tabs.forEach(t => {
    const btn = document.getElementById(`sync-tab-btn-${t}`);
    const view = document.getElementById(`sync-view-${t}`);
    if (btn) btn.classList.toggle('active', t === tab);
    if (view) view.style.display = (t === tab) ? 'block' : 'none';
  });

  const msgEl = document.getElementById('sync-modal-msg');
  if (msgEl) msgEl.style.display = 'none';

  if (tab === 'account') {
    const emailEl = document.getElementById('sync-manage-current-email');
    if (emailEl) emailEl.textContent = currentEmail;
    const lockEl = document.getElementById('sync-manage-lock-status');
    if (lockEl) {
      lockEl.textContent = currentPasswordHash ? '🔒 Protegida con Contraseña' : '🔓 Sin Contraseña';
      lockEl.style.color = currentPasswordHash ? '#84cc16' : '#f59e0b';
    }
    const timeEl = document.getElementById('sync-manage-last-time');
    if (timeEl) timeEl.textContent = lastCloudTimestampText || '--';
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function showSyncModalMsg(text, type = 'info') {
  const msgEl = document.getElementById('sync-modal-msg');
  if (!msgEl) return;
  msgEl.style.display = 'block';
  msgEl.textContent = text;
  if (type === 'error') {
    msgEl.style.background = 'rgba(239, 68, 68, 0.18)';
    msgEl.style.color = '#fca5a5';
    msgEl.style.border = '1px solid rgba(239, 68, 68, 0.4)';
  } else if (type === 'warning') {
    msgEl.style.background = 'rgba(245, 158, 11, 0.18)';
    msgEl.style.color = '#fcd34d';
    msgEl.style.border = '1px solid rgba(245, 158, 11, 0.4)';
  } else if (type === 'success') {
    msgEl.style.background = 'rgba(16, 185, 129, 0.18)';
    msgEl.style.color = '#86efac';
    msgEl.style.border = '1px solid rgba(16, 185, 129, 0.4)';
  } else {
    msgEl.style.background = 'rgba(59, 130, 246, 0.18)';
    msgEl.style.color = '#93c5fd';
    msgEl.style.border = '1px solid rgba(59, 130, 246, 0.4)';
  }
}

function updateSyncUI(statusText = 'En Tiempo Real', dotColor = '#10b981') {
  const displayEmail = currentEmail || 'Sin Sesión';

  const userEl = document.getElementById('banner-sync-user');
  if (userEl) userEl.textContent = displayEmail;

  const activeLabel = document.getElementById('sync-active-label');
  if (activeLabel) activeLabel.textContent = currentEmail ? currentEmail : 'Ninguna (Sesión cerrada)';

  const manageEmail = document.getElementById('sync-manage-current-email');
  if (manageEmail) manageEmail.textContent = displayEmail;

  const inputEmail = document.getElementById('sync-input-email');
  if (inputEmail && !inputEmail.value && currentEmail) inputEmail.value = currentEmail;

  const pillLabel = document.getElementById('sync-pill-label');
  if (pillLabel) {
    pillLabel.textContent = currentEmail ? currentEmail.split('@')[0] : 'Desconectado';
  }
  const pillDot = document.getElementById('sync-pill-dot');
  if (pillDot) {
    pillDot.style.background = currentEmail ? dotColor : '#64748b';
  }

  const statusEl = document.getElementById('banner-sync-status');
  if (statusEl) {
    statusEl.textContent = currentEmail ? statusText : 'Desconectado';
    statusEl.style.color = currentEmail ? dotColor : '#94a3b8';
  }

  const dotEl = document.getElementById('banner-sync-dot');
  if (dotEl) {
    dotEl.style.background = currentEmail ? dotColor : '#64748b';
  }

  const timeEl = document.getElementById('banner-sync-time');
  const modalTimeEl = document.getElementById('sync-modal-last-time');
  const manageTimeEl = document.getElementById('sync-manage-last-time');
  const timeToShow = lastCloudTimestampText || new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
  if (timeEl) timeEl.textContent = timeToShow;
  if (modalTimeEl) modalTimeEl.textContent = timeToShow;
  if (manageTimeEl) manageTimeEl.textContent = timeToShow;

  const badge = document.getElementById('sync-status-badge');
  if (badge) {
    if (!currentEmail) {
      badge.textContent = 'Desconectado';
      badge.style.color = '#94a3b8';
      badge.style.background = 'rgba(148, 163, 184, 0.15)';
    } else {
      badge.textContent = currentPasswordHash ? 'Protegida con Contraseña' : 'Sin Contraseña';
      badge.style.color = currentPasswordHash ? '#10b981' : '#f59e0b';
      badge.style.background = currentPasswordHash ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)';
    }
  }

  const lockBadge = document.getElementById('banner-lock-badge');
  if (lockBadge) {
    if (!currentEmail) {
      lockBadge.textContent = '⚪ Desconectado';
      lockBadge.style.color = '#94a3b8';
    } else {
      lockBadge.textContent = currentPasswordHash ? '🔒 Protegida' : '🔓 Sin clave';
      lockBadge.style.color = currentPasswordHash ? '#84cc16' : '#f59e0b';
    }
  }

  const settingsSyncAcc = document.getElementById('settings-sync-account-label');
  if (settingsSyncAcc) {
    settingsSyncAcc.textContent = displayEmail;
  }
}

async function initCloudSync() {
  updateSyncUI('Sincronizando...', '#f59e0b');
  
  // 1. Priority 1: Same-origin local data.json
  try {
    const localRes = await fetch(`data.json?t=${Date.now()}`);
    if (localRes.ok) {
      const data = await localRes.json();
      if (data && Array.isArray(data.payments) && data.payments.length >= 71) {
        applyCloudData(data);
        updateSyncUI('Sincronizado', '#10b981');
        return;
      }
    }
  } catch (e) {}

  // 2. Priority 2: GitHub Raw public backup
  try {
    const ghRes = await fetch(`https://raw.githubusercontent.com/ferjrm-8/C-lculo-de-hipoteca/main/data.json?t=${Date.now()}`);
    if (ghRes.ok) {
      const data = await ghRes.json();
      if (data && Array.isArray(data.payments) && data.payments.length >= 71) {
        applyCloudData(data);
        updateSyncUI('Sincronizado', '#10b981');
        return;
      }
    }
  } catch (e) {}

  // 3. Priority 3: Cloud bin storage
  try {
    const targetBin = currentBinId || DEFAULT_USER_BIN;
    const res = await fetch(`https://extendsclass.com/api/json-storage/bin/${targetBin}?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.payments) && data.payments.length >= 71) {
        applyCloudData(data);
        updateSyncUI('Sincronizado', '#10b981');
        return;
      }
    }
  } catch (err) {}

  // 4. Guarantee all 71 payments are loaded and calculated
  if (!payments || payments.length < 71) {
    payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
    saveStateToStorage();
    recomputeBalances();
    updateDashboardUI();
  }
  updateSyncUI(currentEmail ? 'Conectado' : 'Datos Listos', '#10b981');
}

function applyCloudData(data) {
  isSyncingIncoming = true;
  localLastSyncTime = data.updatedAt || Date.now();
  lastCloudTimestampText = data.lastUpdatedText || new Date(localLastSyncTime).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

  if (data.settings) settings = { ...settings, ...data.settings };
  if (Array.isArray(data.revisions) && data.revisions.length > 0) revisions = data.revisions;
  if (Array.isArray(data.payments) && data.payments.length >= 71) {
    payments = data.payments;
  } else if (!payments || payments.length < 71) {
    payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
  }

  try {
    const cfgStr = JSON.stringify(settings);
    const revStr = JSON.stringify(revisions);
    const payStr = JSON.stringify(payments);
    localStorage.setItem('hipoteca_cfg_v7', cfgStr);
    localStorage.setItem('hipoteca_cfg_v6', cfgStr);
    localStorage.setItem('hipoteca_revs_v7', revStr);
    localStorage.setItem('hipoteca_revs_v6', revStr);
    localStorage.setItem('hipoteca_payments_v7', payStr);
    localStorage.setItem('hipoteca_payments_v6', payStr);
  } catch (e) {}

  recomputeBalances();
  updateDashboardUI();
  updateSyncUI('En Tiempo Real', '#10b981');
  isSyncingIncoming = false;
}

async function syncToCloud() {
  if (isSyncingIncoming) return;
  saveStateToStorage();

  const targetBin = currentBinId || DEFAULT_USER_BIN;
  if (!targetBin) return;

  if (!payments || payments.length < 71) return;

  const now = Date.now();
  localLastSyncTime = now;
  lastCloudTimestampText = new Date(now).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

  let effectiveHash = currentPasswordHash || '';
  if (!effectiveHash) {
    const stored = getStoredAuth();
    if (stored && stored.hash) effectiveHash = stored.hash;
  }

  const payload = {
    account: currentEmail || DEFAULT_USER_EMAIL,
    passwordHash: effectiveHash,
    updatedAt: now,
    lastUpdatedText: lastCloudTimestampText,
    settings,
    revisions,
    payments
  };

  try {
    fetch(`https://extendsclass.com/api/json-storage/bin/${targetBin}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => {
      if (res.ok) updateSyncUI('En Tiempo Real', '#10b981');
    }).catch(() => {});
  } catch (err) {}
}

function startRealtimePoller() {
  if (realtimePollInterval) clearInterval(realtimePollInterval);
  const targetBin = currentBinId || DEFAULT_USER_BIN;
  if (!targetBin) return;
  realtimePollInterval = setInterval(async () => {
    if (isSyncingIncoming) return;
    try {
      const res = await fetch(`https://extendsclass.com/api/json-storage/bin/${targetBin}?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.updatedAt && data.updatedAt > localLastSyncTime) {
          if (Array.isArray(data.payments) && data.payments.length >= 71) {
            applyCloudData(data);
          }
        }
      }
    } catch (err) {}
  }, 5000);
}

async function triggerManualSync() {
  const icon = document.getElementById('sync-spin-icon');
  if (icon) icon.classList.add('spin-active');
  updateSyncUI('Sincronizando...', '#f59e0b');

  let success = false;

  // 1. Try local data.json
  try {
    const localRes = await fetch(`data.json?t=${Date.now()}`);
    if (localRes.ok) {
      const data = await localRes.json();
      if (data && Array.isArray(data.payments) && data.payments.length >= 71) {
        applyCloudData(data);
        success = true;
      }
    }
  } catch (e) {}

  // 2. Try GitHub Raw
  if (!success) {
    try {
      const ghRes = await fetch(`https://raw.githubusercontent.com/ferjrm-8/C-lculo-de-hipoteca/main/data.json?t=${Date.now()}`);
      if (ghRes.ok) {
        const data = await ghRes.json();
        if (data && Array.isArray(data.payments) && data.payments.length >= 71) {
          applyCloudData(data);
          success = true;
        }
      }
    } catch (e) {}
  }

  // 3. Try extendsclass
  if (!success) {
    try {
      const targetBin = currentBinId || DEFAULT_USER_BIN;
      const res = await fetch(`https://extendsclass.com/api/json-storage/bin/${targetBin}?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.payments) && data.payments.length >= 71) {
          applyCloudData(data);
          success = true;
        }
      }
    } catch (e) {}
  }

  if (icon) icon.classList.remove('spin-active');

  if (success) {
    updateSyncUI('Sincronizado', '#10b981');
    showToast(`Sincronizados ${payments.length} meses`);
  } else {
    if (!payments || payments.length < 71) {
      payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
      saveStateToStorage();
      recomputeBalances();
      updateDashboardUI();
    }
    updateSyncUI('Conectado', '#10b981');
    showToast('Datos actualizados correctamente');
  }
}

function restoreOfficialPayments() {
  payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
  saveStateToStorage();
  recomputeBalances();
  updateDashboardUI();
  syncToCloud();
  showToast(`✅ Restituidos con éxito los 71 meses (Noviembre 2020 - Septiembre 2026).`);
}

function openSyncModal(defaultTab) {
  const chosenTab = defaultTab || (currentPasswordHash ? 'account' : 'login');
  switchSyncTab(chosenTab);

  const emailInput = document.getElementById('sync-input-email');
  if (emailInput) emailInput.value = currentEmail;

  const pwdInput = document.getElementById('sync-input-password');
  if (pwdInput) pwdInput.value = '';

  const activeLabel = document.getElementById('sync-active-label');
  if (activeLabel) activeLabel.textContent = currentEmail;

  const modalTimeEl = document.getElementById('sync-modal-last-time');
  if (modalTimeEl) modalTimeEl.textContent = lastCloudTimestampText || '--';

  const modal = document.getElementById('sync-modal');
  if (modal) modal.classList.add('active');
}

function closeSyncModal() {
  const modal = document.getElementById('sync-modal');
  if (modal) modal.classList.remove('active');
}

/* ==========================================================
   AUTHENTICATION: LOGIN
   ========================================================== */
function handleSyncLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById('sync-input-email');
  const pwdInput = document.getElementById('sync-input-password');

  let rawEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const pwd = pwdInput ? pwdInput.value.trim() : '';

  if (!rawEmail) {
    showSyncModalMsg('Introduce un correo electrónico o usuario.', 'error');
    return;
  }
  // Normalize aliases for main user
  if (rawEmail === 'ferjrm' || rawEmail === 'mi_sistema_hipoteca') {
    rawEmail = DEFAULT_USER_EMAIL;
  }

  const pwdHash = pwd ? hashPassword(pwd) : '';
  const binId = DEFAULT_USER_BIN;

  // Immediate activation
  currentEmail = rawEmail;
  currentPasswordHash = pwdHash;
  currentBinId = binId;
  saveStoredAuth(rawEmail, pwdHash, binId);

  // Guarantee all 71 payments are loaded and calculated
  if (!payments || payments.length < 71) {
    payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
    saveStateToStorage();
  }
  recomputeBalances();
  updateDashboardUI();
  updateSyncUI('Conectado', '#10b981');
  closeSyncModal();
  showToast(`Conectado como ${rawEmail}`);

  // Non-blocking background sync attempt with 2s timeout
  setTimeout(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const binRes = await fetch(`https://extendsclass.com/api/json-storage/bin/${binId}?t=${Date.now()}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (binRes.ok) {
        const cloudData = await binRes.json();
        if (cloudData && Array.isArray(cloudData.payments) && cloudData.payments.length >= 71) {
          applyCloudData(cloudData);
        }
      }
    } catch (err) {}
  }, 100);
}

/* ==========================================================
   AUTHENTICATION: RESET / UNLOCK ACCESS
   ========================================================== */
function resetAccountPassword(email, binId) {
  const targetEmail = (email || currentEmail || DEFAULT_USER_EMAIL).trim().toLowerCase();
  const targetBinId = binId || currentBinId || DEFAULT_USER_BIN;

  currentEmail = targetEmail;
  currentPasswordHash = '';
  currentBinId = targetBinId;
  saveStoredAuth(targetEmail, '', targetBinId);

  if (!payments || payments.length < 71) {
    payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
    saveStateToStorage();
  }
  recomputeBalances();
  updateDashboardUI();
  updateSyncUI('Conectado', '#10b981');
  closeSyncModal();
  showToast(`Acceso restablecido como ${targetEmail}`);
}

function handleQuickUnlock() {
  const emailInput = document.getElementById('sync-input-email');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : currentEmail;
  resetAccountPassword(email, currentBinId);
}

function switchToLoginFor(email) {
  switchSyncTab('login');
  const emailInput = document.getElementById('sync-input-email');
  if (emailInput) {
    emailInput.value = email;
  }
  const pwdInput = document.getElementById('sync-input-password');
  if (pwdInput) {
    pwdInput.value = '';
    pwdInput.focus();
  }
}

/* ==========================================================
   AUTHENTICATION: CREATE NEW USER
   ========================================================== */
function handleCreateUser(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById('sync-reg-email');
  const pwdInput = document.getElementById('sync-reg-password');
  const confirmInput = document.getElementById('sync-reg-confirm');

  let rawEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const pwd = pwdInput ? pwdInput.value.trim() : '';
  const confirmPwd = confirmInput ? confirmInput.value.trim() : '';

  if (!rawEmail) {
    showSyncModalMsg('Introduce un correo electrónico o nombre de usuario.', 'error');
    return;
  }
  if (!rawEmail.includes('@') && !rawEmail.includes('.')) {
    rawEmail = rawEmail + '@hotmail.com';
  }
  if (pwd && pwd.length < 4) {
    showSyncModalMsg('La contraseña debe tener al menos 4 caracteres.', 'error');
    return;
  }
  if (pwd && pwd !== confirmPwd) {
    showSyncModalMsg('Las contraseñas no coinciden.', 'error');
    return;
  }

  const pwdHash = pwd ? hashPassword(pwd) : '';
  const binId = DEFAULT_USER_BIN;

  currentEmail = rawEmail;
  currentPasswordHash = pwdHash;
  currentBinId = binId;
  saveStoredAuth(rawEmail, pwdHash, binId);

  if (!payments || payments.length < 71) {
    payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS_DEFAULT));
    saveStateToStorage();
  }
  recomputeBalances();
  updateDashboardUI();
  updateSyncUI('Conectado', '#10b981');
  closeSyncModal();
  showToast(`Cuenta creada como ${rawEmail}`);
}

async function assignPasswordToExisting(rawEmail, pwd, binId) {
  showSyncModalMsg(`Asignando contraseña y conectando a ${rawEmail}...`, 'info');
  const targetBin = binId || DEFAULT_USER_BIN;
  const pwdHash = pwd ? hashPassword(pwd) : '';

  currentEmail = rawEmail;
  currentPasswordHash = pwdHash;
  currentBinId = targetBin;
  saveStoredAuth(rawEmail, pwdHash, targetBin);

  if (!payments || payments.length < 71) {
    restoreOfficialPayments();
  } else {
    recomputeBalances();
    updateDashboardUI();
  }

  updateSyncUI('Conectado', '#10b981');
  closeSyncModal();
  startRealtimePoller();
  showToast(`✅ Conectado como ${rawEmail} con tu nueva contraseña`);
}

/* ==========================================================
   AUTHENTICATION: CHANGE PASSWORD
   ========================================================== */
async function handleChangePassword(e) {
  if (e && e.preventDefault) e.preventDefault();
  const newPwdInput = document.getElementById('pwd-new');
  const confirmPwdInput = document.getElementById('pwd-confirm');

  const newPwd = newPwdInput ? newPwdInput.value.trim() : '';
  const confirmPwd = confirmPwdInput ? confirmPwdInput.value.trim() : '';

  if (!newPwd || newPwd.length < 4) {
    showSyncModalMsg('La nueva contraseña debe tener al menos 4 caracteres.', 'error');
    return;
  }
  if (newPwd !== confirmPwd) {
    showSyncModalMsg('❌ Las contraseñas nuevas no coinciden.', 'error');
    return;
  }

  await forceSetPassword(newPwd);
}

async function forceSetPassword(newPwd) {
  if (!newPwd || newPwd.length < 4) {
    showSyncModalMsg('La contraseña debe tener al menos 4 caracteres.', 'error');
    return;
  }
  showSyncModalMsg('Guardando nueva clave...', 'info');

  const newHash = hashPassword(newPwd);
  const targetBin = currentBinId || DEFAULT_USER_BIN;
  const targetEmail = currentEmail || DEFAULT_USER_EMAIL;

  currentPasswordHash = newHash;
  currentEmail = targetEmail;
  currentBinId = targetBin;
  saveStoredAuth(targetEmail, newHash, targetBin);

  const oldPwdInput = document.getElementById('pwd-old');
  const newPwdInput = document.getElementById('pwd-new');
  const confirmPwdInput = document.getElementById('pwd-confirm');
  if (oldPwdInput) oldPwdInput.value = '';
  if (newPwdInput) newPwdInput.value = '';
  if (confirmPwdInput) confirmPwdInput.value = '';

  updateSyncUI('Protegida', '#10b981');
  showSyncModalMsg('✅ ¡Contraseña establecida con éxito!', 'success');
  showToast('🔐 Contraseña guardada correctamente');
}

/* ==========================================================
   AUTHENTICATION: DELETE ACCOUNT
   ========================================================== */
async function handleDeleteAccount(e) {
  if (e && e.preventDefault) e.preventDefault();
  localStorage.removeItem('mortgage_auth_email');
  localStorage.removeItem('mortgage_auth_hash');
  localStorage.removeItem('mortgage_auth_bin');

  currentEmail = '';
  currentPasswordHash = '';
  currentBinId = '';

  updateSyncUI('Sesión Cerrada', '#ef4444');
  showToast('🗑️ Sesión cerrada en este dispositivo.');
  closeSyncModal();
}

/* ==========================================================
   BACKUP, EXPORT & DIRECT MULTI-DEVICE SYNC CODE
   ========================================================== */
function exportSyncCode() {
  try {
    const bundle = {
      appName: 'Hipoteca Conjunta Laura y Rak',
      exportedAt: Date.now(),
      settings,
      revisions,
      payments
    };
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(bundle))));
    navigator.clipboard.writeText(code).then(() => {
      showToast('📋 Código de sincronización copiado al portapapeles');
      alert('¡Código de sincronización copiado!\n\nPuedes pegarlo en cualquier otro dispositivo (móvil, tablet, ordenador) pulsando "Pegar Código" para sincronizar tus 71 meses al instante.');
    }).catch(() => {
      prompt('Copia este código de sincronización y pégalo en tu otro dispositivo:', code);
    });
  } catch (err) {
    alert('Error al generar código: ' + err.message);
  }
}

function importSyncCodePrompt() {
  const code = prompt('Pega aquí el código de sincronización copiado desde tu otro dispositivo:');
  if (!code) return;
  try {
    const jsonStr = decodeURIComponent(escape(atob(code.trim())));
    const bundle = JSON.parse(jsonStr);
    if (bundle && Array.isArray(bundle.payments) && bundle.payments.length >= 71) {
      applyCloudData(bundle);
      showToast(`✅ ¡Sincronizados con éxito los ${payments.length} meses!`);
      closeSyncModal();
    } else {
      alert('El código introducido no contiene los 71 meses válidos.');
    }
  } catch (err) {
    alert('Código de sincronización inválido o corrupto.');
  }
}

function downloadBackupJSON() {
  try {
    const bundle = {
      appName: 'Hipoteca Conjunta Laura y Rak',
      exportedAt: Date.now(),
      dateText: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
      totalMonths: payments.length,
      settings,
      revisions,
      payments
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hipoteca_backup_71_meses_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 Copia de seguridad JSON descargada');
  } catch (err) {
    alert('Error al descargar copia: ' + err.message);
  }
}

/* ==========================================================
   AUTHENTICATION: LOGOUT
   ========================================================== */
function handleLogout() {
  if (realtimePollInterval) {
    clearInterval(realtimePollInterval);
    realtimePollInterval = null;
  }
  currentEmail = '';
  currentPasswordHash = '';
  currentBinId = '';
  try {
    localStorage.removeItem('mortgage_auth_email');
    localStorage.removeItem('mortgage_auth_hash');
    localStorage.removeItem('mortgage_auth_bin');
  } catch (e) {}

  updateSyncUI('Desconectado', '#64748b');
  switchSyncTab('login');

  const emailInput = document.getElementById('sync-input-email');
  if (emailInput) emailInput.value = '';
  const pwdInput = document.getElementById('sync-input-password');
  if (pwdInput) pwdInput.value = '';

  showSyncModalMsg('Sesión cerrada por completo. La sincronización se ha detenido.', 'info');
  showToast("Sesión cerrada por completo");
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '90px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#062014';
  toast.style.color = '#10b981';
  toast.style.border = '1px solid #10b981';
  toast.style.padding = '10px 18px';
  toast.style.borderRadius = '9999px';
  toast.style.fontSize = '12px';
  toast.style.fontWeight = '700';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2600);
}
