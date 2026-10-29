import type { Relaxation } from "@/types/blueprint";

export interface FrozenExam {
  id: string;
  code: string;
  layoutYear: number;
  durationMin: number;
  taskIds: string[];
  relaxations: Relaxation[];
}

// Wygenerowane przez `npm run exams:freeze` – nie edytuj ręcznie.
export const MOCK_EXAMS: FrozenExam[] = [
  {
    "id": "probny-1",
    "code": "2600001",
    "layoutYear": 2026,
    "durationMin": 180,
    "taskIds": [
      "abs-p2",
      "log-p1",
      "log-p3",
      "abs-p1",
      "pf-potegi-5",
      "wsm-z2",
      "log-o2",
      "nk-p2",
      "nl-p2",
      "nl-o1",
      "ur-wiek-3",
      "wl-o2",
      "wf-o1",
      "pf-liniowa-1",
      "fl-z1",
      "ot-kwadratowa-wzor-5",
      "ot-suma-ciagu-3",
      "cg-p1",
      "kr-wyraz-ciagu-4",
      "tc-p1",
      "ok-z1",
      "tk-p2",
      "ok-o2",
      "kr-kat-wpisany-4",
      "tr-s1",
      "ro-s2",
      "ok-s1",
      "pf-odcinek-6",
      "ro-z1",
      "ot-przekatna-1",
      "gp-p1",
      "km-zero-8",
      "pr-lub-6",
      "st-pf-4",
      "pr-urna-6",
      "fl-p2",
      "op-p1"
    ],
    "relaxations": [
      {
        "slot": "12.1",
        "points": 2,
        "rule": "format",
        "note": "Zad. 12.1 (Funkcje, 2 pkt): zadanie otwarte z rozwiązaniem zamiast z krótką odpowiedzią"
      },
      {
        "slot": "12.2",
        "points": 2,
        "rule": "format",
        "note": "Zad. 12.2 (Funkcje, 2 pkt): zadanie otwarte z rozwiązaniem zamiast z krótką odpowiedzią"
      }
    ]
  },
  {
    "id": "probny-2",
    "code": "2600002",
    "layoutYear": 2026,
    "durationMin": 180,
    "taskIds": [
      "pot-p1",
      "abs-z1",
      "pot-z3",
      "pot-s3",
      "pf-potegi-3",
      "wsm-p3",
      "abs-o1",
      "nk-p3",
      "nk-p1",
      "nk-o2",
      "ur-wiek-3",
      "pw-o1",
      "fl-o2",
      "pf-liniowa-3",
      "wl-s1",
      "ot-kwadratowa-wzor-3",
      "ot-suma-ciagu-5",
      "cg-s2",
      "kr-wyraz-ciagu-3",
      "tc-z1",
      "tk-z1",
      "tk-s2",
      "ok-o1",
      "kr-kat-wpisany-5",
      "tr-s2",
      "pp-s2",
      "tk-s1",
      "pf-odcinek-6",
      "pp-z1",
      "gp-o1",
      "gp-p2",
      "km-zero-1",
      "pr-lub-1",
      "st-pf-6",
      "pr-urna-1",
      "pw-s1",
      "op-z1"
    ],
    "relaxations": [
      {
        "slot": "12.1",
        "points": 2,
        "rule": "format",
        "note": "Zad. 12.1 (Funkcje, 2 pkt): zadanie otwarte z rozwiązaniem zamiast z krótką odpowiedzią"
      },
      {
        "slot": "12.2",
        "points": 2,
        "rule": "format",
        "note": "Zad. 12.2 (Funkcje, 2 pkt): zadanie otwarte z rozwiązaniem zamiast z krótką odpowiedzią"
      }
    ]
  },
  {
    "id": "probny-3",
    "code": "2600003",
    "layoutYear": 2026,
    "durationMin": 180,
    "taskIds": [
      "log-p1",
      "abs-p1",
      "abs-z2",
      "abs-z1",
      "pf-potegi-1",
      "wsm-p2",
      "abs-o1",
      "nl-s1",
      "rw-p3",
      "nk-o2",
      "ur-wiek-6",
      "fl-o2",
      "wl-o2",
      "pf-liniowa-4",
      "fl-z1",
      "ot-kwadratowa-wzor-3",
      "cg-o2",
      "cg-s2",
      "kr-wyraz-ciagu-2",
      "tr-s2",
      "ok-s1",
      "ok-p1",
      "ok-o1",
      "kr-kat-wpisany-4",
      "tc-s1",
      "ro-p2",
      "tk-p2",
      "pf-odcinek-1",
      "pp-p1",
      "ot-przekatna-1",
      "gp-z1",
      "km-funkcje-6",
      "pr-lub-4",
      "st-pf-1",
      "pr-urna-7",
      "fl-s1",
      "op-p1"
    ],
    "relaxations": [
      {
        "slot": "12.1",
        "points": 2,
        "rule": "format",
        "note": "Zad. 12.1 (Funkcje, 2 pkt): zadanie otwarte z rozwiązaniem zamiast z krótką odpowiedzią"
      },
      {
        "slot": "12.2",
        "points": 2,
        "rule": "format",
        "note": "Zad. 12.2 (Funkcje, 2 pkt): zadanie otwarte z rozwiązaniem zamiast z krótką odpowiedzią"
      }
    ]
  }
];
