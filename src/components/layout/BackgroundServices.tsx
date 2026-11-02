"use client";

import { useEffect } from "react";
import { startCloudSync } from "@/lib/cloud-sync";
import { startStudyTimer } from "@/lib/study-time";
import { syncStatusBar } from "@/lib/theme";

/**
 * Usługi działające na każdym ekranie (także w quizach poza AppShell): licznik czasu nauki, kolor ikon paska stanu,
 * kopia postępu w chmurze (także po powrocie internetu). Nic nie renderuje.
 */
export default function BackgroundServices() {
  useEffect(() => startStudyTimer(), []);
  useEffect(() => startCloudSync(), []);
  // motyw ustawia skrypt w <head> przed Reactem – pasek stanu dopasowujemy po starcie (potem przy każdej zmianie motywu)
  useEffect(() => syncStatusBar(), []);
  return null;
}
