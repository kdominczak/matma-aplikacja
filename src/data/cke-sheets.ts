// Oficjalne arkusze maturalne z matematyki – pliki PDF z serwisu Centralnej Komisji Egzaminacyjnej (cke.gov.pl).
// Adresy przepisane ze stron „Arkusze” CKE i sprawdzone (HTTP 200, application/pdf) 27.10.2026.
// Termin główny (maj), standardowa wersja arkusza (A). Wersje dostosowane są na stronie roku w CKE.

export type SheetLevel = "podstawowy" | "rozszerzony";

/** Formuła 2023 – obecna podstawa (poziom podstawowy: 46 pkt w latach 2023–2024, od 2025 – 50 pkt); formuła 2015 – poprzedni program. */
export type SheetFormula = "2023" | "2015";

export interface SheetFiles {
  /** Arkusz egzaminacyjny. */
  exam: string;
  /** Zasady oceniania rozwiązań zadań (klucz odpowiedzi). */
  solutions: string;
  /** Karta odpowiedzi (od 2024). */
  answerCard?: string;
}

export interface ExamYear {
  year: number;
  formula: SheetFormula;
  /** Strona roku w CKE – z pozostałymi wersjami arkuszy (dostosowane, dla obywateli Ukrainy). */
  page: string;
  levels: Record<SheetLevel, SheetFiles>;
}

const IMG = "https://cke.gov.pl/images";
const F2023 = `${IMG}/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne`;
const F2015 = `${IMG}/_EGZAMIN_MATURALNY_OD_2015/Arkusze_egzaminacyjne`;
const PAGE_2023 = "https://cke.gov.pl/egzamin-maturalny/egzamin-maturalny-w-formule-2023/arkusze";
const PAGE_2015 = "https://cke.gov.pl/egzamin-maturalny/egzamin-maturalny-w-formule-2015/arkusze";

/** Formuła 2023, od 2024 r. z kartą odpowiedzi i arkuszem w wersji A. */
function formula2023(year: number, zasadyDir: (level: SheetLevel) => string): ExamYear {
  const yy = String(year).slice(2);
  const files = (level: SheetLevel): SheetFiles => {
    const code = level === "podstawowy" ? "MMAP-P0" : "MMAP-R0";
    const dir = `${F2023}/${year}/Matematyka/poziom_${level}`;
    return {
      exam: `${dir}/${code}-100-A-${yy}05-arkusz.pdf`,
      answerCard: `${dir}/${code}-100-A-${yy}05-karta.pdf`,
      solutions: `${zasadyDir(level)}/${code}-100-${yy}05-zasady.pdf`,
    };
  };
  return {
    year,
    formula: "2023",
    page: `${PAGE_2023}/${year}-2/`,
    levels: { podstawowy: files("podstawowy"), rozszerzony: files("rozszerzony") },
  };
}

const levelDir = (year: number) => (level: SheetLevel) => `${F2023}/${year}/Matematyka/poziom_${level}`;

export const EXAM_YEARS: ExamYear[] = [
  formula2023(2026, levelDir(2026)),
  formula2023(2025, () => `${F2023}/2025/zasady_oceniania`),
  formula2023(2024, levelDir(2024)),
  {
    year: 2023,
    formula: "2023",
    page: `${PAGE_2023}/2023-2/`,
    levels: {
      podstawowy: {
        exam: `${F2023}/2023/Matematyka/poziom_podstawowy/MMAP-P0-100-2305.pdf`,
        solutions: `${F2023}/2023/Matematyka/poziom_podstawowy/MMAP-P0-100-2305-zasady.pdf`,
      },
      rozszerzony: {
        exam: `${F2023}/2023/Matematyka/poziom_rozszerzony/MMAP-R0-100-2305.pdf`,
        solutions: `${F2023}/2023/Matematyka/poziom_rozszerzony/MMAP-R0-100-2305-zasady.pdf`,
      },
    },
  },
  {
    year: 2022,
    formula: "2015",
    page: `${PAGE_2015}/2022-2/`,
    levels: {
      podstawowy: {
        exam: `${F2015}/2022/Matematyka/poziom_podstawowy/EMAP-P0-100-2205.pdf`,
        solutions: `${F2015}/2022/Zasady_oceniania/EMAP-P0-100-2205-zasady.pdf`,
      },
      rozszerzony: {
        exam: `${F2015}/2022/Matematyka/poziom_rozszerzony/EMAP-R0-100-2205.pdf`,
        solutions: `${F2015}/2022/Zasady_oceniania/EMAP-R0-100-2205-zasady.pdf`,
      },
    },
  },
  {
    year: 2021,
    formula: "2015",
    page: `${PAGE_2015}/2021-2/`,
    levels: {
      podstawowy: {
        exam: `${F2015}/2021/Matematyka/poziom_podstawowy/EMAP-P0-100-2105.pdf`,
        solutions: `${F2015}/2021/Zasady_Oceniania/EMAP-P0-100-2105-zasady.pdf`,
      },
      rozszerzony: {
        exam: `${F2015}/2021/Matematyka/poziom_rozszerzony/EMAP-R0-100-2105.pdf`,
        solutions: `${F2015}/2021/Zasady_Oceniania/EMAP-R0-100-2105-zasady.pdf`,
      },
    },
  },
  {
    year: 2020,
    formula: "2015",
    page: `${PAGE_2015}/2020-2/`,
    levels: {
      podstawowy: {
        exam: `${F2015}/2020/formula_od_2015/matematyka/MMA-P1_1P-202.pdf`,
        solutions: `${F2015}/2020/formula_od_2015/Zasady_oceniania/MMA-PP-202_zasady.pdf`,
      },
      rozszerzony: {
        exam: `${F2015}/2020/formula_od_2015/matematyka/MMA-R1_1P-202.pdf`,
        solutions: `${F2015}/2020/formula_od_2015/Zasady_oceniania/MMA-PR-202_zasady.pdf`,
      },
    },
  },
  {
    year: 2019,
    formula: "2015",
    page: `${PAGE_2015}/2019-2/`,
    levels: {
      podstawowy: {
        exam: `${F2015}/2019/formula_od_2015/matematyka/MMA-P1_1P-192.pdf`,
        solutions: `${F2015}/2019/formula_od_2015/Zasady_oceniania/MMA-P1_1P-192_model.pdf`,
      },
      rozszerzony: {
        exam: `${F2015}/2019/formula_od_2015/matematyka/MMA-R1_1P-192.pdf`,
        solutions: `${F2015}/2019/formula_od_2015/Zasady_oceniania/MMA-R1_1P-192_model.pdf`,
      },
    },
  },
];

/** Oficjalna karta „Wybrane wzory matematyczne” (formuła 2023) – dostępna na egzaminie. */
export const FORMULA_SHEET_URL = `${IMG}/_EGZAMIN_MATURALNY_OD_2023/Informatory/wybrane_wzory_matematyczne_EM2023.pdf`;

export const CKE_ARCHIVE_URL = "https://cke.gov.pl/egzamin-maturalny/egzamin-maturalny-w-formule-2023/arkusze/";
