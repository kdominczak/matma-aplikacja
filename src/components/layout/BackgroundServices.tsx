"use client";

import { useEffect } from "react";
import { startCloudSync } from "@/lib/cloud-sync";
import { startBackgroundSync } from "@/lib/learning-sync";
import { startStudyTimer } from "@/lib/study-time";

/**
 * Usługi działające na każdym ekranie (także w quizach poza AppShell): licznik czasu nauki
 * wysyłka zaległych odpowiedzi po powrocie internetu i kopia postępu w chmurze. Nic nie renderuje.
 */
export default function BackgroundServices() {
  useEffect(() => startStudyTimer(), []);
  useEffect(() => startBackgroundSync(), []);
  useEffect(() => startCloudSync(), []);
  return null;
}
